# claude.md — Resolve Pal System Initialization File

> **Project:** Resolve Pal  
> **Tagline:** Intelligent multi-agent routing. Unshakeable performance.  
> **Lead Engineer:** Mohd Yousuf Parvez  
> **Stack:** Next.js 14 (App Router) · Tailwind CSS · Java 21 · Spring Boot 3 · LangChain4j · Claude API · Ollama  
> **Purpose:** This file is the single source of truth for all AI-assisted code generation. When Claude reads this file, it must adopt the specialized engineering personas defined in Section 6 and execute each layer of the system with precision.

---

## 1. Project Overview

Resolve Pal is a customer support orchestration system built around a **Supervisor Multi-Agent Pattern**. It autonomously triages incoming support tickets and routes them to specialized sub-agents (Billing, Technical) based on detected intent.

The system is designed for **dual deployment modes**:
- **API Mode (Quick Start):** User supplies their own API key. All state (tickets, chat history) lives in the browser via `IndexedDB`/`localStorage`. Zero backend state.
- **Local Install (Maximum Security):** Full localized inference via Ollama. No data leaves the user's machine. Ideal for zero-trust enterprise environments.

**Claude is the strongly preferred model.** The architecture must treat `claude-sonnet-4-20250514` as the default while gracefully supporting OpenAI, Grok, Gemini, and Ollama-local models via a swappable bean injection pattern.

---

## 2. Repository Structure

```
resolve-pal/
├── frontend/                        # Next.js 14 App Router
│   ├── app/
│   │   ├── page.tsx                 # Landing page (hero, stack showcase, CTA)
│   │   ├── dashboard/
│   │   │   └── page.tsx             # Ticket dashboard (API mode)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── Hero.tsx
│   │   ├── ArchitectureDiagram.tsx
│   │   ├── DeploymentModes.tsx
│   │   ├── TechMarquee.tsx
│   │   ├── ContactCTA.tsx
│   │   └── TicketChat.tsx           # Chat + local storage integration
│   ├── lib/
│   │   └── storage.ts               # IndexedDB wrapper for tickets + history
│   └── tailwind.config.ts
│
└── backend/                         # Java 21 + Spring Boot 3 + LangChain4j
    ├── src/main/java/com/resolvepal/
    │   ├── ResolvePalApplication.java
    │   ├── config/
    │   │   └── LlmConfig.java       # Model bean injection (Claude / OpenAI / Ollama)
    │   ├── controller/
    │   │   └── SupportController.java
    │   ├── agent/
    │   │   ├── SupervisorAgent.java
    │   │   ├── BillingAgent.java
    │   │   └── TechnicalAgent.java
    │   ├── tools/
    │   │   ├── BillingTools.java
    │   │   └── TechnicalTools.java
    │   └── model/
    │       ├── TicketRequest.java
    │       └── AgentResponse.java
    └── pom.xml
```

---

## 3. Visual Identity & Frontend Specification

### 3.1 Design Language

The frontend communicates **stability, intelligence, and premium craftsmanship**. No generic SaaS templates. Every design decision is deliberate.

| Token | Value | Usage |
|---|---|---|
| `--color-bg-deep` | `#0A0E1A` | Page background, hero canvas |
| `--color-bg-surface` | `#111827` | Cards, panels, nav |
| `--color-bg-elevated` | `#1C2333` | Hover states, code blocks |
| `--color-gold-primary` | `#C9A84C` | CTAs, active borders, key metrics |
| `--color-gold-muted` | `#8A6E32` | Secondary accents, dividers |
| `--color-text-primary` | `#E8EAF0` | Headlines |
| `--color-text-secondary` | `#8892A4` | Body, labels |
| `--color-status-success` | `#22C55E` | Resolved tickets |
| `--color-status-warning` | `#EAB308` | Pending/escalated |
| `--color-status-error` | `#EF4444` | Error states |

**Typography:**
- Display / Hero: `Inter` (700–900 weight), tight tracking (`-0.03em`), uppercase eyebrows in `--color-gold-primary`
- Body: `Inter` (400–500 weight), relaxed line height (`1.7`)
- Monospace / Metrics / Logs: `JetBrains Mono`, used for agent output, routing decisions, and the architecture diagram data

**Signature Element:** A subtle animated "routing pulse" on the architecture diagram — a gold travelling dot that moves from the Supervisor node to sub-agent nodes on scroll entry. This is the one moment of personality; everything else stays disciplined.

