import type { CampoFormulario } from '@/types/db';

type Value = string | string[] | boolean;

export default function CampoRender({
  campo,
  value,
  onChange,
}: {
  campo: CampoFormulario;
  value: Value | undefined;
  onChange: (v: Value) => void;
}) {
  const baseCls = 'w-full font-dm text-sm border border-rosa/20 rounded-xl px-4 py-2.5 focus:outline-none focus:border-rosa bg-white';

  const label = (
    <label className="font-dm text-sm font-medium text-texto-principal mb-1.5 block">
      {campo.label}
      {campo.obrigatorio && <span className="text-rosa ml-1">*</span>}
    </label>
  );

  switch (campo.tipo) {
    case 'texto':
      return (
        <div>
          {label}
          <input
            type="text"
            value={(value as string) ?? ''}
            onChange={e => onChange(e.target.value)}
            required={campo.obrigatorio}
            placeholder={campo.placeholder}
            className={baseCls}
          />
        </div>
      );
    case 'texto-longo':
      return (
        <div>
          {label}
          <textarea
            value={(value as string) ?? ''}
            onChange={e => onChange(e.target.value)}
            required={campo.obrigatorio}
            placeholder={campo.placeholder}
            rows={4}
            className={baseCls + ' resize-none'}
          />
        </div>
      );
    case 'email':
      return (
        <div>
          {label}
          <input
            type="email"
            value={(value as string) ?? ''}
            onChange={e => onChange(e.target.value)}
            required={campo.obrigatorio}
            placeholder={campo.placeholder}
            className={baseCls}
          />
        </div>
      );
    case 'telefone':
      return (
        <div>
          {label}
          <input
            type="tel"
            value={(value as string) ?? ''}
            onChange={e => onChange(e.target.value)}
            required={campo.obrigatorio}
            placeholder={campo.placeholder || '(00) 00000-0000'}
            className={baseCls}
          />
        </div>
      );
    case 'data':
      return (
        <div>
          {label}
          <input
            type="date"
            value={(value as string) ?? ''}
            onChange={e => onChange(e.target.value)}
            required={campo.obrigatorio}
            className={baseCls}
          />
        </div>
      );
    case 'select':
      return (
        <div>
          {label}
          <select
            value={(value as string) ?? ''}
            onChange={e => onChange(e.target.value)}
            required={campo.obrigatorio}
            className={baseCls}
          >
            <option value="">— escolha —</option>
            {(campo.opcoes ?? []).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    case 'checkbox': {
      const vals = (value as string[]) ?? [];
      return (
        <div>
          {label}
          <div className="space-y-2">
            {(campo.opcoes ?? []).map(opt => {
              const checked = vals.includes(opt);
              return (
                <label key={opt} className="flex items-center gap-2 font-dm text-sm text-texto-principal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={e => {
                      const next = e.target.checked ? [...vals, opt] : vals.filter(v => v !== opt);
                      onChange(next);
                    }}
                    className="w-4 h-4 rounded accent-rosa"
                  />
                  {opt}
                </label>
              );
            })}
          </div>
        </div>
      );
    }
    case 'sim-nao':
      return (
        <div>
          {label}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChange('Sim')}
              className={`flex-1 px-4 py-2.5 rounded-full font-dm text-sm font-medium transition-all ${value === 'Sim' ? 'bg-verde text-white' : 'bg-roxo/5 text-texto-secundario'}`}
            >
              Sim
            </button>
            <button
              type="button"
              onClick={() => onChange('Não')}
              className={`flex-1 px-4 py-2.5 rounded-full font-dm text-sm font-medium transition-all ${value === 'Não' ? 'bg-rosa text-white' : 'bg-roxo/5 text-texto-secundario'}`}
            >
              Não
            </button>
          </div>
        </div>
      );
  }
}
