import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function WaitlistModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    nomeMae: '',
    nomeMenina: '',
    idadeMenina: '',
    whatsapp: '',
    bairro: '',
    indicacao: '',
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const change = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const obs = [
      form.bairro ? `Bairro: ${form.bairro}` : null,
      form.indicacao ? `Como conheceu: ${form.indicacao}` : null,
    ].filter(Boolean).join(' · ');

    const { error } = await supabase.rpc('criar_inscricao', {
      _nome_menina: `${form.nomeMenina}${form.idadeMenina ? ` (${form.idadeMenina} anos)` : ''}`,
      _data_nasc_menina: null,
      _nome_responsavel: form.nomeMae,
      _telefone: form.whatsapp,
      _email: '',
      _observacoes: obs,
    });
    setSaving(false);
    if (error) {
      toast.error('Erro ao enviar — tente novamente');
      return;
    }
    setDone(true);
  };

  const inputCls = "w-full rounded-full border-[1.5px] border-rosa/20 h-11 px-5 font-dm text-sm focus:outline-none focus:border-rosa";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-[24px] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-6 pb-0">
            <div>
              <h2 className="font-playfair text-2xl text-texto-principal">Lista de espera</h2>
              <p className="font-dm text-sm text-texto-secundario mt-1">Clube Juvenil Alfa · SJC</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-rosa-light rounded-full transition-colors">
              <X className="w-5 h-5 text-texto-secundario" />
            </button>
          </div>

          <div className="p-6">
            {done ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-verde mx-auto mb-4" />
                <h3 className="font-playfair text-2xl text-texto-principal mb-2">Inscrição realizada! 🌸</h3>
                <p className="font-dm text-texto-secundario">Entraremos em contato pelo WhatsApp em breve.</p>
                <button onClick={onClose} className="mt-6 px-8 py-3 rounded-full bg-rosa text-white font-dm font-medium">
                  Fechar
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="font-dm text-sm font-medium text-texto-principal mb-1.5 block">Nome da mãe ou responsável</label>
                  <input value={form.nomeMae} onChange={change('nomeMae')} required placeholder="Seu nome completo" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-dm text-sm font-medium text-texto-principal mb-1.5 block">Nome da menina</label>
                    <input value={form.nomeMenina} onChange={change('nomeMenina')} required placeholder="Nome" className={inputCls} />
                  </div>
                  <div>
                    <label className="font-dm text-sm font-medium text-texto-principal mb-1.5 block">Idade</label>
                    <input type="number" min="8" max="16" value={form.idadeMenina} onChange={change('idadeMenina')} required placeholder="Ex: 12" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="font-dm text-sm font-medium text-texto-principal mb-1.5 block">WhatsApp com DDD</label>
                  <input value={form.whatsapp} onChange={change('whatsapp')} required placeholder="(12) 99999-9999" className={inputCls} />
                </div>
                <div>
                  <label className="font-dm text-sm font-medium text-texto-principal mb-1.5 block">Bairro ou região de SJC</label>
                  <input value={form.bairro} onChange={change('bairro')} placeholder="Ex: Vila Ema" className={inputCls} />
                </div>
                <div>
                  <label className="font-dm text-sm font-medium text-texto-principal mb-1.5 block">Como conheceu o Clube Alfa?</label>
                  <input value={form.indicacao} onChange={change('indicacao')} placeholder="Ex: amiga, Instagram, indicação..." className={inputCls} />
                </div>
                <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-rosa text-white font-dm font-semibold shadow-xl shadow-rosa/35 hover:bg-rosa-dark transition-all disabled:opacity-60">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Quero entrar na lista</span> <ArrowRight className="w-5 h-5" /></>}
                </button>
                <p className="font-dm text-xs text-texto-secundario/60 text-center">Sem spam. Só entraremos em contato para falar sobre o clube.</p>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
