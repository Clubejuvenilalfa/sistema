import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ArrowLeft, Download, Check, Clock, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { Evento, InscricaoEvento } from '@/types/db';

export default function EventoInscricoes() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [filtro, setFiltro] = useState<'todas' | 'pendente' | 'pago' | 'isento'>('todas');

  const eventoQ = useQuery({
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

  const marcarMut = useMutation({
    mutationFn: async ({ insId, status }: { insId: string; status: 'pendente' | 'pago' }) => {
      const payload: { pagamento_status: string; pagamento_data?: string | null } = { pagamento_status: status };
      payload.pagamento_data = status === 'pago' ? new Date().toISOString().slice(0, 10) : null;
      const { error } = await supabase.from('inscricoes_evento').update(payload).eq('id', insId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inscricoes_evento', id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: async (insId: string) => {
      const { error } = await supabase.from('inscricoes_evento').delete().eq('id', insId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Inscrição removida');
      qc.invalidateQueries({ queryKey: ['inscricoes_evento', id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (eventoQ.isLoading || inscQ.isLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-roxo" /></div>;
  }
  if (!eventoQ.data) {
    return <div className="text-center py-16"><p className="font-dm text-sm text-texto-secundario">Evento não encontrado</p></div>;
  }

  const evento = eventoQ.data;
  const todas = inscQ.data ?? [];
  const confirmadas = todas.filter(i => i.confirmacao === 'sim');
  const canceladas = todas.filter(i => i.confirmacao === 'nao');
  const pagas = confirmadas.filter(i => i.pagamento_status === 'pago');
  const pendentes = confirmadas.filter(i => i.pagamento_status === 'pendente');

  const totalEsperado = confirmadas.reduce((s, i) => s + Number(i.valor_total || 0), 0);
  const totalRecebido = pagas.reduce((s, i) => s + Number(i.valor_total || 0), 0);
  const totalFaltando = totalEsperado - totalRecebido;

  const filtradas = (() => {
    if (filtro === 'todas') return todas;
    if (filtro === 'pago') return pagas;
    if (filtro === 'pendente') return pendentes;
    if (filtro === 'isento') return canceladas;
    return todas;
  })();

  function exportarCSV() {
    const header = ['Nome associada', 'Nível', 'Responsável', 'E-mail', 'Confirmação', 'Adultos', 'Crianças ≤5', 'Valor', 'Pagamento', 'Data pagamento', 'Inscrito em'];
    const linhas = [header, ...todas.map(i => [
      i.nome_associada, i.nivel ?? '', i.nome_responsavel, i.email,
      i.confirmacao === 'sim' ? 'Confirmado' : 'Não vai',
      String(i.adultos ?? 0), String(i.criancas ?? 0),
      `R$ ${Number(i.valor_total).toFixed(2).replace('.', ',')}`,
      i.pagamento_status, i.pagamento_data ?? '',
      new Date(i.created_at).toLocaleString('pt-BR'),
    ])];
    const csv = linhas.map(l => l.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${evento.slug}-inscricoes.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <Link to="/painel/eventos" className="inline-flex items-center gap-1 font-dm text-sm text-roxo hover:text-roxo-dark mb-4">
        <ArrowLeft className="w-4 h-4" /> voltar
      </Link>

      <div className="mb-6">
        <h2 className="font-playfair text-2xl text-texto-principal mb-1">Inscrições — {evento.nome}</h2>
        <p className="font-dm text-sm text-texto-secundario">{todas.length} inscrição(ões) registrada(s).</p>
      </div>

      {/* Totalizadores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Confirmados" value={confirmadas.length} sub={`${canceladas.length} não vão`} color="bg-roxo/10 text-roxo" />
        <Stat label="Esperado" value={`R$ ${totalEsperado.toFixed(2).replace('.', ',')}`} color="bg-rosa/10 text-rosa" />
        <Stat label="Recebido" value={`R$ ${totalRecebido.toFixed(2).replace('.', ',')}`} sub={`${pagas.length} pagam.`} color="bg-verde/15 text-verde" />
        <Stat label="A receber" value={`R$ ${totalFaltando.toFixed(2).replace('.', ',')}`} sub={`${pendentes.length} pendente(s)`} color="bg-laranja/15 text-laranja" />
      </div>

      {/* Filtros + Export */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="flex gap-1 bg-white rounded-full p-1 border border-roxo/10">
          {[
            { v: 'todas', label: `Todas (${todas.length})` },
            { v: 'pendente', label: `Pendentes (${pendentes.length})` },
            { v: 'pago', label: `Pagas (${pagas.length})` },
            { v: 'isento', label: `Não vão (${canceladas.length})` },
          ].map(f => (
            <button key={f.v} onClick={() => setFiltro(f.v as typeof filtro)}
              className={`px-3 py-1.5 rounded-full font-dm text-xs font-medium transition-all ${filtro === f.v ? 'bg-roxo text-white' : 'text-texto-secundario hover:text-roxo'}`}>
              {f.label}
            </button>
          ))}
        </div>
        {todas.length > 0 && (
          <button onClick={exportarCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-verde/15 text-verde font-dm text-sm font-medium hover:bg-verde/25 transition-all">
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
        )}
      </div>

      {filtradas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-roxo/10 p-10 text-center">
          <Users className="w-10 h-10 text-roxo/30 mx-auto mb-3" />
          <p className="font-dm text-sm text-texto-secundario">Nenhuma inscrição nesse filtro.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtradas.map(i => (
            <div key={i.id} className="bg-white rounded-2xl border border-roxo/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-dm font-medium text-texto-principal">{i.nome_associada}</h4>
                    {i.nivel && <span className="text-[10px] font-dm px-2 py-0.5 rounded-full bg-roxo/5 text-roxo">{i.nivel}</span>}
                    <StatusBadge status={i.confirmacao === 'nao' ? 'isento' : i.pagamento_status} />
                  </div>
                  <p className="font-dm text-xs text-texto-secundario">
                    Resp.: {i.nome_responsavel} · {i.email}
                  </p>
                  {i.confirmacao === 'sim' && (
                    <p className="font-dm text-xs text-texto-secundario mt-0.5">
                      {i.adultos} adulto{i.adultos === 1 ? '' : 's'}
                      {i.criancas > 0 && <> + {i.criancas} criança{i.criancas === 1 ? '' : 's'} ≤{evento.idade_isenta} anos</>}
                      · <b className="text-texto-principal">R$ {Number(i.valor_total).toFixed(2).replace('.', ',')}</b>
                      {i.pagamento_status === 'pago' && i.pagamento_data && (
                        <> · pago em {new Date(i.pagamento_data).toLocaleDateString('pt-BR')}</>
                      )}
                    </p>
                  )}
                  <p className="font-dm text-[10px] text-texto-secundario/60 mt-1">
                    Inscrito em {new Date(i.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {i.confirmacao === 'sim' && i.pagamento_status === 'pendente' && (
                    <button onClick={() => marcarMut.mutate({ insId: i.id, status: 'pago' })} disabled={marcarMut.isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-verde/15 text-verde font-dm text-xs font-medium hover:bg-verde/25 transition-all">
                      <Check className="w-3.5 h-3.5" /> Marcar pago
                    </button>
                  )}
                  {i.confirmacao === 'sim' && i.pagamento_status === 'pago' && (
                    <button onClick={() => marcarMut.mutate({ insId: i.id, status: 'pendente' })} disabled={marcarMut.isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-laranja/10 text-laranja font-dm text-xs font-medium hover:bg-laranja/20 transition-all">
                      <Clock className="w-3.5 h-3.5" /> Volta pra pendente
                    </button>
                  )}
                  <button onClick={() => confirm(`Remover inscrição de ${i.nome_associada}?`) && delMut.mutate(i.id)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-full bg-rosa/10 text-rosa font-dm text-xs font-medium hover:bg-rosa/20 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-roxo/10 p-4">
      <div className={`inline-block text-[10px] font-dm font-medium px-2 py-0.5 rounded-full mb-2 ${color}`}>{label}</div>
      <p className="font-playfair text-2xl text-texto-principal leading-none">{value}</p>
      {sub && <p className="font-dm text-[10px] text-texto-secundario mt-1">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: 'pendente' | 'pago' | 'isento' }) {
  const map = {
    pendente: { label: '⏳ pendente', cls: 'bg-laranja/15 text-laranja' },
    pago: { label: '✓ pago', cls: 'bg-verde/15 text-verde' },
    isento: { label: 'não vai', cls: 'bg-texto-secundario/15 text-texto-secundario' },
  };
  const s = map[status];
  return <span className={`text-[10px] font-dm font-medium px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>;
}
