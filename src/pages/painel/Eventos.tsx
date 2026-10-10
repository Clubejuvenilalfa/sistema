import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, X, ExternalLink, Pencil, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Evento } from '@/types/db';

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

export default function Eventos() {
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ nome: '', slug: '' });

  const q = useQuery({
    queryKey: ['eventos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('eventos').select('*').order('data_evento', { ascending: false });
      if (error) throw error;
      return data as Evento[];
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const slug = form.slug || slugify(form.nome);
      const { data, error } = await supabase.from('eventos').insert({ nome: form.nome.trim(), slug }).select().single();
      if (error) throw error;
      return data as Evento;
    },
    onSuccess: () => {
      toast.success('Evento criado');
      qc.invalidateQueries({ queryKey: ['eventos'] });
      setShowNew(false);
      setForm({ nome: '', slug: '' });
    },
    onError: (e: Error) => toast.error(e.message.includes('duplicate') ? 'Esse slug já existe' : e.message),
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    createMut.mutate();
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-playfair text-2xl text-texto-principal mb-1">Eventos 🎉</h2>
          <p className="font-dm text-sm text-texto-secundario">
            Crie e gerencie eventos com inscrição, calculadora e controle de pagamento.
          </p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-roxo text-white font-dm text-sm font-medium hover:bg-roxo-dark transition-all shadow-md shadow-roxo/20">
          <Plus className="w-4 h-4" /> Novo evento
        </button>
      </div>

      {q.isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-roxo" /></div>
      ) : q.data && q.data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-roxo/10 p-10 text-center">
          <Calendar className="w-10 h-10 text-roxo/30 mx-auto mb-3" />
          <p className="font-dm text-sm text-texto-secundario">Nenhum evento ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {q.data?.map(e => (
            <div key={e.id} className="bg-white rounded-2xl border border-roxo/10 p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-playfair text-lg text-texto-principal truncate">{e.nome}</h3>
                    <span className={`text-[10px] font-dm font-medium px-2 py-0.5 rounded-full ${e.status === 'ativo' ? 'bg-verde/15 text-verde' : 'bg-texto-secundario/15 text-texto-secundario'}`}>
                      {e.status}
                    </span>
                  </div>
                  <p className="font-dm text-xs text-texto-secundario">
                    {e.subtitulo || '—'} · {e.data_evento ? new Date(e.data_evento).toLocaleDateString('pt-BR') : '(sem data)'}
                  </p>
                  <code className="font-mono text-[10px] text-texto-secundario/60 mt-1 inline-block">{origin}/eventos/{e.slug}</code>
                </div>
                <div className="flex gap-1 shrink-0">
                  <a href={`/eventos/${e.slug}`} target="_blank" rel="noopener noreferrer" title="Abrir link público"
                    className="p-2 rounded-full hover:bg-roxo/10 text-roxo transition-all">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <Link to={`/painel/eventos/${e.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-roxo text-white text-xs font-dm font-medium hover:bg-roxo-dark transition-all">
                    <Pencil className="w-3.5 h-3.5" /> Abrir
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={() => setShowNew(false)}>
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-playfair text-xl text-texto-principal">Novo evento</h3>
              <button onClick={() => setShowNew(false)} className="p-1 hover:bg-roxo-light rounded-full">
                <X className="w-5 h-5 text-texto-secundario" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Nome *</label>
                <input required value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value, slug: slugify(e.target.value) }))}
                  placeholder="Ex: Alfa Stars 2026"
                  className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-4 py-2.5 focus:outline-none focus:border-roxo/40" />
              </div>
              <div>
                <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Slug (parte do link)</label>
                <input value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                  className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-4 py-2.5 focus:outline-none focus:border-roxo/40 font-mono" />
                <p className="font-dm text-[10px] text-texto-secundario mt-1">
                  Link: {origin}/eventos/<b>{form.slug || 'slug'}</b>
                </p>
              </div>
              <button type="submit" disabled={createMut.isPending || !form.nome.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-roxo text-white font-dm text-sm font-medium hover:bg-roxo-dark transition-all disabled:opacity-40">
                {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar e configurar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
