const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

async function resetPasswords() {
    try {
        const hash = await bcrypt.hash('123456', 10);
        db.run('UPDATE users SET password_hash = ?', [hash], function (err) {
            if (err) {
                console.error("Error updating passwords:", err);
            } else {
                console.log(`Updated ${this.changes} user passwords to 123456.`);
            }
            db.close();
        });
    } catch (err) {
        console.error(err);
    }
}

resetPasswords();
