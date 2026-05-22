package com.bugsense.service;

import java.time.Instant;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.bugsense.domain.User;
import com.bugsense.dto.AuthResponse;
import com.bugsense.dto.LoginRequest;
import com.bugsense.dto.SignupRequest;
import com.bugsense.dto.UpdateProfileRequest;
import com.bugsense.dto.UserProfile;
import com.bugsense.exception.ApiException;
import com.bugsense.repository.UserRepository;
import com.bugsense.security.JwtService;

@Service
public class AuthService {

	private static final Logger log = LoggerFactory.getLogger(AuthService.class);

	private final UserRepository userRepository;

	private final PasswordEncoder passwordEncoder;

	private final JwtService jwtService;

	public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	public AuthResponse signup(SignupRequest request) {
		String email = normalizeEmail(request.email());
		log.info("Signup requested for email={}", email);
		try {
			if (userRepository.existsByEmail(email)) {
				log.info("Signup rejected because account already exists for email={}", email);
				throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists.");
			}
			User user = new User(request.name().trim(), email, passwordEncoder.encode(request.password()));
			user.setCompany(request.company() == null ? "" : request.company().trim());
			User saved = userRepository.save(user);
			AuthResponse response = new AuthResponse(jwtService.generateToken(saved), UserProfile.from(saved));
			log.info("Signup succeeded for userId={} email={}", saved.getId(), email);
			return response;
		} catch (DuplicateKeyException exception) {
			log.warn("Signup raced with an existing account for email={}", email, exception);
			throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists.");
		} catch (DataAccessException exception) {
			log.error("Signup failed because MongoDB is unavailable for email={}", email, exception);
			throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
					"Authentication database is unavailable. Please check MongoDB and try again.");
		}
	}

	public AuthResponse login(LoginRequest request) {
		String email = normalizeEmail(request.email());
		log.info("Login requested for email={}", email);
		try {
			User user = userRepository.findByEmail(email)
					.orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));
			if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
				log.info("Login rejected because credentials did not match for email={}", email);
				throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
			}
			AuthResponse response = new AuthResponse(jwtService.generateToken(user), UserProfile.from(user));
			log.info("Login succeeded for userId={} email={}", user.getId(), email);
			return response;
		} catch (DataAccessException exception) {
			log.error("Login failed because MongoDB is unavailable for email={}", email, exception);
			throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
					"Authentication database is unavailable. Please check MongoDB and try again.");
		}
	}

	public User currentUser(String email) {
		String normalizedEmail = normalizeEmail(email);
		try {
			return userRepository.findByEmail(normalizedEmail)
					.orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authenticated user was not found."));
		} catch (DataAccessException exception) {
			log.error("Could not load authenticated user email={}", normalizedEmail, exception);
			throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
					"Authentication database is unavailable. Please check MongoDB and try again.");
		}
	}

	public UserProfile updateProfile(String email, UpdateProfileRequest request) {
		User user = currentUser(email);
		user.setName(request.name().trim());
		user.setCompany(request.company() == null ? "" : request.company().trim());
		user.setUpdatedAt(Instant.now());
		try {
			return UserProfile.from(userRepository.save(user));
		} catch (DataAccessException exception) {
			log.error("Could not update profile for userId={}", user.getId(), exception);
			throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
					"Authentication database is unavailable. Please check MongoDB and try again.");
		}
	}

	private String normalizeEmail(String email) {
		return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
	}
}
