import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, X, ClipboardList, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Formulario } from '@/types/db';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export default function Formularios() {
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ nome: '', slug: '', descricao: '' });

  const q = useQuery({
    queryKey: ['formularios'],
    queryFn: async () => {
      const { data, error } = await supabase.from('formularios').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Formulario[];
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const slug = form.slug || slugify(form.nome);
      const { data, error } = await supabase
        .from('formularios')
        .insert({ nome: form.nome.trim(), slug, descricao: form.descricao.trim() || null, campos: [] })
        .select()
        .single();
      if (error) throw error;
      return data as Formulario;
    },
    onSuccess: () => {
      toast.success('Formulário criado — adicione os campos agora');
      qc.invalidateQueries({ queryKey: ['formularios'] });
      setShowNew(false);
      setForm({ nome: '', slug: '', descricao: '' });
    },
    onError: (e: Error) => toast.error(e.message.includes('duplicate') ? 'Esse slug já existe' : e.message),
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('formularios').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Formulário apagado');
      qc.invalidateQueries({ queryKey: ['formularios'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleStatusMut = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'ativo' | 'encerrado' }) => {
      const { error } = await supabase.from('formularios').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['formularios'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    createMut.mutate();
  }

  function del(f: Formulario) {
    if (!confirm(`Apagar o formulário "${f.nome}"? Todas as respostas serão perdidas.`)) return;
    delMut.mutate(f.id);
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-playfair text-2xl text-texto-principal mb-1">Formulários 📝</h2>
          <p className="font-dm text-sm text-texto-secundario">
            Crie formulários dinâmicos pra inscrições, confirmações e qualquer coleta de dados.
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-roxo text-white font-dm text-sm font-medium hover:bg-roxo-dark transition-all shadow-md shadow-roxo/20"
        >
          <Plus className="w-4 h-4" /> Novo formulário
        </button>
      </div>

      {q.isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-roxo" />
        </div>
      ) : q.data && q.data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-roxo/10 p-10 text-center">
          <ClipboardList className="w-10 h-10 text-roxo/30 mx-auto mb-3" />
          <p className="font-dm text-sm text-texto-secundario">Nenhum formulário ainda.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {q.data?.map(f => (
            <div key={f.id} className="bg-white rounded-2xl border border-roxo/10 p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-dm font-medium text-texto-principal truncate">{f.nome}</h3>
                  <span className={`text-[10px] font-dm font-medium px-2 py-0.5 rounded-full ${f.status === 'ativo' ? 'bg-verde/15 text-verde' : 'bg-texto-secundario/15 text-texto-secundario'}`}>
                    {f.status}
                  </span>
                </div>
                <p className="font-dm text-xs text-texto-secundario truncate">
                  {origin}/f/{f.slug} · {f.campos.length} campo{f.campos.length === 1 ? '' : 's'}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <a
                  href={`/f/${f.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abrir link público"
                  className="p-2 rounded-full hover:bg-roxo/10 text-roxo transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <Link
                  to={`/painel/formularios/${f.id}`}
                  title="Editar"
                  className="p-2 rounded-full hover:bg-roxo/10 text-roxo transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => toggleStatusMut.mutate({ id: f.id, status: f.status === 'ativo' ? 'encerrado' : 'ativo' })}
                  className="text-[11px] font-dm font-medium px-3 py-1 rounded-full bg-roxo/5 text-roxo hover:bg-roxo/10 transition-all"
                >
                  {f.status === 'ativo' ? 'Encerrar' : 'Reabrir'}
                </button>
                <button
                  onClick={() => del(f)}
                  className="p-2 rounded-full hover:bg-rosa/10 text-rosa transition-all"
                  title="Apagar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={() => setShowNew(false)}>
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-playfair text-xl text-texto-principal">Novo formulário</h3>
              <button onClick={() => setShowNew(false)} className="p-1 hover:bg-roxo-light rounded-full">
                <X className="w-5 h-5 text-texto-secundario" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Nome *</label>
                <input
                  required
                  value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value, slug: slugify(e.target.value) }))}
                  placeholder="Ex: Alfa Stars 2025"
                  className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-4 py-2.5 focus:outline-none focus:border-roxo/40"
                />
              </div>
              <div>
                <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Slug (parte do link)</label>
                <input
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                  placeholder="alfa-stars-2025"
                  className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-4 py-2.5 focus:outline-none focus:border-roxo/40 font-mono"
                />
                <p className="font-dm text-[10px] text-texto-secundario mt-1">
                  Link ficará: {origin}/f/<b>{form.slug || 'slug'}</b>
                </p>
              </div>
              <div>
                <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Descrição (opcional)</label>
                <textarea
                  value={form.descricao}
                  onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                  rows={3}
                  placeholder="Mostrada no topo do formulário"
                  className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-4 py-2.5 focus:outline-none focus:border-roxo/40 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={createMut.isPending || !form.nome.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-roxo text-white font-dm text-sm font-medium hover:bg-roxo-dark transition-all disabled:opacity-40"
              >
                {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar e adicionar campos'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
