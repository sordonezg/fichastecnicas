import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Edit2, Trash2, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

const roleNames = {
    1: 'Verde (Admin)',
    2: 'Blanco (Editor)',
    3: 'Gris (Lector)'
};

const roleColors = {
    1: 'bg-green-100 text-green-800',
    2: 'bg-gray-100 text-gray-800',
    3: 'bg-slate-200 text-slate-800'
};

const roleIcons = {
    1: <ShieldCheck className="w-4 h-4 mr-1 text-green-600" />,
    2: <Shield className="w-4 h-4 mr-1 text-gray-600" />,
    3: <ShieldAlert className="w-4 h-4 mr-1 text-slate-500" />
};

export default function UserAdmin() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        nivel_permiso: 3
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            setError('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (user = null) => {
        setEditingUser(user);
        if (user) {
            setFormData({ nombre: user.nombre, email: user.email, password: '', nivel_permiso: user.nivel_permiso });
        } else {
            setFormData({ nombre: '', email: '', password: '', nivel_permiso: 3 });
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingUser(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingUser) {
                const dataToSend = { ...formData };
                if (!dataToSend.password) delete dataToSend.password; // Don't update if blank
                await updateUser(editingUser.id, dataToSend);
            } else {
                if (!formData.password) {
                    setError('La contraseña es obligatoria para nuevos usuarios');
                    return;
                }
                await createUser(formData);
            }
            await loadUsers();
            handleCloseForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al guardar usuario');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;
        try {
            await deleteUser(id);
            await loadUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Error al eliminar usuario');
        }
    };

    if (user?.nivel_permiso !== 1) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <ShieldAlert className="w-16 h-16 text-slate-400 mb-4" />
                <h2 className="text-xl font-semibold text-slate-700">Acceso Denegado</h2>
                <p className="text-slate-500">No tienes permisos para ver esta página.</p>
            </div>
        );
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Cargando usuarios...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Administración de Usuarios</h1>
                    <p className="text-slate-500">Gestiona los accesos y permisos del sistema.</p>
                </div>
                <button
                    onClick={() => handleOpenForm()}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-teal-600 rounded-lg hover:bg-teal-700"
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Nuevo Usuario
                </button>
            </div>

            {error && !isFormOpen && (
                <div className="p-4 text-red-700 bg-red-100 rounded-lg">{error}</div>
            )}

            <div className="overflow-hidden bg-white border rounded-xl border-slate-200">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                            <th className="px-6 py-4 font-medium">Nombre</th>
                            <th className="px-6 py-4 font-medium">Email</th>
                            <th className="px-6 py-4 font-medium">Nivel de Permiso</th>
                            <th className="px-6 py-4 font-medium text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 font-medium text-slate-900">{u.nombre}</td>
                                <td className="px-6 py-4 text-slate-500">{u.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[u.nivel_permiso]}`}>
                                        {roleIcons[u.nivel_permiso]}
                                        {roleNames[u.nivel_permiso]}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleOpenForm(u)}
                                            className="p-2 text-slate-400 hover:text-teal-600 transition-colors rounded-lg hover:bg-teal-50"
                                            title="Editar usuario"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(u.id)}
                                            disabled={u.id === String(user.id)}
                                            className={`p-2 transition-colors rounded-lg ${u.id === String(user.id)
                                                    ? 'text-slate-300 cursor-not-allowed'
                                                    : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                                }`}
                                            title={u.id === String(user.id) ? "No puedes eliminarte a ti mismo" : "Eliminar usuario"}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de Formulario */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">
                            {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </h2>

                        {error && (
                            <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg">{error}</div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    value={formData.nombre}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Contraseña {editingUser && <span className="text-slate-400 font-normal">(Dejar en blanco para no cambiar)</span>}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nivel de Permiso</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    value={formData.nivel_permiso}
                                    onChange={e => setFormData({ ...formData, nivel_permiso: Number(e.target.value) })}
                                >
                                    <option value={1}>Verde (Administrador - Acceso total)</option>
                                    <option value={2}>Blanco (Editor - Puede gestionar fichas)</option>
                                    <option value={3}>Gris (Espectador - Solo lectura)</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4 mt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={handleCloseForm}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 transition-colors bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white transition-colors bg-teal-600 rounded-lg hover:bg-teal-700"
                                >
                                    {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
