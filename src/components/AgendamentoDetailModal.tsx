import React, { useState, useEffect } from 'react';
import {
  X,
  MessageCircle,
  Calendar,
  Clock,
  DollarSign,
  Save,
  Check,
  Copy,
  ExternalLink,
  User,
  Scissors,
} from 'lucide-react';
import { Agendamento, AgendamentoStatus } from '../types/agendamento';
import {
  formatCurrencyBRL,
  formatDateBR,
  formatWhatsApp,
  parsePriceToNumber,
  STATUS_CONFIG,
  buildAgendamentoWhatsAppLink,
} from '../utils/formatters';

interface AgendamentoDetailModalProps {
  agendamento: Agendamento | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Agendamento>) => void;
}

export const AgendamentoDetailModal: React.FC<AgendamentoDetailModalProps> = ({
  agendamento,
  onClose,
  onSave,
}) => {
  if (!agendamento) return null;

  const [nome, setNome] = useState(agendamento.nome);
  const [telefone, setTelefone] = useState(agendamento.telefone);
  const [procedimento, setProcedimento] = useState(agendamento.procedimento);
  const [procedimentoPreco, setProcedimentoPreco] = useState(agendamento.procedimentoPreco || '');
  const [data, setData] = useState(agendamento.data);
  const [horario, setHorario] = useState(agendamento.horario);
  const [observacoes, setObservacoes] = useState(agendamento.observacoes || '');
  const [status, setStatus] = useState<AgendamentoStatus>(agendamento.status || 'confirmado');
  const [sinalPago, setSinalPago] = useState<number>(agendamento.sinalPago || 0);

  const [templateType, setTemplateType] = useState<'confirmacao' | 'lembrete' | 'pos_atendimento'>('confirmacao');
  const [copied, setCopied] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    setNome(agendamento.nome);
    setTelefone(agendamento.telefone);
    setProcedimento(agendamento.procedimento);
    setProcedimentoPreco(agendamento.procedimentoPreco || '');
    setData(agendamento.data);
    setHorario(agendamento.horario);
    setObservacoes(agendamento.observacoes || '');
    setStatus(agendamento.status || 'confirmado');
    setSinalPago(agendamento.sinalPago || 0);
  }, [agendamento]);

  const handleSave = () => {
    onSave(agendamento._id, {
      nome,
      telefone,
      procedimento,
      procedimentoPreco,
      data,
      horario,
      observacoes,
      status,
      sinalPago: Number(sinalPago),
    });
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2000);
  };

  const currentWaUrl = buildAgendamentoWhatsAppLink(
    {
      ...agendamento,
      nome,
      telefone,
      procedimento,
      data,
      horario,
    },
    templateType
  );

  const handleCopyMessage = () => {
    try {
      const parsed = new URL(currentWaUrl);
      const text = parsed.searchParams.get('text') || '';
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const precoNum = parsePriceToNumber(procedimentoPreco);
  const saldoRestante = Math.max(0, precoNum - (sinalPago || 0));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-[#141619] border border-neutral-800 rounded-xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-start justify-between gap-4 bg-neutral-900/60">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white tracking-tight font-serif-luxury">
                {nome}
              </h2>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                  status === 'confirmado'
                    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20'
                    : status === 'pendente'
                    ? 'text-amber-400 border-amber-500/30 bg-amber-950/20'
                    : 'text-rose-400 border-rose-500/30 bg-rose-950/20'
                }`}
              >
                {status.toUpperCase()}
              </span>
            </div>
            <div className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
              <span>{formatWhatsApp(telefone)}</span>
              <span>·</span>
              <span>{procedimento}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-[#e0a96d] to-[#c28859] rounded hover:brightness-105 transition-all shadow-sm"
            >
              <Save className="w-3.5 h-3.5 text-neutral-950" />
              <span>{savedBanner ? 'Salvo!' : 'Salvar Alterações'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {savedBanner && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Agendamento salvo com sucesso no banco de dados MongoDB!</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 text-[11px] mb-1">Nome do Cliente *</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-[#c28859]"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-[11px] mb-1">Telefone / WhatsApp *</label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-[#c28859]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-neutral-400 text-[11px] mb-1">Procedimento *</label>
              <input
                type="text"
                value={procedimento}
                onChange={(e) => setProcedimento(e.target.value)}
                placeholder="Ex: Alinhamento Orgânico Anti-Frizz"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-[#c28859]"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-[11px] mb-1">Data Agendada *</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-[#c28859]"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-[11px] mb-1">Horário *</label>
              <input
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-[#c28859]"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-[11px] mb-1">Preço do Procedimento</label>
              <input
                type="text"
                value={procedimentoPreco}
                onChange={(e) => setProcedimentoPreco(e.target.value)}
                placeholder="Ex: R$ 380,00"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-emerald-400 font-mono font-semibold focus:outline-none focus:border-[#c28859]"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-[11px] mb-1">Status do Agendamento</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AgendamentoStatus)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-[#c28859]"
              >
                <option value="confirmado">Confirmado</option>
                <option value="pendente">Pendente</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 text-[11px] mb-1">Sinal / Entrada Pago (R$)</label>
              <input
                type="number"
                step="10"
                value={sinalPago}
                onChange={(e) => setSinalPago(Number(e.target.value))}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-cyan-400 font-mono focus:outline-none focus:border-[#c28859]"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-[11px] mb-1">Saldo a Receber no Ateliê</label>
              <div className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-amber-300 font-mono font-semibold">
                {formatCurrencyBRL(saldoRestante)}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-neutral-400 text-[11px] mb-1">
                Observações Técnicas / Anamnese da Flávia Marques
              </label>
              <textarea
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Teste de mecha aprovado. Fios ondulados 2B. Cauterização com ácido hialurônico..."
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-[#c28859]"
              />
            </div>
          </div>

          {/* WhatsApp Direct Integration */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <MessageCircle className="w-4 h-4" />
                <span>Confirmação & Lembrete Automático de Horário</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                {formatWhatsApp(telefone)}
              </span>
            </div>

            <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded">
              <button
                onClick={() => setTemplateType('confirmacao')}
                className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
                  templateType === 'confirmacao'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Confirmação
              </button>
              <button
                onClick={() => setTemplateType('lembrete')}
                className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
                  templateType === 'lembrete'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Lembrete no Dia
              </button>
              <button
                onClick={() => setTemplateType('pos_atendimento')}
                className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
                  templateType === 'pos_atendimento'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Pós-Atendimento
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={currentWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar pelo WhatsApp Web / App</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              <button
                onClick={handleCopyMessage}
                title="Copiar texto da mensagem"
                className="p-2 text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-700 rounded hover:bg-neutral-800 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/60 flex items-center justify-between text-xs">
          <div className="text-neutral-400">
            ID: <span className="font-mono text-neutral-300">{agendamento._id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-neutral-400 hover:text-white transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-[#e0a96d] to-[#c28859] rounded hover:brightness-105 transition-all shadow-sm"
            >
              <Save className="w-3.5 h-3.5 text-neutral-950" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
