import { motion } from 'framer-motion';

const afternooonCards = [
  { emoji: '🎯', title: 'Orientação Profissional', desc: 'Ampliar a visão sobre o futuro acadêmico e as possibilidades de carreira' },
  { emoji: '🎬', title: 'Cine-Fórum', desc: 'Filmes e debates com temas relevantes para a faixa etária' },
  { emoji: '💬', title: 'Conversas Direcionadas', desc: 'Espaço para falar sobre escolhas, sonhos e desafios reais' },
  { emoji: '🌿', title: 'Lazer com propósito', desc: 'Descanso, brincadeira e convívio — com leveza e alegria' },
];

export default function ClubeEstendido() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F0E6FF 0%, #e8d5ff 100%)' }}>
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-roxo/5" />
      <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-rosa/5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="font-dm text-sm font-semibold text-roxo uppercase tracking-widest">Para as maiores</span>
          <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl text-texto-principal mt-3 mb-4">Clube Estendido</h2>
          <p className="font-dm text-texto-secundario text-lg max-w-xl mx-auto">Para meninas de 13 e 14 anos, o sábado vai além.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center mb-14 p-8 rounded-[24px] border-[1.5px] border-roxo/20 bg-white/70"
        >
          <p className="font-dm text-sm font-semibold text-roxo uppercase tracking-widest mb-3">Das 9h30 às 15h</p>
          <p className="font-dm text-texto-secundario leading-relaxed text-base">
            O Clube Estendido é o passo seguinte para as meninas de 13 e 14 anos. Elas almoçam juntas — trazendo marmita de casa ou preparando o próprio almoço quando a aula é de gastronomia — e continuam a tarde com atividades pensadas para essa fase.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {afternooonCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-7 rounded-[20px] bg-white border border-roxo/15 hover:border-roxo/30 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-roxo/10"
            >
              <span className="text-4xl block mb-4">{card.emoji}</span>
              <h3 className="font-playfair text-lg text-texto-principal mb-2">{card.title}</h3>
              <p className="font-dm text-sm text-texto-secundario leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[28px] p-8 md:p-12 mb-14"
          style={{ background: 'linear-gradient(135deg, #7B2FBE 0%, #5A1A9A 100%)' }}
        >
          <div className="max-w-3xl mx-auto">
            <span className="inline-block font-dm text-xs font-bold text-white/70 uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full border border-white/20">Destaque especial</span>
            <h3 className="font-playfair text-2xl sm:text-3xl text-white mb-2">COP — Curso de Orientação Profissional</h3>
            <p className="font-dm text-white/80 text-sm mb-6">Com a participação de <strong className="text-white">Rairis Faeti</strong>, diretora pedagógica do CRF – Educação Individualizada e Assessorias.</p>
            <p className="font-dm text-white/80 leading-relaxed mb-6">
              Mais do que escolher uma carreira: o COP ajuda cada jovem a desenvolver clareza, autonomia e responsabilidade na construção do próprio caminho. Ao longo dos encontros, as meninas conhecem diferentes cursos, universidades e formas de ingresso — vestibulares, processos seletivos nacionais e internacionais — e têm conversas reais com profissionais de diversas áreas.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="font-playfair text-5xl text-roxo/30 block leading-none mb-2">"</span>
          <blockquote className="font-playfair italic text-xl sm:text-2xl text-texto-principal leading-relaxed">
            O Clube Estendido não é só mais tempo juntas — é o espaço onde elas começam a se perguntar quem querem ser.
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}
