package com.bugsense.rules;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.bugsense.domain.Issue;
import com.bugsense.domain.RuleResult;

@Component
public class DuplicateCodeRule implements StaticAnalysisRule {

	@Override
	public String id() {
		return "maintainability-duplicate-code";
	}

	@Override
	public String name() {
		return "Duplicate code pattern";
	}

	@Override
	public Set<LanguageFamily> supportedLanguages() {
		return Set.of(LanguageFamily.JAVA, LanguageFamily.JAVASCRIPT, LanguageFamily.SQL, LanguageFamily.HTML);
	}

	@Override
	public RuleResult analyze(AnalysisContext context) {
		List<Issue> issues = new ArrayList<>();
		Map<String, Integer> firstLineByFingerprint = new LinkedHashMap<>();
		Map<String, Integer> counts = new LinkedHashMap<>();
		for (int index = 0; index < context.lines().size(); index++) {
			String fingerprint = fingerprint(context.lines().get(index));
			if (fingerprint.isBlank()) {
				continue;
			}
			firstLineByFingerprint.putIfAbsent(fingerprint, index + 1);
			counts.put(fingerprint, counts.getOrDefault(fingerprint, 0) + 1);
		}
		int reported = 0;
		for (Map.Entry<String, Integer> entry : counts.entrySet()) {
			if (entry.getValue() > 1 && reported < 5) {
				reported++;
				issues.add(RuleSupport.issue("Duplicate code pattern",
						"A non-trivial source line appears " + entry.getValue()
								+ " times, which may indicate copy-pasted logic.",
						"MEDIUM", "Maintainability", firstLineByFingerprint.get(entry.getKey()),
						"Extract the repeated logic into a shared method, component, query fragment, or constant."));
			}
		}
		return RuleSupport.result(this, issues);
	}

	private String fingerprint(String line) {
		String value = RuleSupport.stripInlineComment(line).trim().replaceAll("\\s+", " ");
		if (value.length() < 28 || value.equals("{") || value.equals("}")) {
			return "";
		}
		if (value.startsWith("import ") || value.startsWith("package ")) {
			return "";
		}
		return value;
	}
}
