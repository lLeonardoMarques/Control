import React from 'react';
import {
  TrendingUp,
  PieChart,
  Layers,
  Scissors,
  DollarSign,
  Clock,
  Calendar,
} from 'lucide-react';
import { Agendamento } from '../types/agendamento';
import { formatCurrencyBRL, parsePriceToNumber } from '../utils/formatters';

interface AnalyticsViewProps {
  agendamentos: Agendamento[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ agendamentos }) => {
  const total = agendamentos.length;

  // 1. Procedure Breakdown
  interface ProcedureMetric {
    name: string;
    count: number;
    revenue: number;
  }
  const procMap = new Map<string, ProcedureMetric>();

  agendamentos.forEach((item) => {
    const name = item.procedimento || 'Outro Procedimento';
    const preco = parsePriceToNumber(item.procedimentoPreco);
    const cur = procMap.get(name) || { name, count: 0, revenue: 0 };
    cur.count++;
    if (item.status === 'confirmado') {
      cur.revenue += preco;
    }
    procMap.set(name, cur);
  });

  const topProcedures = Array.from(procMap.values()).sort((a, b) => b.count - a.count);

  // 2. Status Breakdown
  const confirmados = agendamentos.filter((a) => a.status === 'confirmado').length;
  const pendentes = agendamentos.filter((a) => a.status === 'pendente').length;
  const cancelados = agendamentos.filter((a) => a.status === 'cancelado').length;

  // 3. Time Slot Breakdown (Morning vs Afternoon)
  let manhaCount = 0;
  let tardeCount = 0;
  agendamentos.forEach((item) => {
    if (!item.horario) return;
    const hour = parseInt(item.horario.split(':')[0], 10);
    if (!isNaN(hour)) {
      if (hour < 12) manhaCount++;
      else tardeCount++;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-800">
        <div>
          <h2 className="text-lg font-bold text-white font-serif-luxury">
            Análise & Inteligência da Agenda
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Métricas de procedimentos mais procurados, horários de pico e taxa de ocupação da Flávia Marques.
          </p>
        </div>
        <div className="text-xs text-neutral-400">
          Total de agendamentos no banco: <span className="font-semibold text-white font-tabular">{total}</span>
        </div>
      </div>

      {/* Grid: Procedimentos & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Procedimentos Mais Agendados (7 cols) */}
        <div className="lg:col-span-7 p-5 bg-[#141619] border border-neutral-800 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Scissors className="w-4 h-4 text-[#c28859]" />
              <span>Procedimentos Mais Realizados</span>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono">Ranking de Serviços</span>
          </div>

          <div className="space-y-3 pt-1">
            {topProcedures.map((proc) => {
              const pct = total > 0 ? ((proc.count / total) * 100).toFixed(0) : '0';
              return (
                <div key={proc.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-200 truncate max-w-[280px]">
                      {proc.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-mono font-tabular">
                        {formatCurrencyBRL(proc.revenue)}
                      </span>
                      <span className="text-neutral-400 font-mono font-tabular text-[11px]">
                        {proc.count} ({pct}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#c28859] to-[#e0a96d] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status da Agenda & Turnos (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Status Breakdown */}
          <div className="p-5 bg-[#141619] border border-neutral-800 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>Status dos Agendamentos</span>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <div className="p-2.5 bg-neutral-900/60 border border-neutral-800 rounded flex items-center justify-between">
                <span className="text-emerald-400 font-semibold">Confirmados</span>
                <span className="text-white font-mono font-tabular font-bold">
                  {confirmados} ({total > 0 ? ((confirmados / total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="p-2.5 bg-neutral-900/60 border border-neutral-800 rounded flex items-center justify-between">
                <span className="text-amber-400 font-semibold">Pendentes de Confirmação</span>
                <span className="text-white font-mono font-tabular font-bold">
                  {pendentes} ({total > 0 ? ((pendentes / total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
              <div className="p-2.5 bg-neutral-900/60 border border-neutral-800 rounded flex items-center justify-between">
                <span className="text-rose-400 font-semibold">Cancelados</span>
                <span className="text-white font-mono font-tabular font-bold">
                  {cancelados} ({total > 0 ? ((cancelados / total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
            </div>
          </div>

          {/* Turnos */}
          <div className="p-5 bg-[#141619] border border-neutral-800 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Clock className="w-4 h-4 text-[#e0a96d]" />
              <span>Preferência de Turno</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded text-center">
                <div className="text-neutral-400 text-[11px]">Manhã (09h - 12h)</div>
                <div className="text-lg font-bold text-white font-mono font-tabular mt-1">
                  {manhaCount}
                </div>
              </div>
              <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded text-center">
                <div className="text-neutral-400 text-[11px]">Tarde (13h - 18h)</div>
                <div className="text-lg font-bold text-[#e0a96d] font-mono font-tabular mt-1">
                  {tardeCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
