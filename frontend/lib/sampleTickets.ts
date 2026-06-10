import { Ticket, generateSessionId } from './storage';

const SAMPLE_SOURCE = 'Walmart sample';

export function createWalmartSampleTickets(): Ticket[] {
  const now = Date.now();
  const sessionId = generateSessionId();

  return [
    {
      id: 'sample_walmart_billing_001',
      sessionId,
      subject: '[SAMPLE - Walmart] Duplicate charge on grocery pickup',
      sample: true,
      source: SAMPLE_SOURCE,
      status: 'resolved',
      createdAt: now - 1000 * 60 * 60 * 4,
      updatedAt: now - 1000 * 60 * 60 * 3,
      messages: [
        {
          role: 'user',
          content:
            'SAMPLE WALMART TICKET: I placed a grocery pickup order for $86.42 and my card was charged twice, but I only received one order.',
          timestamp: now - 1000 * 60 * 60 * 4,
        },
        {
          role: 'assistant',
          content:
            'I confirmed this is a billing-only issue. The duplicate authorization has been identified and a refund request has been initiated for the extra $86.42 charge.',
          timestamp: now - 1000 * 60 * 60 * 3,
          routing: {
            intents: ['BILLING'],
            primary: 'BILLING',
            confidence: 0.96,
          },
        },
      ],
    },
    {
      id: 'sample_walmart_technical_001',
      sessionId,
      subject: '[SAMPLE - Walmart] App checkout fails with Error 500',
      sample: true,
      source: SAMPLE_SOURCE,
      status: 'escalated',
      createdAt: now - 1000 * 60 * 60 * 2,
      updatedAt: now - 1000 * 60 * 60,
      messages: [
        {
          role: 'user',
          content:
            'SAMPLE WALMART TICKET: The Walmart app shows Error 500 every time I try to refresh checkout, and my cart never updates.',
          timestamp: now - 1000 * 60 * 60 * 2,
        },
        {
          role: 'assistant',
          content:
            'I routed this as a technical issue. Error 500 was parsed as a backend sync failure and an engineering escalation ticket was created for checkout reliability review.',
          timestamp: now - 1000 * 60 * 60,
          routing: {
            intents: ['TECHNICAL'],
            primary: 'TECHNICAL',
            confidence: 0.91,
          },
        },
      ],
    },
    {
      id: 'sample_walmart_combined_001',
      sessionId,
      subject: '[SAMPLE - Walmart] Charged for Walmart+ but benefits missing',
      sample: true,
      source: SAMPLE_SOURCE,
      status: 'open',
      createdAt: now - 1000 * 60 * 30,
      updatedAt: now - 1000 * 60 * 20,
      messages: [
        {
          role: 'user',
          content:
            'SAMPLE WALMART TICKET: I was charged $49 for Walmart+ but my account still says I am not a member, and the benefits page throws Error 403.',
          timestamp: now - 1000 * 60 * 30,
        },
        {
          role: 'assistant',
          content:
            'I routed this as billing first, then technical. Payment status should be checked before the entitlement issue is escalated because Error 403 can indicate a stale membership cache.',
          timestamp: now - 1000 * 60 * 20,
          routing: {
            intents: ['BILLING', 'TECHNICAL'],
            primary: 'BILLING',
            confidence: 0.94,
          },
        },
      ],
    },
  ];
}
