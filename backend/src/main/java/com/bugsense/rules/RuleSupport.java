package com.bugsense.rules;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.bugsense.domain.Issue;
import com.bugsense.domain.RuleResult;

final class RuleSupport {

	private RuleSupport() {
	}

	static RuleResult result(StaticAnalysisRule rule, List<Issue> issues) {
		return new RuleResult(rule.id(), rule.name(), issues);
	}

	static Issue issue(String title, String description, String severity, String category, int lineNumber,
			String solution) {
		return new Issue(title, description, severity, category, lineNumber, solution);
	}

	static int lineNumberAt(String source, int index) {
		int line = 1;
		int end = Math.min(index, source.length());
		for (int i = 0; i < end; i++) {
			if (source.charAt(i) == '\n') {
				line++;
			}
		}
		return line;
	}

	static List<Match> findMatches(Pattern pattern, String source) {
		List<Match> matches = new ArrayList<>();
		Matcher matcher = pattern.matcher(source);
		while (matcher.find()) {
			matches.add(new Match(matcher.group(), lineNumberAt(source, matcher.start())));
		}
		return matches;
	}

	static String stripInlineComment(String line) {
		int slashComment = line.indexOf("//");
		int hashComment = line.indexOf("#");
		int index = -1;
		if (slashComment >= 0) {
			index = slashComment;
		}
		if (hashComment >= 0 && (index < 0 || hashComment < index)) {
			index = hashComment;
		}
		return index >= 0 ? line.substring(0, index) : line;
	}

	static String withoutStrings(String line) {
		StringBuilder builder = new StringBuilder(line.length());
		boolean inSingle = false;
		boolean inDouble = false;
		boolean inBacktick = false;
		boolean escaped = false;
		for (int i = 0; i < line.length(); i++) {
			char current = line.charAt(i);
			if (escaped) {
				builder.append(' ');
				escaped = false;
				continue;
			}
			if (current == '\\' && (inSingle || inDouble || inBacktick)) {
				builder.append(' ');
				escaped = true;
				continue;
			}
			if (current == '\'' && !inDouble && !inBacktick) {
				inSingle = !inSingle;
				builder.append(' ');
				continue;
			}
			if (current == '"' && !inSingle && !inBacktick) {
				inDouble = !inDouble;
				builder.append(' ');
				continue;
			}
			if (current == '`' && !inSingle && !inDouble) {
				inBacktick = !inBacktick;
				builder.append(' ');
				continue;
			}
			builder.append(inSingle || inDouble || inBacktick ? ' ' : current);
		}
		return builder.toString();
	}

	record Match(String text, int lineNumber) {
	}
}
