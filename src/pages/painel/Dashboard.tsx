import { useQuery } from '@tanstack/react-query';
import { Users, Heart, ClipboardList, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

function useCount(table: string, filter?: { col: string; eq: string }) {
  return useQuery({
    queryKey: ['count', table, filter?.col, filter?.eq],
    queryFn: async () => {
      let q = supabase.from(table).select('*', { count: 'exact', head: true });
      if (filter) q = q.eq(filter.col, filter.eq);
      const { count, error } = await q;
      if (error) throw error;
      return count ?? 0;
    },
  });
}

export default function Dashboard() {
  const meninas = useCount('meninas', { col: 'status', eq: 'ativa' });
  const familias = useCount('familias');
  const reunioes = useCount('reunioes', { col: 'status', eq: 'agendada' });
  const encontros = useCount('encontros');

  const stats = [
    { label: 'Meninas ativas', value: meninas.data, icon: Users, to: '/painel/meninas', color: 'bg-rosa/10 text-rosa' },
    { label: 'Famílias', value: familias.data, icon: Heart, to: '/painel/familias', color: 'bg-verde/15 text-verde' },
    { label: 'Reuniões agendadas', value: reunioes.data, icon: ClipboardList, to: '/painel/reunioes', color: 'bg-roxo/10 text-roxo' },
    { label: 'Encontros registrados', value: encontros.data, icon: Calendar, to: '/painel/calendario', color: 'bg-laranja/10 text-laranja' },
  ];

  return (
    <div>
      <h2 className="font-playfair text-2xl text-texto-principal mb-1">Visão geral</h2>
      <p className="font-dm text-sm text-texto-secundario mb-6">
        Panorama rápido do que está acontecendo no clube.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <Link
            key={s.label}
            to={s.to}
            className="bg-white rounded-2xl border border-roxo/10 p-5 hover:border-roxo/30 hover:shadow-sm transition-all"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="font-playfair text-3xl text-texto-principal leading-none">
              {s.value ?? '—'}
            </p>
            <p className="font-dm text-xs text-texto-secundario mt-1">{s.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
