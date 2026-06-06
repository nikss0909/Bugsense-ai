package com.bugsense.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.bugsense.domain.AnalysisResult;
import com.bugsense.domain.Issue;
import com.bugsense.domain.RuleResult;
import com.bugsense.rules.AnalysisContext;
import com.bugsense.rules.StaticAnalysisRule;
import com.bugsense.util.SourceFileUtil;

@Service
public class RuleBasedAnalysisService {

	private static final Logger log = LoggerFactory.getLogger(RuleBasedAnalysisService.class);

	private static final Map<String, Integer> SCORE_PENALTIES = Map.of(
			"CRITICAL", 18,
			"HIGH", 10,
			"MEDIUM", 5,
			"LOW", 2);

	private final List<StaticAnalysisRule> rules;

	public RuleBasedAnalysisService(List<StaticAnalysisRule> rules) {
		this.rules = rules.stream()
				.sorted(Comparator.comparing(StaticAnalysisRule::id))
				.toList();
	}

	public AnalysisResult analyze(String fileName, String language, String sourceCode) {
		return analyzeContext(AnalysisContext.of(fileName, language, sourceCode), "single-file");
	}

	public AnalysisResult analyzeFiles(List<SourceUnit> sourceUnits) {
		return analyzeRepository("Repository", sourceUnits, null);
	}

	public AnalysisResult analyzeRepository(String repositoryName, List<SourceUnit> sourceUnits,
			AnalysisResult.RepositoryStats repositoryStats) {
		List<SourceUnit> units = sourceUnits == null ? List.of() : sourceUnits;
		List<Issue> allIssues = new ArrayList<>();
		List<RuleResult> allRuleResults = new ArrayList<>();
		List<AnalysisResult.FileInsight> fileInsights = new ArrayList<>();
		for (SourceUnit unit : units) {
			AnalysisResult result = analyze(unit.fileName(), unit.language(), unit.sourceCode());
			allIssues.addAll(result.getIssues());
			allRuleResults.addAll(result.getRuleResults());
			fileInsights.addAll(result.getFileInsights());
		}
		AnalysisResult merged = buildResult(repositoryName, "Repository", "repository", allIssues, allRuleResults,
				fileInsights);
		merged.setRepositoryStats(repositoryStats);
		merged.setSummary("Offline static analysis scanned " + units.size() + " files and found "
				+ merged.getIssues().size() + " issue" + (merged.getIssues().size() == 1 ? "" : "s")
				+ ". Quality score: " + merged.getQualityScore() + "/100.");
		merged.normalize();
		return merged;
	}

	private AnalysisResult analyzeContext(AnalysisContext context, String scanScope) {
		log.info("Starting offline static analysis for file={} language={}", context.fileName(), context.language());
		List<RuleResult> ruleResults = new ArrayList<>();
		List<Issue> issues = new ArrayList<>();
		for (StaticAnalysisRule rule : rules) {
			if (!rule.supports(context)) {
				continue;
			}
			RuleResult result = rule.analyze(context);
			result.normalize();
			result.getIssues().forEach(issue -> attachContext(issue, context));
			ruleResults.add(result);
			issues.addAll(result.getIssues());
		}
		AnalysisResult result = buildResult(context.fileName(), context.language(), scanScope, issues, ruleResults,
				List.of(fileInsight(context, issues)));
		log.info("Completed offline static analysis file={} issues={} score={}", context.fileName(),
				result.getIssues().size(), result.getQualityScore());
		return result;
	}

