import React, { useEffect, useState } from 'react';
import { User } from '../../types';
import { db, auth } from '../../src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {
    MapPin,
    Star,
    CheckCircle,
    Phone,
    Mail,
    Award,
    ArrowRight,
    Search,
    Instagram,
    Play,
    Clock,
    ShieldCheck,
    Calculator,
    BookOpen,
    Lock
} from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';

// --- ROBUST MOCK DATA ---
const MOCK_INSTAGRAM = [
    'https://images.unsplash.com/photo-1581094794329-cd1096a7a2e8?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1632921256082-277a119777f9?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&h=500&fit=crop'
];

const MOCK_REVIEWS = [
    { user: 'Ana Pereira', text: 'Serviço impecável! A atenção aos detalhes foi fantástica. Recomendo muito.', rating: 5, date: '2 days ago' },
    { user: 'Marc Lemmer', text: 'Rápido, limpo e muito profissional. O resultado superou minhas expectativas.', rating: 5, date: '1 week ago' },
    { user: 'Sophie Weber', text: 'Excelente comunicação desde o primeiro contato. Trabalho de primeira.', rating: 4.8, date: '3 weeks ago' }
];

const MOCK_TIPS = [
    { title: '3 Dicas para sua pintura durar muito mais', category: 'Manutenção', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop' },
    { title: 'Como economizar na limpeza pós-obra', category: 'Economia', image: 'https://images.unsplash.com/photo-1581578731117-10d5218788dd?w=500&auto=format&fit=crop' },
    { title: 'Tendências de cores para 2024', category: 'Decoração', image: 'https://images.unsplash.com/photo-1563456037889-4b6797a7e937?w=500&auto=format&fit=crop' }
];

const MOCK_VIDEO_THUMBNAIL = "https://images.unsplash.com/photo-1492691527719-901e077a0771?w=1600&h=900&fit=crop";
const MOCK_MAP_IMAGE = "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1600&h=400&fit=crop"; // Placeholder map

interface ProPublicProfileProps {
    proId: string;
    // Deprecated: Internal navigation used instead. Keeping for compatibility if passed.
    onContact?: (pro: User) => void;
}

export const ProPublicProfile: React.FC<ProPublicProfileProps> = ({ proId }) => {
    const navigate = useNavigate();
    const [pro, setPro] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Calculator State
    const [calcService, setCalcService] = useState('Limpeza Padrão');
    const [calcQty, setCalcQty] = useState<number>(3);
    const [estimatedPrice, setEstimatedPrice] = useState<number>(120);

    // Calculate price effect
    useEffect(() => {
        let basePrice = 40;
        if (calcService === 'Pintura Interior') basePrice = 15; // per m2
        if (calcService === 'Reparos Gerais') basePrice = 50; // per hour
        setEstimatedPrice(calcQty * basePrice);
    }, [calcService, calcQty]);

    useEffect(() => {
        const fetchPro = async () => {
            try {
                const docRef = doc(db, 'users', proId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as User;
                    if (data.role !== 'PRO') {
                        setError('This profile is not valid.');
                    } else {
                        setPro(data);
                    }
                } else {
                    setError('Professional not found.');
                }
            } catch (err: any) {
                console.error("Error fetching pro:", err);
                if (err.code === 'permission-denied') {
                    setError('This profile is private or requires login.');
                } else {
                    setError('Failed to load profile.');
                }
            } finally {
                setLoading(false);
            }
        };

        if (proId) fetchPro();
    }, [proId]);

    const handleStrictContact = () => {
        if (!pro) return;
        const targetUrl = `/request/new?proId=${pro.id}`; // Use real Pro ID
        if (!auth.currentUser) {
            // Not logged in: Send to Login then Redirect back
            navigate(`/login?redirect=${encodeURIComponent(targetUrl)}`);
        } else {
            navigate(targetUrl);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div></div>;
    if (error || !pro) return <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-slate-950"><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Not Available</h1><p className="text-slate-500 mt-2">{error}</p><button onClick={() => navigate('/login')} className="mt-4 text-orange-500 font-bold hover:underline">Go to Login</button></div>;

    // --- THEME & COLOR LOGIC ---
    const theme = pro.websiteTheme || 'modern';
    const primaryColor = pro.primaryColor || '#f97316';

    const styles: Record<string, any> = {
        modern: {
            font: 'font-sans',
            bg: 'bg-slate-50 dark:bg-slate-950',
            container: 'rounded-[3rem] bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-0 md:my-10 border border-slate-100 dark:border-slate-800',
            avatar: 'rounded-[2.5rem] border-[6px] border-white dark:border-slate-900 shadow-2xl skew-x-0',
            card: 'bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700/50',
            button: 'rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all font-bold bg-gradient-to-r from-primary to-orange-400',
            sectionTitle: 'text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight',
            badge: 'bg-primary/10 text-primary rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider',
            trustBlock: 'bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50'
        },
        classic: {
            font: 'font-serif',
            bg: 'bg-[#f4f1ea] dark:bg-slate-950',
            container: 'bg-white dark:bg-slate-900 shadow-lg border-x-8 border-t-8 border-primary/20 min-h-screen',
            avatar: 'rounded-full border-4 border-white dark:border-slate-900 shadow-md ring-4 ring-primary/20',
            card: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:border-primary transition-colors',
            button: 'rounded-sm uppercase tracking-[0.2em] font-bold text-xs px-8 py-4 hover:opacity-90 transition-opacity border-b-2 border-black/10 bg-primary',
            sectionTitle: 'text-3xl font-serif font-bold text-slate-900 dark:text-white mb-6 pb-4 border-b-2 border-primary/20 inline-block',
            badge: 'border border-primary text-primary rounded-sm px-3 py-1 text-xs font-bold uppercase',
            trustBlock: 'bg-[#f9f7f4] dark:bg-slate-800 border-t-4 border-primary p-6'
        },
        bold: {
            font: 'font-sans',
            bg: 'bg-black',
            container: 'min-h-screen bg-zinc-900 text-white',
            avatar: 'rounded-none border-4 border-white shadow-[10px_10px_0px_0px_rgba(255,255,255,1)]',
            card: 'bg-black border-2 border-zinc-700 p-6 hover:bg-zinc-800 hover:border-white transition-all rounded-none',
            button: 'bg-white text-black font-black uppercase tracking-tighter hover:bg-primary hover:text-white transition-colors rounded-none border-2 border-transparent text-xl px-8 py-4',
            sectionTitle: 'text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-8 leading-none',
            badge: 'bg-white text-black font-black uppercase px-3 py-1 text-sm transform -skew-x-12 inline-block',
            trustBlock: 'bg-zinc-800 border-2 border-white/20 p-8'
        },
        minimalist: {
            font: 'font-sans',
            bg: 'bg-white dark:bg-black',
            container: 'max-w-4xl mx-auto bg-white dark:bg-black min-h-screen',
            avatar: 'rounded-full aspect-square object-cover',
            card: 'border-l-2 border-primary/20 pl-6 py-2 hover:border-primary transition-colors',
            button: 'rounded-full border border-slate-200 dark:border-slate-800 hover:border-primary hover:text-primary transition-colors px-10 py-3 bg-transparent text-slate-900 dark:text-white font-medium',
            sectionTitle: 'text-2xl font-medium text-slate-900 dark:text-white mb-8 tracking-tight',
            badge: 'bg-slate-100 dark:bg-slate-900 text-slate-500 rounded-full px-4 py-1 text-xs font-medium',
            trustBlock: 'bg-slate-50 dark:bg-slate-900 rounded-lg p-6'
        }
    };

    const s = styles[theme] || styles['modern'];
    const dynamicStyle = { '--primary': primaryColor } as React.CSSProperties;

    return (
        <div style={dynamicStyle} className={`${s.bg} ${s.font} min-h-screen selection:bg-primary/20 selection:text-primary w-full overflow-x-hidden transition-colors duration-500 pb-24 md:pb-0`}>

            <div className={`mx-auto ${theme === 'minimalist' ? '' : 'max-w-7xl'} ${s.container}`}>

                {/* --- HERO SECTION --- */}
                <div className="relative">
                    <div className="h-[50vh] min-h-[400px] w-full relative overflow-hidden group">
                        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 ${theme === 'bold' ? 'opacity-100' : 'opacity-70'}`} />
                        <img
                            src={pro.coverImage || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2669&auto=format&fit=crop"}
                            className={`w-full h-full object-cover transition-transform duration-[3s] ${theme === 'bold' ? 'grayscale' : 'group-hover:scale-105'}`}
                            alt="Cover"
                        />
                        <div className="absolute bottom-0 left-0 w-full z-20 px-6 md:px-12 pb-12 flex flex-col md:flex-row items-end justify-between gap-6">
                            <div className="max-w-3xl">
                                <h1 className={`${theme === 'bold' ? 'text-5xl md:text-7xl uppercase' : 'text-4xl md:text-6xl'} font-black text-white leading-[0.9] mb-4 shadow-black/50 drop-shadow-2xl`}>
                                    {pro.companyDetails?.legalName || pro.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3 text-white/90 font-bold">
                                    <span className={s.badge}>{pro.level || 'Top Pro'}</span>
                                    {pro.isVerified && (
                                        <span className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-xs uppercase tracking-wider border border-white/20">
                                            <CheckCircle size={12} className="text-blue-400" /> Verified
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-xs uppercase tracking-wider border border-white/20">
                                        <Star size={12} className="text-yellow-400 fill-yellow-400" /> {pro.rating?.toFixed(1) || '5.0'}
                                    </span>
                                </div>
                                <button
                                    onClick={handleStrictContact}
                                    className={`mt-6 inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-transform ${theme === 'bold' ? 'bg-white text-black' : 'bg-primary text-white'}`}
                                >
                                    {theme === 'bold' ? 'GET QUOTE' : 'Get a Quote'} <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 md:px-12 relative z-30 -mt-16 md:-mt-24 pointer-events-none">
                        <div className="flex justify-end md:justify-start">
                            <img
                                src={pro.avatar || `https://ui-avatars.com/api/?name=${pro.name}`}
                                className={`w-32 h-32 md:w-52 md:h-52 object-cover bg-white pointer-events-auto ${s.avatar}`}
                                alt="Avatar"
                            />
                        </div>
                    </div>
                </div>

                {/* --- ABOUT & VIDEO GRID --- */}
                <section className="px-6 md:px-12 py-12 md:py-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className={s.sectionTitle}>About Me</h2>
                            <p className={`text-lg leading-relaxed mb-8 ${theme === 'bold' ? 'text-zinc-400 font-mono text-sm' : 'text-slate-600 dark:text-slate-300'}`}>
                                {pro.bio || "I am a dedicated professional committed to delivering high-quality results. My focus is on customer satisfaction and clear communication throughout every project."}
                            </p>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <div className={`p-3 rounded-full ${theme === 'bold' ? 'bg-white text-black' : 'bg-green-100 text-green-600'}`}>
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <div className={`font-bold ${theme === 'bold' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>Fast Response</div>
                                        <div className="text-slate-500 text-sm">Responds within 1 hour</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <div className={`p-3 rounded-full ${theme === 'bold' ? 'bg-white text-black' : 'bg-blue-100 text-blue-600'}`}>
                                        <Award size={24} />
                                    </div>
                                    <div>
                                        <div className={`font-bold ${theme === 'bold' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>Certified Pro</div>
                                        <div className="text-slate-500 text-sm">Valid license & insurance</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`relative aspect-video rounded-3xl overflow-hidden shadow-2xl group cursor-pointer ${theme === 'bold' ? 'border-2 border-zinc-700' : ''}`}>
                            <img src={MOCK_VIDEO_THUMBNAIL} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" alt="Video Thumb" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 text-white ${theme === 'bold' ? 'bg-white text-black' : 'bg-primary/90'}`}>
                                    <Play size={32} fill="currentColor" className="ml-1" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- LEAD MAGNET: BUDGET ESTIMATOR --- */}
                <section className={`py-16 px-6 md:px-12 ${theme === 'bold' ? 'bg-zinc-900' : 'bg-slate-100 dark:bg-slate-800/30'}`}>
                    <div className="max-w-4xl mx-auto">
                        <div className={`${s.card} !p-8 md:!p-12 relative overflow-hidden`}>
                            {/* Decorative BG Icon */}
                            <Calculator className={`absolute -right-10 -bottom-10 opacity-5 w-64 h-64 transform -rotate-12 ${theme === 'bold' ? 'text-white' : 'text-primary'}`} />

                            <h2 className={s.sectionTitle}>Get a Price Estimate</h2>
                            <p className="text-slate-500 mb-8 max-w-xl">
                                Wondering how much your project might cost? Use this quick estimator to get an approximate idea before we talk.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                <div className="space-y-6">
                                    <div>
                                        <label className={`block font-bold mb-2 ${theme === 'bold' ? 'text-zinc-400' : 'text-slate-700 dark:text-white'}`}>Service Type</label>
                                        <select
                                            value={calcService}
                                            onChange={(e) => setCalcService(e.target.value)}
                                            className="w-full p-4 rounded-xl bg-slate-200 dark:bg-slate-900 border-none font-medium focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="Limpeza Padrão">Standard Cleaning (Total)</option>
                                            <option value="Pintura Interior">Interior Painting (per m²)</option>
                                            <option value="Reparos Gerais">General Repairs (per hour)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`block font-bold mb-2 ${theme === 'bold' ? 'text-zinc-400' : 'text-slate-700 dark:text-white'}`}>
                                            Quantity {calcService.includes('m²') ? '(m²)' : calcService.includes('hour') ? '(Hours)' : '(Rooms)'}
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range"
                                                min="1"
                                                max="50"
                                                value={calcQty}
                                                onChange={(e) => setCalcQty(parseInt(e.target.value))}
                                                className="w-full accent-primary h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer"
                                            />
                                            <span className="font-black text-xl w-12 text-center">{calcQty}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={`flex flex-col items-center justify-center p-8 rounded-2xl text-center ${theme === 'bold' ? 'bg-zinc-800' : 'bg-primary text-white'}`}>
                                    <div className="text-sm font-medium opacity-80 uppercase tracking-widest mb-2">Estimated Total</div>
                                    <div className="text-5xl font-black mb-2">€{estimatedPrice}</div>
                                    <div className="text-xs opacity-70 max-w-[200px]">
                                        *Approximate value. Final quote requires detailed assessment.
                                    </div>
                                    <button
                                        onClick={handleStrictContact}
                                        className="mt-6 bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform"
                                    >
                                        Get Final Quote
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- SERVICES GRID --- */}
                <section className={`py-20 px-6 md:px-12`}>
                    <h2 className={s.sectionTitle}>Services</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {pro.services && pro.services.length > 0 ? pro.services?.map((service, i) => (
                            <div key={i} className={s.card}>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className={`text-xl font-bold ${theme === 'bold' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{service.id}</h3>
                                    {service.price && <span className={`font-black ${theme === 'bold' ? 'text-white' : 'text-primary'}`}>€{service.price}</span>}
                                </div>
                                <p className="text-slate-500 text-sm">Professional service execution.</p>
                            </div>
                        )) : (
                            [1, 2, 3].map((_, i) => (
                                <div key={i} className={s.card}>
                                    <h3 className={`text-xl font-bold mb-2 ${theme === 'bold' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>Service {i + 1}</h3>
                                    <p className="text-slate-500 text-sm">High quality service offering tailored to your needs.</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* --- EXPERT TIPS (SEO CONTENT) --- */}
                <section className={`py-20 px-6 md:px-12 ${theme === 'bold' ? 'bg-zinc-900' : 'bg-slate-50 dark:bg-slate-800/30'}`}>
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className={s.sectionTitle}>Expert Tips</h2>
                            <p className="text-slate-500">Advice and insights for your projects.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {MOCK_TIPS.map((tip, i) => (
                            <div key={i} className="group cursor-pointer">
                                <div className={`aspect-[4/3] w-full overflow-hidden mb-4 ${theme === 'modern' ? 'rounded-2xl' : 'rounded-none'}`}>
                                    <img src={tip.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Blog" />
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider">{tip.category}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-xs text-slate-500">5 min read</span>
                                </div>
                                <h3 className={`text-xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors ${theme === 'bold' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                    {tip.title}
                                </h3>
                                <div className="flex items-center gap-1 text-sm font-medium text-slate-500 group-hover:translate-x-1 transition-transform">
                                    Read Article <ArrowUpRight size={14} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- INSTAGRAM FEED (SOCIAL PROOF) --- */}
                <section className="py-20 px-6 md:px-12 text-center md:text-left">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                        <div>
                            <h2 className={s.sectionTitle}>Follow my work</h2>
                            <p className="text-slate-500">Recent updates from @{pro.username || 'mariasantos'}</p>
                        </div>
                        <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-pink-600 text-white font-bold hover:bg-pink-700 transition-colors shadow-lg shadow-pink-500/30">
                            <Instagram size={20} /> View Profile
                        </button>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
                        {MOCK_INSTAGRAM.map((img, i) => (
                            <div key={i} className={`aspect-square relative group overflow-hidden cursor-pointer ${theme === 'modern' ? 'rounded-xl' : ''}`}>
                                <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Insta" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                    <Instagram className="text-white opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- AREAS OF SERVICE (MAP) --- */}
                <section className="py-0">
                    <div className="relative h-[400px] w-full bg-slate-200">
                        <img src={MOCK_MAP_IMAGE} className={`w-full h-full object-cover ${theme === 'bold' ? 'grayscale opacity-50' : ''}`} alt="Map" />
                        <div className="absolute inset-0 flex items-center justify-center p-6">
                            <div className={`bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-8 md:p-12 text-center shadow-2xl ${theme === 'modern' ? 'rounded-3xl' : ''} max-w-lg`}>
                                <div className={`inline-flex p-4 rounded-full mb-6 ${theme === 'bold' ? 'bg-black text-white' : 'bg-primary/10 text-primary'}`}>
                                    <MapPin size={32} />
                                </div>
                                <h3 className={`text-2xl font-black mb-2 ${theme === 'bold' ? 'text-black' : 'text-slate-900 dark:text-white'}`}>Serving Luxembourg</h3>
                                <p className="text-slate-500 mb-6">Available for projects in Luxembourg City and surrounding regions (+25km).</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- TESTIMONIALS --- */}
                <section className="py-20 px-6 md:px-12 bg-slate-50 dark:bg-slate-800/20">
                    <h2 className={`${s.sectionTitle} text-center mb-12`}>What clients say</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {MOCK_REVIEWS.map((review, i) => (
                            <div key={i} className={`${s.card} relative pt-12`}>
                                <div className="absolute -top-4 left-6 text-6xl text-primary/20 font-serif">"</div>
                                <p className={`italic mb-6 relative z-10 ${theme === 'bold' ? 'text-zinc-400' : 'text-slate-600 dark:text-slate-300'}`}>{review.text}</p>
                                <div className="flex items-center gap-2 font-bold text-sm">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center transform shrink-0">
                                        {review.user.charAt(0)}
                                    </div>
                                    <span className={theme === 'bold' ? 'text-white' : 'text-slate-900 dark:text-white'}>{review.user}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- FOOTER & GUARANTEE BLOCK --- */}
                <div className="py-24 px-6 md:px-12 text-center">
                    <h2 className={`text-4xl font-black mb-8 ${theme === 'bold' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>Ready to Transform Your Space?</h2>

                    {/* Desktop Button */}
                    <button
                        onClick={handleStrictContact}
                        className={`hidden md:inline-flex ${s.button} text-white px-12 py-5 text-xl items-center gap-2`}
                    >
                        {theme === 'bold' ? 'INITIATE SAFE CONTACT' : 'Request Secure Quote'} <ShieldCheck size={20} />
                    </button>

                    {/* Trust/Guarantee Block */}
                    <div className={`mt-10 max-w-2xl mx-auto flex items-start gap-4 text-left ${s.trustBlock}`}>
                        <div className="p-3 bg-green-100 text-green-700 rounded-full shrink-0">
                            <Lock size={24} />
                        </div>
                        <div>
                            <h4 className={`font-bold text-lg mb-1 ${theme === 'bold' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>Zolver Buyer Protection</h4>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Your payment is held securely in escrow. The professional is only paid when you confirm the job is done to your satisfaction.
                                <span className="block mt-1 font-bold text-slate-700 dark:text-slate-300">Never pay outside the platform.</span>
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- MOBILE STICKY CTA --- */}
            <div className="fixed bottom-0 left-0 w-full p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 md:hidden z-50 flex items-center justify-between gap-4 safe-area-bottom">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Starting at</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">€{pro.services?.[0]?.price || '50'}</span>
                </div>
                <button
                    onClick={handleStrictContact}
                    className="flex-1 bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    <ShieldCheck size={18} /> {theme === 'bold' ? 'GET QUOTE' : 'Request Quote'}
                </button>
            </div>

        </div>
    );
};
