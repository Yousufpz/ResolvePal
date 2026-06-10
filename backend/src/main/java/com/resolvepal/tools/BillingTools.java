package com.resolvepal.tools;

import dev.langchain4j.agent.tool.Tool;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class BillingTools {

    @Tool("Checks the payment status for a customer and amount")
    public String checkPaymentStatus(String customerId, double amount) {
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