package com.bugsense.controller;

import java.security.Principal;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bugsense.dto.UpdateProfileRequest;
import com.bugsense.dto.UserProfile;
import com.bugsense.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

	private final AuthService authService;

	public UserController(AuthService authService) {
		this.authService = authService;
	}

	@GetMapping("/me")
	public UserProfile me(Principal principal) {
		return UserProfile.from(authService.currentUser(principal.getName()));
	}

	@PutMapping("/me")
	public UserProfile updateMe(Principal principal, @Valid @RequestBody UpdateProfileRequest request) {
		return authService.updateProfile(principal.getName(), request);
	}
}
