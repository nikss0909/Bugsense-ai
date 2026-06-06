package com.bugsense.rules;

import java.util.Set;

import com.bugsense.domain.RuleResult;

public interface StaticAnalysisRule {

	String id();

	String name();

	Set<LanguageFamily> supportedLanguages();

	RuleResult analyze(AnalysisContext context);

	default boolean supports(AnalysisContext context) {
		return supportedLanguages().contains(context.languageFamily())
				|| supportedLanguages().contains(LanguageFamily.OTHER);
	}
}
