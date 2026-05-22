package com.bugsense.dto;

import java.time.Instant;

import com.bugsense.domain.User;

public record UserProfile(String id, String name, String email, String role, String company, Instant createdAt) {
	public static UserProfile from(User user) {
		return new UserProfile(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getCompany(),
				user.getCreatedAt());
	}
}
