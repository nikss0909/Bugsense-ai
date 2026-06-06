package com.bugsense.rules;

import java.util.Locale;

public enum LanguageFamily {
	JAVA,
	JAVASCRIPT,
	SQL,
	HTML,
	OTHER;

	public static LanguageFamily from(String language, String fileName) {
		String value = ((language == null ? "" : language) + " " + (fileName == null ? "" : fileName))
				.toLowerCase(Locale.ROOT);
		if (value.endsWith(".js") || value.endsWith(".jsx") || value.endsWith(".ts") || value.endsWith(".tsx")
				|| value.contains("javascript") || value.contains("typescript") || value.contains("react")) {
			return JAVASCRIPT;
		}
		if (value.endsWith(".java") || value.contains("java")) {
			return JAVA;
		}
		if (value.endsWith(".sql") || value.contains("sql")) {
			return SQL;
		}
		if (value.endsWith(".html") || value.endsWith(".htm") || value.contains("html")) {
			return HTML;
		}
		return OTHER;
	}
}
