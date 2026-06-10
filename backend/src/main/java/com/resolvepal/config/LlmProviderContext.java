package com.resolvepal.config;

public final class LlmProviderContext {
    private static final ThreadLocal<String> CURRENT_PROVIDER = new ThreadLocal<>();

    private LlmProviderContext() {
    }

    public static void set(String provider) {
        CURRENT_PROVIDER.set(provider);
    }

    public static String get() {
        return CURRENT_PROVIDER.get();
    }

    public static void clear() {
        CURRENT_PROVIDER.remove();
    }
}
