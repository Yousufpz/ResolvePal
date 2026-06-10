package com.resolvepal.controller;

import com.resolvepal.agent.SupervisorAgent;
import com.resolvepal.config.LlmProviderContext;
import com.resolvepal.config.LlmProviderException;
import com.resolvepal.config.LlmProviderFactory;
import com.resolvepal.model.AgentResponse;
import com.resolvepal.model.RoutingDecision;
import com.resolvepal.model.TicketRequest;
import com.resolvepal.service.BillingAgentService;
import com.resolvepal.service.TechnicalAgentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/support")
@CrossOrigin(origins = "*")
public class SupportController {

    private final SupervisorAgent supervisor;
    private final BillingAgentService billingService;
    private final TechnicalAgentService technicalService;
    private final LlmProviderFactory providerFactory;
    private final ObjectMapper mapper;

    public SupportController(SupervisorAgent supervisor,
                           BillingAgentService billingService,
                           TechnicalAgentService technicalService,
                           LlmProviderFactory providerFactory,
                           ObjectMapper mapper) {
        this.supervisor = supervisor;
        this.billingService = billingService;
        this.technicalService = technicalService;
        this.providerFactory = providerFactory;
        this.mapper = mapper;
    }

    @PostMapping("/ticket")
    public ResponseEntity<AgentResponse> handleTicket(
            @RequestBody TicketRequest request,
            @RequestParam(value = "model", required = false) String model,
            @RequestHeader(value = "X-LLM-Provider", required = false) String providerHeader
    ) {
        try {
            validateRequest(request);
            String provider = selectProvider(model, providerHeader);
            providerFactory.validateProvider(provider);
            LlmProviderContext.set(provider);

            // Step 1: Supervisor routes
            String routingJson = supervisor.route(request.message());
            RoutingDecision decision = parseRoutingDecision(routingJson);

            String billingContext = "";
            String finalResponse = "";

            // Step 2: Execute agents in priority order
            if (decision.intents().contains("BILLING")) {
                billingContext = billingService.handle(request.message(), request.customerId());
            }

            if (decision.intents().contains("TECHNICAL")) {
                finalResponse = technicalService.handle(
                    request.message(),
                    billingContext,
                    request.customerId()
                );
            } else {
                finalResponse = billingContext;
            }

            return ResponseEntity.ok(AgentResponse.builder()
                .response(finalResponse)
                .routing(decision)
                .sessionId(request.sessionId())
                .build());
        } catch (LlmProviderException e) {
            return ResponseEntity.badRequest().body(AgentResponse.error(e.getMessage(), safeSessionId(request)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(AgentResponse.error(
                "Unable to process ticket: " + e.getMessage(),
                safeSessionId(request)
            ));
        } finally {
            LlmProviderContext.clear();
        }
    }

    private String selectProvider(String model, String providerHeader) {
        if (model != null && !model.isBlank()) {
            return providerFactory.normalize(model);
        }
        if (providerHeader != null && !providerHeader.isBlank()) {
            return providerFactory.normalize(providerHeader);
        }
        return providerFactory.defaultProvider();
    }

    private RoutingDecision parseRoutingDecision(String routingJson) throws Exception {
        String json = extractJsonObject(routingJson);
        RoutingDecision decision = mapper.readValue(json, RoutingDecision.class);
        if (decision.intents() == null || decision.intents().isEmpty()) {
            throw new IllegalArgumentException("Supervisor returned no routing intents");
        }
        if (decision.primary() == null || decision.primary().isBlank()) {
            throw new IllegalArgumentException("Supervisor returned no primary intent");
        }
        return decision;
    }

    private String extractJsonObject(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Supervisor returned an empty routing decision");
        }
        int start = raw.indexOf('{');
        int end = raw.lastIndexOf('}');
        if (start < 0 || end <= start) {
            throw new IllegalArgumentException("Supervisor returned non-JSON routing decision");
        }
        return raw.substring(start, end + 1);
    }

    private void validateRequest(TicketRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (request.message() == null || request.message().isBlank()) {
            throw new IllegalArgumentException("Ticket message is required");
        }
        if (request.customerId() == null || request.customerId().isBlank()) {
            throw new IllegalArgumentException("customerId is required");
        }
        if (request.sessionId() == null || request.sessionId().isBlank()) {
            throw new IllegalArgumentException("sessionId is required");
        }
    }

    private String safeSessionId(TicketRequest request) {
        return request == null ? "" : request.sessionId();
    }
}
