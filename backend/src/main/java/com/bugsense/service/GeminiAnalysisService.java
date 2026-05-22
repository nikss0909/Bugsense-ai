package com.bugsense.service;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;

import com.bugsense.domain.AnalysisResult;
import com.bugsense.dto.gemini.GeminiGenerateRequest;
import com.bugsense.dto.gemini.GeminiGenerateResponse;
import com.bugsense.exception.GeminiApiException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class GeminiAnalysisService {

    private static final Logger log =
            LoggerFactory.getLogger(GeminiAnalysisService.class);

    private final WebClient webClient;

    private final ObjectMapper objectMapper;

    private final String apiKey;

    private final String model;

    private final int timeoutSeconds;

    public GeminiAnalysisService(
            @Value("${gemini.api-key:}") String apiKey,
            @Value("${gemini.model:gemini-1.5-flash}") String model,
            @Value("${gemini.base-url:https://generativelanguage.googleapis.com}") String baseUrl,
            @Value("${gemini.timeout-seconds:45}") int timeoutSeconds
    ) {

        this.objectMapper = new ObjectMapper();

        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .build();

        this.apiKey = apiKey == null ? "" : apiKey.trim();

        this.model = StringUtils.hasText(model)
                ? model.trim()
                : "gemini-1.5-flash";

        this.timeoutSeconds = timeoutSeconds;

        if (!StringUtils.hasText(this.apiKey)) {
            log.warn("Gemini API key is missing.");
        }

        log.info("Gemini initialized with model={}", this.model);
    }

    public AnalysisResult analyze(
            String fileName,
            String language,
            String sourceCode
    ) {

        if (!hasUsableApiKey()) {
            throw new GeminiApiException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Gemini API key is missing."
            );
        }

        log.info("Starting Gemini analysis for file={}", fileName);

        GeminiGenerateRequest request =
                GeminiGenerateRequest.text(
                        buildPrompt(fileName, language, sourceCode),
                        analysisResponseSchema()
                );

        try {

            GeminiGenerateResponse response =
                    webClient.post()
                            .uri(uriBuilder -> uriBuilder
                                    .path("/v1beta/models/"
                                            + normalizedModel()
                                            + ":generateContent")
                                    .queryParam("key", apiKey)
                                    .build())
                            .contentType(MediaType.APPLICATION_JSON)
                            .accept(MediaType.APPLICATION_JSON)
                            .bodyValue(request)
                            .retrieve()
                            .bodyToMono(GeminiGenerateResponse.class)
                            .block(Duration.ofSeconds(timeoutSeconds));

            if (response == null) {
                throw new GeminiApiException(
                        HttpStatus.BAD_GATEWAY,
                        "Gemini returned empty response."
                );
            }

            if (response.getCandidates() == null
                    || response.getCandidates().isEmpty()) {

                throw new GeminiApiException(
                        HttpStatus.BAD_GATEWAY,
                        "Gemini returned no candidates."
                );
            }

            String responseText = response.getCandidates()
                    .get(0)
                    .getContent()
                    .getParts()
                    .get(0)
                    .getText();

            if (responseText == null || responseText.isBlank()) {

                throw new GeminiApiException(
                        HttpStatus.BAD_GATEWAY,
                        "Gemini returned blank response."
                );
            }

            log.info("Gemini raw response: {}", responseText);

            String cleanJson = extractJson(responseText);

            AnalysisResult result =
                    objectMapper.readValue(
                            cleanJson,
                            AnalysisResult.class
                    );

            result.normalize();

            return result;

        } catch (GeminiApiException e) {

            throw e;

        } catch (Exception e) {

            log.error("Gemini analysis failed", e);

            throw new GeminiApiException(
                    HttpStatus.BAD_GATEWAY,
                    "Gemini API integration failed: "
                            + e.getMessage()
            );
        }
    }

    private String buildPrompt(
            String fileName,
            String language,
            String sourceCode
    ) {

        return """
                You are BugSense AI.

                Analyze the uploaded source code for:
                - syntax issues
                - logical bugs
                - security vulnerabilities
                - performance problems
                - clean code violations
                - test case suggestions

                Return ONLY valid JSON.

                File: %s
                Language: %s

                Source code:
                ```%s
                %s
                ```
                """.formatted(
                fileName,
                language,
                language,
                sourceCode
        );
    }

    private String extractJson(String text) {

        String value = text == null
                ? ""
                : text.trim();

        if (value.startsWith("```")) {

            int firstLine = value.indexOf('\n');

            int lastFence = value.lastIndexOf("```");

            if (firstLine >= 0 && lastFence > firstLine) {

                value = value.substring(
                        firstLine + 1,
                        lastFence
                ).trim();
            }
        }

        int start = value.indexOf('{');

        int end = value.lastIndexOf('}');

        if (start >= 0 && end > start) {

            return value.substring(start, end + 1);
        }

        throw new IllegalArgumentException(
                "Gemini response was not valid JSON."
        );
    }

    private String normalizedModel() {

        String value = model.trim();

        return value.startsWith("models/")
                ? value.substring("models/".length())
                : value;
    }

    private boolean hasUsableApiKey() {

        if (!StringUtils.hasText(apiKey)) {
            return false;
        }

        String lower = apiKey.toLowerCase(Locale.ROOT);

        return !lower.contains("replace-with")
                && !lower.contains("your-google-ai-studio-key");
    }

    private Map<String, Object> analysisResponseSchema() {

        Map<String, Object> schema = new LinkedHashMap<>();

        schema.put("type", "object");

        return schema;
    }
}