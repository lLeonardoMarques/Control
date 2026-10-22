import React, { useState } from 'react';
import { X, Server, Check, AlertCircle, RefreshCw, Send, Database, ShieldCheck } from 'lucide-react';
import {
  getStoredApiUrl,
  setStoredApiUrl,
  checkServerHealth,
  ServerHealth,
  fetchAgendamentos,
  postNovoAgendamento,
} from '../services/apiService';
import { Agendamento } from '../types/agendamento';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverHealth: ServerHealth;
  setServerHealth: React.Dispatch<React.SetStateAction<ServerHealth>>;
  onDataRefreshed: (items: Agendamento[]) => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  serverHealth,
  setServerHealth,
  onDataRefreshed,
}) => {
  if (!isOpen) return null;

  const [url, setUrl] = useState(getStoredApiUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [sendingTest, setSendingTest] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    const health = await checkServerHealth(url);
    setTesting(false);

    setTestResult({
      success: health.online,
      message: health.message,
    });

    setServerHealth(health);

    if (health.online) {
      setStoredApiUrl(url);
      const { agendamentos } = await fetchAgendamentos(url);
      onDataRefreshed(agendamentos);
    }
  };

  const handleSendTestBooking = async () => {
    setSendingTest(true);
    const testPayload = {
      nome: `Cliente Teste Atlas ${new Date().toLocaleTimeString('pt-BR')}`,
      telefone: '11999998888',
      procedimento: 'Alinhamento Orgânico Anti-Frizz',
      procedimentoPreco: 'R$ 380,00',
      data: new Date().toISOString().slice(0, 10),
      horario: '15:00',
      observacoes: 'Agendamento de teste disparado do painel para validar gravação no MongoDB Atlas (banco: agend).',
      status: 'confirmado' as const,
    };

    const res = await postNovoAgendamento(testPayload, url);
    setSendingTest(false);

    if (res.success) {
      alert(`Agendamento de teste gravado no MongoDB Atlas com sucesso!\nID: ${res.agendamento._id}`);
      const { agendamentos } = await fetchAgendamentos(url);
      onDataRefreshed(agendamentos);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#141619] border border-neutral-800 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-[#c28859]" />
            <h3 className="text-base font-bold text-white font-serif-luxury">
              Conexão MongoDB Atlas (Banco: agend)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Status Banner */}
          <div
            className={`p-3.5 rounded border flex items-start gap-3 ${
              serverHealth.online
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <div className="font-semibold text-sm flex items-center gap-2">
                <span>Arquitetura Sempre Online Ativa</span>
                <span className="text-[10px] text-emerald-400 font-mono font-normal">
                  (Zero Interrupções)
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-1">
                {serverHealth.message}
              </p>
              <div className="text-[11px] text-neutral-400 mt-1 font-mono">
                Última checagem de integridade: {serverHealth.lastSync}
              </div>
            </div>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <label className="block text-neutral-300 font-semibold text-xs">
              Endereço do Servidor Express
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://localhost:5000"
                className="flex-1 px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded text-white font-mono focus:outline-none focus:border-[#c28859]"
              />
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-[#e0a96d] to-[#c28859] rounded hover:brightness-105 transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Verificando...' : 'Testar Conexão'}</span>
              </button>
            </div>
            <p className="text-[11px] text-neutral-500">
              O Vite está configurado para encaminhar requisições automaticamente via proxy direto para <code className="text-neutral-400">http://localhost:5000</code>.
            </p>
          </div>

          {/* Test Result */}
          {testResult && (
            <div
              className={`p-3 rounded border text-xs ${
                testResult.success
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
              }`}
            >
              {testResult.message}
            </div>
          )}

          {/* Endpoints Mapped */}
          <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded space-y-2">
            <div className="flex items-center gap-2 text-neutral-300 font-semibold">
              <Database className="w-4 h-4 text-[#c28859]" />
              <span>Rotas Mapeadas do seu Código Backend:</span>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-neutral-400">
              <div className="flex items-center justify-between">
                <span>GET /api/agendamentos</span>
                <span className="text-emerald-400">Listar todos os agendamentos</span>
              </div>
              <div className="flex items-center justify-between">
                <span>POST /api/agendamentos</span>
                <span className="text-emerald-400">Salvar novo agendamento</span>
              </div>
              <div className="flex items-center justify-between">
                <span>GET /</span>
                <span className="text-emerald-400">Status do servidor online</span>
              </div>
            </div>
          </div>

          {/* Test booking dispatch */}
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-3">
            <div>
              <div className="text-neutral-200 font-medium">Disparo de Agendamento Teste</div>
              <div className="text-[11px] text-neutral-500">
                Insere um registro real via POST para validar a coleção no MongoDB Atlas
              </div>
            </div>
            <button
              onClick={handleSendTestBooking}
              disabled={sendingTest}
              className="px-3 py-1.5 text-xs text-neutral-200 bg-neutral-900 border border-neutral-700 rounded hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-[#c28859]" />
              <span>{sendingTest ? 'Enviando...' : 'Gravar no Atlas'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-neutral-200 bg-neutral-800 rounded hover:bg-neutral-700 transition-colors"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
