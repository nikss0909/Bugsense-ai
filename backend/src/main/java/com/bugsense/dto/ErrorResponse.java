package com.bugsense.dto;

import java.time.Instant;
import java.util.Map;

import org.springframework.http.HttpStatus;

public record ErrorResponse(
		int status,
		String error,
		String message,
		Map<String, String> errors,
		String path,
		Instant timestamp) {

	public static ErrorResponse of(HttpStatus status, String message, String path) {
		return new ErrorResponse(status.value(), status.name(), message, Map.of(), path, Instant.now());
	}

	public static ErrorResponse of(HttpStatus status, String message, Map<String, String> errors, String path) {
		return new ErrorResponse(status.value(), status.name(), message, errors, path, Instant.now());
	}
}
