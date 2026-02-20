const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    const dataPath = path.join(__dirname, '../data.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log('Seeding users...');
    for (const user of data.users) {
        await prisma.user.upsert({
            where: { id: BigInt(user.id) },
            update: {},
            create: {
                id: BigInt(user.id),
                nombre: user.nombre,
                email: user.email,
                password_hash: user.password_hash,
                nivel_permiso: user.nivel_permiso,
            },
        });
    }

    console.log('Seeding catalog...');
    for (const item of data.catalog) {
        await prisma.eventItem.upsert({
            where: { id: item.id },
            update: {},
            create: {
                id: item.id,
                categoria: item.categoria,
                nombre: item.nombre,
                activo: item.activo,
            },
        });
    }

    console.log('Seeding events...');
    for (const event of data.events) {
        await prisma.event.upsert({
            where: { id: BigInt(event.id) },
            update: {},
            create: {
                id: BigInt(event.id),
                titulo: event.titulo,
                descripcion: event.descripcion,
                fecha_inicio: new Date(event.fecha_inicio),
                fecha_fin: new Date(event.fecha_fin),
                requisitos_tecnicos: event.requisitos_tecnicos,
                estado: event.estado,
                user_id: BigInt(event.user_id),
            },
        });
    }

    console.log('Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
