import { Agendamento } from '../types/agendamento';
import { formatDateBR, parsePriceToNumber } from './formatters';

/**
 * Exports Agendamentos to an Excel-friendly CSV with UTF-8 BOM and ';' delimiter
 */
export function exportAgendamentosToExcel(
  agendamentos: Agendamento[],
  filename = 'Agendamentos_FlaviaMarques.csv'
): void {
  const headers = [
    'ID Agendamento',
    'Data Agendamento',
    'Horario',
    'Nome Cliente',
    'Telefone / WhatsApp',
    'Procedimento',
    'Preco Procedimento (R$)',
    'Sinal Pago (R$)',
    'Status Agendamento',
    'Observacoes',
    'Data Cadastro Sistema',
  ];

  const escapeCell = (val: unknown): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""').replace(/\r?\n/g, ' ');
    return `"${str}"`;
  };

  const rows = agendamentos.map((item) => {
    const precoNum = parsePriceToNumber(item.procedimentoPreco);
    const precoFmt = precoNum.toFixed(2).replace('.', ',');
    const sinalFmt = (item.sinalPago || 0).toFixed(2).replace('.', ',');
    const statusLabel =
      item.status === 'confirmado'
        ? 'Confirmado'
        : item.status === 'pendente'
        ? 'Pendente'
        : 'Cancelado';

    return [
      escapeCell(item._id),
      escapeCell(formatDateBR(item.data)),
      escapeCell(item.horario),
      escapeCell(item.nome),
      escapeCell(item.telefone),
      escapeCell(item.procedimento),
      escapeCell(precoFmt),
      escapeCell(sinalFmt),
      escapeCell(statusLabel),
      escapeCell(item.observacoes || ''),
      escapeCell(item.createdAt ? formatDateBR(item.createdAt) : ''),
    ].join(';');
  });

  // UTF-8 BOM
  const bom = '\uFEFF';
  const csvContent = bom + [headers.join(';'), ...rows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
