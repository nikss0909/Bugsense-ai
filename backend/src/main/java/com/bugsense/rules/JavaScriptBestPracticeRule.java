package com.bugsense.rules;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import com.bugsense.domain.Issue;
import com.bugsense.domain.RuleResult;

@Component
public class JavaScriptBestPracticeRule implements StaticAnalysisRule {

	private static final Pattern VAR_USAGE = Pattern.compile("\\bvar\\s+[A-Za-z_$][\\w$]*");

	private static final Pattern LOOSE_EQUALITY = Pattern.compile("(?<![=!])==(?![=])");

	@Override
	public String id() {
		return "javascript-best-practices";
	}

	@Override
	public String name() {
		return "JavaScript best practices";
	}

	@Override
	public Set<LanguageFamily> supportedLanguages() {
		return Set.of(LanguageFamily.JAVASCRIPT);
	}

	@Override
	public RuleResult analyze(AnalysisContext context) {
		List<Issue> issues = new ArrayList<>();
		for (int index = 0; index < context.lines().size(); index++) {
			String code = RuleSupport.withoutStrings(RuleSupport.stripInlineComment(context.lines().get(index)));
			if (code.contains("console.log")) {
				issues.add(RuleSupport.issue("console.log usage",
						"Debug logging left in client code can leak data and clutter browser output.",
						"LOW", "Best Practice", index + 1,
						"Remove debug logging or route messages through the app logger with environment checks."));
			}
			if (VAR_USAGE.matcher(code).find()) {
				issues.add(RuleSupport.issue("var usage",
						"var is function-scoped and can create subtle reassignment and hoisting bugs.",
						"LOW", "Best Practice", index + 1,
						"Use const by default and let only when reassignment is required."));
			}
			if (LOOSE_EQUALITY.matcher(code).find()) {
				issues.add(RuleSupport.issue("Loose equality operator",
						"== performs type coercion and can hide comparison bugs.",
						"MEDIUM", "Best Practice", index + 1,
						"Use === or !== so comparisons are explicit and type-safe."));
			}
		}
		return RuleSupport.result(this, issues);
	}
}