	private AnalysisResult buildResult(String fileName, String language, String scanScope, List<Issue> rawIssues,
			List<RuleResult> ruleResults, List<AnalysisResult.FileInsight> fileInsights) {
		List<Issue> issues = deduplicate(rawIssues);
		int qualityScore = qualityScore(issues);
		Map<String, Integer> severityCounts = AnalysisResult.countSeverities(issues);
		int securityScore = scoreByCategory(issues, Set.of("Security"), 100);
		int maintainabilityScore = scoreByCategory(issues, Set.of("Maintainability", "Code Smell", "Best Practice"), 100);
		int performanceScore = scoreByCategory(issues, Set.of("Performance"), 100);
		int documentationScore = documentationScore(fileInsights);
		int projectHealthScore = Math.round(
				(qualityScore + securityScore + maintainabilityScore + performanceScore + documentationScore) / 5.0f);

		AnalysisResult result = new AnalysisResult();
		result.setEngine("RuleBasedAnalysisService");
		result.setScanScope(scanScope);
		result.setIssues(issues);
		result.setRuleResults(ruleResults);
		result.setQualityScore(qualityScore);
		result.setSecurityScore(securityScore);
		result.setMaintainabilityScore(maintainabilityScore);
		result.setPerformanceScore(performanceScore);
		result.setDocumentationScore(documentationScore);
		result.setProjectHealthScore(projectHealthScore);
		result.setSeverityCounts(severityCounts);
		result.setTechnicalDebt(AnalysisResult.estimateDebt(severityCounts));
		result.setSummary("Offline static analysis scanned " + fileName + " (" + language + ") with "
				+ ruleResults.size() + " rule strategies and found " + issues.size() + " issue"
				+ (issues.size() == 1 ? "" : "s") + ". Quality score: " + qualityScore + "/100.");
		result.setTestSuggestions(testSuggestions(issues));
		result.setFixRecommendations(recommendations(issues));
		result.setFileInsights(fileInsights);
		result.normalize();
		return result;
	}

	private void attachContext(Issue issue, AnalysisContext context) {
		if (issue == null) {
			return;
		}
		if (issue.getFileName() == null || issue.getFileName().isBlank()) {
			issue.setFileName(context.fileName());
		}
		if (issue.getLanguage() == null || issue.getLanguage().isBlank()) {
			issue.setLanguage(context.language());
		}
	}

	private List<Issue> deduplicate(List<Issue> rawIssues) {
		Set<String> seen = new LinkedHashSet<>();
		List<Issue> unique = new ArrayList<>();
		if (rawIssues == null) {
			return unique;
		}
		for (Issue issue : rawIssues) {
			issue.normalize();
			String key = issue.getTitle() + "|" + issue.getLineNumber() + "|" + issue.getCategory();
			if (seen.add(key)) {
				unique.add(issue);
			}
		}
		return unique;
	}

	private int qualityScore(List<Issue> issues) {
		int penalty = 0;
		for (Issue issue : issues) {
			penalty += SCORE_PENALTIES.getOrDefault(Issue.normalizedSeverity(issue.getSeverity()), 2);
		}
		return Math.max(0, 100 - penalty);
	}

	private int scoreByCategory(List<Issue> issues, Set<String> categories, int fallbackScore) {
		List<Issue> matching = issues == null ? List.of() : issues.stream()
				.filter(issue -> categories.contains(issue.getCategory()))
				.toList();
		if (matching.isEmpty()) {
			return fallbackScore;
		}
		return qualityScore(matching);
	}

	private int documentationScore(List<AnalysisResult.FileInsight> fileInsights) {
		if (fileInsights == null || fileInsights.isEmpty()) {
			return 100;
		}
		double total = 0;
		for (AnalysisResult.FileInsight insight : fileInsights) {
			total += insight.getLinesOfCode() > 80 && insight.getNumberOfFunctions() > 5 ? 82 : 94;
		}
		return Math.max(0, Math.min(100, Math.round((float) (total / fileInsights.size()))));
	}

