import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, CheckCircle2, X, Phone, Mail, Calendar, Clock, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { InscricaoPendente } from '@/types/db';

export default function ListaEspera() {
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ['inscricoes_pendentes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inscricoes_pendentes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as InscricaoPendente[];
    },
  });

  const aprovarMut = useMutation({
    mutationFn: async (ins: InscricaoPendente) => {
      // 1. Cria família
      const { data: familia, error: errFam } = await supabase
        .from('familias')
        .insert({
          responsavel: ins.nome_responsavel,
          telefone: ins.telefone,
          email: ins.email,
          observacoes: ins.observacoes,
        })
        .select()
        .single();
      if (errFam) throw errFam;

      // 2. Cria menina vinculada
      const { error: errMen } = await supabase.from('meninas').insert({
        nome: ins.nome_menina,
        data_nasc: ins.data_nasc_menina,
        familia_id: familia.id,
      });
      if (errMen) throw errMen;

      // 3. Apaga a inscrição pendente
      const { error: errDel } = await supabase
        .from('inscricoes_pendentes')
        .delete()
        .eq('id', ins.id);
      if (errDel) throw errDel;
    },
    onSuccess: () => {
      toast.success('Inscrição aprovada e cadastrada');
      qc.invalidateQueries({ queryKey: ['inscricoes_pendentes'] });
      qc.invalidateQueries({ queryKey: ['meninas'] });
      qc.invalidateQueries({ queryKey: ['familias'] });
      qc.invalidateQueries({ queryKey: ['count'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rejeitarMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('inscricoes_pendentes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Inscrição removida');
      qc.invalidateQueries({ queryKey: ['inscricoes_pendentes'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function aprovar(ins: InscricaoPendente) {
    if (!confirm(`Aprovar ${ins.nome_menina}? Vou criar o cadastro de família e menina automaticamente.`)) return;
    aprovarMut.mutate(ins);
  }
  function rejeitar(ins: InscricaoPendente) {
    if (!confirm(`Remover a inscrição de ${ins.nome_menina}?`)) return;
    rejeitarMut.mutate(ins.id);
  }

  return (
    <div>
      <h2 className="font-playfair text-2xl text-texto-principal mb-1">Lista de espera 💌</h2>
      <p className="font-dm text-sm text-texto-secundario mb-6">
        Famílias que se cadastraram pelo site. Aprove para criar o cadastro automaticamente, ou remova.
      </p>

      {q.isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-roxo" />
        </div>
      ) : q.data && q.data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-roxo/10 p-10 text-center">
          <Inbox className="w-10 h-10 text-roxo/30 mx-auto mb-3" />
          <p className="font-dm text-sm text-texto-secundario">
            Nenhuma inscrição pendente.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {q.data?.map(ins => (
            <div key={ins.id} className="bg-white rounded-2xl border border-roxo/10 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-playfair text-lg text-texto-principal">{ins.nome_menina}</h3>
                  <p className="font-dm text-sm text-texto-secundario">Responsável: <b>{ins.nome_responsavel}</b></p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => aprovar(ins)}
                    disabled={aprovarMut.isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-verde/15 text-verde font-dm text-xs font-medium hover:bg-verde/25 transition-all disabled:opacity-40"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                  </button>
                  <button
                    onClick={() => rejeitar(ins)}
                    disabled={rejeitarMut.isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rosa/10 text-rosa font-dm text-xs font-medium hover:bg-rosa/20 transition-all disabled:opacity-40"
                  >
                    <X className="w-3.5 h-3.5" /> Remover
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-2 text-sm font-dm text-texto-secundario">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-roxo/60" /> {ins.telefone}
                </div>
                {ins.email && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-roxo/60 shrink-0" /> {ins.email}
                  </div>
                )}
                {ins.data_nasc_menina && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-roxo/60" />
                    nasc. {new Date(ins.data_nasc_menina).toLocaleDateString('pt-BR')}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-roxo/60" />
                  {new Date(ins.created_at).toLocaleDateString('pt-BR')} às {new Date(ins.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {ins.observacoes && (
                <p className="font-dm text-xs text-texto-secundario italic mt-3 bg-roxo/5 rounded-xl p-2.5">
                  {ins.observacoes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
