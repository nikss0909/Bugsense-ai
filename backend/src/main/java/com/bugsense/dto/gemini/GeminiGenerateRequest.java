package com.bugsense.dto.gemini;

import java.util.List;
import java.util.Map;

public record GeminiGenerateRequest(List<Content> contents, GenerationConfig generationConfig) {

	public static GeminiGenerateRequest text(String prompt, Map<String, Object> responseSchema) {
		return new GeminiGenerateRequest(
				List.of(new Content("user", List.of(new Part(prompt)))),
				new GenerationConfig(0.15, 8192, "application/json", responseSchema));
	}

	public record Content(String role, List<Part> parts) {
	}

	public record Part(String text) {
	}

	public record GenerationConfig(
			Double temperature,
			Integer maxOutputTokens,
			String responseMimeType,
			Map<String, Object> responseSchema) {
	}
}
