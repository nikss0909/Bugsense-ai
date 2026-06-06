package com.bugsense.rules;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import com.bugsense.domain.Issue;
import com.bugsense.domain.RuleResult;

@Component
public class EmptyCatchRule implements StaticAnalysisRule {

	private static final Pattern CATCH_PATTERN = Pattern.compile("\\bcatch\\s*\\(");

	@Override
	public String id() {
		return "reliability-empty-catch";
	}

	@Override
	public String name() {
		return "Empty catch block";
	}

	@Override
	public Set<LanguageFamily> supportedLanguages() {
		return Set.of(LanguageFamily.JAVA, LanguageFamily.JAVASCRIPT);
	}

	@Override
	public RuleResult analyze(AnalysisContext context) {
		List<Issue> issues = new ArrayList<>();
		List<String> lines = context.lines();
		for (int index = 0; index < lines.size(); index++) {
			if (!CATCH_PATTERN.matcher(lines.get(index)).find()) {
				continue;
			}
			if (hasEmptyBody(lines, index)) {
				issues.add(RuleSupport.issue("Empty catch block",
						"An exception is caught and ignored, hiding failures that should be logged, handled, or rethrown.",
						"HIGH", "Best Practice", index + 1,
						"Handle the exception explicitly, log useful context, or rethrow a domain-specific exception."));
			}
		}
		return RuleSupport.result(this, issues);
	}

	private boolean hasEmptyBody(List<String> lines, int catchLine) {
		boolean opened = false;
		int depth = 0;
		StringBuilder body = new StringBuilder();
		for (int index = catchLine; index < lines.size(); index++) {
			String line = lines.get(index);
			for (int charIndex = 0; charIndex < line.length(); charIndex++) {
				char current = line.charAt(charIndex);
				if (current == '{') {
					if (opened && depth > 0) {
						body.append(current);
					}
					opened = true;
					depth++;
					continue;
				}
				if (!opened) {
					continue;
				}
				if (current == '}') {
					depth--;
					if (depth == 0) {
						return isOnlyWhitespaceOrComments(body.toString());
					}
					body.append(current);
					continue;
				}
				if (depth > 0) {
					body.append(current);
				}
			}
			if (opened) {
				body.append('\n');
			}
		}
		return false;
	}

	private boolean isOnlyWhitespaceOrComments(String body) {
		String withoutBlockComments = body.replaceAll("(?s)/\\*.*?\\*/", "");
		String[] lines = withoutBlockComments.split("\\R");
		for (String line : lines) {
			String stripped = RuleSupport.stripInlineComment(line).trim();
			if (!stripped.isEmpty()) {
				return false;
			}
		}
		return true;
	}
}
