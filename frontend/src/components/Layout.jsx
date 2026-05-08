import { useAuth } from '../context/AuthContext';
import { LogOut, Calendar, PlusCircle, User as UserIcon, Bell, Search, LayoutDashboard, Tag, MapPin } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 1: return 'bg-emerald-500 shadow-md shadow-emerald-200';
            case 2: return 'bg-white border border-gray-200';
            case 3: return 'bg-slate-400';
            default: return 'bg-gray-200';
        }
    };

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Nueva Ficha', path: '/nuevo-evento', icon: PlusCircle, roles: [1, 2] },
        { name: 'Recintos', path: '/admin/recintos', icon: MapPin, roles: [1] },
        { name: 'Catálogo', path: '/admin/catalogo', icon: Tag, roles: [1] },
        { name: 'Usuarios', path: '/admin/usuarios', icon: UserIcon, roles: [1] },
    ];

    return (
        <div className="min-h-screen bg-[#fafdfc] font-sans selection:bg-emerald-100 selection:text-emerald-900">
            {/* Sidebar - Desktop Only */}
            <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col z-30 shadow-sm">
                <div className="p-8 pb-12">
                    <Link to="/" className="flex items-center gap-3 text-2xl font-display font-bold text-gray-900 group">
                        <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-lg shadow-emerald-100 group-hover:rotate-6 transition-transform">
                            <Calendar size={20} />
                        </div>
                        <span>Fichas<span className="text-emerald-600">.</span></span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Menú Principal</p>
                    {menuItems.map((item) => (
                        (!item.roles || item.roles.includes(user?.nivel_permiso)) && (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all group ${location.pathname === item.path
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 translate-x-1'
                                    : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'
                                    }`}
                            >
                                <item.icon size={20} className={location.pathname === item.path ? '' : 'text-gray-300 group-hover:text-emerald-500'} />
                                {item.name}
                            </Link>
                        )
                    ))}
                </nav>

                <div className="p-6">
                    <div className="bg-emerald-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-800 rounded-full blur-2xl opacity-40 -mr-12 -mt-12"></div>
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 relative z-10">Estado del Sistema</p>
                        <p className="text-xs font-medium text-emerald-100 leading-relaxed mb-4 relative z-10">Todos los servicios técnicos operativos.</p>
                        <button className="w-full bg-emerald-800 hover:bg-emerald-700 py-2 rounded-xl text-[10px] font-bold uppercase transition-colors relative z-10">Ver Reportes</button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="lg:pl-72 min-h-screen flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-20 bg-[#fafdfc]/80 backdrop-blur-md px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm w-96 max-w-full">
                        <Search size={18} className="text-gray-300" />
                        <input
                            type="text"
                            placeholder="Buscar fichas o eventos..."
                            className="bg-transparent border-none outline-none text-sm font-medium w-full text-gray-600 placeholder:text-gray-300"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2.5 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-emerald-600 transition-all shadow-sm">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-8 w-px bg-gray-100"></div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-gray-900 leading-none mb-1">{user?.nombre}</p>
                                <div className="flex items-center justify-end gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${user?.nivel_permiso === 1 ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                        {user?.nivel_permiso === 1 ? 'Admin' : user?.nivel_permiso === 2 ? 'Editor' : 'Solicitante'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-emerald-600 group hover:border-emerald-200 transition-all cursor-pointer overflow-hidden p-0.5">
                                    <div className="w-full h-full bg-emerald-50 rounded-xl flex items-center justify-center font-display font-bold text-lg">
                                        {user?.nombre?.charAt(0)}
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                    title="Cerrar Sesión"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-8 lg:p-12">
                    {children}
                </main>

                <footer className="px-12 py-8 text-center sm:text-left text-gray-400 text-xs border-t border-gray-100 bg-white">
                    <p>© 2026 Plataforma de Fichas Técnicas • Todos los derechos reservados.</p>
                </footer>
            </div>
        </div>
    );
};

export default Layout;
