export type Cargo = 'diretora' | 'preceptora' | 'monitora';

export type Profile = {
  id: string;
  nome: string;
  cargo: Cargo;
  telefone: string | null;
  data_nasc: string | null;
  status: 'ativa' | 'inativa';
  created_at: string;
};

export type Familia = {
  id: string;
  responsavel: string;
  telefone: string | null;
  email: string | null;
  observacoes: string | null;
  created_at: string;
};

export type Menina = {
  id: string;
  nome: string;
  data_nasc: string | null;
  familia_id: string | null;
  status: 'ativa' | 'inativa';
  observacoes: string | null;
  created_at: string;
};

export type Encontro = {
  id: string;
  data: string;
  tema: string | null;
  atividades: string | null;
  tipo: 'regular' | 'especial' | 'passeio' | 'retiro';
  observacoes: string | null;
  created_at: string;
};

export type Presenca = {
  id: string;
  encontro_id: string;
  menina_id: string;
  presente: boolean;
  observacao: string | null;
  registered_by: string | null;
  created_at: string;
};

export type Atividade = {
  id: string;
  titulo: string;
  descricao: string | null;
  idade_min: number | null;
  idade_max: number | null;
  virtude: string | null;
  duracao_min: number | null;
  materiais: string | null;
  created_at: string;
};

export type FormacaoPais = {
  id: string;
  data: string;
  hora: string | null;
  tema: string;
  descricao: string | null;
  local: string | null;
  convite_url: string | null;
  created_at: string;
};

export type Reuniao = {
  id: string;
  data: string;
  hora: string | null;
  titulo: string;
  participantes: string | null;
  pauta: string | null;
  ata: string | null;
  status: 'agendada' | 'realizada' | 'cancelada';
  created_by: string | null;
  created_at: string;
};

export type AnotacaoCalendario = {
  id: string;
  data: string;
  tema: string | null;
  texto: string | null;
  created_by: string | null;
  created_at: string;
};

export type TipoCampo = 'texto' | 'texto-longo' | 'email' | 'telefone' | 'data' | 'select' | 'checkbox' | 'sim-nao';

export type CampoFormulario = {
  id: string;
  tipo: TipoCampo;
  label: string;
  obrigatorio: boolean;
  placeholder?: string;
  opcoes?: string[]; // só para select e checkbox
};

export type Formulario = {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  campos: CampoFormulario[];
  status: 'ativo' | 'encerrado';
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type RespostaFormulario = {
  id: string;
  formulario_id: string;
  dados: Record<string, string | string[] | boolean>;
  created_at: string;
};

export type Evento = {
  id: string;
  slug: string;
  nome: string;
  subtitulo: string | null;
  descricao: string | null;
  data_evento: string | null;
  hora_evento: string | null;
  local: string | null;
  imagem_capa_url: string | null;
  valor_por_pessoa: number;
  idade_isenta: number;
  vencimento_pagamento: string | null;
  pix_chave: string | null;
  pix_tipo: string | null;
  pix_titular: string | null;
  pix_banco: string | null;
  texto_reembolso: string | null;
  pedido_colaboracao: string | null;
  whatsapp_grupo: string | null;
  whatsapp_responsavel_financeiro: string | null;
  nome_responsavel_financeiro: string | null;
  niveis: string[];
  status: 'ativo' | 'encerrado';
  created_at: string;
  updated_at: string;
};

export type InscricaoEvento = {
  id: string;
  evento_id: string;
  email: string;
  nome_associada: string;
  nivel: string | null;
  nome_responsavel: string;
  confirmacao: 'sim' | 'nao';
  adultos: number;
  criancas: number;
  valor_total: number;
  pagamento_status: 'pendente' | 'pago' | 'isento';
  pagamento_data: string | null;
  pagamento_observacao: string | null;
  tipo: 'associada' | 'convidada';
  convidada_por: string | null;
  created_at: string;
};

export type InscricaoPendente = {
  id: string;
  nome_menina: string;
  data_nasc_menina: string | null;
  nome_responsavel: string;
  telefone: string;
  email: string | null;
  observacoes: string | null;
  created_at: string;
};
