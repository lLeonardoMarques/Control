export type AgendamentoStatus = 'confirmado' | 'pendente' | 'cancelado';

export interface Agendamento {
  _id: string;
  nome: string;
  telefone: string;
  procedimento: string;
  procedimentoPreco?: string; // ex: "R$ 380,00" ou "380"
  data: string; // ex: "2026-10-23" ou "23/10/2026"
  horario: string; // ex: "14:30"
  observacoes?: string;
  status: AgendamentoStatus;
  createdAt?: string;
  updatedAt?: string;

  // Campos complementares de controle de caixa da Flávia Marques
  sinalPago?: number;
  formaPagamento?: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'pendente';
  notasInternas?: string;
}

export interface AgendamentoApiResponse {
  success: boolean;
  count: number;
  data: Agendamento[];
}

export interface NovoAgendamentoPayload {
  nome: string;
  telefone: string;
  procedimento: string;
  procedimentoPreco?: string;
  data: string;
  horario: string;
  observacoes?: string;
  status?: AgendamentoStatus;
}
