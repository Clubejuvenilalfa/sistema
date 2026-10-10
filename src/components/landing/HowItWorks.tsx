import { motion } from 'framer-motion';
import { Clock, Sparkles, Users, Heart } from 'lucide-react';

const cards = [
  { num: '01', title: 'Sábados das 9h30 às 12h30', desc: 'Uma manhã inteira dedicada à formação, com atividades variadas e um ambiente pensado só para elas.', icon: Clock },
  { num: '02', title: 'Atividades que formam o caráter', desc: 'Teatro, culinária, artesanato, esportes e literatura — cada uma com um propósito claro de formação humana.', icon: Sparkles },
  { num: '03', title: 'Parceria real com os pais', desc: 'Os responsáveis fazem parte ativa do processo. Formações mensais e canal aberto todos os sábados.', icon: Users },
];

const facePills = [
  { letter: 'F', word: 'Filha' },
  { letter: 'A', word: 'Amiga' },
  { letter: 'C', word: 'Cristã' },
  { letter: 'E', word: 'Estudante' },
];

export default function HowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="font-dm text-sm font-semibold text-rosa uppercase tracking-widest">Como funciona</span>
          <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl text-texto-principal mt-3 mb-4">Uma manhã no Clube Alfa</h2>
          <p className="font-dm text-texto-secundario text-lg max-w-2xl mx-auto">
            Das 9h30 às 12h30, todo sábado — três horas que constroem muito mais do que parecem.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="group p-8 rounded-[20px] border-[1.5px] border-rosa/20 bg-white hover:shadow-xl hover:shadow-rosa/10 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-rosa-light flex items-center justify-center mb-5">
                <card.icon className="w-5 h-5 text-rosa" />
              </div>
              <span className="font-dm text-xs font-bold text-rosa/60 uppercase tracking-wider">{card.num}</span>
              <h3 className="font-playfair text-xl text-texto-principal mt-2 mb-3">{card.title}</h3>
              <p className="font-dm text-texto-secundario leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 md:p-10 rounded-[20px] bg-rosa-light border-[1.5px] border-rosa/20"
        >
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-14 h-14 rounded-full bg-rosa/10 flex items-center justify-center flex-shrink-0">
              <Heart className="w-7 h-7 text-rosa" />
            </div>
            <div className="flex-1">
              <h3 className="font-playfair text-2xl text-texto-principal mb-4">Nossa Preceptoria — o coração do Clube</h3>
              <p className="font-dm text-texto-secundario leading-relaxed mb-6">
                Cada menina é acompanhada de perto por preceptoras: jovens formadas dentro do próprio Clube, que conhecem a jornada por dentro e se tornam amigas de verdade para guiar, ouvir e inspirar. Esse acompanhamento é feito com a sigla FACE:
              </p>
              <div className="flex flex-wrap gap-3">
                {facePills.map((pill, i) => (
                  <div key={i} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-rosa/20">
                    <span className="w-7 h-7 rounded-full bg-rosa text-white flex items-center justify-center font-dm font-bold text-sm">{pill.letter}</span>
                    <span className="font-dm font-medium text-texto-principal">{pill.word}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
