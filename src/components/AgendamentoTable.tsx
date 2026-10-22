import React, { useState, useMemo } from 'react';
import {
  Search,
  MessageCircle,
  Eye,
  SlidersHorizontal,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { Agendamento, AgendamentoStatus } from '../types/agendamento';
import {
  formatCurrencyBRL,
  formatWhatsApp,
  formatDateBR,
  formatRelativeTime,
  parsePriceToNumber,
  STATUS_CONFIG,
  buildAgendamentoWhatsAppLink,
} from '../utils/formatters';

interface AgendamentoTableProps {
  agendamentos: Agendamento[];
  onSelectAgendamento: (item: Agendamento) => void;
  onUpdateStatus: (id: string, newStatus: AgendamentoStatus) => void;
  onDeleteAgendamento: (id: string) => void;
  onOpenNewAgendamento: () => void;
}

export const AgendamentoTable: React.FC<AgendamentoTableProps> = ({
  agendamentos,
  onSelectAgendamento,
  onUpdateStatus,
  onDeleteAgendamento,
  onOpenNewAgendamento,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Filter logic
  const filtered = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);

    return agendamentos.filter((item) => {
      // Search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const mNome = item.nome?.toLowerCase().includes(term);
        const mTel = item.telefone?.includes(term);
        const mProc = item.procedimento?.toLowerCase().includes(term);
        const mData = item.data?.includes(term);
        const mObs = item.observacoes?.toLowerCase().includes(term);
        if (!mNome && !mTel && !mProc && !mData && !mObs) return false;
      }

      // Status
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      // Date filter
      if (dateFilter === 'today') {
        const itemDateClean = item.data?.replace(/\//g, '-');
        if (!itemDateClean.includes(todayStr) && formatDateBR(item.data) !== formatDateBR(todayStr)) {
          return false;
        }
      }

      return true;
    });
  }, [agendamentos, searchTerm, statusFilter, dateFilter]);

  return (
    <div className="bg-[#141619] border border-neutral-800 rounded-lg overflow-hidden">
      {/* Control Bar: Search and Filters */}
      <div className="p-4 border-b border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, telefone, procedimento ou data..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#c28859] transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded text-neutral-300 focus:outline-none focus:border-[#c28859]"
          >
            <option value="all">Todos os Status ({agendamentos.length})</option>
            <option value="confirmado">Confirmados</option>
            <option value="pendente">Pendentes</option>
            <option value="cancelado">Cancelados</option>
          </select>

          {/* Quick Clear */}
          {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter('all');
              }}
              className="px-2.5 py-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-900/50 text-neutral-400 font-medium">
              <th className="py-3 px-4 whitespace-nowrap">Data & Horário</th>
              <th className="py-3 px-4 whitespace-nowrap">Cliente & Contato</th>
              <th className="py-3 px-4 whitespace-nowrap">Procedimento Capilar</th>
              <th className="py-3 px-4 whitespace-nowrap text-right">Valor / Preço</th>
              <th className="py-3 px-4 whitespace-nowrap">Observações</th>
              <th className="py-3 px-4 whitespace-nowrap">Status</th>
              <th className="py-3 px-4 whitespace-nowrap text-right">Ações Rápidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-neutral-400">
                  <SlidersHorizontal className="w-6 h-6 mx-auto mb-2 text-neutral-500" />
                  <p className="text-sm font-medium text-neutral-300">Nenhum agendamento encontrado</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Cadastre um novo agendamento ou ajuste os filtros de pesquisa.
                  </p>
                  <button
                    onClick={onOpenNewAgendamento}
                    className="mt-3 px-3 py-1.5 text-xs text-[#c28859] bg-neutral-900 border border-[#c28859]/30 rounded hover:bg-neutral-800 transition-colors"
                  >
                    + Novo Agendamento
                  </button>
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const currentStatus = item.status || 'confirmado';
                const statusConf = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.confirmado;
                const waUrl = buildAgendamentoWhatsAppLink(item, 'confirmacao');
                const precoNum = parsePriceToNumber(item.procedimentoPreco);

                return (
                  <tr
                    key={item._id}
                    className="hover:bg-neutral-900/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectAgendamento(item)}
                  >
                    {/* 1. Data e Horário */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#c28859]" />
                        <span>{formatDateBR(item.data)}</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5 font-tabular font-mono">
                        <Clock className="w-3 h-3 text-neutral-500" />
                        <span>{item.horario || 'Horário a definir'}</span>
                      </div>
                    </td>

                    {/* 2. Cliente */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white whitespace-nowrap">
                        {item.nome}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-tabular font-mono mt-0.5">
                        {formatWhatsApp(item.telefone)}
                      </div>
                    </td>

                    {/* 3. Procedimento */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-neutral-200">
                        {item.procedimento}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Flávia Marques Hair Atelier
                      </div>
                    </td>

                    {/* 4. Preço */}
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="font-semibold text-white font-tabular font-mono">
                        {item.procedimentoPreco || formatCurrencyBRL(precoNum)}
                      </div>
                      {item.sinalPago ? (
                        <div className="text-[11px] text-emerald-400 font-mono font-tabular">
                          Sinal: {formatCurrencyBRL(item.sinalPago)}
                        </div>
                      ) : (
                        <div className="text-[11px] text-neutral-500 font-mono">
                          Sem sinal
                        </div>
                      )}
                    </td>

                    {/* 5. Observações */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-neutral-300 truncate" title={item.observacoes || ''}>
                        {item.observacoes || <span className="text-neutral-500 italic">Sem observações</span>}
                      </div>
                    </td>

                    {/* 6. Status Dropdown */}
                    <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={currentStatus}
                        onChange={(e) => onUpdateStatus(item._id, e.target.value as AgendamentoStatus)}
                        className={`text-xs px-2.5 py-1 rounded border ${statusConf.borderClass} ${statusConf.bgClass} ${statusConf.textClass} focus:outline-none cursor-pointer`}
                      >
                        <option value="confirmado" className="bg-neutral-900 text-neutral-200">
                          Confirmado
                        </option>
                        <option value="pendente" className="bg-neutral-900 text-neutral-200">
                          Pendente
                        </option>
                        <option value="cancelado" className="bg-neutral-900 text-neutral-200">
                          Cancelado
                        </option>
                      </select>
                    </td>

                    {/* 7. Ações Rápidas */}
                    <td className="py-3 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1-Clique WhatsApp Confirmation */}
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Enviar confirmação automática no WhatsApp"
                          className="p-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded hover:bg-emerald-900/40 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>

                        {/* View / Edit Modal */}
                        <button
                          onClick={() => onSelectAgendamento(item)}
                          title="Visualizar e editar agendamento"
                          className="p-1.5 text-[#e0a96d] bg-neutral-900 border border-neutral-700 rounded hover:bg-neutral-800 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Remover agendamento de ${item.nome}?`)) {
                              onDeleteAgendamento(item._id);
                            }
                          }}
                          title="Remover agendamento"
                          className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-neutral-900 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-3 bg-neutral-900/60 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
        <div>
          Exibindo <span className="font-semibold text-neutral-200">{filtered.length}</span> de{' '}
          <span className="font-semibold text-neutral-200">{agendamentos.length}</span> agendamentos
        </div>
        <div className="hidden sm:inline text-neutral-400">
          Dados sincronizados com MongoDB Atlas (banco: agend)
        </div>
      </div>
    </div>
  );
};
