# Resolve Pal Deployment Guide

This guide covers local development, local AI deployment through Ollama, cloud-provider API mode, and production packaging for the current Resolve Pal codebase.

## Current Verified Commands

From the repository root:

```powershell
# Backend verification
cd backend
mvn test

# Frontend verification
cd ..\frontend
npm install
npm run build
```

Verified on 2026-06-10:
- Backend: `mvn test` passes with 6 tests covering Spring context startup and all core controller flows.
- Frontend: `npm run build` passes after installing dependencies.
- Dashboard includes synthetic Walmart sample tickets marked with `sample: true` and visible `Sample` labels.

Note: `npm install` currently reports audit findings and a security deprecation warning for pinned `next@14.2.0`. Before public production deployment, upgrade Next.js to a patched 14.x release or newer and rerun the frontend build.

## Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Node.js | 18.x or higher | Frontend runtime |
| npm / yarn | Latest | Package management |
| Java | 21 | Backend runtime |
| Maven | 3.8+ | Java dependency management |
| Ollama (optional) | Latest | Local LLM inference |

---

## Step 1: Repository Setup

```bash
# Clone the repository
git clone <repository-url>
cd resolve-pal

# Create directory structure
mkdir -p frontend/public
mkdir -p frontend/app/dashboard
mkdir -p frontend/components
mkdir -p frontend/lib
mkdir -p backend/src/main/java/com/resolvepal/config
mkdir -p backend/src/main/java/com/resolvepal/controller
mkdir -p backend/src/main/java/com/resolvepal/agent
mkdir -p backend/src/main/java/com/resolvepal/tools
mkdir -p backend/src/main/java/com/resolvepal/model
mkdir -p backend/src/main/resources
```

---

## Step 2: Environment Configuration

### Backend Environment Variables (.env or system env)

```bash
# Set LLM provider (claude, openai, or ollama)
export LLM_PROVIDER=claude

# For Claude API
export ANTHROPIC_API_KEY=your_anthropic_api_key_here

# For OpenAI API (alternative)
export OPENAI_API_KEY=your_openai_api_key_here

# For Ollama (local)
export OLLAMA_BASE_URL=http://localhost:11434
```

### Frontend Environment Variables (.env.local)

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## Step 3: Frontend Setup (Next.js 14)

```bash
cd frontend

# Install dependencies
npm install next@14 react@18 react-dom@18 typescript @types/react @types/node

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install additional dependencies
npm install @heroicons/react

# Generate hero background (see CLAUDE.md for Midjourney prompt)
# Place at: frontend/public/hero-bg.webp
```

### Frontend Package.json

```json
{
  "name": "resolve-pal-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "@heroicons/react": "^2.x"
  }
}
```

### Run Frontend Development Server

```bash
cd frontend
npm install @heroicons/react
# Server starts at http://localhost:3000
```

---

## Step 4: Backend Setup (Spring Boot 3)

```bash
cd backend

# Verify Maven wrapper exists
ls mvnw

# Start Spring Boot application
./mvnw spring-boot:run

# Or with Maven directly
mvn spring-boot:run

# Server starts at http://localhost:8080
```

### Application Properties (backend/src/main/resources/application.yml)

```yaml
server:
  port: 8080

llm:
  provider: ${LLM_PROVIDER:claude}

anthropic:
  api:
    key: ${ANTHROPIC_API_KEY:}

openai:
  api:
    key: ${OPENAI_API_KEY:}

ollama:
  base:
    url: ${OLLAMA_BASE_URL:http://localhost:11434}

spring:
  application:
    name: resolve-pal
```

### Application Properties for Local Install

```bash
# For Ollama mode (no API key needed)
export LLM_PROVIDER=ollama
./mvnw spring-boot:run
```

---

## Step 5: Build for Production

### Frontend Production Build

```bash
cd frontend
npm run build
npm run start
```

### Backend Production Build

```bash
cd backend
./mvnw clean package
java -jar target/resolve-pal-*.jar
```

---

## Step 6: Verification Steps

### Test the Reference Ticket Flow

