import { useAuth } from '@/hooks/useAuth';
import { Loader2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Painel() {
  const { profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !profile) {
      navigate('/login');
    }
  }, [loading, profile, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-roxo" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-roxo/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-xl text-texto-principal">Olá, {profile.nome}!</h1>
          <p className="font-dm text-xs text-texto-secundario capitalize">{profile.cargo}</p>
        </div>
        <button
          onClick={() => signOut().then(() => navigate('/login'))}
          className="flex items-center gap-2 text-sm font-dm text-texto-secundario hover:text-roxo"
        >
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-8">
        <h2 className="font-playfair text-3xl text-texto-principal mb-2">Painel</h2>
        <p className="font-dm text-sm text-texto-secundario mb-8">
          Em construção. Abas (Cadastro, Presença, Calendário, Reuniões, Marketing) chegam nas próximas sessões.
        </p>

        <div className="bg-white rounded-2xl border border-roxo/10 p-8 text-center">
          <p className="font-dm text-sm text-texto-secundario">
            🎉 Autenticação Supabase funcionando. Cargo detectado: <b className="text-roxo">{profile.cargo}</b>.
          </p>
        </div>
      </main>
    </div>
  );
}
