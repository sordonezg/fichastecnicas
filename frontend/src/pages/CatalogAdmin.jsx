import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Mic, Lightbulb, Coffee, Tag, FileText, Plus, Trash2, Package } from 'lucide-react';

const CATEGORIAS = [
    { key: 'audio', label: 'Audio', icon: Mic, color: 'blue' },
    { key: 'iluminacion', label: 'Iluminación', icon: Lightbulb, color: 'amber' },
    { key: 'catering', label: 'Catering', icon: Coffee, color: 'orange' },
    { key: 'mobiliario', label: 'Mobiliario', icon: Tag, color: 'purple' },
    { key: 'documentacion', label: 'Documentación', icon: FileText, color: 'emerald' },
];

const COLOR_STYLES = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', dot: 'bg-blue-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', dot: 'bg-amber-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', dot: 'bg-orange-500' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', dot: 'bg-purple-500' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', dot: 'bg-emerald-500' },
};

const CatalogAdmin = () => {
    const [catalog, setCatalog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState({ categoria: 'audio', nombre: '' });
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');

    const fetchCatalog = async () => {
        try {
            const { data } = await api.get('/catalog');
            setCatalog(data);
        } catch {
            setError('Error al cargar el catálogo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCatalog(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newItem.nombre.trim()) return;
        setAdding(true);
        setError('');
        try {
            const { data } = await api.post('/catalog', newItem);
            setCatalog(prev => [...prev, data]);
            setNewItem(prev => ({ ...prev, nombre: '' }));
        } catch {
            setError('Error al agregar el ítem.');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/catalog/${id}`);
            setCatalog(prev => prev.filter(c => c.id !== id));
        } catch {
            setError('Error al eliminar el ítem.');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-gray-400 font-bold text-sm tracking-widest uppercase">Cargando Catálogo</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in font-sans">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 text-emerald-600 font-bold text-sm uppercase tracking-wider mb-3">
                    <Package size={16} /> Administración
                </div>
                <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Catálogo de Requisitos</h1>
                <p className="text-gray-500">Administre los ítems disponibles en cada categoría del formulario de solicitud.</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm mb-6 flex items-center gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center font-bold text-xs">!</span>
                    {error}
                </div>
            )}

            {/* Add form */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm mb-8">
                <h2 className="text-lg font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Plus size={18} className="text-emerald-500" /> Agregar Nuevo Ítem
                </h2>
                <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
                    <select
                        value={newItem.categoria}
                        onChange={e => setNewItem(prev => ({ ...prev, categoria: e.target.value }))}
                        className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-semibold text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    >
                        {CATEGORIAS.map(c => (
                            <option key={c.key} value={c.key}>{c.label}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        required
                        placeholder="Nombre del ítem (ej: Micrófono de mano)..."
                        value={newItem.nombre}
                        onChange={e => setNewItem(prev => ({ ...prev, nombre: e.target.value }))}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-medium text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-gray-300"
                    />
                    <button
                        type="submit"
                        disabled={adding}
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100 transition-all disabled:opacity-60 whitespace-nowrap"
                    >
                        <Plus size={16} /> {adding ? 'Agregando...' : 'Agregar'}
                    </button>
                </form>
            </div>

            {/* Categories */}
            <div className="space-y-6">
                {CATEGORIAS.map(cat => {
                    const items = catalog.filter(c => c.categoria === cat.key);
                    const cs = COLOR_STYLES[cat.color];
                    return (
                        <div key={cat.key} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 ${cs.bg} ${cs.text} rounded-2xl flex items-center justify-center`}>
                                        <cat.icon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-display font-bold text-gray-900">{cat.label}</h3>
                                        <p className="text-xs text-gray-400">{items.length} ítems</p>
                                    </div>
                                </div>
                            </div>

                            {items.length === 0 ? (
                                <p className="text-sm text-gray-300 italic text-center py-6">Sin ítems en esta categoría.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {items.map(item => (
                                        <li key={item.id} className={`flex items-center justify-between px-4 py-3 ${cs.bg} border ${cs.border} rounded-2xl group`}>
                                            <div className="flex items-center gap-3">
                                                <span className={`w-1.5 h-1.5 rounded-full ${cs.dot} flex-shrink-0`}></span>
                                                <span className="text-sm font-semibold text-gray-700">{item.nombre}</span>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                title="Eliminar ítem"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CatalogAdmin;
