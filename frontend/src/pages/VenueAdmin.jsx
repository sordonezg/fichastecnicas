import { useState, useEffect } from 'react';
import { getVenues, createVenue, updateVenue, deleteVenue } from '../api/venues';
import { MapPin, Plus, Trash2, Edit2, X, Check } from 'lucide-react';

const VenueAdmin = () => {
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newVenue, setNewVenue] = useState({ nombre: '', capacidad: '', activo: true });
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ nombre: '', capacidad: '', activo: true });

    const fetchVenues = async () => {
        try {
            const data = await getVenues();
            setVenues(data);
        } catch {
            setError('Error al cargar los recintos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVenues(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newVenue.nombre.trim() || !newVenue.capacidad) return;
        setAdding(true);
        setError('');
        try {
            const data = await createVenue({
                ...newVenue,
                capacidad: parseInt(newVenue.capacidad)
            });
            setVenues(prev => [...prev, data]);
            setNewVenue({ nombre: '', capacidad: '', activo: true });
        } catch {
            setError('Error al agregar el recinto.');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar este recinto?')) return;
        try {
            await deleteVenue(id);
            setVenues(prev => prev.filter(v => v.id !== id));
        } catch {
            setError('Error al eliminar el recinto.');
        }
    };

    const startEditing = (venue) => {
        setEditingId(venue.id);
        setEditForm({
            nombre: venue.nombre,
            capacidad: venue.capacidad,
            activo: venue.activo
        });
    };

    const handleUpdate = async () => {
        if (!editForm.nombre.trim() || !editForm.capacidad) return;
        try {
            const updated = await updateVenue(editingId, {
                ...editForm,
                capacidad: parseInt(editForm.capacidad)
            });
            setVenues(prev => prev.map(v => v.id === editingId ? updated : v));
            setEditingId(null);
        } catch {
            setError('Error al actualizar el recinto.');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-gray-400 font-bold text-sm tracking-widest uppercase">Cargando Recintos</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in font-sans">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 text-emerald-600 font-bold text-sm uppercase tracking-wider mb-3">
                    <MapPin size={16} /> Administración
                </div>
                <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Gestión de Recintos</h1>
                <p className="text-gray-500">Administre los recintos disponibles, su capacidad y visibilidad operativa.</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm mb-6 flex items-center gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center font-bold text-xs">!</span>
                    {error}
                </div>
            )}

            {/* Add filter */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm mb-8">
                <h2 className="text-lg font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Plus size={18} className="text-emerald-500" /> Nuevo Recinto
                </h2>
                <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        required
                        placeholder="Nombre (ej: Aula Magna)"
                        value={newVenue.nombre}
                        onChange={e => setNewVenue(prev => ({ ...prev, nombre: e.target.value }))}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-medium text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-gray-300"
                    />
                    <input
                        type="number"
                        required
                        min="1"
                        placeholder="Capacidad"
                        value={newVenue.capacidad}
                        onChange={e => setNewVenue(prev => ({ ...prev, capacidad: e.target.value }))}
                        className="w-32 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-medium text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-gray-300"
                    />
                    <label className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold cursor-pointer">
                        <input
                            type="checkbox"
                            checked={newVenue.activo}
                            onChange={(e) => setNewVenue(prev => ({ ...prev, activo: e.target.checked }))}
                            className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                        />
                        Activo
                    </label>
                    <button
                        type="submit"
                        disabled={adding}
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100 transition-all disabled:opacity-60 whitespace-nowrap"
                    >
                        <Plus size={16} /> {adding ? 'Guardando...' : 'Agregar'}
                    </button>
                </form>
            </div>

            {/* Venues List */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                {venues.length === 0 ? (
                    <p className="text-sm text-gray-300 italic text-center py-6">No hay recintos registrados.</p>
                ) : (
                    <ul className="space-y-3">
                        {venues.map(venue => (
                            <li key={venue.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl group transition-colors">
                                {editingId === venue.id ? (
                                    <div className="flex flex-1 items-center gap-3">
                                        <input
                                            type="text"
                                            value={editForm.nombre}
                                            onChange={e => setEditForm(prev => ({ ...prev, nombre: e.target.value }))}
                                            className="flex-1 px-3 py-2 bg-white border border-emerald-200 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                        <input
                                            type="number"
                                            value={editForm.capacidad}
                                            onChange={e => setEditForm(prev => ({ ...prev, capacidad: e.target.value }))}
                                            className="w-24 px-3 py-2 bg-white border border-emerald-200 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={editForm.activo}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, activo: e.target.checked }))}
                                                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                            />
                                        </label>
                                    </div>
                                ) : (
                                    <div className="flex flex-1 items-center justify-between pl-2 sm:pr-8">
                                        <div className="flex items-center gap-4">
                                            <MapPin size={18} className="text-emerald-500 opacity-70" />
                                            <div>
                                                <span className="text-sm font-bold text-gray-900 block">{venue.nombre}</span>
                                                <span className="text-xs font-semibold text-emerald-600">Capacidad: {venue.capacidad} pers.</span>
                                            </div>
                                        </div>
                                        <div className={`px-2 py-1 rounded-md text-[10px] uppercase font-black tracking-wider ${venue.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
                                            {venue.activo ? 'Activo' : 'Inactivo'}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mt-4 sm:mt-0 justify-end">
                                    {editingId === venue.id ? (
                                        <>
                                            <button
                                                onClick={handleUpdate}
                                                className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all"
                                                title="Guardar Cambios"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-all"
                                                title="Cancelar"
                                            >
                                                <X size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => startEditing(venue)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all"
                                                title="Editar Recinto"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(venue.id)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="Eliminar Recinto"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default VenueAdmin;
