package com.resolvepal.tools;

import dev.langchain4j.agent.tool.Tool;
import org.springframework.stereotype.Component;

import java.util.Map;

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