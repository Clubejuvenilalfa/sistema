import { useState } from 'react';
import { Heart, Palette, CalendarDays, BookmarkPlus, Film, Copy, Check, Construction } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabId = 'essencia' | 'calendario' | 'referencias' | 'roteiros' | 'identidade';

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'essencia', label: 'Essência', icon: Heart },
  { id: 'calendario', label: 'Calendário', icon: CalendarDays },
  { id: 'referencias', label: 'Referências', icon: BookmarkPlus },
  { id: 'roteiros', label: 'Roteiros', icon: Film },
  { id: 'identidade', label: 'Identidade Visual', icon: Palette },
];

export default function Marketing() {
  const [tab, setTab] = useState<TabId>('essencia');

  return (
    <div>
      <h2 className="font-playfair text-2xl text-texto-principal mb-1">Marketing 📢</h2>
      <p className="font-dm text-sm text-texto-secundario mb-5">
        Planejamento de conteúdo, referências, identidade visual.
      </p>

      <div className="flex gap-1 mb-6 border-b border-roxo/10 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-3 font-dm text-sm font-medium border-b-2 transition-all whitespace-nowrap',
              tab === t.id
                ? 'text-roxo border-roxo'
                : 'text-texto-secundario border-transparent hover:text-roxo/70',
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'essencia' && <Essencia />}
      {tab === 'identidade' && <Identidade />}
      {(tab === 'calendario' || tab === 'referencias' || tab === 'roteiros') && (
        <div className="bg-white rounded-2xl border border-roxo/10 p-10 text-center">
          <Construction className="w-10 h-10 text-roxo/30 mx-auto mb-3" />
          <p className="font-dm text-sm text-texto-secundario">
            Em breve. Essa aba está sendo redesenhada.
          </p>
        </div>
      )}
    </div>
  );
}

function Essencia() {
  return (
    <div className="space-y-4">
      <Card titulo="Propósito">
        Formar meninas a partir das virtudes — ajudar cada menina a crescer em caráter, amizade e propósito, com uma presença próxima da família.
      </Card>
      <Card titulo="Tom de voz">
        Caloroso, próximo, encorajador. Nunca moralista, nunca severo. Fala com a família, não para ela.
      </Card>
      <Card titulo="O que SEMPRE aparece no conteúdo">
        • Meninas sorrindo em cena<br />
        • Virtude trabalhada de forma concreta (coragem, amizade, serviço…)<br />
        • Pais presentes nos momentos-chave<br />
        • Natureza, movimento, afeto
      </Card>
      <Card titulo="O que NUNCA aparece">
        • Comparação entre meninas<br />
        • Tom de advertência / julgamento<br />
        • Linguagem religiosa pesada sem contexto<br />
        • Fotos que exponham as meninas sem permissão
      </Card>
    </div>
  );
}

function Card({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-roxo/10 p-5">
      <h3 className="font-playfair text-lg text-texto-principal mb-2">{titulo}</h3>
      <p className="font-dm text-sm text-texto-secundario leading-relaxed">{children}</p>
    </section>
  );
}

const CORES = [
  { nome: 'Rosa Alfa', hex: '#D5006D', uso: 'Cor principal. Destaques, títulos, botões primários.' },
  { nome: 'Laranja', hex: '#F05A00', uso: 'Energia, realces. Acentos quentes.' },
  { nome: 'Verde', hex: '#8DC63F', uso: 'Esperança, natureza. Confirmações e aniversários.' },
  { nome: 'Roxo', hex: '#7B2FBE', uso: 'Profundidade, sofisticação. Interface do sistema.' },
];

function Identidade() {
  const [copied, setCopied] = useState<string | null>(null);
  function copy(hex: string) {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-playfair text-xl text-texto-principal mb-3 flex items-center gap-2">
          <Palette className="w-5 h-5 text-roxo" /> Paleta de cores
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CORES.map(c => (
            <button
              key={c.hex}
              onClick={() => copy(c.hex)}
              className="bg-white rounded-2xl border border-roxo/10 overflow-hidden hover:shadow-md transition-all text-left"
            >
              <div className="h-20" style={{ backgroundColor: c.hex }} />
              <div className="p-3">
                <p className="font-dm font-medium text-sm text-texto-principal">{c.nome}</p>
                <p className="font-dm text-xs text-texto-secundario mb-1">{c.hex}</p>
                <p className="font-dm text-[10px] text-texto-secundario leading-tight">{c.uso}</p>
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-roxo font-dm">
                  {copied === c.hex ? <><Check className="w-3 h-3" /> copiado</> : <><Copy className="w-3 h-3" /> copiar hex</>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-playfair text-xl text-texto-principal mb-3">Tipografia</h3>
        <div className="bg-white rounded-2xl border border-roxo/10 p-5 space-y-4">
          <div>
            <p className="font-dm text-xs text-texto-secundario mb-1">Playfair Display · títulos e destaques</p>
            <p className="font-playfair text-3xl text-texto-principal">Formando meninas a partir das virtudes.</p>
          </div>
          <div className="border-t border-roxo/10 pt-4">
            <p className="font-dm text-xs text-texto-secundario mb-1">DM Sans · textos corridos</p>
            <p className="font-dm text-base text-texto-principal">O Clube Alfa é um espaço para meninas crescerem em caráter, amizade e propósito.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
