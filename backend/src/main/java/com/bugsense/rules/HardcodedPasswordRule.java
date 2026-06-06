package com.bugsense.rules;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import com.bugsense.domain.Issue;
import com.bugsense.domain.RuleResult;

@Component
public class HardcodedPasswordRule implements StaticAnalysisRule {

	private static final Pattern ASSIGNMENT = Pattern.compile(
			"(?i)\\b(password|passwd|pwd|secret|token|api[_-]?key|client_secret)\\b\\s*[:=]\\s*([\"'`])([^\"'`\\r\\n]{4,})\\2");

	private static final Pattern HTML_VALUE = Pattern.compile(
			"(?i)<input[^>]+(?:name|id)\\s*=\\s*([\"'])(?:password|secret|token|api[_-]?key)\\1[^>]+value\\s*=\\s*([\"'])[^\"']{4,}\\2");

	@Override
	public String id() {
		return "security-hardcoded-secret";
	}

	@Override
	public String name() {
		return "Hardcoded password or secret";
	}

	@Override
	public Set<LanguageFamily> supportedLanguages() {
		return Set.of(LanguageFamily.JAVA, LanguageFamily.JAVASCRIPT, LanguageFamily.SQL, LanguageFamily.HTML,
				LanguageFamily.OTHER);
	}

	@Override
	public RuleResult analyze(AnalysisContext context) {
		List<Issue> issues = new ArrayList<>();
		for (RuleSupport.Match match : RuleSupport.findMatches(ASSIGNMENT, context.sourceCode())) {
			issues.add(RuleSupport.issue("Hardcoded secret detected",
					"A credential-like value is embedded directly in source code, which can leak through logs, version control, or deployments.",
					"CRITICAL", "Security", match.lineNumber(),
					"Move secrets to environment variables, a vault, or a secure configuration provider and rotate the exposed value."));
		}
		for (RuleSupport.Match match : RuleSupport.findMatches(HTML_VALUE, context.sourceCode())) {
			issues.add(RuleSupport.issue("Hardcoded credential value in markup",
					"Sensitive values should not be rendered into HTML because users and browser tooling can inspect them.",
					"CRITICAL", "Security", match.lineNumber(),
					"Remove the value from markup and exchange sensitive data only through authenticated server-side flows."));
		}
		return RuleSupport.result(this, issues);
	}
}
