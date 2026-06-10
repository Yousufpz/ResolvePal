package com.resolvepal.model;

import java.util.List;

public record RoutingDecision(
    List<String> intents,
    String primary,
    String rationale,
    double confidence
) {}