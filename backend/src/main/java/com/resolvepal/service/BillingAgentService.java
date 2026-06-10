package com.resolvepal.service;

import com.resolvepal.agent.BillingAgent;
import com.resolvepal.model.TicketRequest;
import org.springframework.stereotype.Service;

@Service
public class BillingAgentService {
    private final BillingAgent agent;

    public BillingAgentService(BillingAgent agent) {
        this.agent = agent;
    }

    public String handle(String message, String customerId) {
        try {
            return agent.handle(message, customerId);
        } catch (Exception e) {
            return "{\"error\": \"Billing agent failed: " + e.getMessage() + "\"}";
        }
    }
}