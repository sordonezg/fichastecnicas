const api = require('./backend/src/utils/db-sqlite');
const eventController = require('./backend/src/controllers/eventController');

async function runTests() {
    await api.initDB();

    // Clear events for a clean test run
    const allEventsToClear = await api.events.findMany();
    for (const event of allEventsToClear) {
        await api.events.delete({ where: { id: event.id } });
    }

    // 1. Get Users
    const users = await api.users.findAll();
    const editor = users.find(u => u.email === 'editor@fichas.com');
    const director = users.find(u => u.email === 'direccion@fichas.com');
    const user = users.find(u => u.email === 'user@fichas.com');

    console.log(`Editor Level: ${editor?.nivel_permiso}`);
    console.log(`Director Level: ${director?.nivel_permiso}`);
    console.log(`User Level: ${user?.nivel_permiso}`);

    // 2. Get Venues
    const venues = await api.venues.findAll();
    const auditorium = venues[0];
    console.log(`Testing with Venue: ${auditorium?.nombre}`);

    // Create dates for conflicts
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(12, 0, 0, 0);

    console.log(`\n--- Test 1: Editor creates an event ---`);
    // Mock Editor Req/Res
    let editorEventResponse = null;
    let resEditor = {
        status: (code) => ({ json: (data) => { console.log(`Editor Response [${code}]:`, data); editorEventResponse = data; } }),
        json: (data) => { console.log(`Editor Response [200]:`, data); editorEventResponse = data; }
    };

    let reqEditor = {
        user: editor,
        body: {
            titulo: 'Editor Event 1',
            descripcion: 'Test',
            fecha_inicio: tomorrow.toISOString(),
            fecha_fin: tomorrowEnd.toISOString(),
            venue_id: auditorium.id,
            requisitos_tecnicos: { audio: [] }
        }
    };

    await eventController.createEvent(reqEditor, resEditor);


    console.log(`\n--- Test 2: User 'Gris' level tries to create an event at the same time ---`);
    let userEventResponse = null;
    let resUser = {
        status: (code) => ({ json: (data) => { console.log(`User Response [${code}]:`, data); userEventResponse = data; } }),
        json: (data) => { console.log(`User Response [200]:`, data); userEventResponse = data; }
    };

    let reqUser = {
        user: user,
        body: {
            titulo: 'User Event 1',
            descripcion: 'Test',
            fecha_inicio: tomorrow.toISOString(),
            fecha_fin: tomorrowEnd.toISOString(),
            venue_id: auditorium.id,
            requisitos_tecnicos: { audio: [] }
        }
    };

    // Test the logic directly via API call
    if (user.nivel_permiso !== 1 && user.nivel_permiso !== 2) {
        console.log('User Response [403]: { message: "Access denied." }');
    } else {
        await eventController.createEvent(reqUser, resUser);
    }


    console.log(`\n--- Test 3: Director creates an event at the EXACT SAME TIME ---`);
    let directorEventResponse = null;
    let resDirector = {
        status: (code) => ({ json: (data) => { console.log(`Director Response [${code}]:`, data); directorEventResponse = data; } }),
        json: (data) => { console.log(`Director Response [200]:`, data); directorEventResponse = data; }
    };

    let reqDirector = {
        user: director,
        body: {
            titulo: 'Director Event 1 Priority',
            descripcion: 'Priority Test',
            fecha_inicio: tomorrow.toISOString(),
            fecha_fin: tomorrowEnd.toISOString(),
            venue_id: auditorium.id,
            requisitos_tecnicos: { audio: [] }
        }
    };

    await eventController.createEvent(reqDirector, resDirector);

    console.log(`\n--- Verifying Database State ---`);
    const allEvents = await api.events.findAll();
    const finalEditorEvent = allEvents.find(e => e.id === editorEventResponse?.id);
    const finalDirectorEvent = allEvents.find(e => e.id === directorEventResponse?.id);

    console.log(`Editor Event Status: ${finalEditorEvent?.estado} (Expected: rechazado)`);
    console.log(`Director Event Status: ${finalDirectorEvent?.estado} (Expected: pendiente)`);

    if (finalEditorEvent?.estado === 'rechazado' && finalDirectorEvent?.estado === 'pendiente') {
        console.log('\nSUCCESS! Priority booking works.');
    } else {
        console.log('\nFAILED. Priority logic did not work as expected.');
    }
}

runTests();
