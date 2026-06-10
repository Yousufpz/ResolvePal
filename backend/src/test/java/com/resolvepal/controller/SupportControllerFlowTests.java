package com.resolvepal.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resolvepal.agent.SupervisorAgent;
import com.resolvepal.config.LlmProviderFactory;
import com.resolvepal.model.AgentResponse;
import com.resolvepal.model.TicketRequest;
import com.resolvepal.service.BillingAgentService;
import com.resolvepal.service.TechnicalAgentService;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class SupportControllerFlowTests {

    private final SupervisorAgent supervisor = mock(SupervisorAgent.class);
    private final BillingAgentService billingService = mock(BillingAgentService.class);
    private final TechnicalAgentService technicalService = mock(TechnicalAgentService.class);
    private final LlmProviderFactory providerFactory =
            new LlmProviderFactory("ollama", "", "", "http://localhost:11434");
    private final SupportController controller = new SupportController(
            supervisor,
            billingService,
            technicalService,
            providerFactory,
            new ObjectMapper()
    );

    @Test
    void routesWalmartBillingSampleToBillingOnly() {
        TicketRequest request = new TicketRequest(
                "sample_session_001",
                "walmart_customer_001",
                "SAMPLE WALMART TICKET: My grocery pickup order was charged twice for $86.42."
        );
        when(supervisor.route(request.message())).thenReturn("""
                {
                  "intents": ["BILLING"],
                  "primary": "BILLING",
                  "rationale": "Duplicate card charge is a billing issue",
                  "confidence": 0.96
                }
                """);
        when(billingService.handle(request.message(), request.customerId()))
                .thenReturn("Billing sample resolved: duplicate charge refund initiated.");

        ResponseEntity<AgentResponse> response = controller.handleTicket(request, "ollama", null);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().response()).contains("refund initiated");
        assertThat(response.getBody().routing().primary()).isEqualTo("BILLING");
        verify(technicalService, never()).handle(
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.anyString()
        );
    }

    @Test
    void routesWalmartTechnicalSampleToTechnicalOnly() {
        TicketRequest request = new TicketRequest(
                "sample_session_002",
                "walmart_customer_002",
                "SAMPLE WALMART TICKET: The app checkout page shows Error 500 and cart refresh fails."
        );
        when(supervisor.route(request.message())).thenReturn("""
                {
                  "intents": ["TECHNICAL"],
                  "primary": "TECHNICAL",
                  "rationale": "Error 500 is a technical issue",
                  "confidence": 0.91
                }
                """);
        when(technicalService.handle(request.message(), "", request.customerId()))
                .thenReturn("Technical sample escalated: checkout Error 500 ticket created.");

        ResponseEntity<AgentResponse> response = controller.handleTicket(request, "ollama", null);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().response()).contains("Error 500");
        assertThat(response.getBody().routing().primary()).isEqualTo("TECHNICAL");
        verify(billingService, never()).handle(
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.anyString()
        );
    }

    @Test
    void routesWalmartCombinedSampleBillingBeforeTechnical() {
        TicketRequest request = new TicketRequest(
                "sample_session_003",
                "walmart_customer_003",
                "SAMPLE WALMART TICKET: I was charged $49 for Walmart+ but benefits show Error 403."
        );
        when(supervisor.route(request.message())).thenReturn("""
                {
                  "intents": ["BILLING", "TECHNICAL"],
                  "primary": "BILLING",
                  "rationale": "Payment and entitlement error require billing-first routing",
                  "confidence": 0.94
                }
                """);
        when(billingService.handle(request.message(), request.customerId()))
                .thenReturn("Billing context: $49 Walmart+ payment confirmed.");
        when(technicalService.handle(
                request.message(),
                "Billing context: $49 Walmart+ payment confirmed.",
                request.customerId()
        )).thenReturn("Technical sample escalated: entitlement Error 403 ticket created.");

        ResponseEntity<AgentResponse> response = controller.handleTicket(request, "ollama", null);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().routing().intents()).containsExactly("BILLING", "TECHNICAL");
        assertThat(response.getBody().response()).contains("Error 403");

        InOrder order = inOrder(billingService, technicalService);
        order.verify(billingService).handle(request.message(), request.customerId());
        order.verify(technicalService).handle(
                request.message(),
                "Billing context: $49 Walmart+ payment confirmed.",
                request.customerId()
        );
    }

    @Test
    void returnsStructuredProviderErrorWhenClaudeKeyIsMissing() {
        TicketRequest request = new TicketRequest(
                "sample_session_004",
                "walmart_customer_004",
                "SAMPLE WALMART TICKET: My card was charged and I need help."
        );

        ResponseEntity<AgentResponse> response = controller.handleTicket(request, "claude", null);

        assertThat(response.getStatusCode().is4xxClientError()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().response()).contains("ANTHROPIC_API_KEY");
        assertThat(response.getBody().routing().primary()).isEqualTo("ERROR");
        verifyNoInteractions(supervisor, billingService, technicalService);
    }

    @Test
    void returnsStructuredValidationErrorForMissingMessage() {
        TicketRequest request = new TicketRequest(
                "sample_session_005",
                "walmart_customer_005",
                " "
        );

        ResponseEntity<AgentResponse> response = controller.handleTicket(request, "ollama", null);

        assertThat(response.getStatusCode().is4xxClientError()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().response()).contains("Ticket message is required");
        assertThat(response.getBody().routing().primary()).isEqualTo("ERROR");
        verifyNoInteractions(supervisor, billingService, technicalService);
    }
}
