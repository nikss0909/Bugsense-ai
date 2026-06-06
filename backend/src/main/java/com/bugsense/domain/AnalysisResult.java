package com.bugsense.domain;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

public class AnalysisResult {

	private String summary = "Static analysis completed.";

	private int qualityScore = 100;

	private int securityScore = 100;

	private int maintainabilityScore = 100;

	private int performanceScore = 100;

	private int documentationScore = 100;

	private int projectHealthScore = 100;

	private String technicalDebt = "0 minutes";

	private AnalysisSummary analysisSummary = new AnalysisSummary();

	private Map<String, Integer> severityCounts = defaultSeverityCounts();

	private List<Issue> issues = new ArrayList<>();

	private List<RuleResult> ruleResults = new ArrayList<>();

	private List<BugFinding> findings = new ArrayList<>();

	private List<TestSuggestion> testSuggestions = new ArrayList<>();

	private List<String> fixRecommendations = new ArrayList<>();

	private List<FileInsight> fileInsights = new ArrayList<>();

	private RepositoryStats repositoryStats;

	private String engine = "Rule-based static analysis";

	private String scanScope = "single-file";

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

	public int getSecurityScore() {
		return securityScore;
	}

	public void setSecurityScore(int securityScore) {
		this.securityScore = securityScore;
	}

	public int getMaintainabilityScore() {
		return maintainabilityScore;
	}

	public void setMaintainabilityScore(int maintainabilityScore) {
		this.maintainabilityScore = maintainabilityScore;
	}

	public int getPerformanceScore() {
		return performanceScore;
	}

	public void setPerformanceScore(int performanceScore) {
		this.performanceScore = performanceScore;
	}

	public int getDocumentationScore() {
		return documentationScore;
	}

	public void setDocumentationScore(int documentationScore) {
		this.documentationScore = documentationScore;
	}

	public int getProjectHealthScore() {
		return projectHealthScore;
	}

	public void setProjectHealthScore(int projectHealthScore) {
		this.projectHealthScore = projectHealthScore;
	}

	public String getTechnicalDebt() {
		return technicalDebt;
	}

	public void setTechnicalDebt(String technicalDebt) {
		this.technicalDebt = technicalDebt;
	}

	public AnalysisSummary getAnalysisSummary() {
		return analysisSummary;
	}

	public void setAnalysisSummary(AnalysisSummary analysisSummary) {
		this.analysisSummary = analysisSummary;
	}

	public Map<String, Integer> getSeverityCounts() {
		return severityCounts;
	}

	public void setSeverityCounts(Map<String, Integer> severityCounts) {
		this.severityCounts = severityCounts;
	}

	public List<Issue> getIssues() {
		return issues;
	}

	public void setIssues(List<Issue> issues) {
		this.issues = issues;
	}

	public List<RuleResult> getRuleResults() {
		return ruleResults;
	}

