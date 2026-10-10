import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, X, Trash2, ArrowLeft, Save, Download, ExternalLink, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { Formulario, RespostaFormulario, CampoFormulario, TipoCampo } from '@/types/db';

const TIPOS: { value: TipoCampo; label: string; hasOpcoes: boolean }[] = [
  { value: 'texto', label: 'Texto curto', hasOpcoes: false },
  { value: 'texto-longo', label: 'Texto longo', hasOpcoes: false },
  { value: 'email', label: 'E-mail', hasOpcoes: false },
  { value: 'telefone', label: 'Telefone', hasOpcoes: false },
  { value: 'data', label: 'Data', hasOpcoes: false },
  { value: 'select', label: 'Lista (escolha 1)', hasOpcoes: true },
  { value: 'checkbox', label: 'Múltipla escolha', hasOpcoes: true },
  { value: 'sim-nao', label: 'Sim / Não', hasOpcoes: false },
];

export default function FormularioDetalhe() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [aba, setAba] = useState<'editar' | 'respostas'>('editar');
  const [campos, setCampos] = useState<CampoFormulario[]>([]);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [slug, setSlug] = useState('');

  const q = useQuery({
    queryKey: ['formulario', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('formularios').select('*').eq('id', id!).maybeSingle();
      if (error) throw error;
      return data as Formulario | null;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (q.data) {
      setCampos(q.data.campos ?? []);
      setNome(q.data.nome);
      setDescricao(q.data.descricao ?? '');
      setSlug(q.data.slug);
    }
  }, [q.data]);

  const respostasQ = useQuery({
    queryKey: ['respostas', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('respostas_formulario')
        .select('*')
        .eq('formulario_id', id!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as RespostaFormulario[];
    },
    enabled: !!id,
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('formularios')
        .update({ nome, descricao, slug, campos })
        .eq('id', id!);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Salvo');
      qc.invalidateQueries({ queryKey: ['formulario', id] });
      qc.invalidateQueries({ queryKey: ['formularios'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delRespMut = useMutation({
    mutationFn: async (rid: string) => {
      const { error } = await supabase.from('respostas_formulario').delete().eq('id', rid);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Resposta removida');
      qc.invalidateQueries({ queryKey: ['respostas', id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function addCampo() {
    setCampos(prev => [
      ...prev,
      { id: crypto.randomUUID(), tipo: 'texto', label: 'Nova pergunta', obrigatorio: false },
    ]);
  }

  function updateCampo(cid: string, patch: Partial<CampoFormulario>) {
    setCampos(prev => prev.map(c => (c.id === cid ? { ...c, ...patch } : c)));
  }

  function removeCampo(cid: string) {
    if (!confirm('Remover esta pergunta?')) return;
    setCampos(prev => prev.filter(c => c.id !== cid));
  }

  function moveCampo(cid: string, dir: -1 | 1) {
    setCampos(prev => {
      const idx = prev.findIndex(c => c.id === cid);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[next]] = [copy[next], copy[idx]];
      return copy;
    });
  }

  function exportarCSV() {
    const respostas = respostasQ.data ?? [];
    const linhas: string[][] = [];
    const header = ['Enviado em', ...campos.map(c => c.label)];
    linhas.push(header);
    for (const r of respostas) {
      const row = [
        new Date(r.created_at).toLocaleString('pt-BR'),
        ...campos.map(c => {
          const v = r.dados[c.id];
          if (Array.isArray(v)) return v.join(' | ');
          if (typeof v === 'boolean') return v ? 'Sim' : 'Não';
          return String(v ?? '');
        }),
      ];
      linhas.push(row);
    }
    const csv = linhas.map(l => l.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}-respostas.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (q.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-roxo" />
      </div>
    );
  }

  if (!q.data) {
    return (
      <div className="text-center py-16">
        <p className="font-dm text-sm text-texto-secundario">Formulário não encontrado.</p>
        <Link to="/painel/formularios" className="font-dm text-sm text-roxo mt-3 inline-block">← voltar</Link>
      </div>
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div>
      <Link to="/painel/formularios" className="inline-flex items-center gap-1 font-dm text-sm text-roxo hover:text-roxo-dark mb-4">
        <ArrowLeft className="w-4 h-4" /> voltar
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="font-playfair text-2xl text-texto-principal truncate">{nome}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <code className="font-mono text-xs text-texto-secundario bg-roxo/5 px-2 py-1 rounded">
              {origin}/f/{slug}
            </code>
            <a href={`/f/${slug}`} target="_blank" rel="noopener noreferrer" className="font-dm text-xs text-roxo hover:text-roxo-dark inline-flex items-center gap-1">
              abrir <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        <button
          onClick={() => saveMut.mutate()}
          disabled={saveMut.isPending}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-roxo text-white font-dm text-sm font-medium hover:bg-roxo-dark transition-all shadow-md shadow-roxo/20 disabled:opacity-40 shrink-0"
        >
          {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Salvar</>}
        </button>
      </div>

      <div className="flex gap-1 mb-6 border-b border-roxo/10">
        <button
          onClick={() => setAba('editar')}
          className={`px-4 py-3 font-dm text-sm font-medium border-b-2 transition-all ${aba === 'editar' ? 'text-roxo border-roxo' : 'text-texto-secundario border-transparent'}`}
        >
          Editar
        </button>
        <button
          onClick={() => setAba('respostas')}
          className={`px-4 py-3 font-dm text-sm font-medium border-b-2 transition-all ${aba === 'respostas' ? 'text-roxo border-roxo' : 'text-texto-secundario border-transparent'}`}
        >
          Respostas ({respostasQ.data?.length ?? 0})
        </button>
      </div>

      {aba === 'editar' && (
        <div className="space-y-4">
          {/* Meta */}
          <div className="bg-white rounded-2xl border border-roxo/10 p-5 space-y-3">
            <div>
              <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Nome</label>
              <input
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-4 py-2.5 focus:outline-none focus:border-roxo/40"
              />
            </div>
            <div>
              <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Slug</label>
              <input
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="w-full font-mono text-sm border border-roxo/15 rounded-xl px-4 py-2.5 focus:outline-none focus:border-roxo/40"
              />
            </div>
            <div>
              <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Descrição</label>
              <textarea
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                rows={4}
                className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-4 py-2.5 focus:outline-none focus:border-roxo/40 resize-none"
              />
            </div>
          </div>

          {/* Campos */}
          <div className="space-y-2">
            {campos.map((c, i) => (
              <CampoEditor
                key={c.id}
                c={c}
                i={i}
                total={campos.length}
                onUpdate={patch => updateCampo(c.id, patch)}
                onRemove={() => removeCampo(c.id)}
                onMove={dir => moveCampo(c.id, dir)}
              />
            ))}
          </div>

          <button
            onClick={addCampo}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-roxo/30 text-roxo font-dm text-sm font-medium hover:bg-roxo/5 transition-all"
          >
            <Plus className="w-4 h-4" /> Adicionar pergunta
          </button>
        </div>
      )}

      {aba === 'respostas' && (
        <div>
          {respostasQ.isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-roxo" />
            </div>
          ) : (respostasQ.data?.length ?? 0) === 0 ? (
            <div className="bg-white rounded-2xl border border-roxo/10 p-10 text-center">
              <p className="font-dm text-sm text-texto-secundario">Nenhuma resposta ainda. Compartilhe o link!</p>
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-3">
                <button
                  onClick={exportarCSV}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-verde/15 text-verde font-dm text-sm font-medium hover:bg-verde/25 transition-all"
                >
                  <Download className="w-4 h-4" /> Exportar CSV
                </button>
              </div>
              <div className="space-y-2">
                {respostasQ.data?.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl border border-roxo/10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-dm text-xs text-texto-secundario">
                        {new Date(r.created_at).toLocaleString('pt-BR')}
                      </p>
                      <button
                        onClick={() => confirm('Apagar esta resposta?') && delRespMut.mutate(r.id)}
                        className="p-1.5 rounded-full hover:bg-rosa/10 text-rosa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <dl className="space-y-1.5">
                      {campos.map(c => {
                        const v = r.dados[c.id];
                        const display = Array.isArray(v) ? v.join(', ') : typeof v === 'boolean' ? (v ? 'Sim' : 'Não') : String(v ?? '—');
                        return (
                          <div key={c.id} className="font-dm text-sm">
                            <dt className="text-texto-secundario text-xs">{c.label}</dt>
                            <dd className="text-texto-principal">{display || '—'}</dd>
                          </div>
                        );
                      })}
                    </dl>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function CampoEditor({
  c, i, total, onUpdate, onRemove, onMove,
}: {
  c: CampoFormulario;
  i: number;
  total: number;
  onUpdate: (patch: Partial<CampoFormulario>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const tipo = TIPOS.find(t => t.value === c.tipo)!;

  return (
    <div className="bg-white rounded-2xl border border-roxo/10 p-4">
      <div className="flex items-start gap-2 mb-3">
        <div className="flex flex-col gap-0.5 shrink-0 mt-1">
          <button onClick={() => onMove(-1)} disabled={i === 0} className="text-texto-secundario/40 hover:text-roxo disabled:opacity-20 text-xs">▲</button>
          <GripVertical className="w-3 h-3 text-texto-secundario/30 mx-auto" />
          <button onClick={() => onMove(1)} disabled={i === total - 1} className="text-texto-secundario/40 hover:text-roxo disabled:opacity-20 text-xs">▼</button>
        </div>
        <div className="flex-1 space-y-2">
          <input
            value={c.label}
            onChange={e => onUpdate({ label: e.target.value })}
            placeholder="Pergunta"
            className="w-full font-dm text-sm font-medium border border-roxo/15 rounded-xl px-3 py-2 focus:outline-none focus:border-roxo/40"
          />
          <div className="flex gap-2 flex-wrap">
            <select
              value={c.tipo}
              onChange={e => onUpdate({ tipo: e.target.value as TipoCampo })}
              className="font-dm text-xs border border-roxo/15 rounded-full px-3 py-1.5 focus:outline-none focus:border-roxo/40 bg-white"
            >
              {TIPOS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <label className="inline-flex items-center gap-1.5 font-dm text-xs text-texto-secundario cursor-pointer">
              <input
                type="checkbox"
                checked={c.obrigatorio}
                onChange={e => onUpdate({ obrigatorio: e.target.checked })}
                className="w-3.5 h-3.5 rounded accent-rosa"
              />
              Obrigatório
            </label>
          </div>
          {tipo.hasOpcoes && (
            <div>
              <label className="font-dm text-[10px] text-texto-secundario mb-1 block uppercase tracking-wider">Opções (uma por linha)</label>
              <textarea
                value={(c.opcoes ?? []).join('\n')}
                onChange={e => onUpdate({ opcoes: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                rows={3}
                placeholder={'Opção 1\nOpção 2\nOpção 3'}
                className="w-full font-dm text-xs border border-roxo/15 rounded-xl px-3 py-2 focus:outline-none focus:border-roxo/40 resize-none"
              />
            </div>
          )}
        </div>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-full hover:bg-rosa/10 text-rosa shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
