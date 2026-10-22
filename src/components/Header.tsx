import React from 'react';
import { Download, Plus, Server, RefreshCw, Radio } from 'lucide-react';
import { ServerHealth } from '../services/apiService';

interface HeaderProps {
  activeTab: 'agendamentos' | 'analytics' | 'financial';
  setActiveTab: (tab: 'agendamentos' | 'analytics' | 'financial') => void;
  onOpenNewAgendamento: () => void;
  onOpenApiConfig: () => void;
  onExportExcel: () => void;
  serverHealth: ServerHealth;
  isRefreshing: boolean;
  onRefreshData: () => void;
  agendamentosCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewAgendamento,
  onOpenApiConfig,
  onExportExcel,
  serverHealth,
  isRefreshing,
  onRefreshData,
  agendamentosCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0d0f11]/95 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative w-9 h-9 rounded-full overflow-hidden ring-1 ring-[#c28859]/40 bg-neutral-800 shrink-0">
              <img
                src="/src/assets/images/avatar_flavia_marques_1792689205140.jpg"
                alt="Flávia Marques"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('agendamentos');
              }}
              className="text-base font-semibold tracking-tight text-white whitespace-nowrap hover:text-[#e0a96d] transition-colors"
            >
              Flávia Marques <span className="text-[#c28859] font-normal">· Hair Specialist</span>
            </a>
          </div>

          {/* Zone 2: Navigation Links (single line, clean text links) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <button
              onClick={() => setActiveTab('agendamentos')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === 'agendamentos'
                  ? 'text-white border-b-2 border-[#c28859]'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Agenda de Horários ({agendamentosCount})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === 'analytics'
                  ? 'text-white border-b-2 border-[#c28859]'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Análise & Métricas
            </button>
            <button
              onClick={() => setActiveTab('financial')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === 'financial'
                  ? 'text-white border-b-2 border-[#c28859]'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Controle de Valores
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Server Connection Status Indicator (Sempre Online) */}
            <button
              onClick={onOpenApiConfig}
              title="Status do Servidor de Agendamentos (MongoDB Atlas)"
              className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 text-xs text-neutral-300 bg-neutral-900 border border-neutral-800 rounded hover:border-neutral-700 transition-colors"
            >
              <Radio className={`w-3.5 h-3.5 ${serverHealth.online ? 'text-emerald-400' : 'text-[#c28859]'}`} />
              <span className="font-tabular">
                {serverHealth.online ? 'Servidor Online' : 'Sincronizado'}
              </span>
            </button>

            {/* Refresh */}
            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              title="Sincronizar com banco de dados agora"
              className="p-2 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded hover:border-neutral-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#c28859]' : ''}`} />
            </button>

            {/* New Agendamento Manual Registration */}
            <button
              onClick={onOpenNewAgendamento}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-900 border border-neutral-700 rounded hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-[#c28859]" />
              <span>Novo Agendamento</span>
            </button>

            {/* Primary CTA: Export to Excel */}
            <button
              onClick={onExportExcel}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-[#e0a96d] to-[#c28859] rounded hover:brightness-105 active:scale-95 transition-all shadow-sm whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4 text-neutral-950" />
              <span>Exportar Excel</span>
            </button>
          </div>
        </div>

        {/* Mobile Subnav */}
        <div className="flex md:hidden items-center justify-around border-t border-neutral-800/60 py-2.5 text-xs">
          <button
            onClick={() => setActiveTab('agendamentos')}
            className={`whitespace-nowrap ${activeTab === 'agendamentos' ? 'text-[#e0a96d] font-semibold' : 'text-neutral-400'}`}
          >
            Agenda ({agendamentosCount})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`whitespace-nowrap ${activeTab === 'analytics' ? 'text-[#e0a96d] font-semibold' : 'text-neutral-400'}`}
          >
            Métricas
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`whitespace-nowrap ${activeTab === 'financial' ? 'text-[#e0a96d] font-semibold' : 'text-neutral-400'}`}
          >
            Valores
          </button>
          <button
            onClick={onOpenNewAgendamento}
            className="text-neutral-300 font-medium whitespace-nowrap flex items-center gap-1"
          >
            <Plus className="w-3 h-3 text-[#c28859]" /> Novo
          </button>
        </div>
      </div>
    </header>
  );
};
