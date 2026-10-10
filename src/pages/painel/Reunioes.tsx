import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, X, Calendar, Clock, Users, FileText, CheckCircle2, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { Reuniao } from '@/types/db';

const STATUS = {
  agendada: { label: 'Agendada', cls: 'bg-roxo/10 text-roxo' },
  realizada: { label: 'Realizada', cls: 'bg-verde/15 text-verde' },
  cancelada: { label: 'Cancelada', cls: 'bg-texto-secundario/15 text-texto-secundario line-through' },
} as const;

type FormState = {
  data: string;
  hora: string;
  titulo: string;
  participantes: string;
  pauta: string;
  ata: string;
  status: 'agendada' | 'realizada' | 'cancelada';
};

const empty: FormState = { data: '', hora: '', titulo: '', participantes: '', pauta: '', ata: '', status: 'agendada' };

export default function Reunioes() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Reuniao | null>(null);
  const [detail, setDetail] = useState<Reuniao | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  const q = useQuery({
    queryKey: ['reunioes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('reunioes').select('*').order('data');
      if (error) throw error;
      return data as Reuniao[];
    },
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        data: form.data,
        hora: form.hora || null,
        titulo: form.titulo.trim(),
        participantes: form.participantes.trim() || null,
        pauta: form.pauta.trim() || null,
        ata: form.ata.trim() || null,
        status: form.status,
      };
      if (editing) {
        const { error } = await supabase.from('reunioes').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('reunioes').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? 'Reunião atualizada' : 'Reunião criada');
      qc.invalidateQueries({ queryKey: ['reunioes'] });
      qc.invalidateQueries({ queryKey: ['count', 'reunioes'] });
      close();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusMut = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'agendada' | 'realizada' | 'cancelada' }) => {
      const { error } = await supabase.from('reunioes').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reunioes'] });
      setDetail(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const ataMut = useMutation({
    mutationFn: async ({ id, ata }: { id: string; ata: string }) => {
      const update: { ata: string; status?: 'realizada' } = { ata };
      if (ata.trim()) update.status = 'realizada';
      const { error } = await supabase.from('reunioes').update(update).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Ata salva');
      qc.invalidateQueries({ queryKey: ['reunioes'] });
      setDetail(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reunioes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Removida');
      qc.invalidateQueries({ queryKey: ['reunioes'] });
      qc.invalidateQueries({ queryKey: ['count', 'reunioes'] });
      setDetail(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openNew() {
    setEditing(null);
    setForm({ ...empty, data: new Date().toISOString().slice(0, 10) });
    setShowForm(true);
  }
  function openEdit(r: Reuniao) {
    setEditing(r);
    setDetail(null);
    setForm({
      data: r.data,
      hora: r.hora ?? '',
      titulo: r.titulo,
      participantes: r.participantes ?? '',
      pauta: r.pauta ?? '',
      ata: r.ata ?? '',
      status: r.status,
    });
    setShowForm(true);
  }
  function close() { setShowForm(false); setEditing(null); setForm(empty); }
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.data || !form.titulo.trim()) return;
    saveMut.mutate();
  }
  function del(r: Reuniao) {
    if (!confirm(`Apagar a reunião "${r.titulo}"?`)) return;
    delMut.mutate(r.id);
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const sorted = [...(q.data ?? [])].sort((a, b) => a.data.localeCompare(b.data));
  const proximas = sorted.filter(r => r.data >= todayStr && r.status !== 'cancelada' && r.status !== 'realizada');
  const passadas = sorted.filter(r => r.data < todayStr || r.status === 'realizada' || r.status === 'cancelada').reverse();

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-playfair text-2xl text-texto-principal mb-1">Reuniões 📋</h2>
          <p className="font-dm text-sm text-texto-secundario">
            Agende as reuniões da equipe e registre as atas de cada uma.
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-roxo text-white font-dm text-sm font-medium hover:bg-roxo-dark transition-all shadow-md shadow-roxo/20"
        >
          <Plus className="w-4 h-4" /> Nova reunião
        </button>
      </div>

      {q.isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-roxo" />
        </div>
      ) : q.data && q.data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-roxo/10 p-10 text-center">
          <Calendar className="w-10 h-10 text-roxo/30 mx-auto mb-3" />
          <p className="font-dm text-sm text-texto-secundario">
            Nenhuma reunião cadastrada ainda. Clique em <b>Nova reunião</b>.
          </p>
        </div>
      ) : (
        <>
          {proximas.length > 0 && (
            <section className="mb-8">
              <h3 className="font-playfair text-lg text-texto-principal mb-3">Próximas</h3>
              <div className="space-y-2">
                {proximas.map(r => <Card key={r.id} r={r} onClick={() => setDetail(r)} />)}
              </div>
            </section>
          )}
          {passadas.length > 0 && (
            <section>
              <h3 className="font-playfair text-lg text-texto-principal mb-3">Histórico</h3>
              <div className="space-y-2">
                {passadas.map(r => <Card key={r.id} r={r} onClick={() => setDetail(r)} />)}
              </div>
            </section>
          )}
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={close}>
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-playfair text-xl text-texto-principal">
                {editing ? 'Editar reunião' : 'Nova reunião'}
              </h3>
              <button onClick={close} className="p-1 hover:bg-roxo-light rounded-full">
                <X className="w-5 h-5 text-texto-secundario" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Data *</label>
                  <input
                    type="date"
                    required
                    value={form.data}
                    onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                    className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-roxo/40"
                  />
                </div>
                <div>
                  <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Hora</label>
                  <input
                    type="time"
                    value={form.hora}
                    onChange={e => setForm(f => ({ ...f, hora: e.target.value }))}
                    className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-roxo/40"
                  />
                </div>
              </div>
              <div>
                <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Assunto *</label>
                <input
                  required
                  value={form.titulo}
                  onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ex: Alinhamento mensal da equipe"
                  className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-4 py-2.5 focus:outline-none focus:border-roxo/40"
                />
              </div>
              <div>
                <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Participantes</label>
                <input
                  value={form.participantes}
                  onChange={e => setForm(f => ({ ...f, participantes: e.target.value }))}
                  placeholder="Ex: Diretoras, preceptoras"
                  className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-4 py-2.5 focus:outline-none focus:border-roxo/40"
                />
              </div>
              <div>
                <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Pauta</label>
                <textarea
                  value={form.pauta}
                  onChange={e => setForm(f => ({ ...f, pauta: e.target.value }))}
                  rows={3}
                  placeholder="O que será discutido..."
                  className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-4 py-2.5 focus:outline-none focus:border-roxo/40 resize-none"
                />
              </div>
              {editing && (
                <div>
                  <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as FormState['status'] }))}
                    className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-roxo/40 bg-white"
                  >
                    <option value="agendada">Agendada</option>
                    <option value="realizada">Realizada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              )}
              <button
                type="submit"
                disabled={saveMut.isPending || !form.data || !form.titulo.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-roxo text-white font-dm text-sm font-medium hover:bg-roxo-dark transition-all disabled:opacity-40"
              >
                {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {detail && (
        <DetailPanel
          r={detail}
          onClose={() => setDetail(null)}
          onEdit={() => openEdit(detail)}
          onDelete={() => del(detail)}
          onMarkStatus={(status) => statusMut.mutate({ id: detail.id, status })}
          onSaveAta={(ata) => ataMut.mutate({ id: detail.id, ata })}
          saving={ataMut.isPending || statusMut.isPending}
        />
      )}
    </div>
  );
}

function Card({ r, onClick }: { r: Reuniao; onClick: () => void }) {
  const st = STATUS[r.status];
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-roxo/10 hover:border-roxo/30 hover:shadow-sm transition-all p-4 flex items-center gap-4"
    >
      <div className="shrink-0 w-14 h-14 rounded-xl bg-roxo/5 flex flex-col items-center justify-center">
        <span className="font-playfair text-lg text-roxo leading-none">{r.data.slice(8, 10)}</span>
        <span className="font-dm text-[10px] text-texto-secundario mt-0.5 uppercase">{mesCurto(r.data)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="font-dm font-medium text-texto-principal truncate">{r.titulo}</h4>
          <span className={`text-[10px] font-dm font-medium px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
        </div>
        <p className="font-dm text-xs text-texto-secundario">
          {formatDate(r.data)}{r.hora ? ` · ${r.hora}` : ''}{r.participantes ? ` · ${r.participantes}` : ''}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-texto-secundario/40 shrink-0" />
    </button>
  );
}

function DetailPanel({ r, onClose, onEdit, onDelete, onMarkStatus, onSaveAta, saving }: {
  r: Reuniao;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMarkStatus: (s: 'realizada' | 'cancelada') => void;
  onSaveAta: (ata: string) => void;
  saving: boolean;
}) {
  const [ata, setAta] = useState(r.ata ?? '');
  const st = STATUS[r.status];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-xl p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className={`text-[10px] font-dm font-medium px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
            <h3 className="font-playfair text-xl text-texto-principal mt-1">{r.titulo}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-roxo-light rounded-full">
            <X className="w-5 h-5 text-texto-secundario" />
          </button>
        </div>

        <div className="space-y-2 mb-5 font-dm text-sm">
          <div className="flex items-center gap-2 text-texto-secundario">
            <Calendar className="w-4 h-4 text-roxo/60" /> {formatDate(r.data)}
          </div>
          {r.hora && (
            <div className="flex items-center gap-2 text-texto-secundario">
              <Clock className="w-4 h-4 text-roxo/60" /> {r.hora}
            </div>
          )}
          {r.participantes && (
            <div className="flex items-center gap-2 text-texto-secundario">
              <Users className="w-4 h-4 text-roxo/60" /> {r.participantes}
            </div>
          )}
        </div>

        {r.pauta && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-roxo/60" />
              <h4 className="font-dm text-sm font-medium text-texto-principal">Pauta</h4>
            </div>
            <p className="font-dm text-sm text-texto-secundario whitespace-pre-wrap bg-roxo/5 rounded-xl p-3">{r.pauta}</p>
          </div>
        )}

        <div className="mb-5">
          <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">Ata da reunião</label>
          <textarea
            value={ata}
            onChange={e => setAta(e.target.value)}
            placeholder="Resumo, decisões e próximos passos..."
            rows={5}
            className="w-full font-dm text-sm border border-roxo/15 rounded-xl px-4 py-2.5 focus:outline-none focus:border-roxo/40 resize-none"
          />
          <button
            onClick={() => onSaveAta(ata)}
            disabled={saving || ata === (r.ata ?? '')}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-roxo text-white font-dm text-xs font-medium hover:bg-roxo-dark transition-all disabled:opacity-40"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><CheckCircle2 className="w-3.5 h-3.5" /> Salvar ata</>}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-4 border-t border-roxo/10">
          {r.status !== 'realizada' && (
            <button onClick={() => onMarkStatus('realizada')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-verde/10 text-verde font-dm text-xs font-medium hover:bg-verde/20 transition-all">
              <CheckCircle2 className="w-3.5 h-3.5" /> Marcar como realizada
            </button>
          )}
          {r.status !== 'cancelada' && (
            <button onClick={() => onMarkStatus('cancelada')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-texto-secundario/10 text-texto-secundario font-dm text-xs font-medium hover:bg-texto-secundario/20 transition-all">
              Cancelar
            </button>
          )}
          <button onClick={onEdit} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-roxo/10 text-roxo font-dm text-xs font-medium hover:bg-roxo/20 transition-all">
            <Pencil className="w-3.5 h-3.5" /> Editar
          </button>
          <button onClick={onDelete} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rosa/10 text-rosa font-dm text-xs font-medium hover:bg-rosa/20 transition-all ml-auto">
            <Trash2 className="w-3.5 h-3.5" /> Apagar
          </button>
        </div>
      </div>
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
  const m = parseInt(iso.split('-')[1], 10);
  return meses[m - 1] || '';
}
