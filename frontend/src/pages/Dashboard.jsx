import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, Info, Plus, Calendar as CalendarIcon, Users, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('calendar'); // 'calendar' or 'list'

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data } = await api.get('/events');
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (eventId, newStatus) => {
        try {
            await api.patch(`/events/${eventId}/status`, { estado: newStatus });
            fetchEvents();
        } catch (error) {
            alert('Error al actualizar el estado del evento');
        }
    };

    const renderHeader = () => (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 animate-fade-in">
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-wider mb-2">
                    <CalendarIcon size={16} />
                    {format(currentMonth, 'yyyy')}
                </div>
                <h2 className="text-4xl font-display font-bold text-gray-900 capitalize">
                    {format(currentMonth, 'MMMM', { locale: es })}
                </h2>
                <p className="text-gray-500 font-medium">Panel de gestión y control de disponibilidad</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    <button
                        onClick={() => setView('calendar')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'calendar' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Calendario
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'list' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Lista
                    </button>
                </div>

                <div className="h-10 w-px bg-gray-200 mx-2 hidden md:block"></div>

                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 rounded-lg transition-all">
                        <ChevronLeft size={22} />
                    </button>
                    <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1.5 text-xs font-bold text-emerald-600 uppercase hover:bg-emerald-50 rounded-lg transition-all">
                        Hoy
                    </button>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 rounded-lg transition-all">
                        <ChevronRight size={22} />
                    </button>
                </div>

                {(user?.nivel_permiso === 2 || user?.nivel_permiso === 3) && (
                    <Link to="/nuevo-evento" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transform hover:-translate-y-0.5 active:translate-y-0">
                        <Plus size={20} />
                        Crear Solicitud
                    </Link>
                )}
            </div>
        </div>
    );

    const renderCalendar = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { locale: es });
        const endDate = endOfWeek(monthEnd, { locale: es });

        const rows = [];
        let days = [];
        let day = startDate;

        const weekdayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const dayEvents = events.filter(e => isSameDay(new Date(e.fecha_inicio), cloneDay));
                const isSelected = isSameDay(day, selectedDay);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isTodayFormatted = isSameDay(day, new Date());

                days.push(
                    <div
                        key={day.toString()}
                        className={`min-h-[120px] p-3 border border-gray-100 transition-all cursor-pointer relative flex flex-col gap-1.5 ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-300' : 'bg-white text-gray-700'
                            } ${isSelected ? 'shadow-inner bg-emerald-50/10' : 'hover:bg-emerald-50/20'}`}
                        onClick={() => setSelectedDay(cloneDay)}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-lg transition-all ${isTodayFormatted ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' :
                                    isSelected ? 'text-emerald-600 font-black' : ''
                                }`}>
                                {format(day, 'd')}
                            </span>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></div>}
                        </div>

                        <div className="flex-1 space-y-1 container-events">
                            {dayEvents.slice(0, 3).map(event => (
                                <div
                                    key={event.id}
                                    className={`text-[9px] px-1.5 py-1 rounded-md font-bold truncate transition-transform hover:scale-105 ${event.estado === 'aceptado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                            event.estado === 'rechazado' ? 'bg-red-50 text-red-700 border border-red-100' :
                                                'bg-amber-50 text-amber-700 border border-amber-100'
                                        }`}
                                >
                                    {event.titulo}
                                </div>
                            ))}
                            {dayEvents.length > 3 && (
                                <div className="text-[10px] text-gray-400 font-semibold pl-1">
                                    + {dayEvents.length - 3} más
                                </div>
                            )}
                        </div>
                    </div>
                );
                day = new Date(day.getTime() + 86400000);
            }
            rows.push(
                <div className="grid grid-cols-7" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }

        return (
            <div className="bg-white rounded-[2rem] shadow-premium overflow-hidden border border-gray-100 animate-slide-up">
                <div className="grid grid-cols-7 bg-white border-b border-gray-100">
                    {weekdayHeaders.map(day => (
                        <div key={day} className="py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            {day}
                        </div>
                    ))}
                </div>
                <div>{rows}</div>
            </div>
        );
    };

    const EventCard = ({ event }) => (
        <div className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-premium hover:border-emerald-100 transition-all animate-fade-in duration-300 relative overflow-hidden">
            {/* Visual Accent */}
            <div className={`absolute top-0 right-0 w-16 h-16 opacity-5 -mr-8 -mt-8 rounded-full ${event.estado === 'aceptado' ? 'bg-emerald-600' :
                    event.estado === 'rechazado' ? 'bg-red-600' :
                        'bg-amber-600'
                }`}></div>

            <div className="flex justify-between items-start mb-4">
                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border shadow-sm ${event.estado === 'aceptado' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        event.estado === 'rechazado' ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${event.estado === 'aceptado' ? 'bg-emerald-500' :
                            event.estado === 'rechazado' ? 'bg-red-500' :
                                'bg-amber-500'
                        }`}></div>
                    {event.estado}
                </div>
                <div className="text-xs font-bold text-gray-400 flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                    <Clock size={14} className="text-gray-300" />
                    {format(new Date(event.fecha_inicio), 'p')}
                </div>
            </div>

            <h4 className="text-lg font-display font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors leading-tight">
                {event.titulo}
            </h4>
            <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed">
                {event.descripcion || 'Sin descripción adicional disponible.'}
            </p>

            <div className="flex items-center justify-between pt-5 border-t border-gray-50">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-emerald-100">
                        {event.user?.nombre?.charAt(0)}
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Responsable</p>
                        <p className="text-sm font-bold text-gray-700 -mt-0.5">{event.user?.nombre || 'General'}</p>
                    </div>
                </div>

                <Link to={`/evento/${event.id}`} className="p-2 text-gray-300 hover:text-emerald-600 transition-colors">
                    <Info size={18} />
                </Link>
            </div>

            {user?.nivel_permiso === 1 && event.estado === 'pendiente' && (
                <div className="grid grid-cols-2 gap-3 mt-6">
                    <button
                        onClick={() => handleStatusChange(event.id, 'aceptado')}
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-100 border border-emerald-500"
                    >
                        <CheckCircle size={14} />
                        Aceptar
                    </button>
                    <button
                        onClick={() => handleStatusChange(event.id, 'rechazado')}
                        className="flex items-center justify-center gap-2 bg-white border border-red-100 text-red-600 hover:bg-red-50 py-2.5 rounded-xl text-xs font-bold transition-all"
                    >
                        <XCircle size={14} />
                        Rechazar
                    </button>
                </div>
            )}
        </div>
    );

    const renderContent = () => {
        if (view === 'calendar') {
            const selectedDayEvents = events.filter(e => isSameDay(new Date(e.fecha_inicio), selectedDay));

            return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-4">
                        {renderCalendar()}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-premium">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-display font-bold text-gray-900 group">
                                    Agenda del {format(selectedDay, 'd MMM', { locale: es })}
                                </h3>
                                <span className="bg-emerald-100 text-emerald-700 font-black text-[10px] px-2.5 py-1 rounded-full border border-emerald-200 uppercase">
                                    {selectedDayEvents.length} eventos
                                </span>
                            </div>

                            <div className="space-y-4">
                                {selectedDayEvents.map(event => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                                {selectedDayEvents.length === 0 && (
                                    <div className="py-16 text-center">
                                        <div className="w-16 h-16 bg-gray-50 text-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-50 shadow-inner">
                                            <CalendarIcon size={32} />
                                        </div>
                                        <p className="text-gray-400 font-bold text-sm">Libre disponibilidad</p>
                                        <p className="text-gray-300 text-xs mt-1">No hay eventos para este día.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Admin Metrics/Quick Actions placeholder */}
                        {user?.nivel_permiso === 1 && (
                            <div className="bg-emerald-900 p-8 rounded-[2rem] shadow-premium text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800 rounded-full blur-2xl opacity-40 -mr-16 -mt-16"></div>
                                <div className="relative z-10">
                                    <h4 className="text-emerald-200 text-xs font-black uppercase tracking-widest mb-4">Métricas del Sistema</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-2xl font-display font-bold">{events.filter(e => e.estado === 'pendiente').length}</p>
                                            <p className="text-emerald-300/80 text-[10px] font-bold uppercase">Pendientes</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-display font-bold">{events.filter(e => e.estado === 'aceptado').length}</p>
                                            <p className="text-emerald-300/80 text-[10px] font-bold uppercase">Activos</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-display font-bold text-gray-900">Todas las Solicitudes</h3>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 shadow-sm transition-all">
                            <Filter size={14} /> Filtros
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 shadow-sm transition-all">
                            <Users size={14} /> Mis Eventos
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {events.map(event => <EventCard key={event.id} event={event} />)}
                </div>
            </div>
        );
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-gray-400 font-bold text-sm tracking-widest uppercase">Cargando Plataforma</p>
        </div>
    );

    return (
        <div className="pb-20">
            {renderHeader()}
            {renderContent()}
        </div>
    );
};

export default Dashboard;
