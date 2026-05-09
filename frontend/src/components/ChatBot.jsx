import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import api from '../api/axios';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([
        { role: 'bot', content: '¡Hola! Soy tu asistente IA del CAM. Puedo ayudarte con dudas sobre las fichas técnicas, disponibilidad de recintos o requisitos de eventos. ¿En qué puedo apoyarte hoy?' }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chat]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || loading) return;

        const userMsg = message.trim();
        setMessage('');
        setChat(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const response = await api.post('/ai/chat', { message: userMsg });
            setChat(prev => [...prev, { role: 'bot', content: response.data.response }]);
        } catch (error) {
            setChat(prev => [...prev, { role: 'bot', content: 'Lo siento, ocurrió un error al procesar tu consulta. Por favor intenta de nuevo.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-50">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 ${isOpen ? 'bg-red-500 rotate-90' : 'bg-emerald-600 hover:bg-emerald-700'
                    } text-white relative group`}
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white animate-pulse"></span>
                )}
                {/* Tooltip */}
                {!isOpen && (
                    <div className="absolute right-20 bg-gray-900 text-white text-xs py-2 px-4 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-gray-800">
                        ¿Tienes dudas? ¡Pregúntame!
                    </div>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-96 max-w-[calc(100vw-2rem)] h-[600px] bg-white rounded-[2.5rem] shadow-premium border border-gray-100 flex flex-col overflow-hidden animate-slide-up">
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
                                <Bot size={28} />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-lg">Asistente CAM IA</h3>
                                <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></div>
                                    En línea y listo para ayudar
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 scroll-smooth"
                    >
                        {chat.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600 border border-emerald-100'
                                        }`}>
                                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                    </div>
                                    <div className={`p-4 rounded-3xl text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-100'
                                            : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none shadow-sm'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start animate-pulse">
                                <div className="flex gap-3 max-w-[85%]">
                                    <div className="w-8 h-8 rounded-xl bg-white text-emerald-600 border border-emerald-100 flex items-center justify-center">
                                        <Loader2 size={16} className="animate-spin" />
                                    </div>
                                    <div className="p-4 bg-white text-gray-400 border border-gray-100 rounded-3xl rounded-tl-none flex items-center gap-2">
                                        <Sparkles size={14} className="text-amber-400" />
                                        Pensando...
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-6 bg-white border-t border-gray-100">
                        <div className="flex items-center gap-3 bg-gray-50 p-2 pl-5 rounded-2xl border border-gray-100 focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500 transition-all">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Escribe tu duda aquí..."
                                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-700 placeholder:text-gray-300"
                            />
                            <button
                                type="submit"
                                disabled={!message.trim() || loading}
                                className={`p-3 rounded-xl transition-all ${!message.trim() || loading ? 'bg-gray-200 text-gray-400' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 transform active:scale-95'
                                    }`}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
