# Resolve Pal Project Guide

## 1. Project Purpose

Resolve Pal is a full-stack multi-agent customer support system. A customer submits a ticket, a Supervisor Agent classifies the ticket, and specialized agents handle billing or technical work.

The main idea is the Supervisor Multi-Agent Pattern:

```text
Customer ticket
  -> Supervisor Agent decides intent
  -> Billing Agent handles payment/refund/subscription issues
  -> Technical Agent handles bugs/errors/escalations
  -> Unified response returns to the customer
```

The project supports two operating modes:

- API Mode: the backend calls a cloud LLM such as Claude or OpenAI.
- Local Install Mode: the backend uses Ollama for local inference.

Synthetic Walmart sample tickets are included for demos. They are not real Walmart data. They are marked with `sample: true`, source `Walmart sample`, and a visible `Sample` badge in the dashboard.

## 2. Repository Map

```text
frontend/
  app/
    page.tsx
    dashboard/page.tsx
    layout.tsx
    globals.css
  components/
  lib/
    storage.ts
    sampleTickets.ts
  package.json
  tsconfig.json
  tailwind.config.ts

backend/
  pom.xml
  src/main/java/com/resolvepal/
    ResolvePalApplication.java
    agent/
    config/
    controller/
    model/
    service/
    tools/
  src/main/resources/
    application.yml
    prompts/supervisor-system.txt
  src/test/java/com/resolvepal/
```

## 3. End-to-End Flow

1. User opens `/dashboard`.
2. User submits a support ticket.
3. Frontend calls `POST /api/support/ticket`.
4. Backend validates `sessionId`, `customerId`, and `message`.
5. Backend selects an LLM provider from `?model=` or `X-LLM-Provider`.
6. Supervisor Agent returns a JSON `RoutingDecision`.
7. Billing Agent runs first if `BILLING` is present.
8. Technical Agent runs if `TECHNICAL` is present.
9. Backend returns `AgentResponse`.
10. Frontend saves the ticket in IndexedDB.

## 4. Backend Architecture

### Entry Point

`ResolvePalApplication.java` is the Spring Boot entry point. `SpringApplication.run(...)` starts the application, component scanning, dependency injection, and the embedded Tomcat server.

### Controller

`SupportController.java` owns:

- Route: `POST /api/support/ticket`
- Request validation
- LLM provider selection
- Supervisor routing
- Agent orchestration
- Structured error responses

Important controller behavior:

- Billing runs before Technical when both intents exist.
- Provider context is cleared in `finally`.
- Raw stack traces are not returned to the frontend.
- Supervisor output is defensively parsed by extracting the JSON object.

### Agents

`SupervisorAgent.java`
- LangChain4j `@AiService`.
- Uses `prompts/supervisor-system.txt`.
- Must output machine-parseable JSON.
- Does not call tools.

`BillingAgent.java`
- LangChain4j `@AiService(tools = "billingTools")`.
- Handles payments, charges, refunds, and subscription questions.

`TechnicalAgent.java`
- LangChain4j `@AiService(tools = "technicalTools")`.
- Handles app errors, dashboard bugs, sync failures, and escalation.

### Services

`BillingAgentService.java` and `TechnicalAgentService.java` wrap agent calls. This gives the controller a stable service layer and gives you a place to add retries, metrics, or fallback behavior later.

### Tools

Tools are Java methods exposed to the LLM.

`BillingTools.java`
- `checkPaymentStatus(customerId, amount)`
- `issueRefund(customerId, amount, reason)`

`TechnicalTools.java`
- `parseErrorLog(errorCode)`
- `createJiraTicket(summary, priority, errorCode)`

These are mock implementations. In production they would connect to payment gateways, billing systems, observability systems, and Jira.

## 5. Backend Data Models

`TicketRequest`

```java
public record TicketRequest(
    String sessionId,
    String customerId,
    String message
) {}
```

`RoutingDecision`

```java
public record RoutingDecision(
    List<String> intents,
    String primary,
    String rationale,
    double confidence
) {}
```

