package com.resolvepal.config;

import dev.langchain4j.model.anthropic.AnthropicChatModel;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LlmProviderFactory {
    private final String defaultProvider;
    private final String anthropicKey;
    private final String openaiKey;
    private final String ollamaUrl;
    private final Map<String, ChatLanguageModel> modelCache = new ConcurrentHashMap<>();

    public LlmProviderFactory(
            @Value("${llm.provider:claude}") String defaultProvider,
            @Value("${anthropic.api.key:}") String anthropicKey,
            @Value("${openai.api.key:}") String openaiKey,
            @Value("${ollama.base.url:http://localhost:11434}") String ollamaUrl
    ) {
        this.defaultProvider = normalize(defaultProvider);
        this.anthropicKey = anthropicKey;
        this.openaiKey = openaiKey;
        this.ollamaUrl = ollamaUrl;
    }

    public String defaultProvider() {
        return defaultProvider;
    }

    public String normalize(String provider) {
        if (provider == null || provider.isBlank()) {
            return "claude";
        }
        String normalized = provider.trim().toLowerCase();
        return switch (normalized) {
            case "anthropic" -> "claude";
            case "claude", "openai", "ollama" -> normalized;
            default -> throw new LlmProviderException("Unsupported LLM provider: " + provider);
        };
    }

    public void validateProvider(String provider) {
        String normalized = normalize(provider);
        if ("claude".equals(normalized) && isBlank(anthropicKey)) {
            throw new LlmProviderException("ANTHROPIC_API_KEY is required when model=claude");
        }
        if ("openai".equals(normalized) && isBlank(openaiKey)) {
            throw new LlmProviderException("OPENAI_API_KEY is required when model=openai");
        }
    }

    public ChatLanguageModel currentModel() {
        String provider = LlmProviderContext.get();
        return modelFor(provider == null ? defaultProvider : provider);
    }

    private ChatLanguageModel modelFor(String provider) {
        String normalized = normalize(provider);
        validateProvider(normalized);
        return modelCache.computeIfAbsent(normalized, this::createModel);
    }

    private ChatLanguageModel createModel(String provider) {
        return switch (provider) {
            case "openai" -> OpenAiChatModel.builder()
                    .apiKey(openaiKey)
                    .modelName("gpt-4o")
                    .build();
            case "ollama" -> OllamaChatModel.builder()
                    .baseUrl(ollamaUrl)
                    .modelName("llama3")
                    .build();
            default -> AnthropicChatModel.builder()
                    .apiKey(anthropicKey)
                    .modelName("claude-sonnet-4-20250514")
                    .logRequests(true)
                    .logResponses(true)
                    .build();
        };
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
