import { useState, useEffect, useMemo } from 'react';
import type { ReactNode, FC } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import serraLogo from '/LogoSerra.png';

const Tooltip: FC<{ children: ReactNode, content: string | ReactNode, className?: string }> = ({ children, content, className }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div className={`relative inline-block ${className}`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            {children}
            <AnimatePresence>
                {isHovered && ( <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-3 bg-gray-800 text-white text-sm rounded-md shadow-lg z-10 border border-gray-700 text-left"> {content} </motion.div> )}
            </AnimatePresence>
        </div>
    );
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-gray-700 border border-gray-600 rounded-md shadow-lg text-white">
                <p className="font-bold">{label}</p>
                <p className="text-sm">{`${payload[0].name}: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

const csatCategoryLabels: { [key: string]: string } = {
    csat_deadlines: 'Cumprimento de Prazos',
    csat_communication_language: 'Comunicação Adequada',
    csat_progress_info: 'Informações sobre o Andamento',
    csat_service_agility: 'Agilidade no Atendimento',
    csat_technical_knowledge: 'Conhecimento Técnico',
    csat_feedback_openness: 'Abertura à Feedback',
    csat_solution_agility: 'Agilidade nas Soluções'
};

interface FormData { id: number; created_at: string; client_name: string; project_name: string; nps_score: number; feedback: string | null; [key: string]: any; }
const NPS_PIE_COLORS = ['#00C49F', '#FFBB28', '#FF8042'];
type DashboardView = 'overview' | 'details';

export function Dashboard() {
    const [responses, setResponses] = useState<FormData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<DashboardView>('overview');
    const [detailFilter, setDetailFilter] = useState(''); // Estado para o filtro da aba de detalhes

    useEffect(() => {
        const fetchResponses = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('satisfaction_forms').select('*').order('created_at', { ascending: false });
            if (error) { setError('Falha ao buscar os dados.'); } else { setResponses(data || []); }
            setLoading(false);
        };
        fetchResponses();
    }, []);

    const filteredDetails = useMemo(() => {
        if (!detailFilter) return responses;
        const lowercasedFilter = detailFilter.toLowerCase();
        return responses.filter(r => 
            r.client_name?.toLowerCase().includes(lowercasedFilter) ||
            r.project_name?.toLowerCase().includes(lowercasedFilter)
        );
    }, [responses, detailFilter]);

    const metrics = useMemo(() => {
        const total = responses.length;
        if (total === 0) return { npsScore: 0, csatAverages: [], npsDistribution: [], hasData: false };
        const promoters = responses.filter(r => r.nps_score >= 9).length;
        const detractors = responses.filter(r => r.nps_score <= 6).length;
        const npsScore = Math.round(((promoters - detractors) / total) * 100);
        const npsDistribution = [ { name: 'Promotores', value: promoters }, { name: 'Passivos', value: total - promoters - detractors }, { name: 'Detratores', value: detractors } ];
        const csatAverages = Object.keys(csatCategoryLabels).map(key => ({ name: csatCategoryLabels[key], 'Média': parseFloat(((responses.reduce((acc, r) => acc + (r[key] || 0), 0)) / total).toFixed(1)) }));
        return { npsScore, csatAverages, npsDistribution, hasData: true };
    }, [responses]);

    if (loading) return <div className="text-center p-10">Carregando dados...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <img src={serraLogo} alt="Logo Serra Jr. Engenharia" className="w-36 sm:w-40 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-center sm:text-left">Dashboard</h1>
            <div className="flex border-b border-gray-700">
                <button onClick={() => setActiveView('overview')} className={`py-2 px-4 text-lg transition-colors ${activeView === 'overview' ? 'border-b-2 border-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}>Visão Geral</button>
                <button onClick={() => setActiveView('details')} className={`py-2 px-4 text-lg transition-colors ${activeView === 'details' ? 'border-b-2 border-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}>Respostas Individuais</button>
            </div>
            
            <AnimatePresence mode="wait">
            {activeView === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-gray-800/50 border-gray-700 text-white"> <CardHeader> <Tooltip content="Mede a lealdade dos clientes. A pontuação varia de -100 a 100."> <CardTitle className="cursor-help border-b border-dashed border-gray-500">NPS (Net Promoter Score)</CardTitle> </Tooltip> </CardHeader> <CardContent className="text-5xl font-bold text-orange-400">{metrics.npsScore}</CardContent> </Card>
                        <Card className="bg-gray-800/50 border-gray-700 text-white"><CardHeader><CardTitle>Total de Respostas</CardTitle></CardHeader><CardContent className="text-5xl font-bold text-blue-400">{responses.length}</CardContent></Card>
                    </div>
                    {metrics.hasData && (
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            <Card className="bg-gray-800/50 border-gray-700 text-white lg:col-span-2">
                                <CardHeader> <Tooltip content={<div className='space-y-1'> <p><b>Promotores (9-10):</b> Clientes leais.</p> <p><b>Passivos (7-8):</b> Satisfeitos.</p> <p><b>Detratores (0-6):</b> Insatisfeitos.</p> </div>}> <CardTitle className="cursor-help border-b border-dashed border-gray-500">Distribuição NPS</CardTitle> </Tooltip> </CardHeader>
                                <CardContent className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                                            <Pie data={metrics.npsDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent, value }) => (value ?? 0) > 0 ? `${name}: ${((percent ?? 0) * 100).toFixed(0)}%` : null} >
                                                {metrics.npsDistribution.map((_, index) => <Cell key={`cell-${index}`} fill={NPS_PIE_COLORS[index % NPS_PIE_COLORS.length]} />)}
                                            </Pie>
                                            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                            <Card className="bg-gray-800/50 border-gray-700 text-white lg:col-span-3">
                                <CardHeader> <Tooltip content="Média de satisfação (1 a 5) para cada aspecto avaliado."> <CardTitle className="cursor-help border-b border-dashed border-gray-500">Média de Satisfação (CSAT) por Categoria</CardTitle> </Tooltip> </CardHeader>
                                <CardContent className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={metrics.csatAverages} margin={{ top: 5, right: 20, left: -10, bottom: 10 }}>
                                        <Bar dataKey="Média" fill="#38A169" />
                                        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                                        <XAxis dataKey="name" stroke="#A0AEC0" angle={0} textAnchor="middle" interval={0} height={5} tick={{ fontSize: 10 }}/>
                                        <YAxis domain={[0, 5]} stroke="#A0AEC0" />
                                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                                        <Legend verticalAlign="top" align="center" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </motion.div>
            )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
            {activeView === 'details' && (
                <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                    <div className="w-full sm:w-auto">
                        <Label htmlFor="detail-filter">Buscar por Nome ou Projeto</Label>
                        <Input id="detail-filter" placeholder="Digite para buscar..." className="max-w-md bg-gray-800 border-gray-600 text-white" value={detailFilter} onChange={e => setDetailFilter(e.target.value)} />
                    </div>
                    {filteredDetails.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredDetails.map(response => (
                                <Card key={response.id} className="bg-gray-800/50 border-gray-700 text-white flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="text-xl">{response.client_name}</CardTitle>
                                        <CardDescription>{response.project_name} - {new Date(response.created_at).toLocaleDateString('pt-BR')}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 flex-grow">
                                        <div><h4 className="font-bold text-orange-400">Nota NPS: {response.nps_score}</h4></div>
                                        <div>
                                            <h4 className="font-bold mb-2">Avaliações CSAT (1-5):</h4>
                                            <ul className="list-disc list-inside text-sm space-y-1">
                                                {Object.keys(csatCategoryLabels).map(key => (
                                                    <li key={key}><span className="text-gray-300">{csatCategoryLabels[key]}:</span> <span className="font-semibold text-green-400">{response[key]}</span></li>
                                                ))}
                                            </ul>
                                        </div>
                                        {response.feedback && (
                                            <div className="pt-2">
                                                <h4 className="font-bold mb-1">Comentário:</h4>
                                                <p className="text-sm bg-gray-900/50 p-3 rounded-md border border-gray-600">"{response.feedback}"</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-10 text-gray-400">Nenhuma resposta encontrada para a sua busca.</p>
                    )}
                </motion.div>
            )}
            </AnimatePresence>
        </motion.div>
    );
}