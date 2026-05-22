package com.bugsense.exception;

import org.springframework.http.HttpStatus;

public class GeminiApiException extends ApiException {

	public GeminiApiException(HttpStatus status, String message) {
		super(status, message);
	}
}
