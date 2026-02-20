const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database.db');
const db = new sqlite3.Database(dbPath);

// Helper to run queries with promises
const run = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const all = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const get = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

// Initialize tables
const initDB = async () => {
    await run(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            nombre TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            nivel_permiso INTEGER DEFAULT 3
        )
    `);

    await run(`
        CREATE TABLE IF NOT EXISTS catalog (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            categoria TEXT NOT NULL,
            nombre TEXT NOT NULL,
            activo BOOLEAN DEFAULT 1
        )
    `);

    await run(`
        CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            titulo TEXT NOT NULL,
            descripcion TEXT,
            fecha_inicio TEXT NOT NULL,
            fecha_fin TEXT NOT NULL,
            requisitos_tecnicos TEXT NOT NULL,
            estado TEXT DEFAULT 'pendiente',
            user_id TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `);
};

const dbClient = {
    initDB,
    users: {
        findAll: () => all('SELECT * FROM users'),
        findOne: ({ where }) => {
            const key = Object.keys(where)[0];
            return get(`SELECT * FROM users WHERE ${key} = ?`, [where[key]]);
        },
        create: async ({ data }) => {
            await run(
                'INSERT INTO users (id, nombre, email, password_hash, nivel_permiso) VALUES (?, ?, ?, ?, ?)',
                [data.id, data.nombre, data.email, data.password_hash, data.nivel_permiso]
            );
            return data;
        }
    },
    catalog: {
        findAll: () => all('SELECT * FROM catalog'),
        create: async ({ data }) => {
            const result = await run(
                'INSERT INTO catalog (categoria, nombre, activo) VALUES (?, ?, ?)',
                [data.categoria, data.nombre, data.activo ? 1 : 0]
            );
            return { ...data, id: result.lastID };
        },
        delete: ({ where }) => run('DELETE FROM catalog WHERE id = ?', [where.id])
    },
    events: {
        findAll: async () => {
            const rows = await all('SELECT * FROM events');
            return rows.map(row => ({
                ...row,
                requisitos_tecnicos: JSON.parse(row.requisitos_tecnicos)
            }));
        },
        findMany: async (params = {}) => {
            let query = 'SELECT * FROM events';
            const values = [];
            if (params.where) {
                const keys = Object.keys(params.where);
                if (keys.length > 0) {
                    if (keys.includes('OR')) {
                        // Special handling for the auth logic: user_id = ? OR estado = 'aceptado'
                        query += ' WHERE user_id = ? OR estado = ?';
                        values.push(params.where.OR[0].user_id, params.where.OR[1].estado);
                    } else {
                        const conditions = keys.map(k => `${k} = ?`).join(' AND ');
                        query += ` WHERE ${conditions}`;
                        values.push(...Object.values(params.where));
                    }
                }
            }
            const rows = await all(query, values);
            return rows.map(row => ({
                ...row,
                requisitos_tecnicos: JSON.parse(row.requisitos_tecnicos)
            }));
        },
        findOne: async ({ where }) => {
            const row = await get('SELECT * FROM events WHERE id = ?', [where.id]);
            if (row) {
                row.requisitos_tecnicos = JSON.parse(row.requisitos_tecnicos);
            }
            return row;
        },
        findUnique: async ({ where }) => {
            const row = await get('SELECT * FROM events WHERE id = ?', [where.id]);
            if (row) {
                row.requisitos_tecnicos = JSON.parse(row.requisitos_tecnicos);
            }
            return row;
        },
        create: async ({ data }) => {
            await run(
                'INSERT INTO events (id, titulo, descripcion, fecha_inicio, fecha_fin, requisitos_tecnicos, estado, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    String(data.id),
                    data.titulo,
                    data.descripcion,
                    data.fecha_inicio,
                    data.fecha_fin,
                    JSON.stringify(data.requisitos_tecnicos),
                    data.estado || 'pendiente',
                    String(data.user_id)
                ]
            );
            return data;
        },
        update: async ({ where, data }) => {
            const keys = Object.keys(data);
            const sets = keys.map(k => `${k} = ?`).join(', ');
            const values = Object.values(data).map(v => typeof v === 'object' ? JSON.stringify(v) : v);
            await run(`UPDATE events SET ${sets} WHERE id = ?`, [...values, where.id]);
            return get('SELECT * FROM events WHERE id = ?', [where.id]);
        },
        delete: ({ where }) => run('DELETE FROM events WHERE id = ?', [where.id])
    }
};

module.exports = dbClient;
