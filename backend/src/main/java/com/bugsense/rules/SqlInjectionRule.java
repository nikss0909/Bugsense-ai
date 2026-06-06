package com.bugsense.rules;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import com.bugsense.domain.Issue;
import com.bugsense.domain.RuleResult;

@Component
public class SqlInjectionRule implements StaticAnalysisRule {

	private static final Pattern SELECT_STAR = Pattern.compile("(?i)\\bselect\\s+\\*\\s+from\\b");

	private static final Pattern STRING_CONCAT_SQL = Pattern.compile(
			"(?i)(select|insert|update|delete)\\b[^;\\n]*(\\+|\\$\\{|%s|String\\.format|format\\()");

	private static final Pattern RAW_EXECUTION = Pattern.compile(
			"(?i)\\b(createStatement|executeQuery|executeUpdate|query|rawQuery)\\s*\\([^)]*[A-Za-z_$][\\w$]*[^)]*\\)");

	@Override
	public String id() {
		return "security-sql-injection";
	}

	@Override
	public String name() {
		return "SQL injection and unsafe SQL";
	}

	@Override
	public Set<LanguageFamily> supportedLanguages() {
		return Set.of(LanguageFamily.SQL, LanguageFamily.JAVA, LanguageFamily.JAVASCRIPT);
	}

	@Override
	public RuleResult analyze(AnalysisContext context) {
		List<Issue> issues = new ArrayList<>();
		for (RuleSupport.Match match : RuleSupport.findMatches(SELECT_STAR, context.sourceCode())) {
			issues.add(RuleSupport.issue("SELECT * usage",
					"Selecting every column increases I/O and can break consumers when schemas change.",
					"LOW", "Performance", match.lineNumber(),
					"Select only the columns the caller needs and keep the result shape explicit."));
		}
		for (RuleSupport.Match match : RuleSupport.findMatches(STRING_CONCAT_SQL, context.sourceCode())) {
			issues.add(RuleSupport.issue("Possible SQL injection",
					"SQL appears to be composed with string interpolation or concatenation, which can let user input change query structure.",
					"CRITICAL", "Security", match.lineNumber(),
					"Use parameterized queries, prepared statements, or a query builder that binds user input separately."));
		}
		for (RuleSupport.Match match : RuleSupport.findMatches(RAW_EXECUTION, context.sourceCode())) {
			issues.add(RuleSupport.issue("Raw SQL execution",
					"Executing dynamic SQL through a raw statement API can be vulnerable when variables include user-controlled data.",
					"HIGH", "Security", match.lineNumber(),
					"Prefer prepared statements and bind all external values as parameters."));
		}
		return RuleSupport.result(this, issues);
	}
}
