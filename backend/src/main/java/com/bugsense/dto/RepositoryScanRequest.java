package com.bugsense.dto;

import jakarta.validation.constraints.NotBlank;

public record RepositoryScanRequest(
		@NotBlank(message = "GitHub repository URL is required.") String repositoryUrl) {
}
