const db = require('./src/utils/db-sqlite');
const bcrypt = require('bcryptjs');

async function resetPasswords() {
    await db.initDB();
    const hash = await bcrypt.hash('password123', 10);

    // update user@fichas.com
    let user = await db.users.findOne({ where: { email: 'user@fichas.com' } });
    if (user) {
        await db.users.update({ where: { id: user.id }, data: { password_hash: hash } });
    }

    // update direccion@fichas.com
    let dir = await db.users.findOne({ where: { email: 'direccion@fichas.com' } });
    if (dir) {
        await db.users.update({ where: { id: dir.id }, data: { password_hash: hash } });
    }
    console.log('Passwords reset to password123');
}

resetPasswords().catch(console.error);