`AgentResponse`

```java
public record AgentResponse(
    String response,
    RoutingDecision routing,
    String sessionId
) {}
```

Records are used because these classes are immutable data carriers.

## 6. LLM Provider Integration

The backend supports:

- `claude`
- `openai`
- `ollama`

Provider selection:

- Query parameter: `?model=ollama`
- Header: `X-LLM-Provider: claude`
- Default: `LLM_PROVIDER` from `application.yml`

`LlmProviderFactory.java`:
- Normalizes provider names.
- Accepts `anthropic` as an alias for `claude`.
- Validates API keys.
- Lazily creates model clients.

`DynamicChatLanguageModel.java`:
- Is the single Spring `ChatLanguageModel` bean.
- Delegates each LangChain4j call to the current request provider.

`LlmProviderContext.java`:
- Uses `ThreadLocal` to hold request-specific provider selection.
- Must be cleared after each request.

Why this design matters:

- Spring can inject one `ChatLanguageModel`.
- Each request can still use a different provider.
- Ollama mode can boot without cloud API keys.
- Missing cloud keys are reported as clean 400 JSON errors.

## 7. AI Concepts Used

LLM:
- A Large Language Model generates text from prompts.

Agent:
- An LLM plus instructions and optional tools.

Supervisor Agent:
- Routes work.
- Does not solve tickets.
- Keeps orchestration predictable.

Tool Calling:
- The model can call Java methods annotated with `@Tool`.
- This lets the agent use external capabilities instead of only text generation.

System Prompt:
- High-priority instruction that defines an agent's behavior.
- Supervisor prompt forces strict JSON.

Intent Classification:
- The Supervisor labels tickets as `BILLING`, `TECHNICAL`, or both.

Confidence:
- The Supervisor returns a number from `0.0` to `1.0`.
- It represents how confident the model is in the route.

Prompt Hardening:
- The Supervisor prompt says "Output ONLY valid JSON."
- The backend still defensively extracts JSON because LLMs can be imperfect.

Local Inference:
- Ollama runs a local model.
- Useful for privacy, demos, and secure environments.

## 8. Java Concepts Used

Records:
- Immutable data classes.
- Used for request and response DTOs.

Constructor Injection:
- Dependencies are passed through constructors.
- Makes code testable and explicit.

Interfaces:
- Agents are Java interfaces.
- LangChain4j creates runtime implementations.

Annotations:
- `@RestController`, `@PostMapping`, `@RequestBody`, `@RequestParam`, `@RequestHeader`
- `@Service`, `@Component`, `@Configuration`, `@Bean`, `@Primary`
- `@AiService`, `@SystemMessage`, `@UserMessage`, `@Tool`

Exceptions:
- `LlmProviderException` represents provider configuration problems.
- Controller catches it and returns structured JSON.

ThreadLocal:
- Stores request provider for the current thread.
- Useful but must be cleaned up.

Switch Expressions:
- Used for provider creation and normalization.

Text Blocks:
- Multi-line Java strings.
- Used for prompts, JSON test fixtures, and mock tool responses.

Mockito:
- Used to mock agents/services in tests.
- Lets tests verify orchestration without real LLM calls.

## 9. Spring Boot Concepts Used

Dependency Injection:
- Spring creates objects and wires dependencies.

Bean:
- A managed object in the Spring container.

Component Scanning:
- Spring finds annotated classes under `com.resolvepal`.

Embedded Tomcat:
- The backend runs as a standalone web server.

Jackson:
- Converts JSON to Java records and Java records to JSON.

Configuration Properties:
- `application.yml` maps environment variables to app settings.

CORS:
- `@CrossOrigin(origins = "*")` supports local frontend/backend development.
- In production, restrict this to the frontend domain.

## 10. Frontend Architecture

Next.js App Router:
- `app/page.tsx` is the landing page.
- `app/dashboard/page.tsx` is the ticket dashboard.
- `app/layout.tsx` is the root layout.

React:
- Dashboard is a client component because it uses state, effects, browser storage, and form handlers.

