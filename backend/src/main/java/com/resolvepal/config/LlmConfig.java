package com.resolvepal.config;

import dev.langchain4j.model.chat.ChatLanguageModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class LlmConfig {

    @Bean
    @Primary
    public ChatLanguageModel chatLanguageModel(LlmProviderFactory providerFactory) {
        return new DynamicChatLanguageModel(providerFactory);
    }
}
