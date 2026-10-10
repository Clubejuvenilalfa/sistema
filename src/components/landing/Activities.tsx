import { motion } from 'framer-motion';

const activities = [
  { emoji: '🎭', title: 'Teatro', desc: 'Expressão e confiança' },
  { emoji: '🍳', title: 'Culinária', desc: 'Autonomia e equipe' },
  { emoji: '🎨', title: 'Artesanato', desc: 'Paciência e criatividade' },
  { emoji: '⚽', title: 'Esportes', desc: 'Superação e fair play' },
  { emoji: '📚', title: 'Literatura', desc: 'Livros e Cine-Fórum' },
  { emoji: '🌱', title: 'Formação humana', desc: 'Virtudes e propósito' },
];

export default function Activities() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden" style={{ background: '#D5006D' }}>
      <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white/5" />
      <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-white/5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="font-dm text-sm font-semibold text-white/80 uppercase tracking-widest">O que acontece por aqui</span>
          <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl text-white mt-3 mb-4">Atividades que ela vai amar</h2>
          <p className="font-dm text-white/70 text-lg max-w-xl mx-auto">E que ensinam muito mais do que parecem.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {activities.map((activity, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-7 rounded-[20px] border border-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-1"
              style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}
            >
              <span className="text-4xl block mb-4">{activity.emoji}</span>
              <h3 className="font-playfair text-xl text-white mb-2">{activity.title}</h3>
              <p className="font-dm text-white/70">{activity.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
