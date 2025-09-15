import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SatisfactionForm } from './components/SatisfactionForm';
import { Dashboard } from './components/Dashboard';

const FormPage = () => (
  <main className="min-h-screen w-full flex items-center justify-center p-4 relative bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('/banner-back 1.png')` }}>
    <div className="absolute inset-0 bg-black/70 z-0" />
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="w-full z-10 flex justify-center"
    >
      <SatisfactionForm />
    </motion.div>
  </main>
);

const DashboardPage = () => (
    <main className="min-h-screen w-full bg-gray-900 text-white p-4 sm:p-8 relative">
        <Dashboard />
    </main>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FormPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;