	private AnalysisResult.FileInsight fileInsight(AnalysisContext context, List<Issue> issues) {
		List<String> lines = context.lines();
		int loc = 0;
		int imports = 0;
		int dependencies = 0;
		int functions = 0;
		int classes = 0;
		int decisionPoints = 0;

		for (String line : lines) {
			String trimmed = line.trim();
			if (trimmed.isEmpty()) {
				continue;
			}
			loc++;
			String lower = trimmed.toLowerCase(Locale.ROOT);
			if (lower.startsWith("import ") || lower.startsWith("from ") || lower.startsWith("#include")
					|| lower.contains("require(")) {
				imports++;
				dependencies++;
			}
			if (lower.matches(".*\\b(class|interface|enum|record)\\b.*")) {
				classes++;
			}
			if (looksLikeFunction(trimmed, lower)) {
				functions++;
			}
			decisionPoints += countDecisionPoints(lower);
		}

		int complexityScore = Math.min(100, 10 + decisionPoints * 4);
		int quality = qualityScore(issues);
		int security = scoreByCategory(issues, Set.of("Security"), 100);
		int maintainability = Math.max(0, Math.min(100,
				scoreByCategory(issues, Set.of("Maintainability", "Code Smell", "Best Practice"), 100)
						- Math.max(0, complexityScore - 55) / 2));

		AnalysisResult.FileInsight insight = new AnalysisResult.FileInsight();
		insight.setFileName(context.fileName());
		insight.setFileSize(context.sourceCode().getBytes().length);
		insight.setFileType(SourceFileUtil.extension(context.fileName()).toUpperCase(Locale.ROOT));
		insight.setLanguage(context.language());
		insight.setLinesOfCode(loc);
		insight.setNumberOfFunctions(functions);
		insight.setNumberOfClasses(classes);
		insight.setNumberOfImports(imports);
		insight.setNumberOfDependencies(dependencies);
		insight.setComplexityScore(complexityScore);
		insight.setMaintainabilityScore(maintainability);
		insight.setSecurityScore(security);
		insight.setQualityScore(quality);
		insight.setTechnicalDebt(AnalysisResult.estimateDebt(AnalysisResult.countSeverities(issues)));
		insight.setLastScanTime(Instant.now().toString());
		insight.normalize();
		return insight;
	}

	private boolean looksLikeFunction(String trimmed, String lower) {
		return lower.startsWith("function ")
				|| lower.matches(".*\\b(function|def|fn)\\s+[a-zA-Z_][\\w$]*\\s*\\(.*")
				|| lower.matches(".*\\b[a-zA-Z_][\\w$]*\\s*=\\s*\\([^)]*\\)\\s*=>.*")
				|| trimmed.matches(".*\\b(public|private|protected|static)\\b.*\\([^)]*\\).*")
				|| trimmed.matches(".*[A-Za-z0-9_<>\\[\\]]+\\s+[A-Za-z0-9_]+\\s*\\([^)]*\\)\\s*\\{?.*");
	}

	private int countDecisionPoints(String lower) {
		int count = 0;
		for (String token : List.of(" if ", " for ", " while ", " catch ", " case ", " switch ", "&&", "||", "?")) {
			int index = 0;
			while ((index = lower.indexOf(token, index)) >= 0) {
				count++;
				index += token.length();
			}
		}
		return count;
	}

	private List<AnalysisResult.TestSuggestion> testSuggestions(List<Issue> issues) {
		List<AnalysisResult.TestSuggestion> tests = new ArrayList<>();
		if (issues.stream().anyMatch(issue -> "Security".equals(issue.getCategory()))) {
			tests.add(new AnalysisResult.TestSuggestion("Security regression coverage", "security", "high",
					"Add tests for credential handling, SQL parameter binding, and unsafe input paths flagged by the scanner."));
		}
		if (issues.stream().anyMatch(issue -> "Accessibility".equals(issue.getCategory()))) {
			tests.add(new AnalysisResult.TestSuggestion("Accessibility smoke checks", "accessibility", "medium",
					"Add automated checks for alt text, labels, and accessible names on interactive controls."));
		}
		if (issues.stream().anyMatch(issue -> "HIGH".equals(Issue.normalizedSeverity(issue.getSeverity()))
				|| "CRITICAL".equals(Issue.normalizedSeverity(issue.getSeverity())))) {
			tests.add(new AnalysisResult.TestSuggestion("Failure-path unit tests", "unit", "high",
					"Cover exceptional branches and boundary inputs around high-severity findings."));
		}
		if (tests.isEmpty()) {
			tests.add(new AnalysisResult.TestSuggestion("Static-analysis regression check", "quality", "low",
					"Keep this file in regular scans and add focused tests for future behavioral changes."));
		}
		return tests;
	}

	private List<String> recommendations(List<Issue> issues) {
		Map<String, String> byCategory = new LinkedHashMap<>();
		for (Issue issue : issues) {
			byCategory.putIfAbsent(issue.getCategory(), issue.getSolution());
		}
		if (byCategory.isEmpty()) {
			return List.of("No rule violations were detected. Continue scanning each change before release.");
		}
		return new ArrayList<>(byCategory.values()).stream().limit(6).toList();
	}

	public record SourceUnit(String fileName, String language, String sourceCode, long fileSize) {
	}
}
