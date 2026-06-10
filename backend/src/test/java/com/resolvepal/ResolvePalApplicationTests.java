package com.resolvepal;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "llm.provider=ollama")
class ResolvePalApplicationTests {

    @Test
    void contextLoads() {
    }
}
