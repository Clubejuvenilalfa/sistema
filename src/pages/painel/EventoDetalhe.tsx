import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ArrowLeft, ExternalLink, Save, Trash2, Settings, Users, Heart, DollarSign, Check, Clock, Download, Copy, Send, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import type { Evento, InscricaoEvento } from '@/types/db';

type Tab = 'config' | 'associadas' | 'convidadas' | 'financeiro';

export default function EventoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>('config');

  const q = useQuery({
    queryKey: ['evento', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('eventos').select('*').eq('id', id!).maybeSingle();
      if (error) throw error;
      return (data ?? null) as Evento | null;
    },
    enabled: !!id,
  });

  const inscQ = useQuery({
    queryKey: ['inscricoes_evento', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inscricoes_evento')
        .select('*')
        .eq('evento_id', id!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as InscricaoEvento[];
    },
    enabled: !!id,
  });

  if (q.isLoading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-roxo" /></div>;
  if (!q.data) return <div className="text-center py-16"><p className="font-dm text-sm text-texto-secundario">Evento não encontrado</p></div>;

  const evento = q.data;
  const inscricoes = inscQ.data ?? [];
  const assocCount = inscricoes.filter(i => i.tipo === 'associada').length;
  const convCount = inscricoes.filter(i => i.tipo === 'convidada').length;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'config', label: 'Config', icon: Settings },
    { id: 'associadas', label: 'Inscritas', icon: Users, badge: assocCount },
    { id: 'convidadas', label: 'Convidadas', icon: Heart, badge: convCount },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  ];

  return (
    <div>
      <Link to="/painel/eventos" className="inline-flex items-center gap-1 font-dm text-sm text-roxo hover:text-roxo-dark mb-4">
        <ArrowLeft className="w-4 h-4" /> voltar aos eventos
      </Link>

      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div className="min-w-0">
          <h2 className="font-playfair text-2xl text-texto-principal truncate">{evento.nome}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <code className="font-mono text-xs text-texto-secundario bg-roxo/5 px-2 py-1 rounded">{origin}/eventos/{evento.slug}</code>
            <a href={`/eventos/${evento.slug}`} target="_blank" rel="noopener noreferrer"
              className="font-dm text-xs text-roxo hover:text-roxo-dark inline-flex items-center gap-1">
              associadas <ExternalLink className="w-3 h-3" />
            </a>
            <a href={`/eventos/${evento.slug}/convidadas`} target="_blank" rel="noopener noreferrer"
              className="font-dm text-xs text-rosa hover:text-rosa-dark inline-flex items-center gap-1">
              convidadas <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-5 border-b border-roxo/10 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-3 font-dm text-sm font-medium border-b-2 transition-all whitespace-nowrap',
              tab === t.id ? 'text-roxo border-roxo' : 'text-texto-secundario border-transparent hover:text-roxo/70'
            )}>
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className="text-[10px] font-dm font-bold px-1.5 py-0.5 rounded-full bg-roxo text-white">{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'config' && <ConfigTab evento={evento} />}
      {tab === 'associadas' && <ListaTab evento={evento} inscricoes={inscricoes.filter(i => i.tipo === 'associada')} tipo="associada" />}
      {tab === 'convidadas' && <ListaTab evento={evento} inscricoes={inscricoes.filter(i => i.tipo === 'convidada')} tipo="convidada" />}
      {tab === 'financeiro' && <FinanceiroTab evento={evento} inscricoes={inscricoes.filter(i => i.tipo === 'associada')} />}
    </div>
  );
}

