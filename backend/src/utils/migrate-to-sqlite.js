const fs = require('fs');
const path = require('path');
const db = require('./db-sqlite');

const migrate = async () => {
    try {
        console.log('--- Iniciando Migración a SQLite ---');

        // 1. Inicializar tablas
        await db.initDB();
        console.log('✓ Tablas inicializadas.');

        // 2. Leer data.json
        const dataPath = path.join(__dirname, '../../data.json');
        if (!fs.existsSync(dataPath)) {
            console.error('✗ No se encontró data.json');
            return;
        }
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        // 3. Migrar Usuarios
        console.log('Migrando usuarios...');
        for (const user of data.users) {
            await db.users.create({
                data: {
                    ...user,
                    id: String(user.id)
                }
            });
        }
        console.log(`✓ ${data.users.length} usuarios migrados.`);

        // 4. Migrar Catálogo
        console.log('Migrando catálogo...');
        for (const item of data.catalog) {
            await db.catalog.create({ data: item });
        }
        console.log(`✓ ${data.catalog.length} ítems del catálogo migrados.`);

        // 5. Migrar Eventos
        console.log('Migrando eventos...');
        for (const event of data.events) {
            await db.events.create({
                data: {
                    ...event,
                    id: String(event.id),
                    user_id: String(event.user_id),
                    venue_id: event.venue_id || 1
                }
            });
        }
        console.log(`✓ ${data.events.length} eventos migrados.`);

        console.log('--- Migración Completada con Éxito ---');
        process.exit(0);
    } catch (error) {
        console.error('✗ Error durante la migración:', error);
        process.exit(1);
    }
};

migrate();
