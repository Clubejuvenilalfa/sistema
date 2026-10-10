import { useQuery } from '@tanstack/react-query';
import { Loader2, UserCog } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/db';

const cargoLabel: Record<string, string> = {
  diretora: 'Diretora',
  preceptora: 'Preceptora',
  monitora: 'Monitora',
};

export default function Admin() {
  const q = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('nome');
      if (error) throw error;
      return data as Profile[];
    },
  });

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-playfair text-2xl text-texto-principal mb-1">Equipe</h2>
          <p className="font-dm text-sm text-texto-secundario">
            Voluntárias cadastradas no sistema. Novas voluntárias são adicionadas via Supabase (temporário — aba de convite chega em breve).
          </p>
        </div>
      </div>

      {q.isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-roxo" />
        </div>
      ) : q.data && q.data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-roxo/10 p-10 text-center">
          <UserCog className="w-10 h-10 text-roxo/30 mx-auto mb-3" />
          <p className="font-dm text-sm text-texto-secundario">Nenhuma voluntária cadastrada.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-roxo/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-roxo-light/40">
              <tr className="text-left font-dm text-xs text-texto-secundario">
                <th className="px-5 py-3">Nome</th>
                <th className="px-5 py-3">Cargo</th>
                <th className="px-5 py-3 hidden md:table-cell">Telefone</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-roxo/5">
              {q.data?.map(p => (
                <tr key={p.id} className="font-dm text-sm">
                  <td className="px-5 py-3 text-texto-principal">{p.nome}</td>
                  <td className="px-5 py-3 text-texto-secundario">{cargoLabel[p.cargo] || p.cargo}</td>
                  <td className="px-5 py-3 text-texto-secundario hidden md:table-cell">{p.telefone || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-dm font-medium px-2 py-0.5 rounded-full ${p.status === 'ativa' ? 'bg-verde/15 text-verde' : 'bg-texto-secundario/10 text-texto-secundario'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
