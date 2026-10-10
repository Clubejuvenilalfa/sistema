import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rosa-light via-white to-roxo-light">
      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid grid-cols-2 gap-0.5 w-8 h-8">
            <div className="rounded-sm bg-rosa"></div>
            <div className="rounded-sm bg-verde"></div>
            <div className="rounded-sm bg-roxo"></div>
            <div className="rounded-sm bg-laranja"></div>
          </div>
          <span className="font-playfair font-bold text-lg text-texto-principal">Clube Alfa</span>
        </div>
        <Link
          to="/login"
          className="text-sm font-dm text-roxo hover:text-roxo-dark font-medium"
        >
          Entrar
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="font-playfair text-5xl md:text-6xl text-texto-principal mb-5">
          Formando meninas <br /> a partir das virtudes.
        </h1>
        <p className="font-dm text-lg text-texto-secundario max-w-2xl mx-auto mb-10">
          Um clube para meninas crescerem em caráter, amizade e propósito —
          com encontros, formação dos pais e muito mais.
        </p>
        <Link
          to="/autocadastro"
          className="inline-block bg-roxo text-white font-dm font-medium rounded-full px-8 py-4 shadow-lg shadow-roxo/20 hover:bg-roxo-dark transition-all"
        >
          Quero inscrever minha filha
        </Link>
      </main>

      <footer className="text-center text-xs text-texto-secundario/60 py-10 font-dm">
        © Clube Juvenil Alfa
      </footer>
    </div>
  );
}
