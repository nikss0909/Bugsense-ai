package com.bugsense.rules;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import com.bugsense.domain.Issue;
import com.bugsense.domain.RuleResult;

@Component
public class NullPointerRule implements StaticAnalysisRule {

	private static final Pattern NULL_ASSIGNMENT = Pattern.compile("\\b([A-Za-z_$][\\w$]*)\\s*=\\s*null\\s*;");

	private static final Pattern CHAINED_CALL = Pattern.compile("\\)\\s*\\.\\s*[A-Za-z_$][\\w$]*\\s*\\(");

	private static final Pattern VARIABLE_EQUALS = Pattern.compile("\\b([A-Za-z_$][\\w$]*)\\.equals\\s*\\(");

	@Override
	public String id() {
		return "java-null-pointer-risk";
	}

	@Override
	public String name() {
		return "NullPointerException risk";
	}

	@Override
	public Set<LanguageFamily> supportedLanguages() {
		return Set.of(LanguageFamily.JAVA);
	}

	@Override
	public RuleResult analyze(AnalysisContext context) {
		List<Issue> issues = new ArrayList<>();
		List<String> lines = context.lines();
		for (int index = 0; index < lines.size(); index++) {
			String code = RuleSupport.withoutStrings(RuleSupport.stripInlineComment(lines.get(index)));
			Matcher assignment = NULL_ASSIGNMENT.matcher(code);
			while (assignment.find()) {
				String variable = assignment.group(1);
				Integer dereferenceLine = dereferencedSoon(lines, index + 1, variable);
				if (dereferenceLine != null) {
					issues.add(RuleSupport.issue("Possible NullPointerException",
							"Variable '" + variable + "' is assigned null and later dereferenced without an obvious null check.",
							"HIGH", "Code Smell", dereferenceLine,
							"Guard '" + variable + "' before dereferencing it or avoid assigning null by using Optional or a safe default."));
				}
			}

			if (CHAINED_CALL.matcher(code).find()) {
				issues.add(RuleSupport.issue("Chained method call may dereference null",
						"A chained call can throw NullPointerException if an intermediate method returns null.",
						"MEDIUM", "Best Practice", index + 1,
						"Break the chain into named variables and validate nullable results before continuing."));
			}

			Matcher equalsMatcher = VARIABLE_EQUALS.matcher(code);
			while (equalsMatcher.find()) {
				String receiver = equalsMatcher.group(1);
				if (!"Objects".equals(receiver) && !"String".equals(receiver)) {
					issues.add(RuleSupport.issue("equals called on nullable receiver",
							"Calling equals on a variable receiver can throw NullPointerException when the receiver is null.",
							"LOW", "Best Practice", index + 1,
							"Use a constant receiver, Objects.equals(left, right), or check the receiver for null first."));
				}
			}
		}
		return RuleSupport.result(this, issues);
	}

	private Integer dereferencedSoon(List<String> lines, int startIndex, String variable) {
		Pattern nullCheck = Pattern.compile("\\b" + Pattern.quote(variable) + "\\s*(?:!=|==)\\s*null\\b");
		Pattern dereference = Pattern.compile("\\b" + Pattern.quote(variable) + "\\s*\\.");
		int end = Math.min(lines.size(), startIndex + 6);
		for (int index = startIndex; index < end; index++) {
			String code = RuleSupport.withoutStrings(RuleSupport.stripInlineComment(lines.get(index)));
			if (nullCheck.matcher(code).find()) {
				return null;
			}
			if (dereference.matcher(code).find()) {
				return index + 1;
			}
		}
		return null;
	}
}
