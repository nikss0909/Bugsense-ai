package com.bugsense.domain;

import java.util.Locale;
import java.util.Set;

public class Issue {

	private static final Set<String> SEVERITIES = Set.of("CRITICAL", "HIGH", "MEDIUM", "LOW");

	private static final Set<String> CATEGORIES = Set.of("Security", "Performance", "Maintainability",
			"Code Smell", "Accessibility", "Best Practice");

	private String title;

	private String description;

	private String severity = "LOW";

	private String category = "Code Smell";

	private String fileName;

	private String language;

	private Integer lineNumber;

	private String solution;

	private String impact;

	private String rootCause;

	private String whyItMatters;

	private String aiExplanation;

	private String suggestedFix;

	private String bestPractices;

	private String exampleCodeFix;

	public Issue() {
	}

	public Issue(String title, String description, String severity, String category, Integer lineNumber,
			String solution) {
		this.title = title;
		this.description = description;
		this.severity = severity;
		this.category = category;
		this.lineNumber = lineNumber;
		this.solution = solution;
		normalize();
	}

	public void normalize() {
		if (title == null || title.isBlank()) {
			title = "Static analysis issue";
		}
		if (description == null || description.isBlank()) {
			description = "The analyzer found a code quality issue.";
		}
		severity = normalizedSeverity(severity);
		if (category == null || category.isBlank() || !CATEGORIES.contains(category)) {
			category = "Code Smell";
		}
		if (lineNumber != null && lineNumber <= 0) {
			lineNumber = null;
		}
		if (solution == null || solution.isBlank()) {
			solution = "Review this location and apply the project coding standard.";
		}
		if (impact == null || impact.isBlank()) {
			impact = defaultImpact();
		}
		if (rootCause == null || rootCause.isBlank()) {
			rootCause = "The code pattern matched a static rule that is commonly linked to production defects or security risk.";
		}
		if (whyItMatters == null || whyItMatters.isBlank()) {
			whyItMatters = "Teams can prioritize the fix before it becomes harder to investigate in a larger change set.";
		}
		if (aiExplanation == null || aiExplanation.isBlank()) {
			aiExplanation = description;
		}
		if (suggestedFix == null || suggestedFix.isBlank()) {
			suggestedFix = solution;
		}
		if (bestPractices == null || bestPractices.isBlank()) {
			bestPractices = "Keep the risky behavior isolated, add a focused test, and prefer framework-supported safe APIs.";
		}
		if (exampleCodeFix == null || exampleCodeFix.isBlank()) {
			exampleCodeFix = "Apply the recommendation in the affected file and verify it with a regression test.";
		}
	}

	private String defaultImpact() {
		String normalized = normalizedSeverity(severity);
		if ("CRITICAL".equals(normalized)) {
			return "This can expose sensitive data, enable account abuse, or break a production path.";
		}
		if ("HIGH".equals(normalized)) {
			return "This can create a visible reliability, security, or maintainability problem if shipped.";
		}
		if ("MEDIUM".equals(normalized)) {
			return "This can slow future changes and increase the chance of regressions.";
		}
		return "This is worth cleaning up to keep the codebase easier to maintain.";
	}

	public String severityKey() {
		return severityKey(severity);
	}

	public static String severityKey(String value) {
		return normalizedSeverity(value).toLowerCase(Locale.ROOT);
	}

	public static String normalizedSeverity(String value) {
		if (value == null || value.isBlank()) {
			return "LOW";
		}
		String normalized = value.trim().toUpperCase(Locale.ROOT);
		return SEVERITIES.contains(normalized) ? normalized : "LOW";
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getSeverity() {
		return severity;
	}

	public void setSeverity(String severity) {
		this.severity = severity;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	public Integer getLineNumber() {
		return lineNumber;
	}

	public void setLineNumber(Integer lineNumber) {
		this.lineNumber = lineNumber;
	}

	public String getSolution() {
		return solution;
	}

	public void setSolution(String solution) {
		this.solution = solution;
	}

	public String getImpact() {
		return impact;
	}

	public void setImpact(String impact) {
		this.impact = impact;
	}

	public String getRootCause() {
		return rootCause;
	}

	public void setRootCause(String rootCause) {
		this.rootCause = rootCause;
	}

	public String getWhyItMatters() {
		return whyItMatters;
	}

	public void setWhyItMatters(String whyItMatters) {
		this.whyItMatters = whyItMatters;
	}

	public String getAiExplanation() {
		return aiExplanation;
	}

	public void setAiExplanation(String aiExplanation) {
		this.aiExplanation = aiExplanation;
	}

	public String getSuggestedFix() {
		return suggestedFix;
	}

	public void setSuggestedFix(String suggestedFix) {
		this.suggestedFix = suggestedFix;
	}

	public String getBestPractices() {
		return bestPractices;
	}

	public void setBestPractices(String bestPractices) {
		this.bestPractices = bestPractices;
	}

	public String getExampleCodeFix() {
		return exampleCodeFix;
	}

	public void setExampleCodeFix(String exampleCodeFix) {
		this.exampleCodeFix = exampleCodeFix;
	}
}
