import { motion } from 'framer-motion';
import { Clock, MapPin, User, Phone } from 'lucide-react';

const info = [
  { icon: Clock, title: 'Horário', desc: 'Sábados das 9h30 às 12h30' },
  { icon: Clock, title: 'Clube Estendido', desc: 'Sábados das 9h30 às 15h · Para meninas de 13 e 14 anos · Inclui almoço em grupo + atividades da tarde' },
  { icon: MapPin, title: 'Endereço', desc: 'Rua Justino Cobra, 70 · Vila Ema · São José dos Campos – SP' },
  { icon: User, title: 'Faixa etária', desc: 'Meninas de 10 a 14 anos' },
  { icon: Phone, title: 'Contato', desc: 'Viviane (12) 98247-8590 · Cláudia (12) 98144-6430' },
];

export default function PracticalInfo() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="font-dm text-sm font-semibold text-rosa uppercase tracking-widest">Informações</span>
          <h2 className="font-playfair text-3xl sm:text-4xl text-texto-principal mt-3">Informações Práticas</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {info.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-8 rounded-[20px] border-[1.5px] border-rosa/15 hover:shadow-lg hover:shadow-rosa/10 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-rosa-light flex items-center justify-center mx-auto mb-5">
                <item.icon className="w-6 h-6 text-rosa" />
              </div>
              <h3 className="font-playfair text-lg text-texto-principal mb-2">{item.title}</h3>
              <p className="font-dm text-sm text-texto-secundario leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
