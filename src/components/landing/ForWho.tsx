import { motion } from 'framer-motion';

const profiles = [
  { emoji: '🦋', title: 'A que ama fazer amigos de verdade' },
  { emoji: '🌸', title: 'A mais quietinha e reservada' },
  { emoji: '⚡', title: 'A cheia de energia e criatividade' },
  { emoji: '🫂', title: 'A que precisa de mais estrutura' },
];

export default function ForWho() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7B2FBE 0%, #5A1A9A 100%)' }}>
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5" />
      <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-white/5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="font-dm text-sm font-semibold text-white/80 uppercase tracking-widest">Para quem é</span>
          <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl text-white mt-3 mb-4">Sua filha vai se identificar</h2>
          <p className="font-dm text-white/70 text-lg max-w-2xl mx-auto">
            O clube é para meninas de 10 a 14 anos que merecem muito mais do que uma manhã qualquer.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5 mb-6">
          {profiles.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-7 rounded-[20px] border border-white/20 hover:border-white/40 hover:-translate-y-1 transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}
            >
              <span className="text-4xl block mb-4">{item.emoji}</span>
              <h3 className="font-playfair text-xl text-white">{item.title}</h3>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 md:p-10 rounded-[20px] border border-white/20"
          style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-start gap-5">
            <span className="text-4xl">💗</span>
            <div>
              <h3 className="font-playfair text-2xl text-white mb-3">Taxa mensal simbólica</h3>
              <p className="font-dm text-white/80 leading-relaxed">
                Cobramos uma contribuição mensal simbólica para manter o projeto e garantir atividades, materiais e os encontros de formação. Acreditamos que esse investimento pequeno representa um compromisso real com o desenvolvimento da sua filha.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
