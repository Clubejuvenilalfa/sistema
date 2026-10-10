import { Construction } from 'lucide-react';

export default function EmBreve({ titulo, descricao }: { titulo: string; descricao?: string }) {
  return (
    <div>
      <h2 className="font-playfair text-2xl text-texto-principal mb-1">{titulo}</h2>
      {descricao && <p className="font-dm text-sm text-texto-secundario mb-6">{descricao}</p>}
      <div className="bg-white rounded-2xl border border-roxo/10 p-12 text-center">
        <Construction className="w-10 h-10 text-roxo/30 mx-auto mb-4" />
        <h3 className="font-playfair text-lg text-texto-principal mb-1">Em breve</h3>
        <p className="font-dm text-sm text-texto-secundario">Essa aba será construída na próxima sessão.</p>
      </div>
    </div>
  );
}
