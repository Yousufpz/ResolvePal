package com.resolvepal.agent;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.spring.AiService;

@AiService
public interface SupervisorAgent {
    @SystemMessage(fromResource = "prompts/supervisor-system.txt")
    String route(@UserMessage String ticket);
}