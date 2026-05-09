import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    ArrowLeft, Calendar, Clock, User, Users, Mic, Lightbulb,
    Coffee, FileText, CheckCircle, XCircle, ExternalLink, Tag, Check, MapPin
} from 'lucide-react';
import { getVenues } from '../api/venues';

const StatusBadge = ({ estado }) => {
    const styles = {
        aceptado: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        rechazado: 'bg-red-50 text-red-700 border-red-100',
        pendiente: 'bg-amber-50 text-amber-700 border-amber-100',
    };
    const dots = {
        aceptado: 'bg-emerald-500',
        rechazado: 'bg-red-500',
        pendiente: 'bg-amber-500',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${styles[estado] || styles.pendiente}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dots[estado] || dots.pendiente}`}></span>
            {estado}
        </span>
    );
};

const RequirementSection = ({ icon: Icon, label, value, catalog, iconColor = 'text-gray-400' }) => {
    const renderContent = () => {
        if (!value || (Array.isArray(value) && value.length === 0)) {
            return <span className="text-gray-300 font-normal italic">No especificado</span>;
        }

        if (Array.isArray(value)) {
            return (
                <div className="flex flex-wrap gap-2 mt-2">
                    {value.map(id => {
                        const item = catalog.find(c => String(c.id) === String(id));
                        return (
                            <span key={id} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${iconColor.replace('text-', 'bg-').replace('-500', '-50').replace('-400', '-50')} ${iconColor} border border-current opacity-70`}>
                                <Check size={12} />
                                {item ? item.nombre : `Item #${id}`}
                            </span>
                        );
                    })}
                </div>
            );
        }

        // Legacy string data
        return <p className="text-sm font-semibold text-gray-800">{value}</p>;
    };

    return (
        <div className="flex items-start gap-4 py-6 border-b border-gray-50 last:border-0">
            <div className={`mt-0.5 ${iconColor}`}><Icon size={18} /></div>
            <div className="flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                {renderContent()}
            </div>
        </div>
    );
};

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [catalog, setCatalog] = useState([]);
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventRes, catalogRes, venuesRes] = await Promise.all([
                    api.get('/events'),
                    api.get('/catalog'),
                    getVenues()
                ]);

                const found = eventRes.data.find(e => String(e.id) === String(id));
                if (!found) setError('Evento no encontrado.');
                else {
                    setEvent(found);
                    setCatalog(catalogRes.data);
                    setVenues(venuesRes);
                }
            } catch {
                setError('Error al cargar la información.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleStatus = async (newStatus) => {
        setActionLoading(true);
        try {
            await api.patch(`/events/${id}/status`, { estado: newStatus });
            setEvent(prev => ({ ...prev, estado: newStatus }));
        } catch {
            alert('Error al actualizar el estado del evento.');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-gray-400 font-bold text-sm tracking-widest uppercase">Cargando Ficha</p>
        </div>
    );

    if (error || !event) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
            <p className="text-2xl font-bold text-gray-300">😕</p>
            <p className="text-gray-500 font-semibold">{error || 'Evento no encontrado.'}</p>
            <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition">
                Volver al Dashboard
            </button>
        </div>
    );

    const req = event.requisitos_tecnicos || {};

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in font-sans">
            {/* Back + Title */}
            <div className="mb-10">
                <button
                    onClick={() => navigate('/')}
                    className="group flex items-center gap-2 text-gray-400 hover:text-emerald-600 mb-4 transition-all font-bold text-sm uppercase tracking-widest"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Volver
                </button>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2 leading-tight">{event.titulo}</h1>
                        <StatusBadge estado={event.estado} />
                    </div>
                    {user?.nivel_permiso === 1 && event.estado === 'pendiente' && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleStatus('aceptado')}
                                disabled={actionLoading}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100 transition-all disabled:opacity-60"
                            >
                                <CheckCircle size={16} /> Aceptar
                            </button>
                            <button
                                onClick={() => handleStatus('rechazado')}
                                disabled={actionLoading}
                                className="flex items-center gap-2 bg-white border border-red-100 text-red-600 hover:bg-red-50 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all disabled:opacity-60"
                            >
                                <XCircle size={16} /> Rechazar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText size={18} className="text-emerald-500" /> Descripción
                        </h2>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            {event.descripcion || <span className="italic text-gray-300">Sin descripción adicional.</span>}
                        </p>
                    </div>

                    {/* Agenda / Minuto a Minuto */}
                    {event.activities && event.activities.length > 0 && (
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-lg font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Clock size={18} className="text-emerald-500" /> Agenda del Evento
                            </h2>
                            <div className="space-y-4">
                                {event.activities.map((act, index) => (
                                    <div key={index} className="flex gap-4 group">
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                {index + 1}
                                            </div>
                                            {index < event.activities.length - 1 && (
                                                <div className="w-0.5 h-full bg-gray-50 group-hover:bg-emerald-50 transition-colors my-1"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 pb-6">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-bold text-gray-900">{act.name}</h4>
                                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                    {act.startsAt} - {act.endsAt}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">{act.description || 'Sin descripción adicional.'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Technical Requirements / Detalles Específicos */}
                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm space-y-6">
                        <h2 className="text-lg font-display font-bold text-gray-900 mb-2 flex items-center gap-2 border-b border-gray-50 pb-4">
                            <Mic size={18} className="text-blue-500" /> Detalles de la Ficha Técnica
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Objetivo</p>
                                <p className="text-sm font-semibold text-gray-800">{event.objective || <span className="text-gray-300 italic">No especificado</span>}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dress Code</p>
                                <p className="text-sm font-semibold text-gray-800">{event.dressCode || <span className="text-gray-300 italic">No especificado</span>}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Programa Impactado</p>
                                <p className="text-sm font-semibold text-gray-800">{event.programImpacted || <span className="text-gray-300 italic">No especificado</span>}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Especificaciones de Invitados</p>
                                <p className="text-sm font-semibold text-gray-800">{event.guestSpecifications || <span className="text-gray-300 italic">No especificado</span>}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Detalle de Presidium</p>
                                <p className="text-sm font-semibold text-gray-800">{event.presidiumDetail || <span className="text-gray-300 italic">No especificado</span>}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Acción del Director</p>
                                <p className="text-sm font-semibold text-gray-800">{event.directorAction || <span className="text-gray-300 italic">No especificado</span>}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-emerald-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800 rounded-full blur-3xl opacity-40 -mr-16 -mt-16"></div>
                        <h3 className="text-emerald-300 text-xs font-black uppercase tracking-widest mb-6 relative z-10">Detalles del Evento</h3>
                        <div className="space-y-5 relative z-10">
                            <div className="flex items-start gap-3">
                                <Calendar size={18} className="text-emerald-400 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black text-emerald-400 uppercase">Inicio</p>
                                    <p className="text-sm font-bold">
                                        {format(new Date(event.fecha_inicio), "d 'de' MMMM yyyy", { locale: es })}
                                    </p>
                                    <p className="text-xs text-emerald-300/70 font-medium">
                                        {format(new Date(event.fecha_inicio), 'HH:mm', { locale: es })} hrs
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock size={18} className="text-emerald-400 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black text-emerald-400 uppercase">Finalización</p>
                                    <p className="text-sm font-bold">
                                        {format(new Date(event.fecha_fin), "d 'de' MMMM yyyy", { locale: es })}
                                    </p>
                                    <p className="text-xs text-emerald-300/70 font-medium">
                                        {format(new Date(event.fecha_fin), 'HH:mm', { locale: es })} hrs
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin size={18} className="text-emerald-400 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black text-emerald-400 uppercase">Recinto</p>
                                    <p className="text-sm font-bold truncate">
                                        {venues.find(v => String(v.id) === String(event.venue_id))?.nombre || 'No especificado'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Users size={18} className="text-emerald-400 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black text-emerald-400 uppercase">Asistentes</p>
                                    <p className="text-sm font-bold">{event.asistentes ? `${event.asistentes} personas` : 'No especificado'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <User size={18} className="text-emerald-400 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black text-emerald-400 uppercase">Responsable</p>
                                    <p className="text-sm font-bold">{event.user?.nombre || 'No asignado'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
