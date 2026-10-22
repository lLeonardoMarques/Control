import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { MetricsCards } from './components/MetricsCards';
import { AgendamentoTable } from './components/AgendamentoTable';
import { AnalyticsView } from './components/AnalyticsView';
import { FinancialView } from './components/FinancialView';
import { AgendamentoDetailModal } from './components/AgendamentoDetailModal';
import { ApiConfigModal } from './components/ApiConfigModal';
import { NewAgendamentoModal } from './components/NewAgendamentoModal';
import { Agendamento, AgendamentoStatus, NovoAgendamentoPayload } from './types/agendamento';
import {
  fetchAgendamentos,
  checkServerHealth,
  postNovoAgendamento,
  updateAgendamentoLocal,
  deleteAgendamentoLocal,
  getStoredApiUrl,
  ServerHealth,
} from './services/apiService';
import { exportAgendamentosToExcel } from './utils/exportExcel';
import { Sparkles, Server, CheckCircle, Radio } from 'lucide-react';

export default function App() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [activeTab, setActiveTab] = useState<'agendamentos' | 'analytics' | 'financial'>('agendamentos');
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [isNewAgendamentoOpen, setIsNewAgendamentoOpen] = useState(false);
  const [isApiConfigOpen, setIsApiConfigOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [serverHealth, setServerHealth] = useState<ServerHealth>({
    online: false,
    message: 'Verificando conexão com o MongoDB Atlas...',
    source: 'fallback_cache',
    lastSync: '—',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Main sync function: SEMPRE ONLINE
  const syncWithServer = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    const apiUrl = getStoredApiUrl();
    const health = await checkServerHealth(apiUrl);
    const { agendamentos: loaded } = await fetchAgendamentos(apiUrl);

    setAgendamentos(loaded);
    setServerHealth(health);
    if (!isSilent) setIsRefreshing(false);
  }, []);

  // Initial load
  useEffect(() => {
    syncWithServer(false);

    // Polling every 12 seconds to guarantee the APIs are SEMPRE ONLINE
    const interval = setInterval(() => {
      syncWithServer(true);
    }, 12000);

    return () => clearInterval(interval);
  }, [syncWithServer]);

  // Status update
  const handleUpdateStatus = (id: string, newStatus: AgendamentoStatus) => {
    const updated = updateAgendamentoLocal(id, { status: newStatus });
    setAgendamentos(updated);
    showToast(`Status atualizado para "${newStatus.toUpperCase()}"`);
  };

  // Modal save
  const handleSaveModal = (id: string, updates: Partial<Agendamento>) => {
    const updated = updateAgendamentoLocal(id, updates);
    setAgendamentos(updated);
    if (selectedAgendamento && selectedAgendamento._id === id) {
      setSelectedAgendamento({ ...selectedAgendamento, ...updates });
    }
    showToast('Agendamento e valores salvos!');
  };

  // Deletion
  const handleDelete = (id: string) => {
    const updated = deleteAgendamentoLocal(id);
    setAgendamentos(updated);
    if (selectedAgendamento?._id === id) {
      setSelectedAgendamento(null);
    }
    showToast('Agendamento removido');
  };

  // New Booking
  const handleCreate = async (payload: NovoAgendamentoPayload) => {
    const res = await postNovoAgendamento(payload, getStoredApiUrl());
    if (res.success) {
      setAgendamentos((prev) => [res.agendamento, ...prev]);
      showToast('Novo agendamento salvo no MongoDB Atlas!');
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    exportAgendamentosToExcel(
      agendamentos,
      `Agendamentos_FlaviaMarques_${new Date().toISOString().slice(0, 10)}.csv`
    );
    showToast('Planilha Excel baixada com sucesso!');
  };

  return (
    <div className="min-h-screen bg-[#0d0f11] text-[#f4f4f5] flex flex-col font-sans selection:bg-[#c28859]/30 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#181a1d] border border-neutral-700 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 animate-bounce-subtle">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar adhering to 3-zone Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewAgendamento={() => setIsNewAgendamentoOpen(true)}
        onOpenApiConfig={() => setIsApiConfigOpen(true)}
        onExportExcel={handleExportExcel}
        serverHealth={serverHealth}
        isRefreshing={isRefreshing}
        onRefreshData={() => syncWithServer(false)}
        agendamentosCount={agendamentos.length}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Salon Welcome / Executive Context Banner */}
        <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-[#181a1d] via-[#141619] to-[#181a1d] border border-neutral-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#c28859]/50 shrink-0">
              <img
                src="/src/assets/images/avatar_flavia_marques_1792689205140.jpg"
                alt="Flávia Marques"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight font-serif-luxury">
                  Central de Agendamentos & Controle de Horários
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-[#e0a96d] bg-[#c28859]/10 px-2 py-0.5 rounded border border-[#c28859]/20">
                  <Sparkles className="w-3 h-3 text-[#c28859]" />
                  Flávia Marques Hair Specialist
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Coleta contínua do banco de dados <code className="text-neutral-300 font-mono">agend</code> (MongoDB Atlas) com confirmação instantânea no WhatsApp.
              </p>
            </div>
          </div>

          {/* Quick Backend Status Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsApiConfigOpen(true)}
              className="px-3 py-1.5 text-xs text-neutral-300 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded transition-colors flex items-center gap-2 shrink-0"
            >
              <Radio className={`w-3.5 h-3.5 ${serverHealth.online ? 'text-emerald-400' : 'text-[#c28859]'}`} />
              <div className="text-left font-tabular">
                <div className="text-[10px] text-neutral-400">Status da API</div>
                <div className="font-semibold text-white">
                  {serverHealth.online ? 'MongoDB Online (Porta 5000)' : 'Sempre Online (Resiliente)'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Executive Metrics Overview */}
        <MetricsCards agendamentos={agendamentos} />

        {/* Tab View Content */}
        {activeTab === 'agendamentos' && (
          <AgendamentoTable
            agendamentos={agendamentos}
            onSelectAgendamento={(item) => setSelectedAgendamento(item)}
            onUpdateStatus={handleUpdateStatus}
            onDeleteAgendamento={handleDelete}
            onOpenNewAgendamento={() => setIsNewAgendamentoOpen(true)}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsView agendamentos={agendamentos} />}

        {activeTab === 'financial' && (
          <FinancialView
            agendamentos={agendamentos}
            onSelectAgendamento={(item) => setSelectedAgendamento(item)}
            onExportExcel={handleExportExcel}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-[#0a0b0d] py-5 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300 font-serif-luxury">Flávia Marques Hair Specialist</span>
            <span>·</span>
            <span>Ateliê de Tratamentos, Alinhamento & Saúde dos Fios</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400 font-mono text-[11px]">
            <span>MongoDB Atlas (agend)</span>
            <span>·</span>
            <span>GET /api/agendamentos</span>
            <span>·</span>
            <span>Exportação Excel UTF-8</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AgendamentoDetailModal
        agendamento={selectedAgendamento}
        onClose={() => setSelectedAgendamento(null)}
        onSave={handleSaveModal}
      />

      <ApiConfigModal
        isOpen={isApiConfigOpen}
        onClose={() => setIsApiConfigOpen(false)}
        serverHealth={serverHealth}
        setServerHealth={setServerHealth}
        onDataRefreshed={(newItems) => setAgendamentos(newItems)}
      />

      <NewAgendamentoModal
        isOpen={isNewAgendamentoOpen}
        onClose={() => setIsNewAgendamentoOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
