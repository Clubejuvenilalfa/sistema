import { useState, useMemo, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, CheckCircle2, Calendar, Clock, MapPin, Copy, Check, AlertTriangle, Users, Heart } from 'lucide-react';
import { toast } from 'sonner';

// --- CONFIG (temporariamente aqui; vai migrar pro admin depois) ---
const EVENTO = {
  nome: 'Alfa Stars 2025',
  subtitulo: 'Confraternização das Famílias',
  data: '29/11/2025',
  hora: '17h',
  local: 'Clube Alfa',
  descricao: `O nosso momento mais esperado do ano está chegando! A Confraternização das Famílias é um encontro preparado com muito carinho para celebrarmos, juntos, o desenvolvimento das nossas meninas — com gratidão, alegria e unidade.

A programação terá início com uma meditação conduzida pelo Sacerdote, no oratório.

Pedimos atenção especial quanto ao cuidado com as vestimentas, adequadas ao ambiente e ao espírito do encontro.

⚠️ A participação é restrita à família núcleo (pai, mãe, avós e irmãos não casados).`,
  valorPorPessoa: 30,
  idadeIsenta: 5,
  vencimento: '20/11/2025',
  pix: {
    chave: 'exemplo@mameva.com.br',
    tipo: 'E-mail',
    titular: 'Clube Juvenil Alfa',
    banco: 'Banco Exemplo',
  },
  textoReembolso: 'Caso não possa comparecer após a confirmação, o valor pago não será reembolsado.',
  pedidoColaboracao: 'A lista do cardápio será divulgada no grupo do WhatsApp.',
  whatsappGrupo: 'https://chat.whatsapp.com/JDDKrOJRvRb4nuv5V4Wq4S',
  whatsappClaudia: '5512981446430',
};

const NIVEIS = ['Nível 1', 'Nível 1 e 1/2', 'Nível 2', 'Níveis 3 e 4'];

type Step = 1 | 2 | 'done';

