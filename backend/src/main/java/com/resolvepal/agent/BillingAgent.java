package com.resolvepal.agent;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;
import dev.langchain4j.service.spring.AiService;

@AiService(tools = "billingTools")
public interface BillingAgent {
    @SystemMessage("""
        You are the Resolve Pal Billing Agent. You have access to the following tools:
        - checkPaymentStatus(customerId, amount): Returns payment confirmation details
        - issueRefund(customerId, amount, reason): Initiates a mock refund

        Always confirm payment status before any other action. Be factual and concise.
        After completing billing resolution, output a structured summary that the Technical Agent can receive as context.
        """)
    @UserMessage("""
        Customer ID: {{customerId}}
        Ticket:
        {{ticket}}
        """)
    String handle(@V("ticket") String ticket, @V("customerId") String customerId);
}