1. Start both frontend and backend servers
2. Open browser to `http://localhost:3000`
3. Navigate to `/dashboard`
4. Click `Load Walmart Samples` to seed synthetic sample tickets into IndexedDB
5. Submit the reference ticket:
   > "I tried to upgrade to the Pro tier. My card was charged $49, but my dashboard still says I am on the free plan and throws an 'Error 500' when I click refresh."

### Expected Response Verification

The response should contain:
- Payment confirmation with transaction ID
- Error 500 acknowledgment
- Jira ticket number (TECH-xxxx)
- ETA for resolution

### Test API Endpoint

```bash
curl -X POST http://localhost:8080/api/support/ticket \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test_123","customerId":"cust_001","message":"Test ticket message"}'
```

### Select LLM Provider Per Request

Use either the `model` query parameter or `X-LLM-Provider` header:

```bash
curl -X POST "http://localhost:8080/api/support/ticket?model=ollama" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test_123","customerId":"cust_001","message":"My dashboard shows Error 500"}'

curl -X POST http://localhost:8080/api/support/ticket \
  -H "Content-Type: application/json" \
  -H "X-LLM-Provider: claude" \
  -d '{"sessionId":"test_123","customerId":"cust_001","message":"My card was charged $49"}'
```

Supported values: `claude`, `openai`, `ollama`. `anthropic` is accepted as an alias for `claude`.

If `model=claude` is selected, `ANTHROPIC_API_KEY` must be set. If `model=openai` is selected, `OPENAI_API_KEY` must be set. `model=ollama` does not require a cloud API key, but Ollama must be running for agent calls.

### Verify Ollama Mode

```bash
# Ensure Ollama is running
ollama serve

# Pull required model
ollama pull llama3

# Start backend in Ollama mode
export LLM_PROVIDER=ollama
./mvnw spring-boot:run
```

### Verified Backend Flow Tests

The backend test suite includes deterministic controller tests for these flows:

| Flow | Sample scenario | Expected routing |
|------|-----------------|------------------|
| Billing-only | Walmart grocery pickup duplicate charge | `BILLING` only |
| Technical-only | Walmart app checkout `Error 500` | `TECHNICAL` only |
| Combined | Walmart+ charge succeeds but benefits throw `Error 403` | `BILLING`, then `TECHNICAL` |
| Provider error | `model=claude` without `ANTHROPIC_API_KEY` | Structured 400 JSON |
| Validation error | Blank message | Structured 400 JSON |

Run:

```bash
cd backend
mvn test
```

---

## Step 7: Docker Deployment (Optional)

### Backend Dockerfile

```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY backend/pom.xml .
COPY backend/src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Frontend Dockerfile

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm install next
EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8080
      
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - "8080:8080"
    environment:
      - LLM_PROVIDER=claude
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
```

---

## Step 8: Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `ANTHROPIC_API_KEY` not set | Set environment variable before starting backend |
| Port 8080 in use | Change port in application.yml |
| CORS errors | Backend allows all origins via `@CrossOrigin(origins = "*")` |
| IndexedDB not available | Ensure browser supports IndexedDB (all modern browsers) |
| Ollama connection refused | Run `ollama serve` first, ensure URL is correct |

---

## Step 9: Success Criteria Checklist

- [x] Frontend production build succeeds
- [x] Backend tests pass
- [x] Backend compiles and Spring context loads in Ollama mode
- [x] POST /api/support/ticket returns structured AgentResponse shape
- [x] Runtime provider selection supports `?model=` and `X-LLM-Provider`
- [x] Missing cloud API keys return structured JSON errors
- [x] Walmart sample tickets are available in the dashboard and marked as samples
- [x] Billing-only, technical-only, combined, provider-error, and validation-error flows are covered by tests
- [ ] Supervisor outputs valid JSON routing decision against live LLM
- [ ] Billing agent calls checkPaymentStatus tool against live LLM
- [ ] Technical agent calls parseErrorLog and createJiraTicket tools against live LLM
- [ ] IndexedDB stores and retrieves tickets
- [ ] Reference ticket produces expected response format
