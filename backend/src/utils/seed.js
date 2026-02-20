const db = require('../utils/db');
const bcrypt = require('bcryptjs');

async function main() {
    const passwordHash = await bcrypt.hash('password123', 10);

    // Admin (Verde)
    await db.users.upsert({
        where: { email: 'admin@fichas.com' },
        update: {},
        create: {
            nombre: 'Administrador Manuel',
            email: 'admin@fichas.com',
            password_hash: passwordHash,
            nivel_permiso: 1,
        },
    });

    // Editor (Blanco)
    await db.users.upsert({
        where: { email: 'editor@fichas.com' },
        update: {},
        create: {
            nombre: 'Editor Sergio',
            email: 'editor@fichas.com',
            password_hash: passwordHash,
            nivel_permiso: 2,
        },
    });

    // Solicitante (Gris)
    await db.users.upsert({
        where: { email: 'user@fichas.com' },
        update: {},
        create: {
            nombre: 'Solicitante Juan',
            email: 'user@fichas.com',
            password_hash: passwordHash,
            nivel_permiso: 3,
        },
    });

    console.log('Seed data created successfully in JSON DB');
}

main().catch(console.error);
