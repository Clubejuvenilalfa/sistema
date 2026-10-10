import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, X, ChevronRight, Calendar, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { Encontro, Menina, Presenca } from '@/types/db';

export default function Presenca() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedEncontro, setSelectedEncontro] = useState<Encontro | null>(null);
  const [novoForm, setNovoForm] = useState({ data: new Date().toISOString().slice(0, 10), tema: '' });

  const encontrosQ = useQuery({
    queryKey: ['encontros'],
    queryFn: async () => {
      const { data, error } = await supabase.from('encontros').select('*').order('data', { ascending: false });
      if (error) throw error;
      return data as Encontro[];
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('encontros')
        .insert({ data: novoForm.data, tema: novoForm.tema.trim() || null, tipo: 'regular' })
        .select()
        .single();
      if (error) throw error;
      return data as Encontro;
    },
    onSuccess: (e) => {
      toast.success('Encontro criado');
      qc.invalidateQueries({ queryKey: ['encontros'] });
      qc.invalidateQueries({ queryKey: ['count', 'encontros'] });
      setShowForm(false);
      setNovoForm({ data: new Date().toISOString().slice(0, 10), tema: '' });
      setSelectedEncontro(e);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (selectedEncontro) {
    return <ChecklistPresenca encontro={selectedEncontro} onBack={() => setSelectedEncontro(null)} />;
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-playfair text-2xl text-texto-principal mb-1">Presença ✍️</h2>
          <p className="font-dm text-sm text-texto-secundario">
            Escolha um encontro para marcar quem veio.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-roxo text-white font-dm text-sm font-medium hover:bg-roxo-dark transition-all shadow-md shadow-roxo/20"
        >
          <Plus className="w-4 h-4" /> Novo encontro
        </button>
      </div>

      {encontrosQ.isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-roxo" />
        </div>
      ) : encontrosQ.data && encontrosQ.data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-roxo/10 p-10 text-center">
          <Calendar className="w-10 h-10 text-roxo/30 mx-auto mb-3" />
          <p className="font-dm text-sm text-texto-secundario">
            Nenhum encontro registrado. Clique em <b>Novo encontro</b>.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {encontrosQ.data?.map(e => (
            <button
              key={e.id}
              onClick={() => setSelectedEncontro(e)}
              className="w-full text-left bg-white rounded-2xl border border-roxo/10 hover:border-roxo/30 hover:shadow-sm transition-all p-4 flex items-center gap-4"
            >
              <div className="shrink-0 w-14 h-14 rounded-xl bg-roxo/5 flex flex-col items-center justify-center">
                <span className="font-playfair text-lg text-roxo leading-none">{e.data.slice(8, 10)}</span>
                <span className="font-dm text-[10px] text-texto-secundario mt-0.5 uppercase">{mesCurto(e.data)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-dm font-medium text-texto-principal truncate">{e.tema || 'Encontro'}</h4>
                <p className="font-dm text-xs text-texto-secundario">{formatDate(e.data)}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-texto-secundario/40" />
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md p-6" onClick={ev => ev.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-playfair text-xl text-texto-principal">Novo encontro</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-roxo-light rounded-full">
                <X className="w-5 h-5 text-texto-secundario" />
              </button>
            </div>
            <form onSubmit={(ev: FormEvent) => { ev.preventDefault(); createMut.mutate(); }} className="space-y-3">
              <div>
                <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Data *</label>
                <input
                  type="date"
                  required
                  value={novoForm.data}
                  onChange={ev => setNovoForm(f => ({ ...f, data: ev.target.value }))}
                  className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-roxo/40"
                />
              </div>
              <div>
                <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Tema (opcional)</label>
                <input
                  value={novoForm.tema}
                  onChange={ev => setNovoForm(f => ({ ...f, tema: ev.target.value }))}
                  placeholder="Ex: Virtude da coragem"
                  className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-4 py-2.5 focus:outline-none focus:border-roxo/40"
                />
              </div>
              <button
                type="submit"
                disabled={createMut.isPending}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-roxo text-white font-dm text-sm font-medium hover:bg-roxo-dark transition-all disabled:opacity-40"
              >
                {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar e marcar presença'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ChecklistPresenca({ encontro, onBack }: { encontro: Encontro; onBack: () => void }) {
  const qc = useQueryClient();

  const meninasQ = useQuery({
    queryKey: ['meninas', 'ativas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('meninas').select('*').eq('status', 'ativa').order('nome');
      if (error) throw error;
      return data as Menina[];
    },
  });

  const presQ = useQuery({
    queryKey: ['presencas', encontro.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('presencas').select('*').eq('encontro_id', encontro.id);
      if (error) throw error;
      return data as Presenca[];
    },
  });

  const presMap = Object.fromEntries((presQ.data ?? []).map(p => [p.menina_id, p]));

  const toggleMut = useMutation({
    mutationFn: async ({ meninaId, presente }: { meninaId: string; presente: boolean }) => {
      const existing = presMap[meninaId];
      if (existing) {
        const { error } = await supabase.from('presencas').update({ presente }).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('presencas').insert({
          encontro_id: encontro.id,
          menina_id: meninaId,
          presente,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['presencas', encontro.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const loading = meninasQ.isLoading || presQ.isLoading;
  const totalPresentes = (presQ.data ?? []).filter(p => p.presente).length;

  return (
    <div>
      <button onClick={onBack} className="font-dm text-sm text-roxo hover:text-roxo-dark mb-4">
        ← voltar aos encontros
      </button>

      <h2 className="font-playfair text-2xl text-texto-principal mb-1">
        {encontro.tema || 'Encontro'}
      </h2>
      <p className="font-dm text-sm text-texto-secundario mb-6">
        {formatDate(encontro.data)} · {totalPresentes} presente(s)
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-roxo" />
        </div>
      ) : meninasQ.data?.length === 0 ? (
        <div className="bg-white rounded-2xl border border-roxo/10 p-10 text-center">
          <ClipboardCheck className="w-10 h-10 text-roxo/30 mx-auto mb-3" />
          <p className="font-dm text-sm text-texto-secundario">
            Cadastre meninas em <b>Meninas</b> antes de marcar presença.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-roxo/10 overflow-hidden">
          <ul className="divide-y divide-roxo/5">
            {meninasQ.data?.map(m => {
              const p = presMap[m.id];
              const presente = p?.presente ?? false;
              return (
                <li key={m.id} className="flex items-center justify-between p-4">
                  <span className="font-dm text-sm text-texto-principal">{m.nome}</span>
                  <button
                    onClick={() => toggleMut.mutate({ meninaId: m.id, presente: !presente })}
                    className={`relative w-12 h-6 rounded-full transition-all ${presente ? 'bg-verde' : 'bg-texto-secundario/20'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${presente ? 'translate-x-6' : ''}`} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-');
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${parseInt(d, 10)} de ${meses[parseInt(m, 10) - 1]} de ${y}`;
}
function mesCurto(iso: string) {
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return meses[parseInt(iso.split('-')[1], 10) - 1] || '';
}
