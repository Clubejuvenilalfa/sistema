import { useState, useMemo, useEffect, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, CheckCircle2, Calendar, Clock, MapPin, Copy, Check, AlertTriangle, Users, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { Evento } from '@/types/db';

type Step = 1 | 2 | 'done';

function formatarData(iso: string | null) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export default function EventoPublico() {
  const { slug } = useParams<{ slug: string }>();

  const q = useQuery({
    queryKey: ['evento_publico', slug],
    queryFn: async () => {
      const { data, error } = await supabase.from('eventos').select('*').eq('slug', slug!).maybeSingle();
      if (error) throw error;
      return (data ?? null) as Evento | null;
    },
    enabled: !!slug,
  });

  if (q.isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-roxo" /></div>;
  }

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

  if (q.data.status === 'encerrado') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-rosa/50 mx-auto mb-3" />
          <h1 className="font-playfair text-2xl text-texto-principal mb-2">Inscrições encerradas</h1>
          <p className="font-dm text-sm text-texto-secundario">O evento <b>{q.data.nome}</b> não aceita mais inscrições.</p>
        </div>
      </div>
    );
  }

  return <EventoFluxo evento={q.data} />;
}

function EventoFluxo({ evento }: { evento: Evento }) {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [nomeAssociada, setNomeAssociada] = useState('');
  const [nivel, setNivel] = useState('');
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const [confirmacao, setConfirmacao] = useState<'sim' | 'nao' | ''>('');
  const [adultos, setAdultos] = useState(0);
  const [criancas, setCriancas] = useState(0);
  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [aceiteFamiliar, setAceiteFamiliar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [pixCopiado, setPixCopiado] = useState(false);

  // rola pro topo sempre que mudar de passo (evita a pessoa achar que não funcionou)
  useEffect(() => {
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { window.scrollTo(0, 0); }
  }, [step]);

  const valorTotal = useMemo(() => adultos * (evento.valor_por_pessoa ?? 0), [adultos, evento.valor_por_pessoa]);
  const vencimentoFmt = formatarData(evento.vencimento_pagamento);
  const dataFmt = formatarData(evento.data_evento);

  function copiarPix() {
    if (!evento.pix_chave) return;
    navigator.clipboard.writeText(evento.pix_chave);
    setPixCopiado(true);
    setTimeout(() => setPixCopiado(false), 2500);
  }

  async function avancarStep1(e: FormEvent) {
    e.preventDefault();
    if (confirmacao === 'nao') {
      // Enviar imediatamente
      setEnviando(true);
      const { error } = await supabase.rpc('inscrever_evento', {
        _slug: evento.slug,
        _email: email,
        _nome_associada: nomeAssociada,
        _nivel: nivel,
        _nome_responsavel: nomeResponsavel,
        _confirmacao: 'nao',
        _adultos: 0,
        _criancas: 0,
      });
      setEnviando(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      setStep('done');
      return;
    }
    setStep(2);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (adultos < 1) {
      toast.error('Informe quantas pessoas vão (pelo menos 1 adulto).');
      return;
    }
    if (!aceiteFamiliar) {
      toast.error('Você precisa confirmar que o convite é para o núcleo familiar.');
      return;
    }
    if (!aceiteTermos) {
      toast.error('Você precisa confirmar o aceite dos termos.');
      return;
    }
    setEnviando(true);
    const { error } = await supabase.rpc('inscrever_evento', {
      _slug: evento.slug,
      _email: email,
      _nome_associada: nomeAssociada,
      _nivel: nivel,
      _nome_responsavel: nomeResponsavel,
      _confirmacao: 'sim',
      _adultos: adultos,
      _criancas: criancas,
    });
    setEnviando(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setStep('done');
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
            <p className="font-dm text-xs uppercase tracking-widest text-white/80 mb-2">Clube Juvenil Alfa</p>
            <h1 className="font-playfair text-4xl md:text-5xl text-white font-bold mb-1">{evento.nome}</h1>
            {evento.subtitulo && <p className="font-dm text-white/90 text-sm md:text-base">{evento.subtitulo}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-5 -mt-10 relative z-10">
        {/* Card infos */}
        <div className="bg-white rounded-2xl shadow-xl shadow-roxo/10 p-5 mb-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <Info icon={Calendar} label="Data" value={dataFmt || '—'} />
            <Info icon={Clock} label="Horário" value={
              evento.hora_evento && evento.hora_encerramento
                ? `${evento.hora_evento.slice(0, 5)} às ${evento.hora_encerramento.slice(0, 5)}`
                : evento.hora_evento?.slice(0, 5) || '—'
            } />
            <Info icon={MapPin} label="Local" value={evento.local || '—'} />
          </div>
        </div>

        {step === 1 && evento.descricao && (
          <div className="bg-white rounded-2xl border border-roxo/10 p-5 mb-5">
            <p className="font-dm text-sm text-texto-secundario whitespace-pre-wrap leading-relaxed">{evento.descricao}</p>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={avancarStep1} className="bg-white rounded-2xl border border-roxo/10 p-5 space-y-4">
            <h2 className="font-playfair text-xl text-texto-principal">1. Dados da família</h2>

            <Field label="E-mail *">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input" />
            </Field>
            <Field label="Nome completo da associada *">
              <input required value={nomeAssociada} onChange={e => setNomeAssociada(e.target.value)} className="input" />
            </Field>
            <Field label="Nível *">
              <select required value={nivel} onChange={e => setNivel(e.target.value)} className="input">
                <option value="">— escolha —</option>
                {(evento.niveis ?? []).map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="Nome do(a) responsável principal *">
              <input required value={nomeResponsavel} onChange={e => setNomeResponsavel(e.target.value)} className="input" />
            </Field>

            <div>
              <p className="font-dm text-sm font-medium text-texto-principal mb-2">Confirmação de presença *</p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setConfirmacao('sim')}
                  className={`px-4 py-3 rounded-xl font-dm text-sm font-medium transition-all border-2 ${confirmacao === 'sim' ? 'bg-verde text-white border-verde' : 'bg-white text-texto-secundario border-roxo/15'}`}>
                  ✅ Confirmo presença
                </button>
                <button type="button" onClick={() => setConfirmacao('nao')}
                  className={`px-4 py-3 rounded-xl font-dm text-sm font-medium transition-all border-2 ${confirmacao === 'nao' ? 'bg-rosa text-white border-rosa' : 'bg-white text-texto-secundario border-roxo/15'}`}>
                  Não poderei
                </button>
              </div>
            </div>

            <button type="submit" disabled={!confirmacao || enviando}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-roxo text-white font-dm text-sm font-medium hover:bg-roxo-dark transition-all disabled:opacity-40 mt-2">
              {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmacao === 'nao' ? 'Enviar' : 'Avançar →'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={enviar} className="space-y-5">
            <div className="bg-white rounded-2xl border border-roxo/10 p-5">
              <h2 className="font-playfair text-xl text-texto-principal mb-3">2. Quantas pessoas vão?</h2>
              <p className="font-dm text-xs text-texto-secundario mb-4">
                Crianças de até {evento.idade_isenta} anos <b>não pagam</b>.
              </p>

              <Contador label="Adultos (incluindo a associada e maiores de 5 anos)" icon={Users} value={adultos} onChange={setAdultos} min={0} />
              {adultos < 1 && (
                <p className="mt-2 font-dm text-xs text-rosa flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3" /> Clique no <b>+</b> para informar quantos adultos vão. (Pelo menos 1 associada deve participar.)
                </p>
              )}
              <div className="h-3" />
              <Contador label={`Crianças com até ${evento.idade_isenta} anos (não pagam)`} icon={Heart} value={criancas} onChange={setCriancas} min={0} />

              <div className="mt-5 pt-5 border-t border-roxo/10 flex items-center justify-between">
                <div>
                  <p className="font-dm text-xs text-texto-secundario uppercase tracking-wider">Total</p>
                  <p className="font-dm text-xs text-texto-secundario">{adultos} × R$ {evento.valor_por_pessoa}</p>
                </div>
                <p className="font-playfair text-3xl text-rosa font-bold">
                  R$ {valorTotal.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>

            {/* PIX */}
            {evento.pix_chave && (
              <div className="bg-white rounded-2xl border border-roxo/10 p-5">
                <h3 className="font-playfair text-lg text-texto-principal mb-1">💰 Pagamento via PIX</h3>
                <p className="font-dm text-xs text-texto-secundario mb-4">
                  {vencimentoFmt && <>Vencimento: <b>{vencimentoFmt}</b> · </>}<span className="text-rosa">Sem parcelamento</span>
                </p>

                <div className="bg-roxo-light/40 rounded-xl p-4 mb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-dm text-[10px] text-texto-secundario uppercase tracking-wider">Chave PIX{evento.pix_tipo ? ` (${evento.pix_tipo})` : ''}</p>
                      <p className="font-mono text-sm text-texto-principal mt-0.5 break-all">{evento.pix_chave}</p>
                    </div>
                    <button type="button" onClick={copiarPix}
                      className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-roxo text-white text-xs font-dm font-medium hover:bg-roxo-dark transition-all">
                      {pixCopiado ? <><Check className="w-3 h-3" /> copiado</> : <><Copy className="w-3 h-3" /> copiar</>}
                    </button>
                  </div>
                </div>
                <div className="font-dm text-xs text-texto-secundario space-y-0.5">
                  {evento.pix_titular && <p>Titular: <b>{evento.pix_titular}</b></p>}
                  {evento.pix_banco && <p>Banco: {evento.pix_banco}</p>}
                  <p className="mt-2">Após o pagamento, envie o comprovante{evento.nome_responsavel_financeiro ? ` para ${evento.nome_responsavel_financeiro}` : ''} com o nome da associada e o nível. Na próxima tela terá o botão direto no WhatsApp.</p>
                </div>
              </div>
            )}

            {evento.aviso_vestimenta && (
              <div className="rounded-2xl p-5 text-white"
                style={{ background: 'linear-gradient(135deg, #7B2FBE 0%, #D5006D 100%)' }}>
                <h3 className="font-playfair text-lg mb-2">✨ Vestimenta</h3>
                <p className="font-dm text-sm whitespace-pre-wrap">{evento.aviso_vestimenta}</p>
              </div>
            )}

            {evento.pedido_colaboracao && (
              <div className="bg-verde/5 border border-verde/20 rounded-2xl p-5">
                <h3 className="font-playfair text-lg text-texto-principal mb-2">🍽️ Colaboração</h3>
                <p className="font-dm text-sm text-texto-secundario whitespace-pre-wrap">{evento.pedido_colaboracao}</p>
              </div>
            )}

            <div className="bg-rosa/5 border border-rosa/20 rounded-2xl p-5 space-y-4">
              {evento.texto_reembolso && (
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rosa shrink-0 mt-0.5" />
                  <div>
                    <p className="font-dm text-sm font-medium text-texto-principal mb-1">Importante — sem reembolso</p>
                    <p className="font-dm text-xs text-texto-secundario">{evento.texto_reembolso}</p>
                  </div>
                </div>
              )}

              {evento.aviso_familiar && (
                <label className="flex items-start gap-3 cursor-pointer pt-3 border-t border-rosa/15">
                  <input type="checkbox" checked={aceiteFamiliar} onChange={e => setAceiteFamiliar(e.target.checked)}
                    className="w-5 h-5 rounded accent-rosa mt-0.5 shrink-0" />
                  <span className="font-dm text-sm text-texto-principal">{evento.aviso_familiar}</span>
                </label>
              )}

              <label className="flex items-start gap-3 cursor-pointer pt-3 border-t border-rosa/15">
                <input type="checkbox" checked={aceiteTermos} onChange={e => setAceiteTermos(e.target.checked)}
                  className="w-5 h-5 rounded accent-rosa mt-0.5 shrink-0" />
                <span className="font-dm text-sm text-texto-principal">
                  <b>Confirmo minha participação</b> e me comprometo com o prazo de pagamento{vencimentoFmt ? ` (${vencimentoFmt})` : ''}. Entendo que o valor pago não será reembolsado em caso de ausência.
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="px-5 py-3 rounded-full bg-white border border-roxo/20 text-texto-secundario font-dm text-sm font-medium hover:bg-roxo-light transition-all">
                ← voltar
              </button>
              <button type="submit" disabled={enviando}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-roxo text-white font-dm text-sm font-medium hover:bg-roxo-dark transition-all disabled:opacity-40">
                {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar inscrição'}
              </button>
            </div>
          </form>
        )}

        {step === 'done' && (
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-roxo/5 text-center">
            <div className="w-14 h-14 rounded-full bg-verde/15 text-verde flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="font-playfair text-2xl text-texto-principal mb-2">
              {confirmacao === 'nao' ? 'Resposta recebida 💗' : 'Inscrição recebida! 🌸'}
            </h2>

            {confirmacao === 'nao' ? (
              <>
                <p className="font-dm text-sm text-texto-secundario mb-6">
                  Que pena que vocês não vão poder — vamos sentir falta! Qualquer coisa, fala com a gente.
                </p>
                <Link to="/" className="inline-block text-sm font-dm text-roxo hover:text-roxo-dark">← Página inicial</Link>
              </>
            ) : (
              <>
                <p className="font-dm text-sm text-texto-secundario mb-2">Próximos passos:</p>
                <ol className="font-dm text-sm text-texto-principal text-left max-w-sm mx-auto space-y-1.5 mb-6">
                  <li>1. Faça o PIX de <b>R$ {valorTotal.toFixed(2).replace('.', ',')}</b>{vencimentoFmt ? <> até <b>{vencimentoFmt}</b></> : ''}</li>
                  <li>2. Envie o comprovante{evento.nome_responsavel_financeiro ? ` pra ${evento.nome_responsavel_financeiro}` : ''} pelo WhatsApp</li>
                  {evento.whatsapp_grupo && <li>3. Entre no grupo pra receber a lista do cardápio</li>}
                </ol>

                <div className="space-y-2.5">
                  {evento.whatsapp_responsavel_financeiro && (
                    <a href={`https://wa.me/${evento.whatsapp_responsavel_financeiro}?text=${encodeURIComponent(
                      `Olá ${evento.nome_responsavel_financeiro || ''}! Segue comprovante de pagamento do ${evento.nome}.\n\nAssociada: ${nomeAssociada}\nNível: ${nivel}\nResponsável: ${nomeResponsavel}\nTotal: R$ ${valorTotal.toFixed(2).replace('.', ',')}`
                    )}`} target="_blank" rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#25D366] text-white font-dm text-sm font-medium hover:brightness-95 transition-all">
                      <WhatsIcon /> Enviar comprovante{evento.nome_responsavel_financeiro ? ` pra ${evento.nome_responsavel_financeiro}` : ''}
                    </a>
                  )}
                  {evento.whatsapp_grupo && (
                    <a href={evento.whatsapp_grupo} target="_blank" rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white border-2 border-[#25D366] text-[#25D366] font-dm text-sm font-medium hover:bg-[#25D366]/5 transition-all">
                      <WhatsIcon /> Entrar no grupo do WhatsApp
                    </a>
                  )}
                </div>

                <Link to="/" className="inline-block mt-6 text-sm font-dm text-texto-secundario hover:text-roxo">← Página inicial</Link>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        .input { width: 100%; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; border: 1px solid rgba(123, 47, 190, 0.15); border-radius: 0.75rem; padding: 0.625rem 1rem; outline: none; transition: border-color 0.2s; background: white; }
        .input:focus { border-color: rgba(123, 47, 190, 0.4); }
      `}</style>
    </div>
  );
}

function WhatsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
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

function Info({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div>
      <Icon className="w-4 h-4 text-roxo mx-auto mb-1" />
      <p className="font-dm text-[10px] text-texto-secundario uppercase tracking-wider">{label}</p>
      <p className="font-dm text-sm font-medium text-texto-principal">{value}</p>
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
          className="w-9 h-9 rounded-full bg-roxo/10 text-roxo font-bold hover:bg-roxo/20 transition-all">−</button>
        <span className="font-dm text-lg font-bold text-texto-principal w-8 text-center">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}
          className="w-9 h-9 rounded-full bg-roxo text-white font-bold hover:bg-roxo-dark transition-all">+</button>
      </div>
    </div>
  );
}