Tailwind CSS:
- Utility-first styling.
- Custom colors live in `tailwind.config.ts`.

IndexedDB:
- Browser database for ticket history.
- Used through `frontend/lib/storage.ts`.

API Layer:
- `sendTicket(...)` posts to the backend.
- Backend URL comes from `NEXT_PUBLIC_API_URL`, defaulting to `http://localhost:8080`.

Sample Data:
- `frontend/lib/sampleTickets.ts` creates synthetic Walmart demo tickets.
- Dashboard button: `Load Walmart Samples`.

TypeScript Path Alias:
- `tsconfig.json` maps `@/*` to project root imports.
- This lets files import `@/lib/storage` and `@/components/Hero`.

## 11. Sample Tickets

The dashboard includes three Walmart sample scenarios:

Billing-only:
- Duplicate grocery pickup charge.
- Expected route: `BILLING`.

Technical-only:
- Walmart app checkout refresh fails with `Error 500`.
- Expected route: `TECHNICAL`.

Combined:
- Walmart+ charge succeeds, benefits missing, `Error 403`.
- Expected route: `BILLING`, then `TECHNICAL`.

These samples are for demos and tests only.

## 12. Testing

Backend:

```bash
cd backend
mvn test
```

Tests:
- Spring context loads in Ollama mode.
- Billing-only flow.
- Technical-only flow.
- Combined billing-first flow.
- Missing Claude key returns structured error.
- Blank ticket message returns structured error.

Frontend:

```bash
cd frontend
npm install
npm run build
```

The frontend build validates:
- TypeScript.
- Next.js compilation.
- App Router pages.
- Import aliases.

## 13. Deployment Summary

Local backend:

```bash
cd backend
mvn spring-boot:run
```

Local frontend:

```bash
cd frontend
npm run dev
```

Ollama mode:

```bash
ollama serve
ollama pull llama3
set LLM_PROVIDER=ollama
mvn spring-boot:run
```

Cloud mode:

```bash
set LLM_PROVIDER=claude
set ANTHROPIC_API_KEY=your_key
mvn spring-boot:run
```

Production:
- Build frontend with `npm run build`.
- Build backend with `mvn clean package`.
- Run backend jar from `backend/target`.
- Serve frontend through Next.js hosting, Vercel, or a Node server.

## 14. Interview Explanation

Short version:

Resolve Pal is a Java 21 and Next.js multi-agent support system. The frontend stores tickets locally in IndexedDB and calls a Spring Boot backend. The backend uses LangChain4j to run a Supervisor Agent that classifies tickets into billing or technical intents. It then delegates to specialized agents with tool access. The system supports Claude, OpenAI, and local Ollama through request-scoped provider selection.

Strong points to mention:
- Clean separation of routing and execution.
- Deterministic backend tests around nondeterministic LLM behavior.
- Request-scoped provider switching.
- Structured JSON error handling.
- Local inference support for privacy.
- Browser-local ticket persistence.

Tradeoffs to mention:
- Tools are mocked and should be replaced by real payment/Jira integrations.
- CORS is open for development and should be restricted.
- Next.js should be upgraded from pinned `14.2.0` before public production.
- Live LLM behavior still needs provider-specific prompt validation.

## 15. Commands Cheat Sheet

```bash
# Backend tests
cd backend
mvn test

# Backend run
mvn spring-boot:run

# Frontend install and build
cd ../frontend
npm install
npm run build

# Frontend dev
npm run dev
```

Example API call:

```bash
curl -X POST "http://localhost:8080/api/support/ticket?model=ollama" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"rp_demo","customerId":"cust_demo","message":"I was charged $49 but my dashboard throws Error 500."}'
```

## 16. Remaining Production Work

- Validate the full reference flow with a live LLM.
- Upgrade Next.js to a patched production-safe version.
- Restrict CORS.
- Add real payment and Jira integrations.
- Add real Dockerfiles and `docker-compose.yml` if container deployment is needed.
- Add authentication and rate limiting before exposing the API publicly.
