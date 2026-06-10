package com.resolvepal.service;

import com.resolvepal.agent.TechnicalAgent;
import org.springframework.stereotype.Service;

@Service
public class TechnicalAgentService {
    private final TechnicalAgent agent;

    public TechnicalAgentService(TechnicalAgent agent) {
        this.agent = agent;
    }

    public String handle(String message, String billingContext, String customerId) {
        try {
            return agent.handle(message, billingContext, customerId);
        } catch (Exception e) {
            return "I have identified a technical issue with your account. I have escalated this to our Platform Engineering team. An engineer will investigate and respond within 24 hours. Error reference: " + e.getMessage();
        }
    }
}