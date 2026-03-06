import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { getVenues } from '../api/venues';
import { Calendar, Clock, Mic, Lightbulb, Coffee, FileText, ArrowLeft, ArrowRight, Save, CheckCircle2, ChevronRight, Info, Tag, MapPin } from 'lucide-react';

const CATEGORIAS = [
    { key: 'audio', label: 'Audio', icon: Mic, color: 'text-blue-500' },
    { key: 'iluminacion', label: 'Iluminación', icon: Lightbulb, color: 'text-amber-500' },
    { key: 'catering', label: 'Catering', icon: Coffee, color: 'text-orange-500' },
    { key: 'mobiliario', label: 'Mobiliario', icon: Tag, color: 'text-purple-500' },
];

const EventForm = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [catalog, setCatalog] = useState([]);
    const [venues, setVenues] = useState([]);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        asistentes: '',
        fecha_inicio: '',
        fecha_fin: '',
        venue_id: '',
        requisitos_tecnicos: {
            audio: [],
            iluminacion: [],
            catering: [],
            mobiliario: [],
            documentacion_url: ''
        }
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [catalogRes, venuesRes] = await Promise.all([
                    api.get('/catalog'),
                    getVenues()
                ]);
                setCatalog(catalogRes.data);
                setVenues(venuesRes.filter(v => v.activo));

                if (isEditMode) {
                    const { data: events } = await api.get('/events');
                    const currentEvent = events.find(e => String(e.id) === String(id));
                    if (currentEvent) {
                        setFormData({
                            titulo: currentEvent.titulo,
                            descripcion: currentEvent.descripcion,
                            asistentes: currentEvent.asistentes || '',
                            // Ensure dates are correctly formatted for datetime-local
                            fecha_inicio: currentEvent.fecha_inicio ? new Date(currentEvent.fecha_inicio).toISOString().slice(0, 16) : '',
                            fecha_fin: currentEvent.fecha_fin ? new Date(currentEvent.fecha_fin).toISOString().slice(0, 16) : '',
                            venue_id: currentEvent.venue_id,
                            requisitos_tecnicos: {
                                audio: currentEvent.requisitos_tecnicos.audio || [],
                                iluminacion: currentEvent.requisitos_tecnicos.iluminacion || [],
                                catering: currentEvent.requisitos_tecnicos.catering || [],
                                mobiliario: currentEvent.requisitos_tecnicos.mobiliario || [],
                                documentacion_url: currentEvent.requisitos_tecnicos.documentacion_url || ''
                            }
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
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (categoria, itemId) => {
        setFormData(prev => {
            const current = prev.requisitos_tecnicos[categoria] || [];
            const updated = current.includes(itemId)
                ? current.filter(id => id !== itemId)
                : [...current, itemId];

            return {
                ...prev,
                requisitos_tecnicos: {
                    ...prev.requisitos_tecnicos,
                    [categoria]: updated
                }
            };
        });
    };

    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Manual validation for fields in hidden steps
        if (!formData.titulo.trim() || !formData.venue_id || !formData.asistentes) {
            setStep(1);
            setError('Por favor complete todos los campos obligatorios.');
            return;
        }

        const selectedVenue = venues.find(v => String(v.id) === String(formData.venue_id));
        if (selectedVenue && parseInt(formData.asistentes) > selectedVenue.capacidad) {
            setStep(1);
            setError(`El recinto seleccionado no tiene capacidad suficiente. Máximo permitido: ${selectedVenue.capacidad}.`);
            return;
        }

        if (!formData.fecha_inicio || !formData.fecha_fin) {
            setStep(2);
            setError('Por favor seleccione las fechas del evento.');
            return;
        }
        if (new Date(formData.fecha_fin) <= new Date(formData.fecha_inicio)) {
            setStep(2);
            setError('La fecha de finalización debe ser posterior a la de inicio.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            if (isEditMode) {
                // When rescheduling, we also want to return it to 'pendiente' status. 
                // However, our backend update endpoint only updates data, so we might need a status reset. 
                // For simplicity, we assume editing a rejected event resubmits it for approval (this requires backend change to set it back to pendiente).
                await api.put(`/events/${id}`, { ...formData, estado: 'pendiente' });
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
        { id: 3, name: 'Técnico', icon: Mic },
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
                    <h1 className="text-4xl font-display font-bold text-gray-900">{isEditMode ? 'Reagendar Evento' : 'Nueva Solicitud'}</h1>
                    <p className="text-gray-500 font-medium">{isEditMode ? 'Edite la fecha o recinto para reprogramar su evento' : 'Configure los detalles técnicos de su evento'}</p>
                </div>

                {/* Vertical/Horizontal Steps indicator */}
                <div className="flex items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    {steps.map((s, i) => (
                        <div key={s.id} className="flex items-center">
                            <button
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
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-tight">Título del Evento</label>
                                    <input
                                        type="text"
                                        required
                                        name="titulo"
                                        className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                        placeholder="Ej: Lanzamiento Web 3.0"
                                        value={formData.titulo}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-tight">Descripción</label>
                                    <textarea
                                        name="descripcion"
                                        rows="6"
                                        className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                        placeholder="Objetivo y detalles generales del evento..."
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-tight flex items-center gap-2">
                                            👥 Asistentes Estimados
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            name="asistentes"
                                            className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium placeholder:text-gray-300"
                                            placeholder="Ej: 50"
                                            value={formData.asistentes}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-tight flex items-center gap-2">
                                            <MapPin size={16} className="text-emerald-500" />
                                            Recinto
                                        </label>
                                        <select
                                            required
                                            name="venue_id"
                                            className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium text-gray-700 appearance-none"
                                            value={formData.venue_id}
                                            onChange={handleChange}
                                        >
                                            <option value="" disabled>Seleccione un recinto...</option>
                                            {venues.map(v => (
                                                <option key={v.id} value={v.id}>{v.nombre} (Capacidad: {v.capacidad})</option>
                                            ))}
                                        </select>
                                    </div>
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
                                            name="fecha_inicio"
                                            className="block w-full px-2 py-3 bg-transparent outline-none text-emerald-900 font-bold uppercase text-xs"
                                            value={formData.fecha_inicio}
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
                                            name="fecha_fin"
                                            className="block w-full px-2 py-3 bg-transparent outline-none text-red-900 font-bold uppercase text-xs"
                                            value={formData.fecha_fin}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                                <div className="text-amber-600"><Info size={24} /></div>
                                <p className="text-sm text-amber-800 leading-relaxed font-medium">
                                    Asegúrese de incluir tiempo adicional para pruebas técnicas antes del inicio oficial. Los eventos se bloquean en el calendario una vez aprobados.
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
                                    <Mic size={24} />
                                </div>
                                <h2 className="text-2xl font-display font-bold text-gray-900">Especificaciones Técnicas</h2>
                            </div>

                            <div className="space-y-10">
                                {CATEGORIAS.map(cat => (
                                    <div key={cat.key}>
                                        <label className={`flex items-center gap-2 text-sm font-black text-gray-400 mb-5 uppercase tracking-widest pl-1`}>
                                            <cat.icon size={16} className={cat.color} /> {cat.label}
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {catalog.filter(item => item.categoria === cat.key).map(item => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => handleCheckboxChange(cat.key, item.id)}
                                                    className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${formData.requisitos_tecnicos[cat.key]?.includes(item.id)
                                                        ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                                                        : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                                                        }`}
                                                >
                                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.requisitos_tecnicos[cat.key]?.includes(item.id)
                                                        ? 'bg-emerald-600 border-emerald-600'
                                                        : 'bg-white border-gray-300 group-hover:border-emerald-300'
                                                        }`}>
                                                        {formData.requisitos_tecnicos[cat.key]?.includes(item.id) && <CheckCircle2 size={14} className="text-white" />}
                                                    </div>
                                                    <span className={`text-sm font-bold ${formData.requisitos_tecnicos[cat.key]?.includes(item.id) ? 'text-emerald-900' : 'text-gray-600'
                                                        }`}>
                                                        {item.nombre}
                                                    </span>
                                                </div>
                                            ))}
                                            {catalog.filter(item => item.categoria === cat.key).length === 0 && (
                                                <p className="text-xs text-gray-400 italic col-span-2">No hay ítems configurados para esta categoría.</p>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-black text-gray-400 mb-3 uppercase tracking-widest pl-1">
                                        <FileText size={16} className="text-purple-500" /> Documentación Adicional (URL)
                                    </label>
                                    <input
                                        type="url"
                                        name="requisitos_tecnicos.documentacion_url"
                                        className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm font-medium transition-all"
                                        placeholder="https://drive.google.com/..."
                                        value={formData.requisitos_tecnicos.documentacion_url}
                                        onChange={handleChange}
                                    />
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
                                            Enviando...
                                        </div>
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            Finalizar Solicitud
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
                                <p className="font-bold text-lg leading-tight truncate">{formData.titulo || 'Sin título'}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-emerald-300 font-black text-[10px] uppercase tracking-widest">Recinto</p>
                                <p className="font-bold text-lg leading-tight truncate">
                                    {venues.find(v => String(v.id) === String(formData.venue_id))?.nombre || 'Pendiente de definir'}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-emerald-300 font-black text-[10px] uppercase tracking-widest">Programación</p>
                                <p className="text-sm font-medium text-emerald-50/80">
                                    {formData.fecha_inicio ? new Date(formData.fecha_inicio).toLocaleString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Pendiente de definir'}
                                </p>
                            </div>

                            <div className="pt-6 mt-6 border-t border-emerald-800 space-y-4">
                                <div className={`flex items-center gap-2 text-sm ${formData.titulo ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                    <CheckCircle2 size={16} /> Información básica
                                </div>
                                <div className={`flex items-center gap-2 text-sm ${formData.fecha_inicio ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                    <CheckCircle2 size={16} /> Horarios definidos
                                </div>
                                <div className={`flex items-center gap-2 text-sm ${Object.values(formData.requisitos_tecnicos).some(v => Array.isArray(v) ? v.length > 0 : !!v) ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                    <CheckCircle2 size={16} /> Ficha técnica ({Object.values(formData.requisitos_tecnicos).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0)} ítems)
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-emerald-950/40 rounded-3xl border border-emerald-800 relative z-10">
                            <p className="text-[10px] text-emerald-400 font-bold uppercase mb-2">Estado</p>
                            <div className="flex items-center gap-2 text-white font-bold">
                                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                Borrador en curso
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventForm;
