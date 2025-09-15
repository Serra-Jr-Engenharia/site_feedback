import type { FC, SVGProps } from 'react';
import { motion } from 'framer-motion';

interface SatisfactionRatingProps {
  title: string;
  description: string;
  value: number | null;
  onChange: (value: number) => void;
  variant: 'csat' | 'nps';
}

const IconFaceFrown: FC<SVGProps<SVGSVGElement>> = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 16s-1.5-2-4-2-4 2-4 2" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" /></svg> );
const IconFaceMeh: FC<SVGProps<SVGSVGElement>> = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="8" x2="16" y1="15" y2="15" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" /></svg> );
const IconFaceSmile: FC<SVGProps<SVGSVGElement>> = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" /></svg> );

const csatOptions = [
  { value: 1, Icon: IconFaceFrown, color: 'text-red-500', selectedAnimation: { rotate: [-5, 5, -5, 0], scale: 1.1 } },
  { value: 2, Icon: IconFaceFrown, color: 'text-orange-500', selectedAnimation: { rotate: [-5, 5, -5, 0], scale: 1.1 } },
  { value: 3, Icon: IconFaceMeh, color: 'text-yellow-500', selectedAnimation: { y: [-3, 3, -3, 0], scale: 1.1 } },
  { value: 4, Icon: IconFaceSmile, color: 'text-lime-500', selectedAnimation: { rotate: [5, -5, 5, 0], scale: 1.1 } },
  { value: 5, Icon: IconFaceSmile, color: 'text-green-500', selectedAnimation: { rotate: [8, -8, 8, 0], scale: 1.1 } },
];

const getNpsColor = (score: number) => {
  if (score <= 6) return 'bg-red-500 hover:bg-red-600';
  if (score <= 8) return 'bg-yellow-500 hover:bg-yellow-600';
  return 'bg-green-500 hover:bg-green-600';
};

const SatisfactionRating: FC<SatisfactionRatingProps> = ({ title, description, value, onChange, variant }) => {
  return (
    <div className="space-y-3">
        <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
            {description && <p className="text-sm text-gray-400">{description}</p>}
        </div>
        {variant === 'csat' && (
            <div className="flex justify-center items-center gap-4 sm:gap-6">
                {csatOptions.map(({ value: score, Icon, color, selectedAnimation }) => (
                    <motion.button type="button" key={score} onClick={() => onChange(score)} className="bg-transparent border-none p-0" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <div className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full transition-all duration-300 ${value === score ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white' : 'ring-2 ring-transparent'}`}>
                            <motion.div 
                                animate={value === score ? selectedAnimation : {}} 
                                // CORREÇÃO APLICADA AQUI:
                                // Removido o "type: 'spring'" para permitir a animação com múltiplos pontos-chave.
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            >
                                <Icon className={`w-10 h-10 sm:w-12 sm:h-12 transition-all duration-300 ${color} ${value === score ? 'opacity-100' : 'opacity-60'}`} />
                            </motion.div>
                        </div>
                    </motion.button>
                ))}
            </div>
        )}
        {variant === 'nps' && (
            <div className="flex justify-center items-center flex-wrap gap-2 sm:gap-3">
                {Array.from({ length: 11 }, (_, i) => i).map((score) => (
                    <motion.button type="button" key={score} onClick={() => onChange(score)} className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full text-white font-bold text-lg transition-all transform ${getNpsColor(score)} ${value === score ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white scale-110' : ''}`} whileHover={{ scale: 1.1, y: -4 }} whileTap={{ scale: 0.95 }}>
                        {score}
                    </motion.button>
                ))}
            </div>
        )}
    </div>
  );
};

export default SatisfactionRating;