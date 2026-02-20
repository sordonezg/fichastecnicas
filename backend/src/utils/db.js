const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data.json');

const initDB = () => {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], events: [], catalog: [] }, null, 2));
    } else {
        // Migrate: ensure catalog array exists
        const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        if (!data.catalog) {
            data.catalog = [];
            fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
        }
    }
};

const getData = () => {
    initDB();
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
};

const saveData = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

const db = {
    users: {
        findUnique: async ({ where }) => {
            const { users } = getData();
            return users.find(u => u.email === where.email) || null;
        },
        create: async ({ data }) => {
            const state = getData();
            const newUser = { id: Date.now(), ...data };
            state.users.push(newUser);
            saveData(state);
            return newUser;
        },
        // For seed upsert mimic
        upsert: async ({ where, update, create }) => {
            const state = getData();
            const index = state.users.findIndex(u => u.email === where.email);
            if (index !== -1) {
                state.users[index] = { ...state.users[index], ...update };
                saveData(state);
                return state.users[index];
            } else {
                const newUser = { id: Date.now(), ...create };
                state.users.push(newUser);
                saveData(state);
                return newUser;
            }
        }
    },
    events: {
        findMany: async (params = {}) => {
            const { events, users } = getData();
            let result = events;

            if (params.where?.OR) {
                const userId = params.where.OR.find(c => c.user_id)?.user_id;
                const state = params.where.OR.find(c => c.estado)?.estado;
                result = events.filter(e => e.user_id === userId || e.estado === state);
            } else if (params.where?.user_id) {
                result = events.filter(e => e.user_id === params.where.user_id);
            }

            // Add user relation simulation
            return result.map(e => ({
                ...e,
                user: users.find(u => u.id === e.user_id)
            }));
        },
        findUnique: async ({ where }) => {
            const { events } = getData();
            return events.find(e => e.id === where.id) || null;
        },
        create: async ({ data }) => {
            const state = getData();
            const newEvent = { id: Date.now(), ...data, estado: data.estado || 'pendiente' };
            state.events.push(newEvent);
            saveData(state);
            return newEvent;
        },
        update: async ({ where, data }) => {
            const state = getData();
            const index = state.events.findIndex(e => e.id === where.id);
            if (index === -1) throw new Error('Not found');
            state.events[index] = { ...state.events[index], ...data };
            saveData(state);
            return state.events[index];
        },
        delete: async ({ where }) => {
            const state = getData();
            state.events = state.events.filter(e => e.id !== where.id);
            saveData(state);
        }
    },
    catalog: {
        findAll: async () => {
            const { catalog } = getData();
            return catalog || [];
        },
        create: async ({ data }) => {
            const state = getData();
            const newItem = { id: Date.now(), ...data, activo: true };
            state.catalog.push(newItem);
            saveData(state);
            return newItem;
        },
        delete: async ({ where }) => {
            const state = getData();
            state.catalog = state.catalog.filter(c => c.id !== where.id);
            saveData(state);
        }
    }
};

module.exports = db;
