package com.bugsense.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import com.mongodb.MongoException;

import com.bugsense.dto.ErrorResponse;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@ExceptionHandler(GeminiApiException.class)
	public ResponseEntity<ErrorResponse> handleGeminiException(GeminiApiException exception,
			HttpServletRequest request) {
		logForStatus(exception.getStatus(), request, exception.getMessage(), exception);
		return error(exception.getStatus(), exception.getMessage(), request);
	}

	@ExceptionHandler(ApiException.class)
	public ResponseEntity<ErrorResponse> handleApiException(ApiException exception, HttpServletRequest request) {
		logForStatus(exception.getStatus(), request, exception.getMessage(), exception);
		return error(exception.getStatus(), exception.getMessage(), request);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException exception,
			HttpServletRequest request) {
		Map<String, String> errors = new LinkedHashMap<>();
		exception.getBindingResult().getFieldErrors()
				.forEach(error -> errors.put(error.getField(),
						error.getDefaultMessage() == null ? "Invalid value" : error.getDefaultMessage()));
		log.warn("{} {} validation failed: {}", request.getMethod(), request.getRequestURI(), errors);
		return ResponseEntity.badRequest().body(ErrorResponse.of(HttpStatus.BAD_REQUEST,
				"Please fix the highlighted fields.", errors, request.getRequestURI()));
	}

	@ExceptionHandler(MaxUploadSizeExceededException.class)
	public ResponseEntity<ErrorResponse> handleMaxUpload(MaxUploadSizeExceededException exception,
			HttpServletRequest request) {
		log.warn("{} {} rejected oversized upload", request.getMethod(), request.getRequestURI());
		return error(HttpStatus.CONTENT_TOO_LARGE, "File is too large. Upload a source file under 1 MB.", request);
	}

	@ExceptionHandler(DuplicateKeyException.class)
	public ResponseEntity<ErrorResponse> handleDuplicateKey(DuplicateKeyException exception, HttpServletRequest request) {
		log.warn("{} {} duplicate key rejected: {}", request.getMethod(), request.getRequestURI(),
				exception.getMostSpecificCause().getMessage());
		return error(HttpStatus.CONFLICT, "An account with this email already exists.", request);
	}

	@ExceptionHandler({ DataAccessException.class, MongoException.class })
	public ResponseEntity<ErrorResponse> handleDatabase(Exception exception, HttpServletRequest request) {
		log.error("{} {} database failure", request.getMethod(), request.getRequestURI(), exception);
		return error(HttpStatus.SERVICE_UNAVAILABLE,
				"Database service is unavailable. Please check MongoDB and try again.", request);
	}

	@ExceptionHandler(JwtException.class)
	public ResponseEntity<ErrorResponse> handleJwt(JwtException exception, HttpServletRequest request) {
		log.warn("{} {} rejected invalid JWT: {}", request.getMethod(), request.getRequestURI(), exception.getMessage());
		return error(HttpStatus.UNAUTHORIZED, "Your session is invalid or expired. Please sign in again.", request);
	}

	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException exception,
			HttpServletRequest request) {
		log.warn("{} {} authentication failure: {}", request.getMethod(), request.getRequestURI(),
				exception.getMessage());
		return error(HttpStatus.UNAUTHORIZED, "Authentication failed. Please sign in again.", request);
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException exception, HttpServletRequest request) {
		log.warn("{} {} access denied: {}", request.getMethod(), request.getRequestURI(), exception.getMessage());
		return error(HttpStatus.FORBIDDEN, "You do not have permission to access this resource.", request);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorResponse> handleUnexpected(Exception exception, HttpServletRequest request) {
		log.error("{} {} unexpected failure", request.getMethod(), request.getRequestURI(), exception);
		return error(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong while processing the request.", request);
	}

	private ResponseEntity<ErrorResponse> error(HttpStatus status, String message, HttpServletRequest request) {
		return ResponseEntity.status(status).body(ErrorResponse.of(status, message, request.getRequestURI()));
	}

	private void logForStatus(HttpStatus status, HttpServletRequest request, String message, Exception exception) {
		if (status.is5xxServerError()) {
			log.error("{} {} failed: {}", request.getMethod(), request.getRequestURI(), message, exception);
			return;
		}
		log.warn("{} {} rejected: {}", request.getMethod(), request.getRequestURI(), message);
	}
}
