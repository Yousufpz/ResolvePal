package com.resolvepal.config;

import dev.langchain4j.agent.tool.ToolSpecification;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.output.Response;

import java.util.List;

public class DynamicChatLanguageModel implements ChatLanguageModel {
    private final LlmProviderFactory providerFactory;

    public DynamicChatLanguageModel(LlmProviderFactory providerFactory) {
        this.providerFactory = providerFactory;
    }

    @Override
    public Response<AiMessage> generate(List<ChatMessage> messages) {
        return providerFactory.currentModel().generate(messages);
    }

    @Override
    public Response<AiMessage> generate(List<ChatMessage> messages, List<ToolSpecification> toolSpecifications) {
        return providerFactory.currentModel().generate(messages, toolSpecifications);
    }

    @Override
    public Response<AiMessage> generate(List<ChatMessage> messages, ToolSpecification toolSpecification) {
        return providerFactory.currentModel().generate(messages, toolSpecification);
    }
}
