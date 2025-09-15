import { useState } from 'react';
import type { ReactNode, FC } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import SatisfactionRating from './SatisfactionRating';
import serraLogo from '/LogoSerra.png';

const Tooltip: FC<{ children: ReactNode, content: string }> = ({ children, content }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div className="relative inline-block" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            {children}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 bg-gray-800 text-white text-sm rounded-md shadow-lg z-10 border border-gray-700"
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

type FormStatus = 'idle' | 'loading' | 'success' | 'error';
interface CsatScores { [key: string]: number | null; }

const csatQuestions = [
    { key: 'csat_deadlines', title: 'Cumprimento de prazos', description: "Se conseguimos entregar o que foi combinado dentro do tempo estipulado." },
    { key: 'csat_communication_language', title: 'Comunicação (linguagem) adequada', description: "Se nossa forma de falar e escrever foi clara, respeitosa e fácil de entender." },
    { key: 'csat_progress_info', title: 'Informações sobre andamento do projeto', description: "Se mantivemos você bem informado(a) sobre o progresso das etapas." },
    { key: 'csat_service_agility', title: 'Agilidade nos atendimentos', description: "Se respondemos suas dúvidas e solicitações de forma rápida." },
    { key: 'csat_technical_knowledge', title: 'Conhecimento técnico', description: "Se demonstramos segurança e domínio sobre os assuntos e ferramentas do projeto." },
    { key: 'csat_feedback_openness', title: 'Abertura a feedbacks', description: "Se ouvimos suas opiniões e consideramos suas sugestões ao longo do trabalho." },
    { key: 'csat_solution_agility', title: 'Agilidade nas soluções de problemas', description: "Se resolvemos imprevistos de maneira rápida e eficiente." },
];

export function SatisfactionForm() {
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [csatScores, setCsatScores] = useState<CsatScores>(Object.fromEntries(csatQuestions.map(q => [q.key, null])));
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleCsatChange = (key: string, value: number) => setCsatScores(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!clientName || !projectName || npsScore === null || Object.values(csatScores).some(score => score === null)) {
      setErrorMessage('Por favor, preencha seu nome, projeto e todas as avaliações.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMessage('');
    const { error } = await supabase.from('satisfaction_forms').insert([{ client_name: clientName, project_name: projectName, nps_score: npsScore, feedback: feedback, ...csatScores }]);
    if (error) {
      setErrorMessage('Ocorreu um erro ao enviar seu feedback. Tente novamente.');
      setStatus('error');
    } else {
      setStatus('success');
    }
  };

  if (status === 'success') {
    return ( <Card className="w-full max-w-lg bg-gray-900/80 backdrop-blur-sm border-gray-700 text-white shadow-2xl rounded-2xl"> <CardHeader className="text-center items-center"> <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }}> <svg className="w-20 h-20 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> </motion.div> <CardTitle className="text-2xl mt-4">Feedback Enviado!</CardTitle> <CardDescription className="text-gray-300">Agradecemos sua colaboração. Sua opinião é fundamental!</CardDescription> </CardHeader> </Card> );
  }

  return (
    <Card className="w-full max-w-2xl bg-gray-900/80 backdrop-blur-sm border-gray-700 text-white shadow-2xl rounded-2xl">
      <CardHeader className="text-center">
        <img src={serraLogo} alt="Logo Serra Jr. Engenharia" className="w-36 sm:w-40 mx-auto mb-6" />
        <CardTitle className="text-3xl font-bold tracking-tight">Formulário de Satisfação</CardTitle>
        <CardDescription className="text-gray-400">Sua opinião é muito importante para nós!</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2"><Label htmlFor="client-name">Seu Nome / Empresa</Label><Input id="client-name" value={clientName} onChange={(e) => setClientName(e.target.value)} required placeholder="Ex: João da Silva"/></div>
            <div className="space-y-2"><Label htmlFor="project-name">Nome do Projeto</Label><Input id="project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)} required placeholder="Ex: Website Institucional"/></div>
          </div>
          <hr className="border-gray-700/50" />
          <div className="space-y-6">
            <div className='text-center'>
                <h3 className="text-lg font-semibold text-gray-100">Satisfação Geral com o Projeto</h3>
                <p className="text-sm text-gray-400 mt-1">De pouco satisfeito a muito satisfeito, avalie os seguintes pontos de sua experiência com os emojis correspondentes:</p>
            </div>
            {csatQuestions.map(q => (
              <div key={q.key}>
                <div className="text-center text-lg font-semibold text-gray-100 mb-3">
                    <Tooltip content={q.description}>
                        <span className="border-b border-dashed border-gray-500 cursor-help">{q.title}</span>
                    </Tooltip>
                </div>
                <SatisfactionRating title="" description="" value={csatScores[q.key]} onChange={(value) => handleCsatChange(q.key, value)} variant="csat" />
              </div>
            ))}
          </div>
          <hr className="border-gray-700/50" />
          <SatisfactionRating title="Recomendação" description="Em uma escala de 0 a 10, o quanto você recomendaria a Serra Junior para alguém?" value={npsScore} onChange={setNpsScore} variant="nps" />
          <div className="space-y-2"><Label htmlFor="feedback">Gostaria de deixar um comentário?</Label><Textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Seus elogios, críticas ou sugestões são muito bem-vindos..." /></div>
          <AnimatePresence>
            {status === 'error' && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-3 text-center text-sm bg-red-900/50 border border-red-500/50 text-red-300 rounded-md">{errorMessage}</motion.div>}
          </AnimatePresence>
          <div><Button type="submit" className="w-full text-base font-bold h-12" disabled={status === 'loading'}>{status === 'loading' ? 'Enviando...' : 'Enviar Feedback'}</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}