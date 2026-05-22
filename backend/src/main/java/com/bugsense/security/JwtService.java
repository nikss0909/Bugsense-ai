package com.bugsense.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.bugsense.domain.User;
import com.bugsense.exception.ApiException;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

	private static final Logger log = LoggerFactory.getLogger(JwtService.class);

	private static final long DEFAULT_EXPIRATION_MS = 86_400_000L;

	private final SecretKey signingKey;

	private final long expirationMs;

	public JwtService(@Value("${jwt.secret:}") String secret,
			@Value("${jwt.expiration-ms:86400000}") long expirationMs) {
		this.signingKey = createSigningKey(secret);
		this.expirationMs = normalizeExpiration(expirationMs);
	}

	public String generateToken(User user) {
		if (user == null || !StringUtils.hasText(user.getEmail())) {
			throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not create authentication session.");
		}
		Instant now = Instant.now();
		try {
			return Jwts.builder()
					.subject(user.getEmail())
					.claim("userId", user.getId())
					.claim("name", user.getName())
					.claim("role", user.getRole())
					.issuedAt(Date.from(now))
					.expiration(Date.from(now.plusMillis(expirationMs)))
					.signWith(signingKey)
					.compact();
		} catch (RuntimeException exception) {
			log.error("JWT token generation failed for userId={}", user.getId(), exception);
			throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR,
					"Could not create authentication session. Check JWT configuration.");
		}
	}

	public String extractEmail(String token) {
		return Jwts.parser()
				.verifyWith(signingKey)
				.build()
				.parseSignedClaims(token)
				.getPayload()
				.getSubject();
	}

	private SecretKey createSigningKey(String secret) {
		String value = secret == null ? "" : secret.trim();
		if (StringUtils.hasText(value) && value.getBytes(StandardCharsets.UTF_8).length >= 32) {
			log.info("JWT signing configured from JWT_SECRET.");
			return Keys.hmacShaKeyFor(value.getBytes(StandardCharsets.UTF_8));
		}
		log.warn("JWT_SECRET is missing or shorter than 32 bytes. Using an in-memory development key. "
				+ "Set JWT_SECRET for stable sessions across backend restarts.");
		return Jwts.SIG.HS256.key().build();
	}

	private long normalizeExpiration(long configuredExpirationMs) {
		if (configuredExpirationMs > 0) {
			return configuredExpirationMs;
		}
		log.warn("JWT_EXPIRATION_MS must be positive. Falling back to {} ms.", DEFAULT_EXPIRATION_MS);
		return DEFAULT_EXPIRATION_MS;
	}
}
