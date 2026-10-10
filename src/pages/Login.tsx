import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setLoading(false);
    if (error) {
      toast.error('E-mail ou senha incorretos');
      return;
    }
    navigate('/painel');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-xl shadow-roxo/5">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="grid grid-cols-2 gap-0.5 w-8 h-8">
            <div className="rounded-sm bg-rosa"></div>
            <div className="rounded-sm bg-verde"></div>
            <div className="rounded-sm bg-roxo"></div>
            <div className="rounded-sm bg-laranja"></div>
          </div>
          <span className="font-playfair font-bold text-lg text-texto-principal">Clube Alfa</span>
        </Link>

        <h1 className="font-playfair text-2xl text-texto-principal text-center mb-1">Entrar</h1>
        <p className="font-dm text-sm text-texto-secundario text-center mb-6">
          Área da voluntária
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-4 py-2.5 focus:outline-none focus:border-roxo/40"
            />
          </div>
          <div>
            <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Senha</label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-4 py-2.5 focus:outline-none focus:border-roxo/40"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-roxo text-white font-dm text-sm font-medium hover:bg-roxo-dark transition-all disabled:opacity-40"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
