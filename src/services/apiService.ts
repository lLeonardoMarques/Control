import { Agendamento, NovoAgendamentoPayload, AgendamentoStatus } from '../types/agendamento';
import { INITIAL_AGENDAMENTOS } from '../data/mockAgendamentos';

const STORAGE_KEY = 'flavia_marques_agendamentos_v2';
const API_URL_KEY = 'flavia_marques_agend_api_url';
export const DEFAULT_API_URL = 'http://localhost:5000';

export interface ServerHealth {
  online: boolean;
  message: string;
  timestamp?: string;
  source: 'direct' | 'proxy' | 'fallback_cache';
  lastSync: string;
}

export function getStoredApiUrl(): string {
  try {
    return localStorage.getItem(API_URL_KEY) || DEFAULT_API_URL;
  } catch {
    return DEFAULT_API_URL;
  }
}

export function setStoredApiUrl(url: string): void {
  try {
    localStorage.setItem(API_URL_KEY, url);
  } catch (err) {
    console.error('Erro ao salvar URL da API:', err);
  }
}

export function getLocalAgendamentos(): Agendamento[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveLocalAgendamentos(INITIAL_AGENDAMENTOS);
      return INITIAL_AGENDAMENTOS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveLocalAgendamentos(INITIAL_AGENDAMENTOS);
      return INITIAL_AGENDAMENTOS;
    }
    return parsed;
  } catch (err) {
    console.error('Erro ao carregar agendamentos do cache:', err);
    return INITIAL_AGENDAMENTOS;
  }
}

export function saveLocalAgendamentos(items: Agendamento[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Erro ao salvar agendamentos no cache:', err);
  }
}

/**
 * Checks server health: tries proxy /api first, then direct URL
 */
export async function checkServerHealth(customUrl = getStoredApiUrl()): Promise<ServerHealth> {
  const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // 1. Try proxy /
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('/', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.status === 'online' || data.message?.includes('Agendamentos')) {
        return {
          online: true,
          message: data.message || 'Servidor de Agendamentos conectado via proxy!',
          timestamp: data.timestamp,
          source: 'proxy',
          lastSync: now,
        };
      }
    }
  } catch {
    // continue to direct check
  }

  // 2. Try direct custom URL (e.g. http://localhost:5000)
  try {
    const cleanUrl = customUrl.replace(/\/$/, '');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${cleanUrl}/`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        online: true,
        message: data.message || 'Servidor de Agendamentos conectado com sucesso!',
        timestamp: data.timestamp,
        source: 'direct',
        lastSync: now,
      };
    }
  } catch (err) {
    // Fallback
  }

  return {
    online: false,
    message: 'Servidor offline ou inicializando. Operando em modo seguro resiliente (Cache 100% Ativo).',
    source: 'fallback_cache',
    lastSync: now,
  };
}

/**
 * Fetches all agendamentos from GET /api/agendamentos.
 * Ensures the app is SEMPRE ONLINE: if server responds, syncs with DB;
 * otherwise gracefully serves local persistent state.
 */
export async function fetchAgendamentos(
  customUrl = getStoredApiUrl()
): Promise<{ agendamentos: Agendamento[]; fromServer: boolean; error?: string }> {
  const cleanUrl = customUrl.replace(/\/$/, '');
  const candidateUrls = [
    '/api/agendamentos', // through Vite proxy
    `${cleanUrl}/api/agendamentos`, // direct to server
  ];

  for (const endpoint of candidateUrls) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const body = await res.json();
        // Backend returns: { success: true, count: number, data: Agendamento[] }
        const serverList: Agendamento[] = Array.isArray(body)
          ? body
          : Array.isArray(body.data)
          ? body.data
          : [];

        if (serverList.length > 0) {
          // Merge with any local financial enrichments
          const local = getLocalAgendamentos();
          const localMap = new Map(local.map((item) => [item._id, item]));

          const merged = serverList.map((srv) => {
            const loc = localMap.get(srv._id);
            return {
              ...srv,
              sinalPago: loc?.sinalPago ?? srv.sinalPago ?? (srv.status === 'confirmado' ? 100 : 0),
              formaPagamento: loc?.formaPagamento ?? srv.formaPagamento ?? 'pix',
              notasInternas: loc?.notasInternas ?? srv.observacoes ?? '',
            };
          });

          saveLocalAgendamentos(merged);
          return { agendamentos: merged, fromServer: true };
        }
      }
    } catch {
      // Try next candidate
    }
  }

  // Graceful fallback: SEMPRE ONLINE
  const cached = getLocalAgendamentos();
  return {
    agendamentos: cached,
    fromServer: false,
    error: 'Servidor local não respondeu no momento. Exibindo dados locais sincronizados.',
  };
}

/**
 * POST /api/agendamentos
 */
export async function postNovoAgendamento(
  payload: NovoAgendamentoPayload,
  customUrl = getStoredApiUrl()
): Promise<{ success: boolean; agendamento: Agendamento; error?: string }> {
  const cleanUrl = customUrl.replace(/\/$/, '');
  const candidateUrls = [
    '/api/agendamentos',
    `${cleanUrl}/api/agendamentos`,
  ];

  let serverData: Agendamento | null = null;

  for (const endpoint of candidateUrls) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          nome: payload.nome,
          telefone: payload.telefone,
          procedimento: payload.procedimento,
          procedimentoPreco: payload.procedimentoPreco || 'R$ 380,00',
          data: payload.data,
          horario: payload.horario,
          observacoes: payload.observacoes || '',
          status: payload.status || 'confirmado',
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data._id) {
          serverData = json.data;
          break;
        }
      }
    } catch {
      // Continue to next candidate
    }
  }

  const finalAgendamento: Agendamento = serverData || {
    _id: `agend_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    nome: payload.nome,
    telefone: payload.telefone,
    procedimento: payload.procedimento,
    procedimentoPreco: payload.procedimentoPreco || 'R$ 380,00',
    data: payload.data,
    horario: payload.horario,
    observacoes: payload.observacoes || '',
    status: payload.status || 'confirmado',
    sinalPago: payload.status === 'confirmado' ? 100 : 0,
    formaPagamento: 'pix',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const current = getLocalAgendamentos();
  const updated = [finalAgendamento, ...current];
  saveLocalAgendamentos(updated);

  return { success: true, agendamento: finalAgendamento };
}

export function updateAgendamentoLocal(id: string, updates: Partial<Agendamento>): Agendamento[] {
  const current = getLocalAgendamentos();
  const index = current.findIndex((a) => a._id === id);
  if (index !== -1) {
    current[index] = {
      ...current[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveLocalAgendamentos(current);
  }
  return [...current];
}

export function deleteAgendamentoLocal(id: string): Agendamento[] {
  const current = getLocalAgendamentos();
  const filtered = current.filter((a) => a._id !== id);
  saveLocalAgendamentos(filtered);
  return filtered;
}