---

### 3.2 Landing Page Structure

#### Hero Section
```
┌──────────────────────────────────────────────────────────┐
│  [BACKGROUND: Deep navy abstract node network — gold     │
│   glowing connections, floating system metrics, calm]    │
│                                                          │
│  EYEBROW (gold, mono, uppercase):                        │
│  MULTI-AGENT CUSTOMER SUPPORT · SUPERVISOR PATTERN       │
│                                                          │
│  H1 (white, 72px, tight tracking):                       │
│  Route Every Ticket.                                     │
│  Resolve With Precision.                                 │
│                                                          │
│  SUBTEXT (secondary, 18px):                              │
│  Resolve Pal orchestrates complex support requests       │
│  through an intelligent supervisor agent that triages,   │
│  delegates, and closes tickets — autonomously.           │
│                                                          │
│  [ Get Started — API Mode ] (gold CTA)                   │
│  [ View Architecture ↓ ] (ghost/outline)                │
└──────────────────────────────────────────────────────────┘
```

**Background asset:** Generate using the following Midjourney prompt:
> *"A highly detailed, abstract 3D render of a data orchestration network. Deep navy and charcoal background. Subtle, glowing gold nodes connecting to form a secure, intelligent routing matrix. Faint, elegant performance metrics and system logs floating in the background depth. Minimalist, premium, sacred, calm, tech-startup aesthetic, 8k resolution, cinematic lighting."*

Place the generated image as `frontend/public/hero-bg.webp` and apply it as a CSS `background-image` with `mix-blend-mode: luminosity` and 40% opacity over the `--color-bg-deep` base. This keeps text legible while preserving the atmosphere.

---

#### Tech Stack Showcase (Marquee)

A horizontally auto-scrolling marquee with the following logos/labels (no icons for now — clean pill badges):

```
Next.js 14   ·   React   ·   Tailwind CSS   ·   Java 21   ·   Spring Boot   ·   LangChain4j   ·   Claude API   ·   Ollama   ·   IndexedDB
```

Duplicate the set for seamless looping. Use CSS `@keyframes scroll-x` — no JS libraries.

---

#### Architecture: How It Works

Visual step diagram rendered in pure JSX/Tailwind. No external diagram libraries.

```
USER TICKET
    │
    ▼
┌─────────────────────────────┐
│      SUPERVISOR AGENT        │   ← Analyzes intent
│  "Billing? Technical? Both?" │     No tools — routing only
└──────────┬──────────────────┘
           │
     ┌─────┴──────┐
     ▼            ▼
┌─────────┐  ┌───────────┐
│ BILLING │  │ TECHNICAL │
│  AGENT  │  │   AGENT   │
│         │  │           │
│ ·Check  │  │ · Parse   │
│  payment│  │   logs    │
│  status │  │ · Create  │
│ ·Refund │  │   Jira    │
│  mock   │  │   ticket  │
└────┬────┘  └─────┬─────┘
     └──────┬──────┘
            ▼
    UNIFIED RESPONSE → USER
```

Animate with `IntersectionObserver` + Tailwind `transition` classes. Gold travelling dot (the signature element) pulses from Supervisor → sub-agents on scroll entry. Each node fades in sequentially with 150ms stagger.

Label each node with its Java class name in JetBrains Mono, small, muted: `SupervisorAgent.java`, `BillingAgent.java`, `TechnicalAgent.java`.

---

#### Deployment Modes Section

Two-column card layout:

| API Mode (Quick Start) | Local Install (Maximum Security) |
|---|---|
| Bring your own key | Zero cloud dependency |
| Claude (preferred), OpenAI, Grok, Gemini | Ollama — runs on your hardware |
| Ticket history in browser (IndexedDB) | Full local inference |
| Up in 30 seconds | Zero-trust enterprise ready |

Use a subtle gold left-border on the Claude-preferred option card to visually endorse it.

---

#### Enterprise CTA Block

Gold-accented full-width section. Use `border-l-4 border-[--color-gold-primary]` left rule on a dark elevated card.

**Exact copy (do not alter):**

```
Enterprise Integration & Local Deployment

Interested in adapting this multi-agent architecture for your business?
With over 2.5 years of dedicated engineering experience in backend
development and performance optimization, I can help you implement
this securely.

Contact me, Mohd Yousuf Parvez, for utilizing this system in
production or setting up a private, localized LLM environment on
your own hardware.

[ Contact ]  ← gold filled button, mailto: or contact form
```

