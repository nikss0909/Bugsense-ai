package com.bugsense.dto.gemini;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public record GeminiGenerateResponse(List<Candidate> candidates) {

	public String text() {
		if (candidates == null || candidates.isEmpty() || candidates.getFirst().content() == null
				|| candidates.getFirst().content().parts() == null) {
			throw new IllegalStateException("Gemini response did not include generated text.");
		}
		return candidates.getFirst().content().parts().stream()
				.map(Part::text)
				.filter(Objects::nonNull)
				.collect(Collectors.joining());
	}

	public record Candidate(Content content, String finishReason) {
	}

	public record Content(List<Part> parts, String role) {
	}

	public record Part(String text) {
	}
}
