const db = require('./backend/src/utils/db-sqlite');
const bcrypt = require('bcryptjs');

const createDireccion = async () => {
    try {
        await db.initDB();
        const hashedPassword = await bcrypt.hash('123456', 10);
        await db.users.create({
            data: {
                id: String(Date.now()),
                nombre: 'Dirección General',
                email: 'direccion@fichas.com',
                password_hash: hashedPassword,
                nivel_permiso: 1 // Using Admin level for Direccion for now, or maybe it should be a new level? Let's use 1 to ensure they have all access.
            }
        });
        console.log('Direccion account created successfully');
    } catch (e) {
        console.error('Error:', e);
    }
};

createDireccion();
