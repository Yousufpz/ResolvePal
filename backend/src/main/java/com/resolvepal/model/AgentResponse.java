package com.resolvepal.model;

import java.util.List;

public record AgentResponse(
    String response,
    RoutingDecision routing,
    String sessionId
) {
    public static AgentResponse error(String message, String sessionId) {
        return new AgentResponse(
            message,
            new RoutingDecision(List.of("ERROR"), "ERROR", "Processing error", 0.0),
            sessionId
        );
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String response = "";
        private RoutingDecision routing = new RoutingDecision(List.of(), "", "", 0.0);
        private String sessionId = "";

        public Builder response(String response) {
            this.response = response;
            return this;
        }

        public Builder routing(RoutingDecision routing) {
            this.routing = routing;
            return this;
        }

        public Builder sessionId(String sessionId) {
            this.sessionId = sessionId;
            return this;
        }

        public AgentResponse build() {
            return new AgentResponse(response, routing, sessionId);
        }
    }
}
