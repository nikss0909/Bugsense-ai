package com.bugsense.domain;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class AnalysisResult {

	private String summary = "Analysis completed.";

	private int qualityScore = 85;

	private Map<String, Integer> severityCounts = defaultSeverityCounts();

	private List<BugFinding> findings = new ArrayList<>();

	private List<TestSuggestion> testSuggestions = new ArrayList<>();

	private List<String> fixRecommendations = new ArrayList<>();

	public String getSummary() {
		return summary;
	}

	public void setSummary(String summary) {
		this.summary = summary;
	}

	public int getQualityScore() {
		return qualityScore;
	}

	public void setQualityScore(int qualityScore) {
		this.qualityScore = qualityScore;
	}

	public Map<String, Integer> getSeverityCounts() {
		return severityCounts;
	}

	public void setSeverityCounts(Map<String, Integer> severityCounts) {
		this.severityCounts = severityCounts;
	}

	public List<BugFinding> getFindings() {
		return findings;
	}

	public void setFindings(List<BugFinding> findings) {
		this.findings = findings;
	}

	public List<TestSuggestion> getTestSuggestions() {
		return testSuggestions;
	}

	public void setTestSuggestions(List<TestSuggestion> testSuggestions) {
		this.testSuggestions = testSuggestions;
	}

	public List<String> getFixRecommendations() {
		return fixRecommendations;
	}

	public void setFixRecommendations(List<String> fixRecommendations) {
		this.fixRecommendations = fixRecommendations;
	}

	public void normalize() {
		qualityScore = Math.max(0, Math.min(100, qualityScore));
		if (summary == null || summary.isBlank()) {
			summary = "Analysis completed.";
		}
		if (findings == null) {
			findings = new ArrayList<>();
		}
		if (testSuggestions == null) {
			testSuggestions = new ArrayList<>();
		}
		if (fixRecommendations == null) {
			fixRecommendations = new ArrayList<>();
		}
		Map<String, Integer> normalized = defaultSeverityCounts();
		for (BugFinding finding : findings) {
			finding.normalize();
			String severity = finding.getSeverity() == null ? "low" : finding.getSeverity().toLowerCase(Locale.ROOT);
			if (!normalized.containsKey(severity)) {
				severity = "low";
			}
			finding.setSeverity(severity);
			normalized.put(severity, normalized.get(severity) + 1);
		}
		severityCounts = normalized;
	}

	public static Map<String, Integer> defaultSeverityCounts() {
		Map<String, Integer> counts = new LinkedHashMap<>();
		counts.put("critical", 0);
		counts.put("high", 0);
		counts.put("medium", 0);
		counts.put("low", 0);
		return counts;
	}

	public static class BugFinding {
		private String title;
		private String severity = "low";
		private String category = "Code Quality";
		private String affectedLines;
		private Integer lineStart;
		private Integer lineEnd;
		private String explanation;
		private String fixRecommendation;
		private String improvedCodeSuggestion;
		private String description;
		private String recommendation;
		private double confidence = 0.75;

		public BugFinding() {
		}

		public BugFinding(String title, String severity, String category, Integer lineStart, Integer lineEnd,
				String description, String recommendation, double confidence) {
			this.title = title;
			this.severity = severity;
			this.category = category;
			this.lineStart = lineStart;
			this.lineEnd = lineEnd;
			this.explanation = description;
			this.fixRecommendation = recommendation;
			this.description = description;
			this.recommendation = recommendation;
			this.confidence = confidence;
		}

		public void normalize() {
			if (title == null || title.isBlank()) {
				title = "Code review finding";
			}
			if (category == null || category.isBlank()) {
				category = "Code Quality";
			}
			if ((explanation == null || explanation.isBlank()) && description != null && !description.isBlank()) {
				explanation = description;
			}
			if ((description == null || description.isBlank()) && explanation != null && !explanation.isBlank()) {
				description = explanation;
			}
			if ((fixRecommendation == null || fixRecommendation.isBlank()) && recommendation != null
					&& !recommendation.isBlank()) {
				fixRecommendation = recommendation;
			}
			if ((recommendation == null || recommendation.isBlank()) && fixRecommendation != null
					&& !fixRecommendation.isBlank()) {
				recommendation = fixRecommendation;
			}
			if (lineStart != null && lineEnd == null) {
				lineEnd = lineStart;
			}
			if ((affectedLines == null || affectedLines.isBlank()) && lineStart != null) {
				affectedLines = lineEnd != null && !lineEnd.equals(lineStart)
						? lineStart + "-" + lineEnd
						: String.valueOf(lineStart);
			}
			if (affectedLines == null || affectedLines.isBlank()) {
				affectedLines = "unknown";
			}
			confidence = Math.max(0, Math.min(1, confidence));
		}

		public String getTitle() {
			return title;
		}

		public void setTitle(String title) {
			this.title = title;
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

		public String getAffectedLines() {
			return affectedLines;
		}

		public void setAffectedLines(String affectedLines) {
			this.affectedLines = affectedLines;
		}

		public Integer getLineStart() {
			return lineStart;
		}

		public void setLineStart(Integer lineStart) {
			this.lineStart = lineStart;
		}

		public Integer getLineEnd() {
			return lineEnd;
		}

		public void setLineEnd(Integer lineEnd) {
			this.lineEnd = lineEnd;
		}

		public String getExplanation() {
			return explanation;
		}

		public void setExplanation(String explanation) {
			this.explanation = explanation;
		}

		public String getFixRecommendation() {
			return fixRecommendation;
		}

		public void setFixRecommendation(String fixRecommendation) {
			this.fixRecommendation = fixRecommendation;
		}

		public String getImprovedCodeSuggestion() {
			return improvedCodeSuggestion;
		}

		public void setImprovedCodeSuggestion(String improvedCodeSuggestion) {
			this.improvedCodeSuggestion = improvedCodeSuggestion;
		}

		public String getDescription() {
			return description;
		}

		public void setDescription(String description) {
			this.description = description;
		}

		public String getRecommendation() {
			return recommendation;
		}

		public void setRecommendation(String recommendation) {
			this.recommendation = recommendation;
		}

		public double getConfidence() {
			return confidence;
		}

		public void setConfidence(double confidence) {
			this.confidence = confidence;
		}
	}

	public static class TestSuggestion {
		private String name;
		private String type = "unit";
		private String priority = "medium";
		private String description;

		public TestSuggestion() {
		}

		public TestSuggestion(String name, String type, String priority, String description) {
			this.name = name;
			this.type = type;
			this.priority = priority;
			this.description = description;
		}

		public String getName() {
			return name;
		}

		public void setName(String name) {
			this.name = name;
		}

		public String getType() {
			return type;
		}

		public void setType(String type) {
			this.type = type;
		}

		public String getPriority() {
			return priority;
		}

		public void setPriority(String priority) {
			this.priority = priority;
		}

		public String getDescription() {
			return description;
		}

		public void setDescription(String description) {
			this.description = description;
		}
	}
}
