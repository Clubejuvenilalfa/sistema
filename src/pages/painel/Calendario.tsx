import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Encontro, Reuniao, FormacaoPais, Menina, Profile } from '@/types/db';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

type DayEvent =
  | { tipo: 'encontro'; titulo: string }
  | { tipo: 'reuniao'; titulo: string }
  | { tipo: 'formacao'; titulo: string }
  | { tipo: 'aniversario'; titulo: string };

const EVENT_STYLE: Record<DayEvent['tipo'], string> = {
  encontro: 'bg-roxo/15 text-roxo',
  reuniao: 'bg-laranja/15 text-laranja',
  formacao: 'bg-verde/15 text-verde',
  aniversario: 'bg-rosa/15 text-rosa',
};

export default function Calendario() {
  const today = new Date();
  const [mes, setMes] = useState(today.getMonth());
  const [ano, setAno] = useState(today.getFullYear());

  const q = useQuery({
    queryKey: ['calendario', ano, mes],
    queryFn: async () => {
      const [enc, reun, form, meninas, vols] = await Promise.all([
        supabase.from('encontros').select('*'),
        supabase.from('reunioes').select('*'),
        supabase.from('formacao_pais').select('*'),
        supabase.from('meninas').select('*').eq('status', 'ativa'),
        supabase.from('profiles').select('*').eq('status', 'ativa'),
      ]);
      return {
        encontros: (enc.data ?? []) as Encontro[],
        reunioes: (reun.data ?? []) as Reuniao[],
        formacao: (form.data ?? []) as FormacaoPais[],
        meninas: (meninas.data ?? []) as Menina[],
        voluntarias: (vols.data ?? []) as Profile[],
      };
    },
  });

  const prevMes = () => (mes === 0 ? (setMes(11), setAno(ano - 1)) : setMes(mes - 1));
  const nextMes = () => (mes === 11 ? (setMes(0), setAno(ano + 1)) : setMes(mes + 1));

  const firstDay = new Date(ano, mes, 1).getDay();
  const daysInMonth = new Date(ano, mes + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  function eventsForDay(day: number): DayEvent[] {
    if (!q.data) return [];
    const dateStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const mm = String(mes + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');

    const events: DayEvent[] = [];
    q.data.encontros.filter(e => e.data === dateStr).forEach(e => events.push({ tipo: 'encontro', titulo: e.tema ?? 'Encontro' }));
    q.data.reunioes.filter(r => r.data === dateStr && r.status !== 'cancelada').forEach(r => events.push({ tipo: 'reuniao', titulo: r.titulo }));
    q.data.formacao.filter(f => f.data === dateStr).forEach(f => events.push({ tipo: 'formacao', titulo: f.tema }));
    q.data.meninas.filter(m => m.data_nasc?.slice(5) === `${mm}-${dd}`).forEach(m => events.push({ tipo: 'aniversario', titulo: `🎂 ${m.nome}` }));
    q.data.voluntarias.filter(v => v.data_nasc?.slice(5) === `${mm}-${dd}`).forEach(v => events.push({ tipo: 'aniversario', titulo: `🎂 ${v.nome}` }));
    return events;
  }

  const isToday = (day: number) =>
    day === today.getDate() && mes === today.getMonth() && ano === today.getFullYear();

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-playfair text-2xl text-texto-principal mb-1">Calendário 🗓️</h2>
          <p className="font-dm text-sm text-texto-secundario">
            Encontros, reuniões, formação dos pais e aniversários.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-roxo/10 p-5">
        {/* Nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMes} className="p-2 hover:bg-roxo-light rounded-full">
            <ChevronLeft className="w-5 h-5 text-roxo" />
          </button>
          <h3 className="font-playfair text-xl text-texto-principal">{MESES[mes]} de {ano}</h3>
          <button onClick={nextMes} className="p-2 hover:bg-roxo-light rounded-full">
            <ChevronRight className="w-5 h-5 text-roxo" />
          </button>
        </div>

        {/* Headings */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DIAS.map(d => (
            <div key={d} className="font-dm text-[11px] text-texto-secundario text-center py-1 uppercase">{d}</div>
          ))}
        </div>

        {q.isLoading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-roxo" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => (
              <div key={i} className="aspect-square">
                {day ? (
                  <div className={`h-full rounded-xl border p-1.5 flex flex-col overflow-hidden ${isToday(day) ? 'border-roxo bg-roxo-light/40' : 'border-roxo/10 hover:border-roxo/20'}`}>
                    <span className={`font-dm text-xs font-medium ${isToday(day) ? 'text-roxo' : 'text-texto-principal'}`}>{day}</span>
                    <div className="flex-1 overflow-hidden mt-0.5 space-y-0.5">
                      {eventsForDay(day).slice(0, 2).map((ev, idx) => (
                        <div key={idx} className={`text-[9px] font-dm px-1 py-0.5 rounded truncate ${EVENT_STYLE[ev.tipo]}`}>
                          {ev.titulo}
                        </div>
                      ))}
                      {eventsForDay(day).length > 2 && (
                        <div className="text-[9px] font-dm text-texto-secundario px-1">
                          +{eventsForDay(day).length - 2}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-roxo/10 text-[11px] font-dm">
          <LegendDot color="bg-roxo" label="Encontro" />
          <LegendDot color="bg-laranja" label="Reunião" />
          <LegendDot color="bg-verde" label="Formação dos pais" />
          <LegendDot color="bg-rosa" label="Aniversário" />
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-texto-secundario">{label}</span>
    </div>
  );
}