	public void setRuleResults(List<RuleResult> ruleResults) {
		this.ruleResults = ruleResults;
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

	public List<FileInsight> getFileInsights() {
		return fileInsights;
	}

	public void setFileInsights(List<FileInsight> fileInsights) {
		this.fileInsights = fileInsights;
	}

	public RepositoryStats getRepositoryStats() {
		return repositoryStats;
	}

	public void setRepositoryStats(RepositoryStats repositoryStats) {
		this.repositoryStats = repositoryStats;
	}

	public String getEngine() {
		return engine;
	}

	public void setEngine(String engine) {
		this.engine = engine;
	}

	public String getScanScope() {
		return scanScope;
	}

	public void setScanScope(String scanScope) {
		this.scanScope = scanScope;
	}

	public void normalize() {
		qualityScore = Math.max(0, Math.min(100, qualityScore));
		securityScore = clampScore(securityScore);
		maintainabilityScore = clampScore(maintainabilityScore);
		performanceScore = clampScore(performanceScore);
		documentationScore = clampScore(documentationScore);
		projectHealthScore = clampScore(projectHealthScore);
		if (issues == null) {
			issues = new ArrayList<>();
		}
		if (findings == null) {
			findings = new ArrayList<>();
		}
		if (issues.isEmpty() && !findings.isEmpty()) {
			issues = findings.stream().map(this::toIssue).toList();
		}
		issues.forEach(Issue::normalize);
		if (findings.isEmpty() && !issues.isEmpty()) {
			findings = issues.stream().map(this::toFinding).toList();
		}
		findings.forEach(BugFinding::normalize);

		if (ruleResults == null) {
			ruleResults = new ArrayList<>();
		}
		ruleResults.forEach(RuleResult::normalize);
		if (testSuggestions == null) {
			testSuggestions = new ArrayList<>();
		}
		if (fixRecommendations == null) {
			fixRecommendations = new ArrayList<>();
		}
		if (fileInsights == null) {
			fileInsights = new ArrayList<>();
		}
		fileInsights.forEach(FileInsight::normalize);
		if (repositoryStats != null) {
			repositoryStats.normalize();
		}
		if (fixRecommendations.isEmpty()) {
			fixRecommendations = defaultRecommendations(issues);
		}

		severityCounts = countSeverities(issues);
		analysisSummary = AnalysisSummary.from(issues, qualityScore);
		if (technicalDebt == null || technicalDebt.isBlank()) {
			technicalDebt = estimateDebt(severityCounts);
		}
		if (summary == null || summary.isBlank()) {
			summary = buildSummary();
		}
		if (engine == null || engine.isBlank()) {
			engine = "Rule-based static analysis";
		}
		if (scanScope == null || scanScope.isBlank()) {
			scanScope = "single-file";
		}
	}

	private int clampScore(int value) {
		return Math.max(0, Math.min(100, value));
	}

	private String buildSummary() {
		int total = issues == null ? 0 : issues.size();
		if (total == 0) {
			return "Static analysis completed with no rule violations. Quality score: " + qualityScore + "/100.";
		}
		return "Static analysis completed with " + total + " issue" + (total == 1 ? "" : "s")
				+ ". Quality score: " + qualityScore + "/100.";
	}

	private Issue toIssue(BugFinding finding) {
		Integer lineNumber = finding.getLineStart();
		return new Issue(finding.getTitle(), firstText(finding.getDescription(), finding.getExplanation()),
				finding.getSeverity(), finding.getCategory(), lineNumber,
				firstText(finding.getRecommendation(), finding.getFixRecommendation()));
	}

	private BugFinding toFinding(Issue issue) {
		return new BugFinding(issue.getTitle(), issue.severityKey(), issue.getCategory(), issue.getLineNumber(),
				issue.getLineNumber(), issue.getDescription(), issue.getSolution(), 0.9);
	}

	private String firstText(String first, String second) {
		return first != null && !first.isBlank() ? first : second;
	}

	private List<String> defaultRecommendations(List<Issue> issues) {
		Set<String> unique = new LinkedHashSet<>();
		if (issues != null) {
			for (Issue issue : issues) {
				if (issue.getSolution() != null && !issue.getSolution().isBlank()) {
					unique.add(issue.getSolution());
				}
				if (unique.size() == 5) {
					break;
				}
			}
		}
		if (unique.isEmpty()) {
			unique.add("Keep running static analysis on every upload to catch regressions early.");
		}
		return new ArrayList<>(unique);
	}

	public static Map<String, Integer> countSeverities(List<Issue> issues) {
		Map<String, Integer> counts = defaultSeverityCounts();
		if (issues == null) {
			return counts;
		}
		for (Issue issue : issues) {
			issue.normalize();
			String severity = issue.severityKey();
			counts.put(severity, counts.get(severity) + 1);
		}
		return counts;
	}

	public static Map<String, Integer> defaultSeverityCounts() {
		Map<String, Integer> counts = new LinkedHashMap<>();
		counts.put("critical", 0);
		counts.put("high", 0);
		counts.put("medium", 0);
		counts.put("low", 0);
		return counts;
	}

	public static String estimateDebt(Map<String, Integer> counts) {
		Map<String, Integer> source = counts == null ? defaultSeverityCounts() : counts;
		int minutes = source.getOrDefault("critical", 0) * 120
				+ source.getOrDefault("high", 0) * 60
				+ source.getOrDefault("medium", 0) * 30
				+ source.getOrDefault("low", 0) * 15;
		if (minutes <= 0) {
			return "0 minutes";
		}
		if (minutes < 60) {
			return minutes + " minutes";
		}
		if (minutes % 60 == 0) {
			int hours = minutes / 60;
			return hours + " hour" + (hours == 1 ? "" : "s");
		}
		int hours = minutes / 60;
		int remainder = minutes % 60;
		return hours + " hour" + (hours == 1 ? "" : "s") + " " + remainder + " minutes";
	}

	public static class BugFinding {
		private String title;
		private String severity = "low";
		private String category = "Code Smell";
		private String affectedLines;
		private Integer lineStart;
		private Integer lineEnd;
		private String explanation;
		private String fixRecommendation;
		private String improvedCodeSuggestion;
		private String description;
		private String recommendation;
		private double confidence = 0.9;

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
				title = "Static analysis finding";
			}
			severity = Issue.normalizedSeverity(severity).toLowerCase(Locale.ROOT);
			if (category == null || category.isBlank()) {
				category = "Code Smell";
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
		private String sampleTestCode;

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

		public String getSampleTestCode() {
			return sampleTestCode;
		}

		public void setSampleTestCode(String sampleTestCode) {
			this.sampleTestCode = sampleTestCode;
		}
	}

	public static class FileInsight {
		private String fileName;
		private long fileSize;
		private String fileType;
		private String language;
		private int linesOfCode;
		private int numberOfFunctions;
		private int numberOfClasses;
		private int numberOfImports;
		private int numberOfDependencies;
		private int complexityScore;
		private int maintainabilityScore;
		private int securityScore;
		private int qualityScore;
		private String technicalDebt = "0 minutes";
		private String lastScanTime;

		public FileInsight() {
		}

		public void normalize() {
			if (fileName == null || fileName.isBlank()) {
				fileName = "source";
			}
			if (fileType == null || fileType.isBlank()) {
				fileType = "source";
			}
			if (language == null || language.isBlank()) {
				language = "Unknown";
			}
			complexityScore = Math.max(0, Math.min(100, complexityScore));
			maintainabilityScore = Math.max(0, Math.min(100, maintainabilityScore));
			securityScore = Math.max(0, Math.min(100, securityScore));
			qualityScore = Math.max(0, Math.min(100, qualityScore));
			if (technicalDebt == null || technicalDebt.isBlank()) {
				technicalDebt = "0 minutes";
			}
			if (lastScanTime == null || lastScanTime.isBlank()) {
				lastScanTime = "Current scan";
			}
		}

		public String getFileName() {
			return fileName;
		}

		public void setFileName(String fileName) {
			this.fileName = fileName;
		}

		public long getFileSize() {
			return fileSize;
		}

		public void setFileSize(long fileSize) {
			this.fileSize = fileSize;
		}

		public String getFileType() {
			return fileType;
		}

		public void setFileType(String fileType) {
			this.fileType = fileType;
		}

		public String getLanguage() {
			return language;
		}

		public void setLanguage(String language) {
			this.language = language;
		}

		public int getLinesOfCode() {
			return linesOfCode;
		}

		public void setLinesOfCode(int linesOfCode) {
			this.linesOfCode = linesOfCode;
		}

		public int getNumberOfFunctions() {
			return numberOfFunctions;
		}

		public void setNumberOfFunctions(int numberOfFunctions) {
			this.numberOfFunctions = numberOfFunctions;
		}

		public int getNumberOfClasses() {
			return numberOfClasses;
		}

		public void setNumberOfClasses(int numberOfClasses) {
			this.numberOfClasses = numberOfClasses;
		}

		public int getNumberOfImports() {
			return numberOfImports;
		}

		public void setNumberOfImports(int numberOfImports) {
			this.numberOfImports = numberOfImports;
		}

		public int getNumberOfDependencies() {
			return numberOfDependencies;
		}

		public void setNumberOfDependencies(int numberOfDependencies) {
			this.numberOfDependencies = numberOfDependencies;
		}

		public int getComplexityScore() {
			return complexityScore;
		}

		public void setComplexityScore(int complexityScore) {
			this.complexityScore = complexityScore;
		}

		public int getMaintainabilityScore() {
			return maintainabilityScore;
		}

		public void setMaintainabilityScore(int maintainabilityScore) {
			this.maintainabilityScore = maintainabilityScore;
		}

		public int getSecurityScore() {
			return securityScore;
		}

		public void setSecurityScore(int securityScore) {
			this.securityScore = securityScore;
		}

		public int getQualityScore() {
			return qualityScore;
		}

		public void setQualityScore(int qualityScore) {
			this.qualityScore = qualityScore;
		}

		public String getTechnicalDebt() {
			return technicalDebt;
		}

		public void setTechnicalDebt(String technicalDebt) {
			this.technicalDebt = technicalDebt;
		}

		public String getLastScanTime() {
			return lastScanTime;
		}

		public void setLastScanTime(String lastScanTime) {
			this.lastScanTime = lastScanTime;
		}
	}

	public static class RepositoryStats {
		private String repositoryUrl;
		private String repositoryName;
		private int totalFiles;
		private int analyzedFiles;
		private int skippedFiles;
		private long totalBytes;
		private Map<String, Long> languageDistribution = new LinkedHashMap<>();
		private String clonedAt;

		public RepositoryStats() {
		}

		public void normalize() {
			if (repositoryName == null || repositoryName.isBlank()) {
				repositoryName = "Repository";
			}
			if (repositoryUrl == null) {
				repositoryUrl = "";
			}
			if (languageDistribution == null) {
				languageDistribution = new LinkedHashMap<>();
			}
			if (clonedAt == null || clonedAt.isBlank()) {
				clonedAt = "Current scan";
			}
		}

		public String getRepositoryUrl() {
			return repositoryUrl;
		}

		public void setRepositoryUrl(String repositoryUrl) {
			this.repositoryUrl = repositoryUrl;
		}

		public String getRepositoryName() {
			return repositoryName;
		}

		public void setRepositoryName(String repositoryName) {
			this.repositoryName = repositoryName;
		}

		public int getTotalFiles() {
			return totalFiles;
		}

		public void setTotalFiles(int totalFiles) {
			this.totalFiles = totalFiles;
		}

		public int getAnalyzedFiles() {
			return analyzedFiles;
		}

		public void setAnalyzedFiles(int analyzedFiles) {
			this.analyzedFiles = analyzedFiles;
		}

		public int getSkippedFiles() {
			return skippedFiles;
		}

		public void setSkippedFiles(int skippedFiles) {
			this.skippedFiles = skippedFiles;
		}

		public long getTotalBytes() {
			return totalBytes;
		}

		public void setTotalBytes(long totalBytes) {
			this.totalBytes = totalBytes;
		}

		public Map<String, Long> getLanguageDistribution() {
			return languageDistribution;
		}

		public void setLanguageDistribution(Map<String, Long> languageDistribution) {
			this.languageDistribution = languageDistribution;
		}

		public String getClonedAt() {
			return clonedAt;
		}

		public void setClonedAt(String clonedAt) {
			this.clonedAt = clonedAt;
		}
	}
}
