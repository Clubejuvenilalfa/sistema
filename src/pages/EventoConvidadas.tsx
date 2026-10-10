import { useState, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, CheckCircle2, Calendar, Clock, MapPin, AlertTriangle, Users, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { Evento } from '@/types/db';

function formatarData(iso: string | null) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export default function EventoConvidadas() {
  const { slug } = useParams<{ slug: string }>();
  const [nomeConvidado, setNomeConvidado] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [adultos, setAdultos] = useState(1);
  const [criancas, setCriancas] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [done, setDone] = useState(false);

  const q = useQuery({
    queryKey: ['evento_publico', slug],
    queryFn: async () => {
      const { data, error } = await supabase.from('eventos').select('*').eq('slug', slug!).maybeSingle();
      if (error) throw error;
      return (data ?? null) as Evento | null;
    },
    enabled: !!slug,
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    const { error } = await supabase.rpc('inscrever_convidada', {
      _slug: slug,
      _email: email,
      _nome_convidado: nomeConvidado,
      _telefone: telefone,
      _adultos: adultos,
      _criancas: criancas,
      _convidada_por: '',
    });
    setEnviando(false);
    if (error) { toast.error(error.message); return; }
    setDone(true);
  }

  if (q.isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-roxo" /></div>;

  if (!q.data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-rosa/50 mx-auto mb-3" />
          <h1 className="font-playfair text-2xl text-texto-principal mb-2">Evento não encontrado</h1>
          <Link to="/" className="font-dm text-sm text-roxo">← voltar</Link>
        </div>
      </div>
    );
  }

  const evento = q.data;
  if (evento.status === 'encerrado') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-rosa/50 mx-auto mb-3" />
          <h1 className="font-playfair text-2xl text-texto-principal mb-2">Inscrições encerradas</h1>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-rosa-light via-white to-roxo-light">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl shadow-roxo/5 text-center">
          <div className="w-14 h-14 rounded-full bg-verde/15 text-verde flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h1 className="font-playfair text-2xl text-texto-principal mb-2">Inscrição recebida! 🌸</h1>
          <p className="font-dm text-sm text-texto-secundario mb-6">
            Será uma honra ter vocês no <b>{evento.nome}</b>. Qualquer novidade, a {evento.nome_responsavel_financeiro || 'equipe'} entra em contato pelo WhatsApp.
          </p>
          {evento.whatsapp_grupo && (
            <a href={evento.whatsapp_grupo} target="_blank" rel="noopener noreferrer"
              className="inline-block px-5 py-3 rounded-full bg-[#25D366] text-white font-dm text-sm font-medium hover:brightness-95">
              Entrar no grupo do WhatsApp
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rosa-light via-white to-roxo-light pb-16">
      {/* Capa */}
      <div className="relative h-56 md:h-72 overflow-hidden">
        {evento.imagem_capa_url ? (
          <img src={evento.imagem_capa_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #D5006D 0%, #7B2FBE 50%, #F05A00 100%)' }} />
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute bottom-10 right-20 w-40 h-40 rounded-full bg-white/10" />
          </>
        )}
        <div className="absolute inset-0 bg-black/15" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-[10px] font-dm uppercase tracking-widest mb-3">
              Inscrição de Convidada
            </span>
            <h1 className="font-playfair text-3xl md:text-4xl text-white font-bold mb-1">{evento.nome}</h1>
            {evento.subtitulo && <p className="font-dm text-white/90 text-sm">{evento.subtitulo}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-5 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl shadow-roxo/10 p-5 mb-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <Info icon={Calendar} label="Data" value={formatarData(evento.data_evento)} />
            <Info icon={Clock} label="Horário" value={evento.hora_evento?.slice(0, 5) || '—'} />
            <Info icon={MapPin} label="Local" value={evento.local || '—'} />
          </div>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl border border-roxo/10 p-5 space-y-4">
          <Field label="Seu nome completo *">
            <input required value={nomeConvidado} onChange={e => setNomeConvidado(e.target.value)} className="input" />
          </Field>
          <Field label="E-mail *">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input" />
          </Field>
          <Field label="WhatsApp com DDD *">
            <input required value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(00) 00000-0000" className="input" />
          </Field>

          <div className="pt-2 border-t border-roxo/10">
            <h4 className="font-dm text-sm font-medium text-texto-principal mb-3">Quantas pessoas vão?</h4>
            <Contador label={`Adultos e crianças acima de ${evento.idade_isenta} anos`} icon={Users} value={adultos} onChange={setAdultos} min={1} />
            <div className="h-3" />
            <Contador label={`Crianças de até ${evento.idade_isenta} anos`} icon={Heart} value={criancas} onChange={setCriancas} min={0} />
          </div>

          <button type="submit" disabled={enviando}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-roxo text-white font-dm text-sm font-medium hover:bg-roxo-dark disabled:opacity-40 mt-2">
            {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar inscrição'}
          </button>
        </form>
      </div>

      <style>{`.input { width: 100%; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; border: 1px solid rgba(123,47,190,0.15); border-radius: 0.75rem; padding: 0.625rem 1rem; outline: none; background: white; }
        .input:focus { border-color: rgba(123,47,190,0.4); }`}</style>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div>
      <Icon className="w-4 h-4 text-roxo mx-auto mb-1" />
      <p className="font-dm text-[10px] text-texto-secundario uppercase tracking-wider">{label}</p>
      <p className="font-dm text-sm font-medium text-texto-principal">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-dm text-sm font-medium text-texto-principal mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function Contador({ label, icon: Icon, value, onChange, min }: { label: string; icon: React.ComponentType<{ className?: string }>; value: number; onChange: (n: number) => void; min: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Icon className="w-4 h-4 text-roxo shrink-0" />
        <span className="font-dm text-sm text-texto-principal">{label}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
          className="w-9 h-9 rounded-full bg-roxo/10 text-roxo font-bold hover:bg-roxo/20">−</button>
        <span className="font-dm text-lg font-bold text-texto-principal w-8 text-center">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}
          className="w-9 h-9 rounded-full bg-roxo text-white font-bold hover:bg-roxo-dark">+</button>
      </div>
    </div>
  );
}
