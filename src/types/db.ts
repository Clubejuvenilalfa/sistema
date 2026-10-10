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
