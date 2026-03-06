const db = require('./src/utils/db-sqlite');

async function seed() {
    await db.initDB();

    const existing = await db.users.findOne({ where: { email: 'direccion@fichas.com' } });
    if (!existing) {
        await db.users.create({
            data: {
                id: String(Date.now()),
                nombre: 'Dirección General',
                email: 'direccion@fichas.com',
                password_hash: '$2b$10$yFrzNZM3ScncyGb5TnCLCOEAbmcarGPnE/7wX8GjSJta/y1Wa/JlO',
                nivel_permiso: 1 // Admin
            }
        });
        console.log('User direccion@fichas.com created successfully.');
    } else {
        console.log('User direccion@fichas.com already exists.');
    }
}

seed().catch(console.error);
