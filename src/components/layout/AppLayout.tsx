import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '@/hooks/useAuth';

const cargoLabel: Record<string, string> = {
  diretora: 'Diretora',
  preceptora: 'Preceptora',
  monitora: 'Monitora',
};

export default function AppLayout() {
  const { profile } = useAuth();

  return (
    <div className="flex min-h-screen bg-roxo-light/20">
      <Sidebar />
      <main className="flex-1 pb-24 md:pb-0 min-w-0">
        <header className="bg-white border-b border-roxo/10 px-6 py-4">
          <h1 className="font-playfair text-xl text-texto-principal">Olá, {profile?.nome}! 🌸</h1>
          <p className="font-dm text-sm text-texto-secundario">
            {profile ? cargoLabel[profile.cargo] : ''}
          </p>
        </header>
        <div className="p-6 md:p-8 max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
