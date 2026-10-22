import React from 'react';
import { Calendar, CheckCircle2, Clock, DollarSign, Sparkles } from 'lucide-react';
import { Agendamento } from '../types/agendamento';
import { formatCurrencyBRL, parsePriceToNumber } from '../utils/formatters';

interface MetricsCardsProps {
  agendamentos: Agendamento[];
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ agendamentos }) => {
  const total = agendamentos.length;

  const confirmados = agendamentos.filter((a) => a.status === 'confirmado');
  const pendentes = agendamentos.filter((a) => a.status === 'pendente');
  const cancelados = agendamentos.filter((a) => a.status === 'cancelado');

  const taxaConfirmacao = total > 0 ? ((confirmados.length / total) * 100).toFixed(1) : '0';

  // Revenue calculations
  let faturamentoConfirmado = 0;
  let faturamentoPendente = 0;
  let totalSinais = 0;

  agendamentos.forEach((item) => {
    const preco = parsePriceToNumber(item.procedimentoPreco);
    const sinal = item.sinalPago || 0;
    totalSinais += sinal;

    if (item.status === 'confirmado') {
      faturamentoConfirmado += preco;
    } else if (item.status === 'pendente') {
      faturamentoPendente += preco;
    }
  });

  const ticketMedio =
    confirmados.length > 0
      ? faturamentoConfirmado / confirmados.length
      : total > 0
      ? (faturamentoConfirmado + faturamentoPendente) / total
      : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      {/* 1. Total Agendamentos */}
      <div className="p-4 bg-[#141619] border border-neutral-800 rounded-lg">
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
          <span>Total Agendamentos</span>
          <Calendar className="w-4 h-4 text-[#c28859]" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-white font-tabular font-mono">
          {total}
        </div>
        <div className="text-[11px] text-neutral-400 mt-1">
          <span>{confirmados.length} confirmados · {pendentes.length} pendentes</span>
        </div>
      </div>

      {/* 2. Taxa de Confirmação */}
      <div className="p-4 bg-[#141619] border border-neutral-800 rounded-lg">
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
          <span>Taxa de Confirmação</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-emerald-400 font-tabular font-mono">
          {taxaConfirmacao}%
        </div>
        <div className="text-[11px] text-neutral-400 mt-1">
          <span>{cancelados.length} cancelamentos registrados</span>
        </div>
      </div>

      {/* 3. Faturamento Confirmado */}
      <div className="p-4 bg-[#141619] border border-neutral-800 rounded-lg">
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
          <span>Faturamento Confirmado</span>
          <DollarSign className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-white font-tabular font-mono">
          {formatCurrencyBRL(faturamentoConfirmado)}
        </div>
        <div className="text-[11px] text-emerald-400/90 font-mono mt-1 font-tabular">
          {formatCurrencyBRL(totalSinais)} em sinais recebidos
        </div>
      </div>

      {/* 4. Valor Pendente */}
      <div className="p-4 bg-[#141619] border border-neutral-800 rounded-lg">
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
          <span>Faturamento Pendente</span>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-amber-300 font-tabular font-mono">
          {formatCurrencyBRL(faturamentoPendente)}
        </div>
        <div className="text-[11px] text-neutral-400 mt-1">
          <span>Aguardando quitação ou sinal</span>
        </div>
      </div>

      {/* 5. Ticket Médio */}
      <div className="p-4 bg-[#141619] border border-neutral-800 rounded-lg col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
          <span>Ticket Médio</span>
          <Sparkles className="w-4 h-4 text-[#e0a96d]" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-[#e0a96d] font-tabular font-mono">
          {formatCurrencyBRL(ticketMedio)}
        </div>
        <div className="text-[11px] text-neutral-400 mt-1">
          <span>Por procedimento agendado</span>
        </div>
      </div>
    </div>
  );
};
