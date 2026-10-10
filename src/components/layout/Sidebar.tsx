import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Heart, ClipboardCheck, Calendar, ClipboardList, Megaphone, LogOut, UserCog, Inbox } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import type { Cargo } from '@/types/db';

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  cargos?: Cargo[];
};

const items: NavItem[] = [
  { to: '/painel', label: 'Painel', icon: LayoutDashboard },
  { to: '/painel/lista-espera', label: 'Lista de Espera', icon: Inbox },
  { to: '/painel/meninas', label: 'Meninas', icon: Users },
  { to: '/painel/familias', label: 'Famílias', icon: Heart },
  { to: '/painel/presenca', label: 'Presença', icon: ClipboardCheck },
  { to: '/painel/calendario', label: 'Calendário', icon: Calendar },
  { to: '/painel/reunioes', label: 'Reuniões', icon: ClipboardList },
  { to: '/painel/marketing', label: 'Marketing', icon: Megaphone, cargos: ['diretora', 'preceptora'] },
  { to: '/painel/admin', label: 'Equipe', icon: UserCog, cargos: ['diretora'] },
];

export default function Sidebar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const visible = items.filter(i => !i.cargos || (profile && i.cargos.includes(profile.cargo)));

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 min-h-screen bg-white border-r border-roxo/10 p-5">
        <div className="flex items-center gap-2.5 mb-10 px-2">
          <div className="grid grid-cols-2 gap-0.5 w-8 h-8">
            <div className="rounded-sm bg-rosa" />
            <div className="rounded-sm bg-verde" />
            <div className="rounded-sm bg-roxo" />
            <div className="rounded-sm bg-laranja" />
          </div>
          <span className="font-playfair font-bold text-lg text-texto-principal">Clube Alfa</span>
        </div>

        <nav className="flex-1 space-y-0.5">
          {visible.map(it => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.to === '/painel'}
              className={({ isActive }) =>
                cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-dm text-sm transition-all',
                  isActive
                    ? 'bg-roxo text-white shadow-md shadow-roxo/20'
                    : 'text-texto-secundario hover:bg-roxo-light hover:text-roxo',
                )
              }
            >
              <it.icon className="w-4 h-4" />
              {it.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-dm text-sm text-texto-secundario hover:bg-roxo-light hover:text-roxo transition-all mt-4"
        >
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-roxo/10 z-50 px-1 py-1.5">
        <div className="flex justify-around overflow-x-auto">
          {visible.map(it => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.to === '/painel'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all min-w-[60px]',
                  isActive ? 'text-roxo' : 'text-texto-secundario',
                )
              }
            >
              <it.icon className="w-4 h-4" />
              <span className="text-[10px] font-dm font-medium">{it.label}</span>
            </NavLink>
          ))}
          <button onClick={handleLogout} className="flex flex-col items-center gap-0.5 px-2 py-1.5 text-texto-secundario min-w-[60px]">
            <LogOut className="w-4 h-4" />
            <span className="text-[10px] font-dm font-medium">Sair</span>
          </button>
        </div>
      </nav>
    </>
  );
}
