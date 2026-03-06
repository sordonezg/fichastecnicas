const http = require('http');
const fs = require('fs');

const request = (options, data = null) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body || '{}') });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
};

async function testPriority() {
    const logs = [];
    const log = (...args) => {
        const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
        console.log(msg);
        logs.push(msg);
    };

    log('--- Testing Venue Priority Logic ---');
    try {
        const resUserLogin = await request({ hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { email: 'user@fichas.com', password: 'password123' });
        const userToken = resUserLogin.data.token;
        log('User logged in. Token length:', userToken ? userToken.length : 'FAIL');

        const resDirLogin = await request({ hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { email: 'direccion@fichas.com', password: 'password123' });
        const dirToken = resDirLogin.data.token;
        log('Direccion logged in. Token length:', dirToken ? dirToken.length : 'FAIL');

        // unique day
        const day = Math.floor(Math.random() * 28) + 1;
        const month = Math.floor(Math.random() * 12) + 1;
        const eventData = { titulo: 'User Event test', descripcion: 'desc', fecha_inicio: `2028-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T10:00:00.000Z`, fecha_fin: `2028-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T12:00:00.000Z`, venue_id: 1, requisitos_tecnicos: { audio: 'none' } };

        log('Booking date:', eventData.fecha_inicio);

        const resUserCreate = await request({ hostname: 'localhost', port: 5000, path: '/api/events', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` } }, eventData);
        log('User created event status:', resUserCreate.status);
        const eventId = resUserCreate.data.id;

        const dirEventData = { ...eventData, titulo: 'Direccion Event override' };
        const resDirCreate = await request({ hostname: 'localhost', port: 5000, path: '/api/events', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${dirToken}` } }, dirEventData);
        log('Direccion created event status:', resDirCreate.status);

        const resGetEvents = await request({ hostname: 'localhost', port: 5000, path: `/api/events`, method: 'GET', headers: { 'Authorization': `Bearer ${userToken}` } });
        const specificEvent = resGetEvents.data.find(e => String(e.id) === String(eventId));
        log('User event status now:', specificEvent ? specificEvent.estado : 'NOT FOUND IN LIST');

        const resUserCreate2 = await request({ hostname: 'localhost', port: 5000, path: '/api/events', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` } }, { ...eventData, titulo: 'User Event test 2' });
        log('User second attempt status:', resUserCreate2.status);

        fs.writeFileSync('test_output_clean.txt', logs.join('\n'));
    } catch (err) {
        log('Test error:', err);
        fs.writeFileSync('test_output_clean.txt', logs.join('\n'));
    }
}
testPriority();
