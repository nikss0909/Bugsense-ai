package com.bugsense.rules;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import com.bugsense.domain.Issue;
import com.bugsense.domain.RuleResult;

@Component
public class LongMethodRule implements StaticAnalysisRule {

	private static final int LONG_METHOD_LINES = 50;

	private static final Pattern JAVA_METHOD = Pattern.compile(
			"\\b(?:public|private|protected)?\\s*(?:static\\s+)?(?:final\\s+)?[\\w<>\\[\\], ?]+\\s+[A-Za-z_$][\\w$]*\\s*\\([^;]*\\)\\s*(?:throws\\s+[\\w, ]+)?\\{");

	private static final Pattern JS_FUNCTION = Pattern.compile(
			"\\bfunction\\s+[A-Za-z_$][\\w$]*\\s*\\([^)]*\\)\\s*\\{|(?:const|let|var)\\s+[A-Za-z_$][\\w$]*\\s*=\\s*(?:async\\s*)?\\([^)]*\\)\\s*=>\\s*\\{");

	@Override
	public String id() {
		return "maintainability-long-method";
	}

	@Override
	public String name() {
		return "Long method";
	}

	@Override
	public Set<LanguageFamily> supportedLanguages() {
		return Set.of(LanguageFamily.JAVA, LanguageFamily.JAVASCRIPT);
	}

	@Override
	public RuleResult analyze(AnalysisContext context) {
		List<Issue> issues = new ArrayList<>();
		Pattern declaration = context.languageFamily() == LanguageFamily.JAVA ? JAVA_METHOD : JS_FUNCTION;
		List<String> lines = context.lines();
		for (int index = 0; index < lines.size(); index++) {
			String code = RuleSupport.withoutStrings(RuleSupport.stripInlineComment(lines.get(index)));
			if (!declaration.matcher(code).find() || isControlStatement(code)) {
				continue;
			}
			int end = findBlockEnd(lines, index);
			if (end > index) {
				int length = end - index + 1;
				if (length > LONG_METHOD_LINES) {
					issues.add(RuleSupport.issue("Long method",
							"This method is " + length + " lines long, increasing the cost of testing and maintenance.",
							"MEDIUM", "Maintainability", index + 1,
							"Extract focused helper methods and keep each method responsible for one clear operation."));
				}
				index = end;
			}
		}
		return RuleSupport.result(this, issues);
	}

	private boolean isControlStatement(String code) {
		return code.matches(".*\\b(if|for|while|switch|catch|try)\\s*\\(.*");
	}

	private int findBlockEnd(List<String> lines, int start) {
		int depth = 0;
		boolean opened = false;
		for (int index = start; index < lines.size(); index++) {
			String code = RuleSupport.withoutStrings(RuleSupport.stripInlineComment(lines.get(index)));
			for (int charIndex = 0; charIndex < code.length(); charIndex++) {
				char current = code.charAt(charIndex);
				if (current == '{') {
					depth++;
					opened = true;
				} else if (current == '}') {
					depth--;
					if (opened && depth == 0) {
						return index;
					}
				}
			}
		}
		return -1;
	}
}
