import React, { useState } from 'react';
import { X, CalendarPlus, Sparkles } from 'lucide-react';
import { NovoAgendamentoPayload, AgendamentoStatus } from '../types/agendamento';

interface NewAgendamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: NovoAgendamentoPayload) => void;
}

export const NewAgendamentoModal: React.FC<NewAgendamentoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().slice(0, 10);

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [procedimento, setProcedimento] = useState('Alinhamento Orgânico Anti-Frizz');
  const [procedimentoPreco, setProcedimentoPreco] = useState('R$ 380,00');
  const [data, setData] = useState(todayStr);
  const [horario, setHorario] = useState('14:00');
  const [observacoes, setObservacoes] = useState('');
  const [status, setStatus] = useState<AgendamentoStatus>('confirmado');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim() || !procedimento.trim()) {
      alert('Por favor, informe Nome, Telefone e Procedimento.');
      return;
    }

    onSubmit({
      nome: nome.trim(),
      telefone: telefone.trim(),
      procedimento: procedimento.trim(),
      procedimentoPreco: procedimentoPreco.trim() || 'R$ 380,00',
      data,
      horario,
      observacoes: observacoes.trim(),
      status,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#141619] border border-neutral-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <CalendarPlus className="w-5 h-5 text-[#c28859]" />
            <h3 className="text-base font-bold text-white font-serif-luxury">
              Novo Agendamento Capilar
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-neutral-300 font-medium mb-1">Nome da Cliente *</label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Vanessa Guimarães"
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-[#c28859]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">WhatsApp / Telefone *</label>
              <input
                type="text"
                required
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="Ex: 11987654321"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-[#c28859]"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium mb-1">Status Inicial</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AgendamentoStatus)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-[#c28859]"
              >
                <option value="confirmado">Confirmado</option>
                <option value="pendente">Pendente de Confirmação</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">Procedimento *</label>
            <input
              type="text"
              required
              value={procedimento}
              onChange={(e) => setProcedimento(e.target.value)}
              placeholder="Ex: Alinhamento Orgânico Anti-Frizz"
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-[#c28859]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">Data Agendada *</label>
              <input
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-[#c28859]"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium mb-1">Horário *</label>
              <input
                type="time"
                required
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-[#c28859]"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium mb-1">Preço / Valor</label>
              <input
                type="text"
                value={procedimentoPreco}
                onChange={(e) => setProcedimentoPreco(e.target.value)}
                placeholder="R$ 380,00"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-emerald-400 font-mono font-semibold focus:outline-none focus:border-[#c28859]"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">
              Observações / Anamnese Prévia
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Cliente com frizz na coroa, mechas no topo, prefere atendimento na quinta-feira..."
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-[#c28859]"
            />
          </div>

          <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-neutral-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-[#e0a96d] to-[#c28859] rounded hover:brightness-105 transition-all shadow-sm"
            >
              Salvar no MongoDB Atlas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
