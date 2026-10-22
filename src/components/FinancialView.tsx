import React, { useState, useMemo } from 'react';
import { DollarSign, CheckCircle2, Clock, Download, Edit3, Calendar } from 'lucide-react';
import { Agendamento, AgendamentoStatus } from '../types/agendamento';
import {
  formatCurrencyBRL,
  formatDateBR,
  formatWhatsApp,
  parsePriceToNumber,
  STATUS_CONFIG,
} from '../utils/formatters';

interface FinancialViewProps {
  agendamentos: Agendamento[];
  onSelectAgendamento: (item: Agendamento) => void;
  onExportExcel: () => void;
}

export const FinancialView: React.FC<FinancialViewProps> = ({
  agendamentos,
  onSelectAgendamento,
  onExportExcel,
}) => {
  const [filter, setFilter] = useState<'all' | AgendamentoStatus>('all');

  const metrics = useMemo(() => {
    let confirmadoReceita = 0;
    let pendenteReceita = 0;
    let totalSinais = 0;
    let saldoReceber = 0;

    agendamentos.forEach((item) => {
      const preco = parsePriceToNumber(item.procedimentoPreco);
      const sinal = item.sinalPago || 0;
      totalSinais += sinal;

      if (item.status === 'confirmado') {
        confirmadoReceita += preco;
        saldoReceber += Math.max(0, preco - sinal);
      } else if (item.status === 'pendente') {
        pendenteReceita += preco;
      }
    });

    return {
      confirmadoReceita,
      pendenteReceita,
      totalSinais,
      saldoReceber,
      totalGeral: confirmadoReceita + pendenteReceita,
      count: agendamentos.length,
    };
  }, [agendamentos]);

  const filtered = useMemo(() => {
    if (filter === 'all') return agendamentos;
    return agendamentos.filter((a) => a.status === filter);
  }, [agendamentos, filter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-800">
        <div>
          <h2 className="text-lg font-bold text-white font-serif-luxury">
            Controle Financeiro de Agendamentos
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Gestão de valores por procedimento, adiantamento de sinais via PIX e saldo a receber no ateliê.
          </p>
        </div>

        <button
          onClick={onExportExcel}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-[#e0a96d] to-[#c28859] rounded hover:brightness-105 transition-all shadow-sm w-fit"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar Balancete Excel</span>
        </button>
      </div>

      {/* 3 Executive Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Confirmado */}
        <div className="p-4 bg-[#141619] border border-neutral-800 rounded-lg">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Faturamento Confirmado</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-400 font-tabular font-mono">
            {formatCurrencyBRL(metrics.confirmadoReceita)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            <span>{formatCurrencyBRL(metrics.totalSinais)} já adiantados em sinais</span>
          </div>
        </div>

        {/* Saldo Restante a Receber */}
        <div className="p-4 bg-[#141619] border border-neutral-800 rounded-lg">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Saldo a Receber no Ateliê</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-amber-300 font-tabular font-mono">
            {formatCurrencyBRL(metrics.saldoReceber)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            <span>A ser recebido no dia dos procedimentos</span>
          </div>
        </div>

        {/* Volume Total Potencial */}
        <div className="p-4 bg-[#141619] border border-neutral-800 rounded-lg">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span>Volume Total da Agenda</span>
            <DollarSign className="w-4 h-4 text-[#e0a96d]" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-white font-tabular font-mono">
            {formatCurrencyBRL(metrics.totalGeral)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            <span>Confirmados + Pendentes de confirmação</span>
          </div>
        </div>
      </div>

      {/* Financial Table */}
      <div className="bg-[#141619] border border-neutral-800 rounded-lg overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-neutral-400 mr-1">Filtrar por:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filter === 'all'
                  ? 'bg-neutral-800 text-white font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Todos ({agendamentos.length})
            </button>
            <button
              onClick={() => setFilter('confirmado')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filter === 'confirmado'
                  ? 'bg-neutral-800 text-emerald-300 font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Confirmados
            </button>
            <button
              onClick={() => setFilter('pendente')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filter === 'pendente'
                  ? 'bg-neutral-800 text-amber-300 font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilter('cancelado')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filter === 'cancelado'
                  ? 'bg-neutral-800 text-rose-300 font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Cancelados
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/50 text-neutral-400 font-medium">
                <th className="py-3 px-4">Data / Horário</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Procedimento</th>
                <th className="py-3 px-4 text-right">Valor Total</th>
                <th className="py-3 px-4 text-right">Sinal Pago</th>
                <th className="py-3 px-4 text-right">Saldo Restante</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filtered.map((item) => {
                const precoNum = parsePriceToNumber(item.procedimentoPreco);
                const sinal = item.sinalPago || 0;
                const saldo = Math.max(0, precoNum - sinal);
                const statusConf = STATUS_CONFIG[item.status] || STATUS_CONFIG.confirmado;

                return (
                  <tr
                    key={item._id}
                    className="hover:bg-neutral-900/40 transition-colors cursor-pointer"
                    onClick={() => onSelectAgendamento(item)}
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{formatDateBR(item.data)}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{item.horario}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{item.nome}</div>
                      <div className="text-[11px] text-neutral-400 font-tabular font-mono">
                        {formatWhatsApp(item.telefone)}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-neutral-300">
                      {item.procedimento}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-white font-tabular font-mono">
                      {item.procedimentoPreco || formatCurrencyBRL(precoNum)}
                    </td>

                    <td className="py-3 px-4 text-right font-semibold text-cyan-400 font-tabular font-mono">
                      {formatCurrencyBRL(sinal)}
                    </td>

                    <td className="py-3 px-4 text-right font-semibold text-amber-300 font-tabular font-mono">
                      {formatCurrencyBRL(saldo)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded border ${statusConf.borderClass} ${statusConf.bgClass} ${statusConf.textClass}`}>
                        {statusConf.label}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectAgendamento(item)}
                        className="flex items-center gap-1 ml-auto px-2 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 rounded hover:border-neutral-700 transition-colors"
                      >
                        <Edit3 className="w-3 h-3 text-[#c28859]" />
                        <span>Editar</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
