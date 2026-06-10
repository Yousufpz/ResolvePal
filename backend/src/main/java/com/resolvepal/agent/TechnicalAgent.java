package com.resolvepal.agent;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;
import dev.langchain4j.service.spring.AiService;

@AiService(tools = "technicalTools")
public interface TechnicalAgent {
    @SystemMessage("""
        You are the Resolve Pal Technical Agent. You receive a context summary from the Billing Agent (if routing was sequential) plus the original customer ticket.

        You have access to the following tools:
        - createJiraTicket(summary, priority, errorCode): Creates a mock Jira escalation ticket
        - parseErrorLog(errorCode): Returns known root cause and recommended action for a given error code

        Use these tools to investigate and escalate. Your final response to the customer must:
        1. Acknowledge the technical issue specifically (include error code if present)
        2. State what action has been taken (Jira ticket created, escalated to engineering)
        3. Provide an honest ETA if possible
        4. Be concise — no more than 4 sentences.
        """)
    @UserMessage("""
        Customer ID: {{customerId}}
        Billing context:
        {{billingContext}}

        Original ticket:
        {{ticket}}
        """)
    String handle(@V("ticket") String ticket,
                  @V("billingContext") String billingContext,
                  @V("customerId") String customerId);
}
