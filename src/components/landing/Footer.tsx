export default function Footer() {
  return (
    <footer className="py-12 relative" style={{ background: '#A00050' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo-clube-alfa.png" alt="Clube Alfa" className="w-10 h-10 rounded-full object-cover" />
            <span className="font-playfair font-bold text-xl text-white">Clube Juvenil Alfa</span>
          </div>
        </div>
        <p className="font-dm text-white/60 text-sm mb-4">São José dos Campos · Desde 1978</p>
        <a
          href="https://instagram.com/clubejuvenilalfa"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-dm text-sm text-white/80 hover:text-white transition-colors"
        >
          @clubejuvenilalfa
        </a>
      </div>
    </footer>
  );
}
