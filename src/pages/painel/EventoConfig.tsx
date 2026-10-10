import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ArrowLeft, Save, ExternalLink, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { Evento } from '@/types/db';

export default function EventoConfig() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ['evento', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('eventos').select('*').eq('id', id!).maybeSingle();
      if (error) throw error;
      return (data ?? null) as Evento | null;
    },
    enabled: !!id,
  });

  const [state, setState] = useState<Partial<Evento>>({});
  const [niveisText, setNiveisText] = useState('');

  useEffect(() => {
    if (q.data) {
      setState(q.data);
      setNiveisText((q.data.niveis ?? []).join('\n'));
    }
  }, [q.data]);

  const saveMut = useMutation({
    mutationFn: async () => {
      const niveis = niveisText.split('\n').map(s => s.trim()).filter(Boolean);
      const { error } = await supabase.from('eventos').update({ ...state, niveis }).eq('id', id!);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Salvo');
      qc.invalidateQueries({ queryKey: ['evento', id] });
      qc.invalidateQueries({ queryKey: ['eventos'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('eventos').delete().eq('id', id!);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Evento apagado');
      window.location.href = '/painel/eventos';
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function set<K extends keyof Evento>(key: K, value: Evento[K] | null) {
    setState(s => ({ ...s, [key]: value }));
  }

  if (q.isLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-roxo" /></div>;
  }
  if (!q.data) {
    return <div className="text-center py-16"><p className="font-dm text-sm text-texto-secundario">Evento não encontrado</p></div>;
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const e = q.data;

  return (
    <div>
      <Link to="/painel/eventos" className="inline-flex items-center gap-1 font-dm text-sm text-roxo hover:text-roxo-dark mb-4">
        <ArrowLeft className="w-4 h-4" /> voltar
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="min-w-0">
          <h2 className="font-playfair text-2xl text-texto-principal truncate">{e.nome}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <code className="font-mono text-xs text-texto-secundario bg-roxo/5 px-2 py-1 rounded">{origin}/eventos/{e.slug}</code>
            <a href={`/eventos/${e.slug}`} target="_blank" rel="noopener noreferrer"
              className="font-dm text-xs text-roxo hover:text-roxo-dark inline-flex items-center gap-1">
              abrir <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link to={`/painel/eventos/${id}/inscricoes`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-roxo/10 text-roxo font-dm text-sm font-medium hover:bg-roxo/20 transition-all">
            <Users className="w-4 h-4" /> Inscrições
          </Link>
          <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-roxo text-white font-dm text-sm font-medium hover:bg-roxo-dark transition-all shadow-md shadow-roxo/20 disabled:opacity-40">
            {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Salvar</>}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <Section titulo="Básico">
          <Grid>
            <Field label="Nome *" col={2}><input value={state.nome ?? ''} onChange={ev => set('nome', ev.target.value)} className="input" /></Field>
            <Field label="Subtítulo" col={2}><input value={state.subtitulo ?? ''} onChange={ev => set('subtitulo', ev.target.value)} className="input" /></Field>
            <Field label="Slug *" col={1}><input value={state.slug ?? ''} onChange={ev => set('slug', ev.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className="input font-mono" /></Field>
            <Field label="Status" col={1}>
              <select value={state.status ?? 'ativo'} onChange={ev => set('status', ev.target.value as 'ativo' | 'encerrado')} className="input">
                <option value="ativo">Ativo</option>
                <option value="encerrado">Encerrado</option>
              </select>
            </Field>
            <Field label="Descrição" col={2}>
              <textarea rows={6} value={state.descricao ?? ''} onChange={ev => set('descricao', ev.target.value)} className="input resize-none" />
            </Field>
          </Grid>
        </Section>

        <Section titulo="Quando e onde">
          <Grid>
            <Field label="Data" col={1}><input type="date" value={state.data_evento ?? ''} onChange={ev => set('data_evento', ev.target.value)} className="input" /></Field>
            <Field label="Hora" col={1}><input type="time" value={state.hora_evento ?? ''} onChange={ev => set('hora_evento', ev.target.value)} className="input" /></Field>
            <Field label="Local" col={2}><input value={state.local ?? ''} onChange={ev => set('local', ev.target.value)} className="input" /></Field>
            <Field label="URL da imagem de capa" col={2}>
              <input value={state.imagem_capa_url ?? ''} onChange={ev => set('imagem_capa_url', ev.target.value)}
                placeholder="https://... (deixe vazio pra usar o gradiente placeholder)" className="input" />
              {state.imagem_capa_url && (
                <img src={state.imagem_capa_url} alt="prévia" className="mt-2 w-full h-32 object-cover rounded-lg" />
              )}
            </Field>
          </Grid>
        </Section>

        <Section titulo="Participantes e níveis">
          <Grid>
            <Field label="Valor por pessoa (R$)" col={1}>
              <input type="number" step="0.01" value={state.valor_por_pessoa ?? 0}
                onChange={ev => set('valor_por_pessoa', Number(ev.target.value))} className="input" />
            </Field>
            <Field label="Idade isenta (anos ≤)" col={1}>
              <input type="number" value={state.idade_isenta ?? 5}
                onChange={ev => set('idade_isenta', Number(ev.target.value))} className="input" />
            </Field>
            <Field label="Níveis disponíveis (um por linha)" col={2}>
              <textarea rows={4} value={niveisText} onChange={ev => setNiveisText(ev.target.value)}
                placeholder={'Nível 1\nNível 2\n…'} className="input resize-none font-dm text-sm" />
            </Field>
          </Grid>
        </Section>

        <Section titulo="Pagamento (PIX)">
          <Grid>
            <Field label="Chave PIX" col={2}><input value={state.pix_chave ?? ''} onChange={ev => set('pix_chave', ev.target.value)} className="input font-mono" /></Field>
            <Field label="Tipo (E-mail, CPF, Telefone, Aleatória)" col={1}><input value={state.pix_tipo ?? ''} onChange={ev => set('pix_tipo', ev.target.value)} className="input" /></Field>
            <Field label="Vencimento" col={1}><input type="date" value={state.vencimento_pagamento ?? ''} onChange={ev => set('vencimento_pagamento', ev.target.value)} className="input" /></Field>
            <Field label="Titular" col={1}><input value={state.pix_titular ?? ''} onChange={ev => set('pix_titular', ev.target.value)} className="input" /></Field>
            <Field label="Banco" col={1}><input value={state.pix_banco ?? ''} onChange={ev => set('pix_banco', ev.target.value)} className="input" /></Field>
          </Grid>
        </Section>

        <Section titulo="Textos extras">
          <Grid>
            <Field label="Texto de reembolso" col={2}>
              <textarea rows={2} value={state.texto_reembolso ?? ''} onChange={ev => set('texto_reembolso', ev.target.value)} className="input resize-none" />
            </Field>
            <Field label="Pedido de colaboração" col={2}>
              <textarea rows={2} value={state.pedido_colaboracao ?? ''} onChange={ev => set('pedido_colaboracao', ev.target.value)} className="input resize-none" />
            </Field>
          </Grid>
        </Section>

        <Section titulo="Contato / WhatsApp">
          <Grid>
            <Field label="Link do grupo WhatsApp" col={2}>
              <input value={state.whatsapp_grupo ?? ''} onChange={ev => set('whatsapp_grupo', ev.target.value)} placeholder="https://chat.whatsapp.com/..." className="input" />
            </Field>
            <Field label="Nome do responsável financeiro" col={1}>
              <input value={state.nome_responsavel_financeiro ?? ''} onChange={ev => set('nome_responsavel_financeiro', ev.target.value)} className="input" />
            </Field>
            <Field label="WhatsApp (só números com DDI, ex: 5512981446430)" col={1}>
              <input value={state.whatsapp_responsavel_financeiro ?? ''} onChange={ev => set('whatsapp_responsavel_financeiro', ev.target.value.replace(/\D/g, ''))} className="input font-mono" />
            </Field>
          </Grid>
        </Section>

        <div className="flex justify-between items-center pt-4 border-t border-roxo/10">
          <button onClick={() => confirm(`Apagar o evento "${e.nome}" e TODAS as inscrições?`) && delMut.mutate()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rosa/10 text-rosa font-dm text-sm font-medium hover:bg-rosa/20 transition-all">
            <Trash2 className="w-4 h-4" /> Apagar evento
          </button>
          <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-roxo text-white font-dm text-sm font-medium hover:bg-roxo-dark transition-all shadow-md shadow-roxo/20 disabled:opacity-40">
            {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Salvar</>}
          </button>
        </div>
      </div>

      <style>{`
        .input { width: 100%; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; border: 1px solid rgba(123, 47, 190, 0.15); border-radius: 0.75rem; padding: 0.625rem 1rem; outline: none; transition: border-color 0.2s; background: white; }
        .input:focus { border-color: rgba(123, 47, 190, 0.4); }
      `}</style>
    </div>
  );
}

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-roxo/10 p-5">
      <h3 className="font-playfair text-lg text-texto-principal mb-4">{titulo}</h3>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>;
}

function Field({ label, col, children }: { label: string; col: 1 | 2; children: React.ReactNode }) {
  return (
    <div className={col === 2 ? 'md:col-span-2' : ''}>
      <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">{label}</label>
      {children}
    </div>
  );
}
