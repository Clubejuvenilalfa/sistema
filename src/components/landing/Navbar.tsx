import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WaitlistModal from './WaitlistModal';

export function ClubeLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <img src="/logo-clube-alfa.png" alt="Clube Alfa" className="w-10 h-10 rounded-full object-cover" />
      <span className="font-playfair font-bold text-xl text-texto-principal">Clube Alfa</span>
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/">
            <ClubeLogo />
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full border-[1.5px] border-roxo text-roxo font-dm font-medium text-sm hover:bg-roxo hover:text-white transition-all duration-300">
              <Lock className="w-3.5 h-3.5" /> Área da Voluntária
            </Link>
            <button onClick={() => setShowWaitlist(true)} className="px-5 py-2 rounded-full bg-rosa text-white font-dm font-medium text-sm shadow-lg shadow-rosa/30 hover:bg-rosa-dark transition-all duration-300">
              Entrar na lista
            </button>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-texto-principal">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-md border-t border-rosa/10"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border-[1.5px] border-roxo text-roxo font-dm font-medium text-sm text-center">
                <Lock className="w-3.5 h-3.5" /> Área da Voluntária
              </Link>
              <button onClick={() => { setMobileOpen(false); setShowWaitlist(true); }} className="px-5 py-2.5 rounded-full bg-rosa text-white font-dm font-medium text-sm text-center shadow-lg shadow-rosa/30">
                Entrar na lista
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {showWaitlist && <WaitlistModal onClose={() => setShowWaitlist(false)} />}
    </nav>
  );
}