export default function EventoAlfaStars() {
  const [step, setStep] = useState<Step>(1);

  // Dados pessoais
  const [email, setEmail] = useState('');
  const [nomeAluna, setNomeAluna] = useState('');
  const [nivel, setNivel] = useState('');
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const [confirmacao, setConfirmacao] = useState<'sim' | 'nao' | ''>('');

  // Calculadora
  const [adultos, setAdultos] = useState(1); // inclui a associada
  const [criancas, setCriancas] = useState(0); // ≤5 anos, não pagam
  const [aceiteTermos, setAceiteTermos] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [pixCopiado, setPixCopiado] = useState(false);

  const valorTotal = useMemo(() => adultos * EVENTO.valorPorPessoa, [adultos]);

  function copiarPix() {
    navigator.clipboard.writeText(EVENTO.pix.chave);
    setPixCopiado(true);
    setTimeout(() => setPixCopiado(false), 2500);
  }

  function avancarStep1(e: FormEvent) {
    e.preventDefault();
    if (confirmacao === 'nao') {
      setStep('done');
      return;
    }
    setStep(2);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!aceiteTermos) {
      toast.error('Você precisa confirmar o aceite dos termos.');
      return;
    }
    setEnviando(true);
    // TODO: persistir no Supabase quando aprovarem o visual
    await new Promise(r => setTimeout(r, 600));
    setEnviando(false);
    setStep('done');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rosa-light via-white to-roxo-light pb-16">
      {/* Capa */}
      <div className="relative h-56 md:h-72 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #D5006D 0%, #7B2FBE 50%, #F05A00 100%)' }}
        />
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute bottom-10 right-20 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
          <div>
            <p className="font-dm text-xs uppercase tracking-widest text-white/80 mb-2">Clube Juvenil Alfa</p>
            <h1 className="font-playfair text-4xl md:text-5xl text-white font-bold mb-1">{EVENTO.nome}</h1>
            <p className="font-dm text-white/90 text-sm md:text-base">{EVENTO.subtitulo}</p>
          </div>
        </div>
        <div className="absolute top-3 right-3">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-[10px] font-dm uppercase tracking-wider">
            Capa placeholder — editável
          </span>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-5 -mt-10 relative z-10">
        {/* Card de infos */}
        <div className="bg-white rounded-2xl shadow-xl shadow-roxo/10 p-5 mb-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <Info icon={Calendar} label="Data" value={EVENTO.data} />
            <Info icon={Clock} label="Horário" value={EVENTO.hora} />
            <Info icon={MapPin} label="Local" value={EVENTO.local} />
          </div>
        </div>

        {/* Descrição — só aparece na etapa 1 */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-roxo/10 p-5 mb-5">
            <p className="font-dm text-sm text-texto-secundario whitespace-pre-wrap leading-relaxed">
              {EVENTO.descricao}
            </p>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={avancarStep1} className="bg-white rounded-2xl border border-roxo/10 p-5 space-y-4">
            <h2 className="font-playfair text-xl text-texto-principal">1. Dados da família</h2>

            <Field label="E-mail *">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input" />
            </Field>
            <Field label="Nome completo da associada *">
              <input required value={nomeAluna} onChange={e => setNomeAluna(e.target.value)} className="input" />
            </Field>
            <Field label="Nível *">
              <select required value={nivel} onChange={e => setNivel(e.target.value)} className="input">
                <option value="">— escolha —</option>
                {NIVEIS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="Nome do(a) responsável principal *">
              <input required value={nomeResponsavel} onChange={e => setNomeResponsavel(e.target.value)} className="input" />
            </Field>

            <div>
              <p className="font-dm text-sm font-medium text-texto-principal mb-2">Confirmação de presença *</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmacao('sim')}
                  className={`px-4 py-3 rounded-xl font-dm text-sm font-medium transition-all border-2 ${confirmacao === 'sim' ? 'bg-verde text-white border-verde' : 'bg-white text-texto-secundario border-roxo/15'}`}
                >
                  ✅ Confirmo presença
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmacao('nao')}
                  className={`px-4 py-3 rounded-xl font-dm text-sm font-medium transition-all border-2 ${confirmacao === 'nao' ? 'bg-rosa text-white border-rosa' : 'bg-white text-texto-secundario border-roxo/15'}`}
                >
                  Não poderei
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!confirmacao}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-roxo text-white font-dm text-sm font-medium hover:bg-roxo-dark transition-all disabled:opacity-40 mt-2"
            >
              {confirmacao === 'nao' ? 'Enviar' : 'Avançar →'}
            </button>
          </form>
        )}

        {/* STEP 2 — calculadora + pagamento */}
        {step === 2 && (
          <form onSubmit={enviar} className="space-y-5">
            <div className="bg-white rounded-2xl border border-roxo/10 p-5">
              <h2 className="font-playfair text-xl text-texto-principal mb-3">2. Quantas pessoas vão?</h2>
              <p className="font-dm text-xs text-texto-secundario mb-4">
                Crianças de até {EVENTO.idadeIsenta} anos <b>não pagam</b>.
              </p>

              <Contador
                label="Adultos (incluindo a associada e maiores de 5 anos)"
                icon={Users}
                value={adultos}
                onChange={setAdultos}
                min={1}
              />
              <div className="h-3" />
              <Contador
                label={`Crianças com até ${EVENTO.idadeIsenta} anos (não pagam)`}
                icon={Heart}
                value={criancas}
                onChange={setCriancas}
                min={0}
              />

              <div className="mt-5 pt-5 border-t border-roxo/10 flex items-center justify-between">
                <div>
                  <p className="font-dm text-xs text-texto-secundario uppercase tracking-wider">Total</p>
                  <p className="font-dm text-xs text-texto-secundario">{adultos} × R$ {EVENTO.valorPorPessoa}</p>
                </div>
                <p className="font-playfair text-3xl text-rosa font-bold">
                  R$ {valorTotal.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>

            {/* PIX */}
            <div className="bg-white rounded-2xl border border-roxo/10 p-5">
              <h3 className="font-playfair text-lg text-texto-principal mb-1">💰 Pagamento via PIX</h3>
              <p className="font-dm text-xs text-texto-secundario mb-4">
                Vencimento: <b>{EVENTO.vencimento}</b> · <span className="text-rosa">Sem parcelamento</span>
              </p>

              <div className="bg-roxo-light/40 rounded-xl p-4 mb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-dm text-[10px] text-texto-secundario uppercase tracking-wider">Chave PIX ({EVENTO.pix.tipo})</p>
                    <p className="font-mono text-sm text-texto-principal mt-0.5 break-all">{EVENTO.pix.chave}</p>
                  </div>
                  <button
                    type="button"
                    onClick={copiarPix}
                    className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-roxo text-white text-xs font-dm font-medium hover:bg-roxo-dark transition-all"
                  >
                    {pixCopiado ? <><Check className="w-3 h-3" /> copiado</> : <><Copy className="w-3 h-3" /> copiar</>}
                  </button>
                </div>
              </div>
              <div className="font-dm text-xs text-texto-secundario space-y-0.5">
                <p>Titular: <b>{EVENTO.pix.titular}</b></p>
                <p>Banco: {EVENTO.pix.banco}</p>
                <p className="mt-2">Após o pagamento, envie o comprovante para a Cláudia (responsável financeira) com o nome da associada e o nível. Na próxima tela terá o botão direto pra ela no WhatsApp.</p>
              </div>
            </div>

            {/* Pedido colaboração — texto informativo */}
            <div className="bg-verde/5 border border-verde/20 rounded-2xl p-5">
              <h3 className="font-playfair text-lg text-texto-principal mb-2">🍽️ Colaboração pro jantar</h3>
              <p className="font-dm text-sm text-texto-secundario">{EVENTO.pedidoColaboracao}</p>
            </div>

            {/* Aviso + aceite */}
            <div className="bg-rosa/5 border border-rosa/20 rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-rosa shrink-0 mt-0.5" />
                <div>
                  <p className="font-dm text-sm font-medium text-texto-principal mb-1">Importante — sem reembolso</p>
                  <p className="font-dm text-xs text-texto-secundario">{EVENTO.textoReembolso}</p>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aceiteTermos}
                  onChange={e => setAceiteTermos(e.target.checked)}
                  className="w-5 h-5 rounded accent-rosa mt-0.5 shrink-0"
                />
                <span className="font-dm text-sm text-texto-principal">
                  <b>Confirmo minha participação</b> e me comprometo com o prazo de pagamento ({EVENTO.vencimento}).
                  Entendo que o valor pago não será reembolsado em caso de ausência.
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-full bg-white border border-roxo/20 text-texto-secundario font-dm text-sm font-medium hover:bg-roxo-light transition-all"
              >
                ← voltar
              </button>
              <button
                type="submit"
                disabled={enviando || !aceiteTermos}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-roxo text-white font-dm text-sm font-medium hover:bg-roxo-dark transition-all disabled:opacity-40"
              >
                {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar inscrição'}
              </button>
            </div>
          </form>
        )}

        {/* STEP DONE */}
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
                <Link to="/" className="inline-block text-sm font-dm text-roxo hover:text-roxo-dark">
                  ← Página inicial
                </Link>
              </>
            ) : (
              <>
                <p className="font-dm text-sm text-texto-secundario mb-2">
                  Próximos passos:
                </p>
                <ol className="font-dm text-sm text-texto-principal text-left max-w-sm mx-auto space-y-1.5 mb-6">
                  <li>1. Faça o PIX de <b>R$ {valorTotal.toFixed(2).replace('.', ',')}</b> até <b>{EVENTO.vencimento}</b></li>
                  <li>2. Envie o comprovante pra Cláudia pelo WhatsApp</li>
                  <li>3. Entre no grupo pra receber a lista do cardápio</li>
                </ol>

                <div className="space-y-2.5">
                  <a
                    href={`https://wa.me/${EVENTO.whatsappClaudia}?text=${encodeURIComponent(
                      `Olá Cláudia! Segue comprovante de pagamento do Alfa Stars 2025.\n\nAssociada: ${nomeAluna}\nNível: ${nivel}\nResponsável: ${nomeResponsavel}\nTotal: R$ ${valorTotal.toFixed(2).replace('.', ',')}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#25D366] text-white font-dm text-sm font-medium hover:brightness-95 transition-all"
                  >
                    <WhatsIcon /> Enviar comprovante pra Cláudia
                  </a>
                  <a
                    href={EVENTO.whatsappGrupo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white border-2 border-[#25D366] text-[#25D366] font-dm text-sm font-medium hover:bg-[#25D366]/5 transition-all"
                  >
                    <WhatsIcon /> Entrar no grupo do WhatsApp
                  </a>
                </div>

                <Link to="/" className="inline-block mt-6 text-sm font-dm text-texto-secundario hover:text-roxo">
                  ← Página inicial
                </Link>
              </>
            )}
          </div>
        )}

        {/* Aviso de preview */}
        <div className="mt-8 bg-laranja/10 border border-laranja/30 rounded-xl p-4 text-center">
          <p className="font-dm text-xs text-texto-secundario">
            ⚙️ Esta é uma <b>pré-visualização</b>. Dados do PIX, capa, datas e textos ainda serão editáveis via painel admin. As inscrições ainda não estão sendo salvas.
          </p>
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          border: 1px solid rgba(123, 47, 190, 0.15);
          border-radius: 0.75rem;
          padding: 0.625rem 1rem;
          outline: none;
          transition: border-color 0.2s;
          background: white;
        }
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

function Contador({
  label, icon: Icon, value, onChange, min,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  onChange: (n: number) => void;
  min: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Icon className="w-4 h-4 text-roxo shrink-0" />
        <span className="font-dm text-sm text-texto-principal">{label}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-9 h-9 rounded-full bg-roxo/10 text-roxo font-bold hover:bg-roxo/20 transition-all"
        >
          −
        </button>
        <span className="font-dm text-lg font-bold text-texto-principal w-8 text-center">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-9 h-9 rounded-full bg-roxo text-white font-bold hover:bg-roxo-dark transition-all"
        >
          +
        </button>
      </div>
    </div>
  );
}
