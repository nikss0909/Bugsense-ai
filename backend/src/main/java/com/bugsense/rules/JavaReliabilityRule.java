package com.bugsense.rules;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import com.bugsense.domain.Issue;
import com.bugsense.domain.RuleResult;

@Component
public class JavaReliabilityRule implements StaticAnalysisRule {

	private static final Pattern DIVISION_BY_ZERO = Pattern.compile("(?<![\\w.])/\\s*0+(?:\\.0+)?\\b");

	private static final Pattern RISKY_CALL = Pattern.compile(
			"\\b(Files\\.|Paths\\.|Integer\\.parseInt|Long\\.parseLong|Double\\.parseDouble|Thread\\.sleep|new\\s+FileInputStream|new\\s+FileReader|new\\s+Scanner)\\b");

	private static final Pattern RESOURCE_ASSIGNMENT = Pattern.compile(
			"\\b([A-Za-z_$][\\w$]*)\\s*=\\s*new\\s+(FileInputStream|FileOutputStream|FileReader|FileWriter|BufferedReader|Scanner|Connection|Statement|PreparedStatement)\\b");

	@Override
	public String id() {
		return "java-reliability";
	}

	@Override
	public String name() {
		return "Java reliability risks";
	}

	@Override
	public Set<LanguageFamily> supportedLanguages() {
		return Set.of(LanguageFamily.JAVA);
	}

	@Override
	public RuleResult analyze(AnalysisContext context) {
		List<Issue> issues = new ArrayList<>();
		Set<String> reportedResources = new HashSet<>();
		boolean insideTry = false;
		for (int index = 0; index < context.lines().size(); index++) {
			String rawLine = context.lines().get(index);
			String code = RuleSupport.withoutStrings(RuleSupport.stripInlineComment(rawLine));
			if (DIVISION_BY_ZERO.matcher(code).find()) {
				issues.add(RuleSupport.issue("Division by zero",
						"An arithmetic expression divides by zero, which will fail at runtime.",
						"HIGH", "Code Smell", index + 1,
						"Validate the denominator and handle zero before performing division."));
			}
			if (code.matches(".*\\bwhile\\s*\\(\\s*true\\s*\\).*")
					|| code.matches(".*\\bfor\\s*\\(\\s*;\\s*;\\s*\\).*")) {
				issues.add(RuleSupport.issue("Possible infinite loop",
						"A loop has no visible termination condition and can consume CPU indefinitely.",
						"HIGH", "Performance", index + 1,
						"Add a clear exit condition or document and guard intentional long-running loops."));
			}

			if (code.contains("try") && code.contains("{")) {
				insideTry = true;
			}
			if (!insideTry && !rawLine.contains(" throws ") && RISKY_CALL.matcher(code).find()) {
				issues.add(RuleSupport.issue("Missing exception handling",
						"A risky operation appears outside a try/catch block or method throws declaration.",
						"MEDIUM", "Best Practice", index + 1,
						"Handle the checked/runtime failure path and return a useful error to the caller."));
			}

			Matcher resourceMatcher = RESOURCE_ASSIGNMENT.matcher(code);
			while (resourceMatcher.find()) {
				String variable = resourceMatcher.group(1);
				if (!reportedResources.add(variable)) {
					continue;
				}
				boolean closed = context.sourceCode().contains(variable + ".close()")
						|| rawLine.contains("try (")
						|| previousLineStartsTryWithResource(context.lines(), index);
				if (!closed) {
					issues.add(RuleSupport.issue("Possible resource leak",
							"Resource '" + variable + "' is opened without an obvious close or try-with-resources block.",
							"HIGH", "Performance", index + 1,
							"Use try-with-resources so streams, scanners, statements, and connections close deterministically."));
				}
			}
			if (code.contains("}")) {
				insideTry = false;
			}
		}
		return RuleSupport.result(this, issues);
	}

	private boolean previousLineStartsTryWithResource(List<String> lines, int index) {
		if (index <= 0) {
			return false;
		}
		return lines.get(index - 1).contains("try (");
	}
}
