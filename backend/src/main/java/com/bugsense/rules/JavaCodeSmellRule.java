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
public class JavaCodeSmellRule implements StaticAnalysisRule {

	private static final Pattern VARIABLE_DECLARATION = Pattern.compile(
			"\\b(?:String|int|long|double|float|boolean|char|var|List<[^>]+>|Map<[^>]+>|Set<[^>]+>)\\s+([a-z][A-Za-z0-9_$]*)\\s*(?:=|;)");

	private static final Pattern MAGIC_NUMBER = Pattern.compile("(?<![\\w.])-?\\b(\\d{2,}|[3-9])\\b(?![\\w.])");

	@Override
	public String id() {
		return "java-code-smells";
	}

	@Override
	public String name() {
		return "Java maintainability smells";
	}

	@Override
	public Set<LanguageFamily> supportedLanguages() {
		return Set.of(LanguageFamily.JAVA);
	}

	@Override
	public RuleResult analyze(AnalysisContext context) {
		List<Issue> issues = new ArrayList<>();
		int magicNumbersReported = 0;
		for (int index = 0; index < context.lines().size(); index++) {
			String rawLine = context.lines().get(index);
			String code = RuleSupport.withoutStrings(RuleSupport.stripInlineComment(rawLine));
			if (code.contains("System.out.println")) {
				issues.add(RuleSupport.issue("System.out.println usage",
						"Console printing in application code makes logs harder to route, filter, and secure.",
						"LOW", "Best Practice", index + 1,
						"Use the application logger with an appropriate log level and structured context."));
			}

			Matcher variableMatcher = VARIABLE_DECLARATION.matcher(code);
			while (variableMatcher.find()) {
				String variable = variableMatcher.group(1);
				if (!isCommonLoopVariable(variable) && occurrences(context.sourceCode(), variable) <= 1) {
					issues.add(RuleSupport.issue("Unused variable",
							"Variable '" + variable + "' is declared but not used elsewhere in the file.",
							"LOW", "Maintainability", index + 1,
							"Remove the variable or use it in the intended calculation."));
				}
			}

			if (magicNumbersReported < 8 && !code.matches(".*\\b(static\\s+final|final\\s+static|final)\\b.*")) {
				Matcher numberMatcher = MAGIC_NUMBER.matcher(code);
				if (numberMatcher.find() && !looksLikeImportOrAnnotation(code)) {
					magicNumbersReported++;
					issues.add(RuleSupport.issue("Magic number",
							"Numeric literal '" + numberMatcher.group(1) + "' is embedded without a named meaning.",
							"LOW", "Maintainability", index + 1,
							"Replace the literal with a named constant that explains the business rule."));
				}
			}
		}
		return RuleSupport.result(this, issues);
	}

	private int occurrences(String source, String variable) {
		Matcher matcher = Pattern.compile("\\b" + Pattern.quote(variable) + "\\b").matcher(source);
		int count = 0;
		while (matcher.find()) {
			count++;
		}
		return count;
	}

	private boolean isCommonLoopVariable(String variable) {
		return variable.length() == 1 && "ijk".contains(variable);
	}

	private boolean looksLikeImportOrAnnotation(String code) {
		String trimmed = code.trim();
		return trimmed.startsWith("import ") || trimmed.startsWith("@");
	}
}
