import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, X, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { Menina, Familia } from '@/types/db';

type FormState = {
  nome: string;
  data_nasc: string;
  familia_id: string;
  observacoes: string;
  status: 'ativa' | 'inativa';
};

const empty: FormState = { nome: '', data_nasc: '', familia_id: '', observacoes: '', status: 'ativa' };

export default function Meninas() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Menina | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  const meninasQ = useQuery({
    queryKey: ['meninas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meninas')
        .select('*')
        .order('nome', { ascending: true });
      if (error) throw error;
      return data as Menina[];
    },
  });

  const familiasQ = useQuery({
    queryKey: ['familias'],
    queryFn: async () => {
      const { data, error } = await supabase.from('familias').select('*').order('responsavel');
      if (error) throw error;
      return data as Familia[];
    },
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        nome: form.nome.trim(),
        data_nasc: form.data_nasc || null,
        familia_id: form.familia_id || null,
        observacoes: form.observacoes.trim() || null,
        status: form.status,
      };
      if (editing) {
        const { error } = await supabase.from('meninas').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('meninas').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? 'Menina atualizada' : 'Menina cadastrada');
      qc.invalidateQueries({ queryKey: ['meninas'] });
      qc.invalidateQueries({ queryKey: ['count', 'meninas'] });
      close();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('meninas').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Removida');
      qc.invalidateQueries({ queryKey: ['meninas'] });
      qc.invalidateQueries({ queryKey: ['count', 'meninas'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openNew() {
    setEditing(null);
    setForm(empty);
    setShowForm(true);
  }

  function openEdit(m: Menina) {
    setEditing(m);
    setForm({
      nome: m.nome,
      data_nasc: m.data_nasc ?? '',
      familia_id: m.familia_id ?? '',
      observacoes: m.observacoes ?? '',
      status: m.status,
    });
    setShowForm(true);
  }

  function close() {
    setShowForm(false);
    setEditing(null);
    setForm(empty);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    saveMut.mutate();
  }

  function del(m: Menina) {
    if (!confirm(`Apagar o cadastro de "${m.nome}"?`)) return;
    delMut.mutate(m.id);
  }

  const familiasMap = Object.fromEntries((familiasQ.data ?? []).map(f => [f.id, f.responsavel]));

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-playfair text-2xl text-texto-principal mb-1">Meninas</h2>
          <p className="font-dm text-sm text-texto-secundario">
            Cadastro das meninas participantes do clube.
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-roxo text-white font-dm text-sm font-medium hover:bg-roxo-dark transition-all shadow-md shadow-roxo/20"
        >
          <Plus className="w-4 h-4" /> Nova menina
        </button>
      </div>

      {meninasQ.isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-roxo" />
        </div>
      ) : meninasQ.data && meninasQ.data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-roxo/10 p-10 text-center">
          <Users className="w-10 h-10 text-roxo/30 mx-auto mb-3" />
          <p className="font-dm text-sm text-texto-secundario">
            Nenhuma menina cadastrada. Clique em <b>Nova menina</b>.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-roxo/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-roxo-light/40">
              <tr className="text-left font-dm text-xs text-texto-secundario">
                <th className="px-5 py-3">Nome</th>
                <th className="px-5 py-3 hidden md:table-cell">Nascimento</th>
                <th className="px-5 py-3 hidden md:table-cell">Família</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-roxo/5">
              {meninasQ.data?.map(m => (
                <tr key={m.id} className="font-dm text-sm">
                  <td className="px-5 py-3 text-texto-principal">{m.nome}</td>
                  <td className="px-5 py-3 text-texto-secundario hidden md:table-cell">
                    {m.data_nasc ? new Date(m.data_nasc).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-5 py-3 text-texto-secundario hidden md:table-cell">
                    {m.familia_id ? familiasMap[m.familia_id] ?? '—' : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[11px] font-dm font-medium px-2 py-0.5 rounded-full ${m.status === 'ativa' ? 'bg-verde/15 text-verde' : 'bg-texto-secundario/10 text-texto-secundario'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(m)} className="p-1.5 rounded-full hover:bg-roxo/10 text-roxo transition-all">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => del(m)} className="p-1.5 rounded-full hover:bg-rosa/10 text-rosa transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={close}>
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-playfair text-xl text-texto-principal">
                {editing ? 'Editar menina' : 'Nova menina'}
              </h3>
              <button onClick={close} className="p-1 hover:bg-roxo-light rounded-full">
                <X className="w-5 h-5 text-texto-secundario" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Nome *</label>
                <input
                  required
                  value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-4 py-2.5 focus:outline-none focus:border-roxo/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Nascimento</label>
                  <input
                    type="date"
                    value={form.data_nasc}
                    onChange={e => setForm(f => ({ ...f, data_nasc: e.target.value }))}
                    className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-roxo/40"
                  />
                </div>
                <div>
                  <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as 'ativa' | 'inativa' }))}
                    className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-roxo/40 bg-white"
                  >
                    <option value="ativa">Ativa</option>
                    <option value="inativa">Inativa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Família</label>
                <select
                  value={form.familia_id}
                  onChange={e => setForm(f => ({ ...f, familia_id: e.target.value }))}
                  className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-roxo/40 bg-white"
                >
                  <option value="">— sem vínculo —</option>
                  {(familiasQ.data ?? []).map(f => (
                    <option key={f.id} value={f.id}>{f.responsavel}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Observações</label>
                <textarea
                  value={form.observacoes}
                  onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
                  rows={3}
                  className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-4 py-2.5 focus:outline-none focus:border-roxo/40 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={saveMut.isPending || !form.nome.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-roxo text-white font-dm text-sm font-medium hover:bg-roxo-dark transition-all disabled:opacity-40"
              >
                {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