---

## 4. Backend Architecture

### 4.1 Model Configuration (`LlmConfig.java`)

The backend must expose a `ChatLanguageModel` bean that is **runtime-swappable** based on a request header or query param (`?model=claude|openai|ollama`).

```java
@Configuration
public class LlmConfig {

    @Value("${llm.provider:claude}")
    private String provider;

    @Bean
    @Primary
    public ChatLanguageModel chatLanguageModel(
        @Value("${anthropic.api.key:}") String anthropicKey,
        @Value("${openai.api.key:}") String openaiKey,
        @Value("${ollama.base.url:http://localhost:11434}") String ollamaUrl
    ) {
        return switch (provider) {
            case "openai" -> OpenAiChatModel.builder()
                .apiKey(openaiKey)
                .modelName("gpt-4o")
                .build();
            case "ollama" -> OllamaChatModel.builder()
                .baseUrl(ollamaUrl)
                .modelName("llama3")
                .build();
            default -> AnthropicChatModel.builder()  // Claude — always the default
                .apiKey(anthropicKey)
                .modelName("claude-sonnet-4-20250514")
                .logRequests(true)
                .logResponses(true)
                .build();
        };
    }
}
```

**`application.yml`:**

```yaml
llm:
  provider: ${LLM_PROVIDER:claude}  # Override via env var

anthropic:
  api:
    key: ${ANTHROPIC_API_KEY:}

openai:
  api:
    key: ${OPENAI_API_KEY:}

ollama:
  base:
    url: ${OLLAMA_BASE_URL:http://localhost:11434}
```

---

### 4.2 Supervisor Agent

The Supervisor has **no tools**. Its sole purpose is intent classification and routing. It must output a strictly machine-parseable decision.

**System Prompt:**

```
You are the Resolve Pal Supervisor Agent. Your ONLY job is to analyze the incoming customer support ticket and output a routing decision in strict JSON format. You do not resolve issues yourself.

Analyze the ticket for the following intents:
- BILLING: Payment issues, charges, refunds, subscription problems
- TECHNICAL: Errors, bugs, crashes, dashboard issues, sync problems
- GENERAL: Account questions, feature inquiries (route to TECHNICAL as default)

Output ONLY valid JSON, no preamble, no explanation:
{
  "intents": ["BILLING", "TECHNICAL"],
  "primary": "BILLING",
  "rationale": "Payment charge confirmed but dashboard sync failure suggests billing-first resolution path",
  "confidence": 0.94
}

Rules:
1. If both BILLING and TECHNICAL intents are detected, primary is always BILLING.
2. Confidence must be a float 0.0–1.0.
3. Never output anything outside the JSON block.
```

**Java Interface:**

```java
@AiService
public interface SupervisorAgent {
    @SystemMessage(fromResource = "prompts/supervisor-system.txt")
    String route(@UserMessage String ticket);
}
```

---

### 4.3 Billing Agent

**System Prompt:**

```
You are the Resolve Pal Billing Agent. You have access to the following tools:
- checkPaymentStatus(customerId, amount): Returns payment confirmation details
- issueRefund(customerId, amount, reason): Initiates a mock refund

Always confirm payment status before any other action. Be factual and concise.
After completing billing resolution, output a structured summary that the Technical Agent can receive as context.
```

**Tools (`BillingTools.java`):**

```java
@Component
public class BillingTools {

    @Tool("Checks the payment status for a customer and amount")
    public String checkPaymentStatus(String customerId, double amount) {
        // Mock implementation — replace with real payment gateway in production
        return String.format("""
            {
              "status": "SUCCESS",
              "customerId": "%s",
              "amount": %.2f,
              "currency": "USD",
              "transactionId": "TXN_%s",
              "timestamp": "%s"
            }
            """, customerId, amount, UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                LocalDateTime.now().toString());
    }

    @Tool("Issues a refund for a customer")
    public String issueRefund(String customerId, double amount, String reason) {
        return String.format("""
            {
              "refundStatus": "INITIATED",
              "customerId": "%s",
              "refundAmount": %.2f,
              "reason": "%s",
              "eta": "3-5 business days"
            }
            """, customerId, amount, reason);
    }
}
```

---

### 4.4 Technical Agent

