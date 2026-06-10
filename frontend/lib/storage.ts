const DB_NAME = 'resolve-pal-db';
const DB_VERSION = 1;
const STORE_NAME = 'tickets';

export interface TicketMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  routing?: {
    intents: string[];
    primary: string;
    confidence: number;
  };
}

export interface Ticket {
  id: string;
  sessionId: string;
  subject: string;
  messages: TicketMessage[];
  status: 'open' | 'resolved' | 'escalated';
  sample?: boolean;
  source?: string;
  createdAt: number;
  updatedAt: number;
}

type RoutingDecision = {
  intents: string[];
  primary: string;
  rationale: string;
  confidence: number;
};

type AgentResponse = {
  response: string;
  routing: RoutingDecision;
  sessionId: string;
};

// Initialize DB
export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('sessionId', 'sessionId', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveTicket(ticket: Ticket): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(ticket);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getTickets(): Promise<Ticket[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function getTicketsBySession(sessionId: string): Promise<Ticket[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const index = tx.objectStore(STORE_NAME).index('sessionId');
    const req = index.getAll(sessionId);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function generateSessionId(): string {
  return `rp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// API integration
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function sendTicket(message: string, customerId: string, sessionId: string): Promise<AgentResponse> {
  const response = await fetch(`${API_BASE}/api/support/ticket`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      customerId,
      sessionId,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
