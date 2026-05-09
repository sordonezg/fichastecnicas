import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { getVenues } from '../api/venues';
import { Calendar, Clock, FileText, ArrowLeft, ArrowRight, Save, CheckCircle2, ChevronRight, Info, MapPin, Briefcase, Plus, X } from 'lucide-react';

const EventForm = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [venues, setVenues] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [eventTypes, setEventTypes] = useState([]);
    const [step, setStep] = useState(1);
    
    // Updated to match AdonisJS Event & VersionContent models
    const [formData, setFormData] = useState({
        name: '',
        objective: '',
        description: '',
        startsAt: '',
        endsAt: '',
        locationId: '',
        organizationId: '',
        eventTypeId: '',
        dressCode: '',
        programImpacted: '',
        guestSpecifications: '',
        presidiumDetail: '',
        directorAction: '',
        activities: []
    });

    const [currentActivity, setCurrentActivity] = useState({
        name: '',
        startsAt: '',
        endsAt: '',
        description: ''
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // We map locations to venues in the backend or frontend api
                const venuesRes = await getVenues();
                setVenues(venuesRes || []);

                // Fetch catalogs from Adonis
                const [orgsRes, typesRes] = await Promise.all([
                    api.get('/organizations'),
                    api.get('/event-types')
                ]);
                setOrganizations(orgsRes.data || []);
                setEventTypes(typesRes.data || []);

                if (isEditMode) {
                    const { data: events } = await api.get('/events');
                    const currentEvent = events.find(e => String(e.id) === String(id));
                    if (currentEvent) {
                        setFormData({
                            name: currentEvent.name || currentEvent.titulo || '',
                            objective: currentEvent.objective || '',
                            description: currentEvent.description || currentEvent.descripcion || '',
                            startsAt: currentEvent.startsAt || currentEvent.fecha_inicio ? new Date(currentEvent.startsAt || currentEvent.fecha_inicio).toISOString().slice(0, 16) : '',
                            endsAt: currentEvent.endsAt || currentEvent.fecha_fin ? new Date(currentEvent.endsAt || currentEvent.fecha_fin).toISOString().slice(0, 16) : '',
                            locationId: currentEvent.locationId || currentEvent.venue_id || '',
                            organizationId: currentEvent.organizationId || '',
                            eventTypeId: currentEvent.eventTypeId || '',
                            dressCode: currentEvent.dressCode || '',
                            programImpacted: currentEvent.programImpacted || '',
                            guestSpecifications: currentEvent.guestSpecifications || currentEvent.asistentes || '',
                            presidiumDetail: currentEvent.presidiumDetail || '',
                            directorAction: currentEvent.directorAction || ''
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Error al cargar datos necesarios.');
            }
        };
        fetchInitialData();
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim() || !formData.locationId || !formData.organizationId || !formData.eventTypeId) {
            setStep(1);
            setError('Por favor complete todos los campos obligatorios (Nombre, Organización, Tipo y Recinto).');
            return;
        }

        if (!formData.startsAt || !formData.endsAt) {
            setStep(2);
            setError('Por favor seleccione las fechas del evento.');
            return;
        }
        if (new Date(formData.endsAt) <= new Date(formData.startsAt)) {
            setStep(2);
            setError('La fecha de finalización debe ser posterior a la de inicio.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            if (isEditMode) {
                await api.put(`/events/${id}`, formData);
            } else {
                await api.post('/events', formData);
            }
            navigate('/');
        } catch (err) {
            setError('Error al guardar la ficha técnica: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, name: 'General', icon: FileText },
        { id: 2, name: 'Horario', icon: Clock },
        { id: 3, name: 'Detalles Específicos', icon: Briefcase },
    ];

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fade-in font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-2 text-gray-400 hover:text-emerald-600 mb-2 transition-all font-bold text-sm uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Dashboard
                    </button>
                    <h1 className="text-4xl font-display font-bold text-gray-900">{isEditMode ? 'Reagendar Evento' : 'Nueva Ficha Técnica'}</h1>
                    <p className="text-gray-500 font-medium">{isEditMode ? 'Edite los detalles de su ficha técnica' : 'Configure los detalles de su ficha técnica (Adonis)'}</p>
                </div>

                <div className="flex items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    {steps.map((s, i) => (
                        <div key={s.id} className="flex items-center">
                            <button
                                type="button"
                                onClick={() => setStep(s.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${step === s.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <s.icon size={18} />
                                <span className="text-sm font-bold">{s.name}</span>
                            </button>
                            {i < steps.length - 1 && <ChevronRight size={16} className="mx-1 text-gray-200" />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm flex items-center gap-3">
                            <span className="flex-shrink-0 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center font-bold text-xs">!</span>
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="bg-white p-8 rounded-[2rem] shadow-premium border border-gray-100 animate-slide-up">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                    <FileText size={24} />
                                </div>
                                <h2 className="text-2xl font-display font-bold text-gray-900">Información Básica</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-tight">Nombre del Evento</label>
                                    <input
                                        type="text"
                                        required
                                        name="name"
                                        className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                        placeholder="Ej: Lanzamiento Web 3.0"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-tight">Organización</label>
                                        <select
                                            required
                                            name="organizationId"
                                            className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium text-gray-700 appearance-none"
                                            value={formData.organizationId}
                                            onChange={handleChange}
                                        >
                                            <option value="" disabled>Seleccione organización...</option>
                                            {organizations.map(o => (
                                                <option key={o.id} value={o.id}>{o.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-tight">Tipo de Evento</label>
                                        <select
                                            required
                                            name="eventTypeId"
                                            className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium text-gray-700 appearance-none"
                                            value={formData.eventTypeId}
                                            onChange={handleChange}
                                        >
                                            <option value="" disabled>Seleccione tipo...</option>
                                            {eventTypes.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-tight">Objetivo</label>
                                    <input
                                        type="text"
                                        name="objective"
                                        className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                        placeholder="Objetivo principal del evento..."
                                        value={formData.objective}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-tight">Descripción</label>
                                    <textarea
                                        name="description"
                                        rows="4"
                                        className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                        placeholder="Detalles generales..."
                                        value={formData.description}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-tight flex items-center gap-2">
                                        <MapPin size={16} className="text-emerald-500" />
                                        Recinto / Locación
                                    </label>
                                    <select
                                        required
                                        name="locationId"
                                        className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium text-gray-700 appearance-none"
                                        value={formData.locationId}
                                        onChange={handleChange}
                                    >
                                        <option value="" disabled>Seleccione una locación...</option>
                                        {venues.map(v => (
                                            <option key={v.id} value={v.id}>{v.nombre || v.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-gray-50 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                                >
                                    Continuar
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="bg-white p-8 rounded-[2rem] shadow-premium border border-gray-100 animate-slide-up">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                                    <Calendar size={24} />
                                </div>
                                <h2 className="text-2xl font-display font-bold text-gray-900">Programación</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 ml-1 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div> INICIO DEL EVENTO
                                    </label>
                                    <div className="p-1 px-2 border border-emerald-100 rounded-2xl bg-emerald-50/10 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
                                        <input
                                            type="datetime-local"
                                            name="startsAt"
                                            className="block w-full px-2 py-3 bg-transparent outline-none text-emerald-900 font-bold uppercase text-xs"
                                            value={formData.startsAt}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 ml-1 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div> FINALIZACIÓN
                                    </label>
                                    <div className="p-1 px-2 border border-red-100 rounded-2xl bg-red-50/10 focus-within:ring-4 focus-within:ring-red-500/10 transition-all">
                                        <input
                                            type="datetime-local"
                                            name="endsAt"
                                            className="block w-full px-2 py-3 bg-transparent outline-none text-red-900 font-bold uppercase text-xs"
                                            value={formData.endsAt}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Agenda Section */}
                            <div className="mt-12">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-display font-bold text-gray-900 flex items-center gap-2">
                                        <Clock size={20} className="text-emerald-500" /> Agenda (Minuto a Minuto)
                                    </h3>
                                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-100 uppercase">
                                        {formData.activities.length} Actividades
                                    </span>
                                </div>

                                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <input
                                                type="text"
                                                placeholder="Nombre de la actividad (Ej: Bienvenida, Ponencia...)"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 outline-none font-medium"
                                                value={currentActivity.name}
                                                onChange={(e) => setCurrentActivity({ ...currentActivity, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Inicio</label>
                                            <input
                                                type="time"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-emerald-700"
                                                value={currentActivity.startsAt}
                                                onChange={(e) => setCurrentActivity({ ...currentActivity, startsAt: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Fin</label>
                                            <input
                                                type="time"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-emerald-700"
                                                value={currentActivity.endsAt}
                                                onChange={(e) => setCurrentActivity({ ...currentActivity, endsAt: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (currentActivity.name && currentActivity.startsAt && currentActivity.endsAt) {
                                                setFormData({
                                                    ...formData,
                                                    activities: [...formData.activities, currentActivity]
                                                });
                                                setCurrentActivity({ name: '', startsAt: '', endsAt: '', description: '' });
                                            }
                                        }}
                                        className="w-full py-3 bg-white border border-emerald-200 text-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus size={18} /> Agregar Actividad a la Agenda
                                    </button>
                                </div>

                                <div className="mt-6 space-y-3">
                                    {formData.activities.map((act, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm animate-fade-in">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{act.name}</p>
                                                    <p className="text-xs text-gray-400 font-medium">{act.startsAt} - {act.endsAt}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData({
                                                        ...formData,
                                                        activities: formData.activities.filter((_, i) => i !== index)
                                                    });
                                                }}
                                                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-12 p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                                <div className="text-amber-600"><Info size={24} /></div>
                                <p className="text-sm text-amber-800 leading-relaxed font-medium">
                                    Asegúrese de incluir tiempo adicional para pruebas técnicas antes del inicio oficial.
                                </p>
                            </div>

                            <div className="mt-12 pt-8 border-t border-gray-50 flex justify-between">
                                <button type="button" onClick={() => setStep(1)} className="px-8 py-3.5 rounded-2xl font-bold text-gray-400 hover:text-gray-600 transition-all">Atrás</button>
                                <button type="button" onClick={() => setStep(3)} className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">Continuar <ChevronRight size={18} /></button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="bg-white p-8 rounded-[2rem] shadow-premium border border-gray-100 animate-slide-up">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                    <Briefcase size={24} />
                                </div>
                                <h2 className="text-2xl font-display font-bold text-gray-900">Detalles de la Ficha Técnica</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-tight">Dress Code</label>
                                    <input
                                        type="text"
                                        name="dressCode"
                                        className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                        placeholder="Ej: Formal, Casual, etc."
                                        value={formData.dressCode}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-tight">Programa Impactado</label>
                                    <input
                                        type="text"
                                        name="programImpacted"
                                        className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                        value={formData.programImpacted}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-tight">Especificaciones de Invitados</label>
                                    <textarea
                                        name="guestSpecifications"
                                        rows="2"
                                        className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                        value={formData.guestSpecifications}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-tight">Detalle de Presidium</label>
                                    <textarea
                                        name="presidiumDetail"
                                        rows="2"
                                        className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                        value={formData.presidiumDetail}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-tight">Acción del Director</label>
                                    <textarea
                                        name="directorAction"
                                        rows="2"
                                        className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                        value={formData.directorAction}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-gray-50 flex justify-between">
                                <button type="button" onClick={() => setStep(2)} className="px-8 py-3.5 rounded-2xl font-bold text-gray-400 hover:text-gray-600 transition-all">Atrás</button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-emerald-600 text-white px-10 py-3.5 rounded-2xl font-bold shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all transform hover:-translate-y-1 active:translate-y-0"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Guardando...
                                        </div>
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            Guardar Ficha Técnica
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                {/* Sidebar Summary */}
                <div className="hidden lg:block">
                    <div className="sticky top-10 bg-emerald-900 rounded-[2.5rem] p-10 text-white shadow-premium relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-800 rounded-full blur-3xl opacity-40 -mr-20 -mt-20"></div>

                        <h3 className="text-2xl font-display font-bold mb-8 relative z-10">Resumen</h3>

                        <div className="space-y-6 relative z-10">
                            <div className="space-y-1">
                                <p className="text-emerald-300 font-black text-[10px] uppercase tracking-widest">Proyecto</p>
                                <p className="font-bold text-lg leading-tight truncate">{formData.name || 'Sin título'}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-emerald-300 font-black text-[10px] uppercase tracking-widest">Locación</p>
                                <p className="font-bold text-lg leading-tight truncate">
                                    {venues.find(v => String(v.id) === String(formData.locationId))?.nombre || venues.find(v => String(v.id) === String(formData.locationId))?.name || 'Pendiente'}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-emerald-300 font-black text-[10px] uppercase tracking-widest">Programación</p>
                                <p className="text-sm font-medium text-emerald-50/80">
                                    {formData.startsAt ? new Date(formData.startsAt).toLocaleString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Pendiente de definir'}
                                </p>
                            </div>

                            <div className="pt-6 mt-6 border-t border-emerald-800 space-y-4">
                                <div className={`flex items-center gap-2 text-sm ${formData.name ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                    <CheckCircle2 size={16} /> Información básica
                                </div>
                                <div className={`flex items-center gap-2 text-sm ${formData.startsAt ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                    <CheckCircle2 size={16} /> Horarios definidos
                                </div>
                                <div className={`flex items-center gap-2 text-sm ${formData.objective ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                    <CheckCircle2 size={16} /> Detalles técnicos
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-emerald-950/40 rounded-3xl border border-emerald-800 relative z-10">
                            <p className="text-[10px] text-emerald-400 font-bold uppercase mb-2">Versión</p>
                            <div className="flex items-center gap-2 text-white font-bold">
                                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                {isEditMode ? 'Creando nueva versión' : 'Borrador inicial'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventForm;