**System Prompt:**

```
You are the Resolve Pal Technical Agent. You receive a context summary from the Billing Agent (if routing was sequential) plus the original customer ticket.

You have access to the following tools:
- createJiraTicket(summary, priority, errorCode): Creates a mock Jira escalation ticket
- parseErrorLog(errorCode): Returns known root cause and recommended action for a given error code

Use these tools to investigate and escalate. Your final response to the customer must:
1. Acknowledge the technical issue specifically (include error code if present)
2. State what action has been taken (Jira ticket created, escalated to engineering)
3. Provide an honest ETA if possible
4. Be concise — no more than 4 sentences.
```

**Tools (`TechnicalTools.java`):**

```java
@Component
public class TechnicalTools {

    @Tool("Creates a Jira ticket for engineering escalation")
    public String createJiraTicket(String summary, String priority, String errorCode) {
        String ticketId = "TECH-" + (1000 + (int)(Math.random() * 9000));
        return String.format("""
            {
              "ticketId": "%s",
              "summary": "%s",
              "priority": "%s",
              "errorCode": "%s",
              "status": "CREATED",
              "assignedTeam": "Platform Engineering",
              "url": "https://jira.internal/browse/%s"
            }
            """, ticketId, summary, priority, errorCode, ticketId);
    }

    @Tool("Returns root cause analysis for a known error code")
    public String parseErrorLog(String errorCode) {
        Map<String, String> knownErrors = Map.of(
            "500", "Internal Server Error — likely a database sync failure post-subscription update. Check subscription_sync_jobs table.",
            "403", "Forbidden — entitlement cache may not have refreshed after plan upgrade.",
            "404", "Resource not found — user dashboard resource reference may be stale."
        );
        return knownErrors.getOrDefault(errorCode,
            "Unknown error code. Manual investigation required.");
    }
}
```

---

### 4.5 Orchestration Controller

```java
@RestController
@RequestMapping("/api/support")
@CrossOrigin(origins = "*")
public class SupportController {

    private final SupervisorAgent supervisor;
    private final BillingAgentService billingService;
    private final TechnicalAgentService technicalService;
    private final ObjectMapper mapper;

    @PostMapping("/ticket")
    public ResponseEntity<AgentResponse> handleTicket(@RequestBody TicketRequest request) {
        // Step 1: Supervisor routes
        String routingJson = supervisor.route(request.getMessage());
        RoutingDecision decision = mapper.readValue(routingJson, RoutingDecision.class);

        String billingContext = "";
        String finalResponse = "";

        // Step 2: Execute agents in priority order
        if (decision.getIntents().contains("BILLING")) {
            billingContext = billingService.handle(request.getMessage(), request.getCustomerId());
        }

        if (decision.getIntents().contains("TECHNICAL")) {
            finalResponse = technicalService.handle(
                request.getMessage(),
                billingContext,
                request.getCustomerId()
            );
        } else {
            finalResponse = billingContext;
        }

        return ResponseEntity.ok(AgentResponse.builder()
            .response(finalResponse)
            .routing(decision)
            .sessionId(request.getSessionId())
            .build());
    }
}
```

---

## 5. Frontend: Browser Storage Layer

All ticket state, chat history, and session metadata for API Mode users is stored entirely in `IndexedDB`. No server-side state.

**`frontend/lib/storage.ts`:**

```typescript
const DB_NAME = 'resolve-pal-db';
const DB_VERSION = 1;

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
  createdAt: number;
  updatedAt: number;
}

// Initialize DB
export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('tickets')) {
        const store = db.createObjectStore('tickets', { keyPath: 'id' });
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
    const tx = db.transaction('tickets', 'readwrite');
    tx.objectStore('tickets').put(ticket);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getTickets(): Promise<Ticket[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tickets', 'readonly');
    const req = tx.objectStore('tickets').getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function generateSessionId(): string {
  return `rp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
