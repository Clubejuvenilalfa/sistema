import { useState } from 'react';
import WaitlistModal from './WaitlistModal';

export default function Hero() {
  const [showWaitlist, setShowWaitlist] = useState(false);
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20" style={{ background: 'linear-gradient(135deg, #FFF0F6 0%, #FFC8E4 100%)' }}>
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #D5006D 0%, transparent 70%)' }} />
      <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #7B2FBE 0%, transparent 70%)' }} />
      <div className="absolute top-40 right-10 w-32 h-32 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #F05A00 0%, transparent 70%)' }} />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 w-[500px] h-[500px] rounded-full border-[3px] border-dashed border-rosa/20 hidden lg:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-rosa/20 mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-rosa animate-pulse" />
            <span className="font-dm text-sm text-texto-secundario">São José dos Campos · Desde 1978</span>
          </div>

          <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl leading-tight text-texto-principal mb-6">
            Um espaço para sua filha{' '}
            <em className="text-rosa not-italic font-bold">crescer com alegria,</em>{' '}
            amizades e valores
          </h1>

          <p className="font-dm text-lg text-texto-secundario leading-relaxed mb-10 max-w-2xl">
            O Clube Juvenil Alfa forma meninas de 10 a 14 anos nas 5 dimensões humanas: intelectual, humana, cultural, física e espiritual — com a parceria real da família.
          </p>

          <button
            onClick={() => setShowWaitlist(true)}
            className="inline-block px-8 py-4 rounded-full bg-rosa text-white font-dm font-semibold text-lg shadow-xl shadow-rosa/35 hover:bg-rosa-dark hover:shadow-2xl hover:shadow-rosa/40 transition-all duration-300 hover:-translate-y-0.5"
          >
            Entrar na lista de espera
          </button>
          {showWaitlist && <WaitlistModal onClose={() => setShowWaitlist(false)} />}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {[
            { value: '+45', label: 'anos de história' },
            { value: '1', label: 'unidade em SJC' },
            { value: '10–14', label: 'anos' },
            { value: '🌸', label: 'só meninas' },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-rosa/10">
              <div className="font-playfair text-3xl font-bold text-rosa mb-1">{stat.value}</div>
              <div className="font-dm text-sm text-texto-secundario">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
