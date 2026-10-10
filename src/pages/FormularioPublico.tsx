import { useState, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import CampoRender from '@/components/forms/CampoRender';
import type { Formulario } from '@/types/db';

export default function FormularioPublico() {
  const { slug } = useParams<{ slug: string }>();
  const [valores, setValores] = useState<Record<string, string | string[] | boolean>>({});
  const [enviando, setEnviando] = useState(false);
  const [done, setDone] = useState(false);

  const q = useQuery({
    queryKey: ['form_publico', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('formularios')
        .select('*')
        .eq('slug', slug!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Formulario | null;
    },
    enabled: !!slug,
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    const { error } = await supabase.rpc('enviar_resposta', { _slug: slug, _dados: valores });
    setEnviando(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDone(true);
  }

  if (q.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-roxo" />
      </div>
    );
  }

  if (!q.data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <AlertTriangle className="w-10 h-10 text-rosa/50 mx-auto mb-3" />
          <h1 className="font-playfair text-2xl text-texto-principal mb-2">Formulário não encontrado</h1>
          <p className="font-dm text-sm text-texto-secundario mb-4">O link pode estar errado ou o formulário foi removido.</p>
          <Link to="/" className="font-dm text-sm text-roxo hover:text-roxo-dark">← voltar</Link>
        </div>
      </div>
    );
  }

  const form = q.data;

  if (form.status === 'encerrado') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <AlertTriangle className="w-10 h-10 text-rosa/50 mx-auto mb-3" />
          <h1 className="font-playfair text-2xl text-texto-principal mb-2">Formulário encerrado</h1>
          <p className="font-dm text-sm text-texto-secundario">Este formulário não aceita mais respostas.</p>
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
          <h1 className="font-playfair text-2xl text-texto-principal mb-2">Resposta enviada! 🌸</h1>
          <p className="font-dm text-sm text-texto-secundario mb-6">
            Obrigada por preencher. Recebemos sua resposta com sucesso.
          </p>
          <Link to="/" className="inline-block text-sm font-dm text-roxo hover:text-roxo-dark">
            ← Página inicial
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
          <h1 className="font-playfair text-2xl text-texto-principal mb-2">{form.nome}</h1>
          {form.descricao && (
            <p className="font-dm text-sm text-texto-secundario mb-6 whitespace-pre-wrap">{form.descricao}</p>
          )}

          <form onSubmit={submit} className="space-y-4">
            {(form.campos ?? []).map(campo => (
              <CampoRender
                key={campo.id}
                campo={campo}
                value={valores[campo.id]}
                onChange={v => setValores(prev => ({ ...prev, [campo.id]: v }))}
              />
            ))}

            <button
              type="submit"
              disabled={enviando}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-roxo text-white font-dm text-sm font-medium hover:bg-roxo-dark transition-all disabled:opacity-40 mt-4"
            >
              {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar resposta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
