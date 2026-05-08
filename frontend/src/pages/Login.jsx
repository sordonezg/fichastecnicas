import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Credenciales inválidas. Por favor verifique su correo y contraseña.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden font-sans">
            {/* Visual Side */}
            <div className="hidden md:flex md:w-1/2 bg-emerald-600 p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-20 -mr-48 -mt-48 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400 rounded-full blur-3xl opacity-20 -ml-32 -mb-32"></div>

                <div className="relative z-10 flex items-center gap-2 text-white/90 font-display text-xl font-bold">
                    <Calendar size={28} />
                    FICHAS TÉCNICAS
                </div>

                <div className="relative z-10 max-w-lg">
                    <h2 className="text-white text-5xl font-display font-bold leading-tight mb-6">
                        Gestione sus eventos con <span className="text-emerald-200">precisión técnica.</span>
                    </h2>
                    <p className="text-emerald-50/80 text-lg leading-relaxed">
                        La plataforma centralizada para la coordinación de recursos, cronogramas y requerimientos específicos de cada espacio.
                    </p>
                </div>

                <div className="relative z-10 flex gap-4 text-emerald-100/60 text-sm">
                    <span>© 2026 Plataforma de Eventos</span>
                    <span>•</span>
                    <span>Soporte Técnico</span>
                </div>
            </div>

            {/* Form Side */}
            <div className="flex-1 flex items-center justify-center p-8 bg-emerald-50/10">
                <div className="max-w-md w-full animate-slide-up">
                    <div className="md:hidden flex justify-center mb-8">
                        <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-200">
                            <Calendar size={32} />
                        </div>
                    </div>

                    <div className="mb-10 text-center md:text-left">
                        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Bienvenido</h1>
                        <p className="text-gray-500">Ingrese sus credenciales para acceder al sistema.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm mb-8 animate-fade-in flex items-center gap-3">
                            <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-xs">!</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Correo Electrónico</label>
                            <div className="group relative transition-all">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                                    <Mail size={19} />
                                </span>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-gray-900 transition-all placeholder:text-gray-400 font-medium shadow-sm"
                                    placeholder="nombre@empresa.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Contraseña</label>
                            <div className="group relative transition-all">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                                    <Lock size={19} />
                                </span>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-gray-900 transition-all placeholder:text-gray-400 font-medium shadow-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-1 px-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer" />
                                <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">Recordarme</span>
                            </label>
                            <button type="button" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-all">¿Olvidó su contraseña?</button>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Iniciar Sesión
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-gray-500 text-sm">
                            ¿No tiene acceso?{' '}
                            <a href="#" className="text-emerald-600 font-bold hover:underline transition-all">Manual de Usuario</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
