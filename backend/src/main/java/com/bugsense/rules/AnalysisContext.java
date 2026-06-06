package com.bugsense.rules;

import java.util.Arrays;
import java.util.List;

public record AnalysisContext(String fileName, String language, String sourceCode, List<String> lines,
		LanguageFamily languageFamily) {

	public static AnalysisContext of(String fileName, String language, String sourceCode) {
		String source = sourceCode == null ? "" : sourceCode;
		List<String> lines = Arrays.asList(source.split("\\R", -1));
		return new AnalysisContext(fileName, language, source, lines, LanguageFamily.from(language, fileName));
	}
}
