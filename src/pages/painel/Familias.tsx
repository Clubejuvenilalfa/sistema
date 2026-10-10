import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, X, Pencil, Trash2, Heart, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { Familia } from '@/types/db';

type FormState = {
  responsavel: string;
  telefone: string;
  email: string;
  observacoes: string;
};

const empty: FormState = { responsavel: '', telefone: '', email: '', observacoes: '' };

export default function Familias() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Familia | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  const q = useQuery({
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
        responsavel: form.responsavel.trim(),
        telefone: form.telefone.trim() || null,
        email: form.email.trim() || null,
        observacoes: form.observacoes.trim() || null,
      };
      if (editing) {
        const { error } = await supabase.from('familias').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('familias').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? 'Família atualizada' : 'Família cadastrada');
      qc.invalidateQueries({ queryKey: ['familias'] });
      qc.invalidateQueries({ queryKey: ['count', 'familias'] });
      close();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('familias').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Família removida');
      qc.invalidateQueries({ queryKey: ['familias'] });
      qc.invalidateQueries({ queryKey: ['count', 'familias'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openNew() { setEditing(null); setForm(empty); setShowForm(true); }
  function openEdit(f: Familia) {
    setEditing(f);
    setForm({
      responsavel: f.responsavel,
      telefone: f.telefone ?? '',
      email: f.email ?? '',
      observacoes: f.observacoes ?? '',
    });
    setShowForm(true);
  }
  function close() { setShowForm(false); setEditing(null); setForm(empty); }
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.responsavel.trim()) return;
    saveMut.mutate();
  }
  function del(f: Familia) {
    if (!confirm(`Apagar a família "${f.responsavel}"?`)) return;
    delMut.mutate(f.id);
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-playfair text-2xl text-texto-principal mb-1">Famílias</h2>
          <p className="font-dm text-sm text-texto-secundario">
            Contatos dos responsáveis pelas meninas.
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-roxo text-white font-dm text-sm font-medium hover:bg-roxo-dark transition-all shadow-md shadow-roxo/20"
        >
          <Plus className="w-4 h-4" /> Nova família
        </button>
      </div>

      {q.isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-roxo" />
        </div>
      ) : q.data && q.data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-roxo/10 p-10 text-center">
          <Heart className="w-10 h-10 text-roxo/30 mx-auto mb-3" />
          <p className="font-dm text-sm text-texto-secundario">
            Nenhuma família cadastrada ainda.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {q.data?.map(f => (
            <div key={f.id} className="bg-white rounded-2xl border border-roxo/10 p-5 flex gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-dm font-medium text-texto-principal mb-1">{f.responsavel}</h3>
                <div className="space-y-0.5">
                  {f.telefone && (
                    <p className="font-dm text-xs text-texto-secundario flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> {f.telefone}
                    </p>
                  )}
                  {f.email && (
                    <p className="font-dm text-xs text-texto-secundario flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3" /> {f.email}
                    </p>
                  )}
                </div>
                {f.observacoes && (
                  <p className="font-dm text-xs text-texto-secundario mt-2 italic">{f.observacoes}</p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => openEdit(f)} className="p-1.5 rounded-full hover:bg-roxo/10 text-roxo transition-all">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => del(f)} className="p-1.5 rounded-full hover:bg-rosa/10 text-rosa transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={close}>
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-playfair text-xl text-texto-principal">
                {editing ? 'Editar família' : 'Nova família'}
              </h3>
              <button onClick={close} className="p-1 hover:bg-roxo-light rounded-full">
                <X className="w-5 h-5 text-texto-secundario" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Responsável *</label>
                <input
                  required
                  value={form.responsavel}
                  onChange={e => setForm(f => ({ ...f, responsavel: e.target.value }))}
                  className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-4 py-2.5 focus:outline-none focus:border-roxo/40"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Telefone</label>
                  <input
                    value={form.telefone}
                    onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                    className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-roxo/40"
                  />
                </div>
                <div>
                  <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">E-mail</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-roxo/40"
                  />
                </div>
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
                disabled={saveMut.isPending || !form.responsavel.trim()}
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
