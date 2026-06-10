package com.resolvepal.model;

public record TicketRequest(
    String sessionId,
    String customerId,
    String message
) {}