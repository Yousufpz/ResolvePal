'use client';

import { useState, useEffect, useRef } from 'react';
import {
  getTickets,
  saveTicket,
  generateSessionId,
  sendTicket,
  Ticket,
} from '@/lib/storage';
import { createWalmartSampleTickets } from '@/lib/sampleTickets';

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate or load session
    const storedSessionId = localStorage.getItem('rp_session_id');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      localStorage.setItem('rp_session_id', newSessionId);
    }

    // Load existing tickets
    getTickets().then((allTickets) => {
      setTickets(allTickets);
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [tickets]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || !customerId.trim()) return;

    setLoading(true);

    try {
      const response = await sendTicket(currentMessage, customerId, sessionId);

      // Create new ticket
      const newTicket: Ticket = {
        id: `t_${Date.now()}`,
        sessionId,
        subject: currentMessage.substring(0, 50) + (currentMessage.length > 50 ? '...' : ''),
        messages: [
          { role: 'user', content: currentMessage, timestamp: Date.now() },
          {
            role: 'assistant',
            content: response.response,
            timestamp: Date.now(),
            routing: {
              intents: response.routing.intents,
              primary: response.routing.primary,
              confidence: response.routing.confidence,
            },
          },
        ],
        status: 'open',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await saveTicket(newTicket);
      setTickets([...tickets, newTicket]);
      setCurrentMessage('');
    } catch (error) {
      console.error('Failed to send ticket:', error);
      alert('Failed to connect to backend. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const loadWalmartSamples = async () => {
    const samples = createWalmartSampleTickets();
    await Promise.all(samples.map((ticket) => saveTicket(ticket)));

    const existingNonSamples = tickets.filter((ticket) => !ticket.sample);
    setTickets([...existingNonSamples, ...samples]);
  };

  return (
    <div className="min-h-screen bg-bg-deep p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Support Dashboard</h1>
          <p className="text-text-secondary">
            Intelligent multi-agent customer support — API Mode
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar - Ticket List */}
          <div className="md:col-span-1">
            <div className="bg-bg-surface rounded-lg p-4">
              <h2 className="font-mono text-xs uppercase text-gold-primary mb-4">
                Recent Tickets
              </h2>
              <button
                type="button"
                onClick={loadWalmartSamples}
                className="mb-4 w-full rounded border border-gold-primary/40 px-3 py-2 font-mono text-xs uppercase text-gold-primary transition-colors hover:bg-gold-primary/10"
              >
                Load Walmart Samples
              </button>
              <div className="space-y-2">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-3 bg-bg-elevated rounded cursor-pointer hover:bg-gold-primary/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate">{ticket.subject}</p>
                      {ticket.sample && (
                        <span className="shrink-0 rounded border border-gold-primary/40 px-1.5 py-0.5 font-mono text-[10px] uppercase text-gold-primary">
                          Sample
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`
                          w-2 h-2 rounded-full
                          ${ticket.status === 'resolved' ? 'bg-status-success' : ''}
                          ${ticket.status === 'open' ? 'bg-status-warning' : ''}
                          ${ticket.status === 'escalated' ? 'bg-status-error' : ''}
                        `}
                      />
                      <span className="font-mono text-xs text-text-secondary">
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                ))}
                {tickets.length === 0 && (
                  <p className="text-text-secondary text-sm">No tickets yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Main - Chat Interface */}
          <div className="md:col-span-2">
            <div className="bg-bg-surface rounded-lg p-6">
              <h2 className="font-mono text-xs uppercase text-gold-primary mb-4">
                New Ticket
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Customer ID
                  </label>
                  <input
                    type="text"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    placeholder="Enter customer ID (e.g., cust_001)"
                    className="w-full px-4 py-2 bg-bg-elevated rounded border border-gold-primary/20 focus:border-gold-primary outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Message
                  </label>
                  <textarea
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Describe your issue..."
                    rows={4}
                    className="w-full px-4 py-2 bg-bg-elevated rounded border border-gold-primary/20 focus:border-gold-primary outline-none resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !currentMessage.trim() || !customerId.trim()}
                  className="w-full px-6 py-3 bg-gold-primary text-bg-deep font-semibold rounded-lg hover:bg-gold-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : 'Submit Ticket'}
                </button>
              </form>

              {/* Latest ticket response preview */}
              {tickets.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gold-primary/20">
                  <h3 className="font-mono text-xs uppercase text-gold-primary mb-4">
                    Latest Response
                  </h3>
                  {tickets[tickets.length - 1].messages.map((msg, idx) => (
                    <div key={idx} className="mb-4 last:mb-0">
                      <div className="flex items-start gap-3">
                        <span className="font-mono text-xs text-gold-primary mt-0.5">
                          {msg.role === 'user' ? 'YOU' : 'AGENT'}
                        </span>
                        <p className="text-sm text-text-secondary">{msg.content}</p>
                      </div>
                      {msg.routing && (
                        <div className="mt-2 font-mono text-xs text-gold-muted/60">
                          Intents: {msg.routing.intents.join(', ')} • Confidence:{' '}
                          {(msg.routing.confidence * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
