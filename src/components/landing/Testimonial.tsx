import { motion } from 'framer-motion';

export default function Testimonial() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F05A00 0%, #E8A000 100%)' }}>
      <div className="absolute top-8 left-8 font-playfair text-[180px] leading-none text-white/10 select-none hidden md:block">"</div>
      <div className="absolute bottom-8 right-8 font-playfair text-[180px] leading-none text-white/10 select-none rotate-180 hidden md:block">"</div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="text-5xl mb-8 block">"</span>
          <blockquote className="font-playfair italic text-2xl sm:text-3xl lg:text-4xl text-white leading-relaxed mb-10">
            Ela não tinha dormido na sexta com ansiedade, com medo de não conseguir fazer amizades. No sábado ela voltou diferente — disse que se sentiu muito querida e conseguiu falar coisas que não conseguia falar em outro lugar.
          </blockquote>
          <div className="font-dm">
            <p className="text-white font-semibold text-lg">Mãe de associada</p>
            <p className="text-white/70">Clube Juvenil Alfa SJC</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
