package com.bugsense.rules;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import com.bugsense.domain.Issue;
import com.bugsense.domain.RuleResult;

@Component
public class NestedIfRule implements StaticAnalysisRule {

	private static final Pattern IF_PATTERN = Pattern.compile("\\bif\\s*\\(");

	@Override
	public String id() {
		return "complexity-nested-if";
	}

	@Override
	public String name() {
		return "Nested if and deep nesting";
	}

	@Override
	public Set<LanguageFamily> supportedLanguages() {
		return Set.of(LanguageFamily.JAVA, LanguageFamily.JAVASCRIPT);
	}

	@Override
	public RuleResult analyze(AnalysisContext context) {
		List<Issue> issues = new ArrayList<>();
		Deque<String> blockStack = new ArrayDeque<>();
		boolean reportedDeepNesting = false;
		for (int index = 0; index < context.lines().size(); index++) {
			String code = RuleSupport.withoutStrings(RuleSupport.stripInlineComment(context.lines().get(index)));
			for (int i = 0; i < count(code, '}') && !blockStack.isEmpty(); i++) {
				blockStack.pop();
			}

			boolean isIf = IF_PATTERN.matcher(code).find();
			long openBlocks = count(code, '{');
			long ifDepth = blockStack.stream().filter("if"::equals).count();
			if (isIf && ifDepth >= 1) {
				issues.add(RuleSupport.issue("Nested if statement",
						"Nested conditionals make the control flow harder to test and reason about.",
						ifDepth >= 2 ? "HIGH" : "MEDIUM", "Maintainability", index + 1,
						"Use guard clauses, combine predicates, or extract the nested branch into a named method."));
			}
			if (!reportedDeepNesting && blockStack.size() >= 5) {
				reportedDeepNesting = true;
				issues.add(RuleSupport.issue("Deep nesting",
						"The block nesting depth is high enough to make this code difficult to review and maintain.",
						"HIGH", "Maintainability", index + 1,
						"Flatten control flow with early returns and move cohesive branches into smaller methods."));
			}
			for (int i = 0; i < openBlocks; i++) {
				blockStack.push(isIf && i == 0 ? "if" : "block");
			}
		}
		return RuleSupport.result(this, issues);
	}

	private int count(String value, char target) {
		int total = 0;
		for (int index = 0; index < value.length(); index++) {
			if (value.charAt(index) == target) {
				total++;
			}
		}
		return total;
	}
}