```

---

## 6. Reference Ticket Flow (Implementation Baseline)

> All agents must be validated against this exact scenario before any other testing.

**Incoming Ticket:**
> "I tried to upgrade to the Pro tier. My card was charged $49, but my dashboard still says I am on the free plan and throws an 'Error 500' when I click refresh."

| Step | Actor | Action | Output |
|---|---|---|---|
| 1 | Frontend | Fetches history from IndexedDB, appends user message, `POST /api/support/ticket` | Request payload with `sessionId`, `customerId`, `message` |
| 2 | Supervisor | Detects intents: `["BILLING", "TECHNICAL"]`, primary: `BILLING` | JSON routing decision |
| 3 | Billing Agent | Calls `checkPaymentStatus(customerId, 49.00)` | `"status": "SUCCESS", "amount": 49.00` |
| 4 | Technical Agent | Receives billing context, calls `parseErrorLog("500")` + `createJiraTicket(...)` | Jira ticket TECH-xxxx created |
| 5 | Controller | Assembles `AgentResponse`, returns to frontend | Final message + routing metadata |
| 6 | Frontend | Appends assistant message to IndexedDB, renders response | Chat updated in browser |

**Expected Final Response to User:**
> "I can confirm your payment of $49 was successfully processed (Transaction ID: TXN-XXXXXXXX). We are currently experiencing a dashboard synchronization error (Error 500) following your plan upgrade — this is a known post-upgrade sync issue. I have escalated this to our Platform Engineering team (Ticket: TECH-XXXX), and your Pro features will be unlocked within the next few hours."

---

## 7. Engineering Personas

When generating code from this file, Claude must operate through the following three lenses simultaneously:

### The AI / SRE Engineer
- Own all LLM configuration: `LlmConfig.java`, system prompts, model selection logic.
- Ensure model fallback is graceful (if no key is provided for the selected model, return a `400` with a clear message).
- Write prompts that are deterministic, parseable, and hardened against hallucination.
- Flag any prompt that could produce non-JSON output from the Supervisor.

### The Java Backend Developer
- Own all Spring Boot classes: controllers, services, agent interfaces, tool registrations.
- Follow Java 21 idioms: records for DTOs, switch expressions, text blocks for system prompts.
- All agents must be `@AiService`-annotated LangChain4j interfaces — no raw API calls in service classes.
- Error handling: every agent call wrapped in try/catch with structured error response.

### The Next.js Frontend Architect
- Own all React components, Tailwind styling, and IndexedDB integration.
- No `localStorage` for message history — use `IndexedDB` exclusively (handles larger payloads).
- The hero background image must load as `priority` in `next/image` with correct aspect ratio.
- The architecture diagram must be pure JSX — no Mermaid, no external diagram libraries.
- The routing animation (gold travelling dot) must respect `prefers-reduced-motion`.
- The contact CTA section must use the exact copy from Section 3.2 — no paraphrasing.

---

## 8. Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `LLM_PROVIDER` | No | `claude` | Model provider: `claude`, `openai`, `ollama` |
| `ANTHROPIC_API_KEY` | If Claude | — | Anthropic API key |
| `OPENAI_API_KEY` | If OpenAI | — | OpenAI API key |
| `OLLAMA_BASE_URL` | If Ollama | `http://localhost:11434` | Ollama server URL |
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:8080` | Backend URL for frontend |

---

## 9. Definition of Done

- [ ] Landing page renders correctly on mobile (375px) and desktop (1440px)
- [ ] Hero background image displays with correct overlay opacity
- [ ] Tech marquee scrolls smoothly, loops seamlessly
- [ ] Architecture diagram animates on scroll with gold routing pulse
- [ ] Deployment modes section renders as two-column card layout
- [ ] CTA block contains exact specified copy, no modifications
- [x] Backend compiles and Spring context loads with `LLM_PROVIDER=ollama` without cloud API keys
- [x] `POST /api/support/ticket` supports runtime provider selection through `?model=` and `X-LLM-Provider`
- [x] Missing provider API keys return structured JSON errors instead of raw stack traces
- [x] Synthetic Walmart sample tickets are marked as samples in frontend data and UI
- [x] Billing-only, technical-only, combined, provider-error, and validation-error flows are covered by backend tests
- [x] Frontend production build succeeds with TypeScript path aliases configured
- [ ] `POST /api/support/ticket` returns structured `AgentResponse` for the reference ticket against a live LLM
- [ ] Supervisor outputs valid JSON routing decision for all test cases
- [ ] Billing and Technical agents call their respective tools correctly against a live LLM
- [ ] IndexedDB storage persists tickets across page refreshes
- [x] `LLM_PROVIDER=ollama` boots without requiring any cloud API key
- [x] Controller validation and provider errors return structured JSON (no raw stack traces to frontend)

---

*End of system initialization file. All code generation must conform to the specifications above.*
