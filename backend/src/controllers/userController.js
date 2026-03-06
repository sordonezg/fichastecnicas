const bcrypt = require('bcryptjs');
const db = require('../utils/db-sqlite');

const getUsers = async (req, res) => {
    try {
        const users = await db.users.findAll();
        // Remove password hashes before sending
        const safeUsers = users.map(user => {
            const { password_hash, ...rest } = user;
            return rest;
        });
        res.json(safeUsers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

const createUser = async (req, res) => {
    const { nombre, email, password, nivel_permiso } = req.body;

    try {
        const existingUser = await db.users.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await db.users.create({
            data: {
                id: String(Date.now()),
                nombre,
                email,
                password_hash: hashedPassword,
                nivel_permiso: nivel_permiso || 3,
            },
        });

        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { nombre, email, password, nivel_permiso } = req.body;

    try {
        const user = await db.users.findOne({ where: { id } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const dataToUpdate = {};
        if (nombre) dataToUpdate.nombre = nombre;
        if (email && email !== user.email) {
            const existingUser = await db.users.findOne({ where: { email } });
            if (existingUser) return res.status(400).json({ message: 'Email already in use' });
            dataToUpdate.email = email;
        }
        if (password) {
            dataToUpdate.password_hash = await bcrypt.hash(password, 10);
        }
        if (nivel_permiso) dataToUpdate.nivel_permiso = nivel_permiso;

        const updatedUser = await db.users.update({
            where: { id },
            data: dataToUpdate
        });

        const { password_hash, ...safeUser } = updatedUser;
        res.json(safeUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        if (id === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete yourself' });
        }

        const user = await db.users.findOne({ where: { id } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        await db.users.delete({ where: { id } });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
