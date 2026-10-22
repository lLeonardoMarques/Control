import { Agendamento, AgendamentoStatus } from '../types/agendamento';

export function parsePriceToNumber(priceStr?: string): number {
  if (!priceStr) return 0;
  // If already pure number or formatted as "R$ 380,00" / "380.00"
  const cleaned = priceStr
    .replace('R$', '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function formatCurrencyBRL(value?: number): string {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0,00';
  }
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

export function formatWhatsApp(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function cleanPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('55') && cleaned.length >= 12) {
    return cleaned;
  }
  if (cleaned.length === 10 || cleaned.length === 11) {
    return `55${cleaned}`;
  }
  return cleaned;
}

export function formatDateBR(dateString?: string): string {
  if (!dateString) return '—';
  // If already DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return dateString;

  // If YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [y, m, d] = dateString.split('-');
    return `${d}/${m}/${y}`;
  }

  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'agora mesmo';
    if (diffMinutes < 60) return `há ${diffMinutes} min`;
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays === 1) return 'ontem';
    if (diffDays < 7) return `há ${diffDays} dias`;
    return formatDateBR(dateString);
  } catch {
    return '—';
  }
}

export const STATUS_CONFIG: Record<
  AgendamentoStatus,
  { label: string; textClass: string; borderClass: string; bgClass: string }
> = {
  confirmado: {
    label: 'Confirmado',
    textClass: 'text-emerald-300',
    borderClass: 'border-emerald-500/40',
    bgClass: 'bg-emerald-950/20',
  },
  pendente: {
    label: 'Pendente',
    textClass: 'text-amber-300',
    borderClass: 'border-amber-500/40',
    bgClass: 'bg-amber-950/20',
  },
  cancelado: {
    label: 'Cancelado',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500/40',
    bgClass: 'bg-rose-950/20',
  },
};

export function buildAgendamentoWhatsAppLink(
  agendamento: Agendamento,
  type: 'confirmacao' | 'lembrete' | 'pos_atendimento' = 'confirmacao'
): string {
  const phone = cleanPhoneForWhatsApp(agendamento.telefone);
  const firstName = agendamento.nome.split(' ')[0];
  const dataFormatada = formatDateBR(agendamento.data);
  const horario = agendamento.horario || 'horário agendado';
  const procedimento = agendamento.procedimento || 'Procedimento Capilar';

  let message = '';

  if (type === 'confirmacao') {
    message = `Olá, ${firstName}! Tudo bem? 

Aqui é a Flávia Marques, Hair Specialist e Terapeuta Capilar. ✨

Estou passando para confirmar o seu agendamento no nosso ateliê:
📅 Data: *${dataFormatada}*
⏰ Horário: *${horario}*
💇‍♀️ Procedimento: *${procedimento}*

Para garantir o melhor resultado, solicitamos comparecer com os cabelos lavados apenas com shampoo suave, sem óleos ou finalizadores pesados.

Qualquer dúvida ou necessidade de ajuste, estou à disposição! 🌸`;
  } else if (type === 'lembrete') {
    message = `Olá, ${firstName}! Flávia Marques por aqui. 🌸

Passando para lembrar do seu horário especial hoje às *${horario}* para o procedimento *${procedimento}*.

Nosso ateliê já está preparado para te receber com todo o carinho e conforto! Te vejo em breve! ✨`;
  } else {
    message = `Olá, ${firstName}! Como estão seus fios após o nosso procedimento *${procedimento}*?

Aqui é a Flávia Marques! Gostaria de saber como está a textura e se precisa de alguma recomendação para a sua rotina home care deste mês. ✨`;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