// ========================================================================
// TAB: CONFIG
// ========================================================================
function ConfigTab({ evento }: { evento: Evento }) {
  const qc = useQueryClient();
  const [state, setState] = useState<Partial<Evento>>(evento);
  const [niveisText, setNiveisText] = useState((evento.niveis ?? []).join('\n'));

  useEffect(() => {
    setState(evento);
    setNiveisText((evento.niveis ?? []).join('\n'));
  }, [evento]);

  const saveMut = useMutation({
    mutationFn: async () => {
      const niveis = niveisText.split('\n').map(s => s.trim()).filter(Boolean);
      const { error } = await supabase.from('eventos').update({ ...state, niveis }).eq('id', evento.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Salvo');
      qc.invalidateQueries({ queryKey: ['evento', evento.id] });
      qc.invalidateQueries({ queryKey: ['eventos'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('eventos').delete().eq('id', evento.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Evento apagado'); window.location.href = '/painel/eventos'; },
    onError: (e: Error) => toast.error(e.message),
  });

  function set<K extends keyof Evento>(key: K, value: Evento[K] | null) {
    setState(s => ({ ...s, [key]: value }));
  }

  return (
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
          <Field label="Data" col={2}><input type="date" value={state.data_evento ?? ''} onChange={ev => set('data_evento', ev.target.value)} className="input" /></Field>
          <Field label="Hora de chegada" col={1}><input type="time" value={state.hora_evento ?? ''} onChange={ev => set('hora_evento', ev.target.value)} className="input" /></Field>
          <Field label="Hora de encerramento" col={1}><input type="time" value={state.hora_encerramento ?? ''} onChange={ev => set('hora_encerramento', ev.target.value)} className="input" /></Field>
          <Field label="Local" col={2}><input value={state.local ?? ''} onChange={ev => set('local', ev.target.value)} className="input" /></Field>
          <Field label="URL da imagem de capa" col={2}>
            <input value={state.imagem_capa_url ?? ''} onChange={ev => set('imagem_capa_url', ev.target.value)}
              placeholder="https://... (deixe vazio pra usar gradiente)" className="input" />
            {state.imagem_capa_url && <img src={state.imagem_capa_url} alt="prévia" className="mt-2 w-full h-32 object-cover rounded-lg" />}
          </Field>
        </Grid>
      </Section>

      <Section titulo="Participantes e níveis">
        <Grid>
          <Field label="Valor por pessoa (R$)" col={1}>
            <input type="number" step="0.01" value={state.valor_por_pessoa ?? 0} onChange={ev => set('valor_por_pessoa', Number(ev.target.value))} className="input" />
          </Field>
          <Field label="Idade isenta (anos ≤)" col={1}>
            <input type="number" value={state.idade_isenta ?? 5} onChange={ev => set('idade_isenta', Number(ev.target.value))} className="input" />
          </Field>
          <Field label="Níveis (um por linha)" col={2}>
            <textarea rows={4} value={niveisText} onChange={ev => setNiveisText(ev.target.value)} className="input resize-none" />
          </Field>
        </Grid>
      </Section>

      <Section titulo="Pagamento (PIX)">
        <Grid>
          <Field label="Chave PIX" col={2}><input value={state.pix_chave ?? ''} onChange={ev => set('pix_chave', ev.target.value)} className="input font-mono" /></Field>
          <Field label="Tipo" col={1}><input value={state.pix_tipo ?? ''} onChange={ev => set('pix_tipo', ev.target.value)} placeholder="E-mail, CPF, Telefone, Aleatória" className="input" /></Field>
          <Field label="Vencimento" col={1}><input type="date" value={state.vencimento_pagamento ?? ''} onChange={ev => set('vencimento_pagamento', ev.target.value)} className="input" /></Field>
          <Field label="Titular" col={1}><input value={state.pix_titular ?? ''} onChange={ev => set('pix_titular', ev.target.value)} className="input" /></Field>
          <Field label="Banco" col={1}><input value={state.pix_banco ?? ''} onChange={ev => set('pix_banco', ev.target.value)} className="input" /></Field>
        </Grid>
      </Section>

      <Section titulo="Textos e avisos">
        <Grid>
          <Field label="Aviso de vestimenta (bloco colorido no topo do passo 2)" col={2}>
            <textarea rows={2} value={state.aviso_vestimenta ?? ''} onChange={ev => set('aviso_vestimenta', ev.target.value)} className="input resize-none" />
          </Field>
          <Field label="Pedido de colaboração" col={2}>
            <textarea rows={2} value={state.pedido_colaboracao ?? ''} onChange={ev => set('pedido_colaboracao', ev.target.value)} className="input resize-none" />
          </Field>
          <Field label="Aviso núcleo familiar (checkbox de aceite obrigatório)" col={2}>
            <textarea rows={2} value={state.aviso_familiar ?? ''} onChange={ev => set('aviso_familiar', ev.target.value)} className="input resize-none" />
          </Field>
          <Field label="Texto de reembolso" col={2}>
            <textarea rows={2} value={state.texto_reembolso ?? ''} onChange={ev => set('texto_reembolso', ev.target.value)} className="input resize-none" />
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
          <Field label="WhatsApp (DDI+DDD+número)" col={1}>
            <input value={state.whatsapp_responsavel_financeiro ?? ''} onChange={ev => set('whatsapp_responsavel_financeiro', ev.target.value.replace(/\D/g, ''))} placeholder="5512981446430" className="input font-mono" />
          </Field>
        </Grid>
      </Section>

      <div className="flex justify-between items-center pt-4 border-t border-roxo/10">
        <button onClick={() => confirm(`Apagar "${evento.nome}" e TODAS as inscrições?`) && delMut.mutate()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rosa/10 text-rosa font-dm text-sm font-medium hover:bg-rosa/20">
          <Trash2 className="w-4 h-4" /> Apagar evento
        </button>
        <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-roxo text-white font-dm text-sm font-medium hover:bg-roxo-dark shadow-md shadow-roxo/20 disabled:opacity-40">
          {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Salvar</>}
        </button>
      </div>

      <style>{`.input { width: 100%; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; border: 1px solid rgba(123,47,190,0.15); border-radius: 0.75rem; padding: 0.625rem 1rem; outline: none; background: white; }
        .input:focus { border-color: rgba(123,47,190,0.4); }`}</style>
    </div>
  );
}

// ========================================================================
// TAB: LISTA (associadas ou convidadas)
// ========================================================================
function ListaTab({ evento, inscricoes, tipo }: { evento: Evento; inscricoes: InscricaoEvento[]; tipo: 'associada' | 'convidada' }) {
  const qc = useQueryClient();
  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('inscricoes_evento').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Removida');
      qc.invalidateQueries({ queryKey: ['inscricoes_evento', evento.id] });
    },
  });

  const linkConvidadas = tipo === 'convidada'
    ? `${window.location.origin}/eventos/${evento.slug}/convidadas`
    : null;

  const [linkCopiado, setLinkCopiado] = useState(false);
  function copiarLink() {
    if (!linkConvidadas) return;
    navigator.clipboard.writeText(linkConvidadas);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2500);
  }

  function exportar() {
    const header = tipo === 'associada'
      ? ['Associada', 'Nível', 'Responsável', 'E-mail', 'Confirmação', 'Adultos', 'Crianças ≤5', 'Valor', 'Pagamento', 'Inscrito em']
      : ['Nome', 'E-mail', 'Adultos', 'Crianças ≤5', 'Inscrito em'];
    const linhas = [
      header,
      ...inscricoes.map(i => tipo === 'associada'
        ? [i.nome_associada, i.nivel ?? '', i.nome_responsavel, i.email, i.confirmacao === 'sim' ? 'Confirmado' : 'Não vai', String(i.adultos), String(i.criancas), `R$ ${Number(i.valor_total).toFixed(2)}`, i.pagamento_status, new Date(i.created_at).toLocaleString('pt-BR')]
        : [i.nome_responsavel, i.email, String(i.adultos), String(i.criancas), new Date(i.created_at).toLocaleString('pt-BR')]
      )
    ];
    const csv = linhas.map(l => l.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${evento.slug}-${tipo}s.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {tipo === 'convidada' && linkConvidadas && (
        <div className="bg-rosa/5 border border-rosa/20 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="w-4 h-4 text-rosa" />
            <h4 className="font-dm text-sm font-medium text-texto-principal">Link para convidadas</h4>
          </div>
          <p className="font-dm text-xs text-texto-secundario mb-3">Compartilhe esse link separado com as pessoas convidadas (elas não pagam a taxa).</p>
          <div className="flex items-center gap-2 bg-white rounded-xl p-3">
            <code className="flex-1 font-mono text-xs text-texto-principal truncate">{linkConvidadas}</code>
            <button onClick={copiarLink}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-rosa text-white text-xs font-dm font-medium hover:bg-rosa-dark">
              {linkCopiado ? <><Check className="w-3 h-3" /> copiado</> : <><Copy className="w-3 h-3" /> copiar</>}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3 gap-2">
        <p className="font-dm text-sm text-texto-secundario">
          {inscricoes.length} {tipo === 'associada' ? 'inscrição(ões) de associadas' : 'convidada(s)'}
        </p>
        {inscricoes.length > 0 && (
          <button onClick={exportar} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-verde/15 text-verde font-dm text-xs font-medium hover:bg-verde/25">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        )}
      </div>

      {inscricoes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-roxo/10 p-10 text-center">
          <Users className="w-10 h-10 text-roxo/30 mx-auto mb-3" />
          <p className="font-dm text-sm text-texto-secundario">
            {tipo === 'associada' ? 'Nenhuma associada inscrita ainda.' : 'Nenhuma convidada ainda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {inscricoes.map(i => (
            <div key={i.id} className="bg-white rounded-2xl border border-roxo/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-dm font-medium text-texto-principal">
                      {tipo === 'associada' ? i.nome_associada : i.nome_responsavel}
                    </h4>
                    {tipo === 'associada' && i.nivel && (
                      <span className="text-[10px] font-dm px-2 py-0.5 rounded-full bg-roxo/5 text-roxo">{i.nivel}</span>
                    )}
                    {tipo === 'associada' && (
                      <span className={`text-[10px] font-dm font-medium px-2 py-0.5 rounded-full ${i.confirmacao === 'sim' ? 'bg-verde/15 text-verde' : 'bg-texto-secundario/15 text-texto-secundario'}`}>
                        {i.confirmacao === 'sim' ? '✓ confirmada' : 'não vai'}
                      </span>
                    )}
                  </div>
                  <p className="font-dm text-xs text-texto-secundario">
                    {tipo === 'associada'
                      ? <>Resp.: {i.nome_responsavel} · {i.email}</>
                      : <>{i.email}</>
                    }
                  </p>
                  {i.confirmacao === 'sim' && (i.adultos > 0 || i.criancas > 0) && (
                    <p className="font-dm text-xs text-texto-secundario mt-0.5">
                      {i.adultos} adulto{i.adultos === 1 ? '' : 's'}
                      {i.criancas > 0 && <> + {i.criancas} criança{i.criancas === 1 ? '' : 's'}</>}
                      {tipo === 'associada' && <> · <b className="text-texto-principal">R$ {Number(i.valor_total).toFixed(2).replace('.', ',')}</b></>}
                    </p>
                  )}
                  <p className="font-dm text-[10px] text-texto-secundario/60 mt-1">
                    {new Date(i.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <button onClick={() => confirm('Remover inscrição?') && delMut.mutate(i.id)}
                  className="shrink-0 p-1.5 rounded-full hover:bg-rosa/10 text-rosa">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ========================================================================
// TAB: FINANCEIRO
// ========================================================================
function FinanceiroTab({ evento, inscricoes }: { evento: Evento; inscricoes: InscricaoEvento[] }) {
  const qc = useQueryClient();
  const [filtro, setFiltro] = useState<'pendente' | 'pago' | 'todas'>('pendente');

  const confirmadas = useMemo(() => inscricoes.filter(i => i.confirmacao === 'sim'), [inscricoes]);
  const pagas = useMemo(() => confirmadas.filter(i => i.pagamento_status === 'pago'), [confirmadas]);
  const pendentes = useMemo(() => confirmadas.filter(i => i.pagamento_status === 'pendente'), [confirmadas]);

  const totalEsperado = confirmadas.reduce((s, i) => s + Number(i.valor_total || 0), 0);
  const totalRecebido = pagas.reduce((s, i) => s + Number(i.valor_total || 0), 0);
  const totalFaltando = totalEsperado - totalRecebido;

  const marcarMut = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'pendente' | 'pago' }) => {
      const payload: { pagamento_status: string; pagamento_data: string | null } = {
        pagamento_status: status,
        pagamento_data: status === 'pago' ? new Date().toISOString().slice(0, 10) : null,
      };
      const { error } = await supabase.from('inscricoes_evento').update(payload).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inscricoes_evento', evento.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function cobrar(i: InscricaoEvento) {
    const telefone = evento.whatsapp_responsavel_financeiro ?? '';
    if (!i.email) {
      toast.error('Essa inscrição não tem e-mail nem contato.');
      return;
    }
    // Mensagem padrão de cobrança — mandar pra pessoa inscrita via WhatsApp? Não temos telefone dela. Vamos abrir só o e-mail.
    const subject = `Pagamento pendente — ${evento.nome}`;
    const body = `Olá! Esse é um lembrete sobre o pagamento do ${evento.nome}.\n\nAssociada: ${i.nome_associada}\nValor: R$ ${Number(i.valor_total).toFixed(2).replace('.', ',')}\nVencimento: ${evento.vencimento_pagamento ? new Date(evento.vencimento_pagamento).toLocaleDateString('pt-BR') : 'em breve'}\n\nChave PIX: ${evento.pix_chave ?? '—'}\n\n${telefone ? `Qualquer dúvida, chama no WhatsApp: ${telefone}` : ''}`;
    window.open(`mailto:${i.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  }

  const filtradas = filtro === 'pendente' ? pendentes : filtro === 'pago' ? pagas : confirmadas;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <Stat label="Esperado" value={`R$ ${totalEsperado.toFixed(2).replace('.', ',')}`} sub={`${confirmadas.length} famílias`} color="bg-rosa/10 text-rosa" />
        <Stat label="Recebido" value={`R$ ${totalRecebido.toFixed(2).replace('.', ',')}`} sub={`${pagas.length} pagamento${pagas.length === 1 ? '' : 's'}`} color="bg-verde/15 text-verde" />
        <Stat label="A receber" value={`R$ ${totalFaltando.toFixed(2).replace('.', ',')}`} sub={`${pendentes.length} pendente${pendentes.length === 1 ? '' : 's'}`} color="bg-laranja/15 text-laranja" />
      </div>

      <div className="flex gap-1 bg-white rounded-full p-1 border border-roxo/10 w-fit mb-4">
        {[
          { v: 'pendente', label: `Pendentes (${pendentes.length})` },
          { v: 'pago', label: `Pagas (${pagas.length})` },
          { v: 'todas', label: `Todas (${confirmadas.length})` },
        ].map(f => (
          <button key={f.v} onClick={() => setFiltro(f.v as typeof filtro)}
            className={`px-3 py-1.5 rounded-full font-dm text-xs font-medium transition-all ${filtro === f.v ? 'bg-roxo text-white' : 'text-texto-secundario'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {filtradas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-roxo/10 p-10 text-center">
          <DollarSign className="w-10 h-10 text-roxo/30 mx-auto mb-3" />
          <p className="font-dm text-sm text-texto-secundario">Nada aqui.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtradas.map(i => (
            <div key={i.id} className="bg-white rounded-2xl border border-roxo/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-dm font-medium text-texto-principal">{i.nome_associada}</h4>
                    <span className={`text-[10px] font-dm font-medium px-2 py-0.5 rounded-full ${i.pagamento_status === 'pago' ? 'bg-verde/15 text-verde' : 'bg-laranja/15 text-laranja'}`}>
                      {i.pagamento_status === 'pago' ? '✓ pago' : '⏳ pendente'}
                    </span>
                  </div>
                  <p className="font-dm text-xs text-texto-secundario">
                    Resp.: {i.nome_responsavel} · {i.email}
                  </p>
                  <p className="font-dm text-sm text-texto-principal mt-1">
                    <b>R$ {Number(i.valor_total).toFixed(2).replace('.', ',')}</b>
                    {i.pagamento_status === 'pago' && i.pagamento_data && (
                      <span className="font-dm text-xs text-texto-secundario"> · pago em {new Date(i.pagamento_data).toLocaleDateString('pt-BR')}</span>
                    )}
                  </p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {i.pagamento_status === 'pendente' ? (
                    <>
                      <button onClick={() => marcarMut.mutate({ id: i.id, status: 'pago' })} disabled={marcarMut.isPending}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-verde/15 text-verde font-dm text-xs font-medium hover:bg-verde/25">
                        <Check className="w-3.5 h-3.5" /> Marcar pago
                      </button>
                      <button onClick={() => cobrar(i)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-roxo/10 text-roxo font-dm text-xs font-medium hover:bg-roxo/20">
                        <Send className="w-3.5 h-3.5" /> Cobrar
                      </button>
                    </>
                  ) : (
                    <button onClick={() => marcarMut.mutate({ id: i.id, status: 'pendente' })} disabled={marcarMut.isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-laranja/10 text-laranja font-dm text-xs font-medium hover:bg-laranja/20">
                      <Clock className="w-3.5 h-3.5" /> Voltar pra pendente
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ========================================================================
// Helpers
// ========================================================================
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
function Stat({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-roxo/10 p-4">
      <div className={`inline-block text-[10px] font-dm font-medium px-2 py-0.5 rounded-full mb-2 ${color}`}>{label}</div>
      <p className="font-playfair text-2xl text-texto-principal leading-none">{value}</p>
      {sub && <p className="font-dm text-[10px] text-texto-secundario mt-1">{sub}</p>}
    </div>
  );
}
