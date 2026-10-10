import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Autocadastro() {
  const [form, setForm] = useState({
    nome_menina: '',
    data_nasc_menina: '',
    nome_responsavel: '',
    telefone: '',
    email: '',
    observacoes: '',
  });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.rpc('criar_inscricao', {
      _nome_menina: form.nome_menina,
      _data_nasc_menina: form.data_nasc_menina || null,
      _nome_responsavel: form.nome_responsavel,
      _telefone: form.telefone,
      _email: form.email,
      _observacoes: form.observacoes,
    });
    setSending(false);
    if (error) {
      toast.error('Erro ao enviar — tente novamente');
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-rosa-light via-white to-roxo-light">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl shadow-roxo/5 text-center">
          <div className="w-14 h-14 rounded-full bg-verde/15 text-verde flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h1 className="font-playfair text-2xl text-texto-principal mb-2">Inscrição recebida!</h1>
          <p className="font-dm text-sm text-texto-secundario mb-6">
            Uma voluntária vai entrar em contato pelo WhatsApp em breve pra conhecer vocês melhor.
          </p>
          <Link to="/" className="inline-block text-sm font-dm text-roxo hover:text-roxo-dark">
            ← voltar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-6 bg-gradient-to-b from-rosa-light via-white to-roxo-light">
      <div className="max-w-lg mx-auto">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-6">
          <div className="grid grid-cols-2 gap-0.5 w-8 h-8">
            <div className="rounded-sm bg-rosa" />
            <div className="rounded-sm bg-verde" />
            <div className="rounded-sm bg-roxo" />
            <div className="rounded-sm bg-laranja" />
          </div>
          <span className="font-playfair font-bold text-lg text-texto-principal">Clube Alfa</span>
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-roxo/5">
          <h1 className="font-playfair text-2xl text-texto-principal mb-1 text-center">Inscreva sua filha</h1>
          <p className="font-dm text-sm text-texto-secundario text-center mb-6">
            Preencha os dados abaixo. Uma voluntária entra em contato pra conhecer vocês.
          </p>

          <form onSubmit={submit} className="space-y-3">
            <Field label="Nome da sua filha *">
              <input
                required
                value={form.nome_menina}
                onChange={e => setForm(f => ({ ...f, nome_menina: e.target.value }))}
                className="input"
              />
            </Field>
            <Field label="Data de nascimento (opcional)">
              <input
                type="date"
                value={form.data_nasc_menina}
                onChange={e => setForm(f => ({ ...f, data_nasc_menina: e.target.value }))}
                className="input"
              />
            </Field>
            <Field label="Seu nome *">
              <input
                required
                value={form.nome_responsavel}
                onChange={e => setForm(f => ({ ...f, nome_responsavel: e.target.value }))}
                className="input"
              />
            </Field>
            <Field label="WhatsApp *">
              <input
                required
                value={form.telefone}
                onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
                placeholder="(00) 00000-0000"
                className="input"
              />
            </Field>
            <Field label="E-mail (opcional)">
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input"
              />
            </Field>
            <Field label="Alguma observação? (opcional)">
              <textarea
                value={form.observacoes}
                onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
                rows={3}
                className="input resize-none"
              />
            </Field>

            <button
              type="submit"
              disabled={sending}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-roxo text-white font-dm text-sm font-medium hover:bg-roxo-dark transition-all disabled:opacity-40"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar inscrição'}
            </button>
          </form>
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
        }
        .input:focus { border-color: rgba(123, 47, 190, 0.4); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-dm text-xs font-medium text-texto-secundario mb-1 block">{label}</label>
      {children}
    </div>
  );
}
