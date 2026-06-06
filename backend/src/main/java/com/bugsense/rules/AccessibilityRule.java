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
public class AccessibilityRule implements StaticAnalysisRule {

	private static final Pattern IMAGE_TAG = Pattern.compile("(?i)<img\\b[^>]*>");

	private static final Pattern INPUT_TAG = Pattern.compile("(?i)<(input|select|textarea)\\b[^>]*>");

	private static final Pattern LABEL_FOR = Pattern.compile("(?i)<label\\b[^>]*\\bfor\\s*=\\s*['\"]([^'\"]+)['\"][^>]*>");

	private static final Pattern ID_ATTRIBUTE = Pattern.compile("(?i)\\bid\\s*=\\s*['\"]([^'\"]+)['\"]");

	private static final Pattern BUTTON_WITHOUT_TEXT = Pattern.compile("(?is)<button\\b(?![^>]*aria-label)[^>]*>\\s*</button>");

	@Override
	public String id() {
		return "accessibility-html-controls";
	}

	@Override
	public String name() {
		return "HTML accessibility";
	}

	@Override
	public Set<LanguageFamily> supportedLanguages() {
		return Set.of(LanguageFamily.HTML);
	}

	@Override
	public RuleResult analyze(AnalysisContext context) {
		List<Issue> issues = new ArrayList<>();
		Set<String> labelledIds = labelledIds(context.sourceCode());
		for (RuleSupport.Match match : RuleSupport.findMatches(IMAGE_TAG, context.sourceCode())) {
			if (!match.text().matches("(?is).*\\balt\\s*=.*")) {
				issues.add(RuleSupport.issue("Image missing alt attribute",
						"Images without alt text are not announced correctly by assistive technologies.",
						"MEDIUM", "Accessibility", match.lineNumber(),
						"Add meaningful alt text, or use alt=\"\" for decorative images."));
			}
		}
		for (RuleSupport.Match match : RuleSupport.findMatches(INPUT_TAG, context.sourceCode())) {
			String tag = match.text();
			if (tag.matches("(?is).*\\btype\\s*=\\s*['\"]hidden['\"].*")) {
				continue;
			}
			boolean hasAccessibleName = tag.matches("(?is).*\\baria-label\\s*=.*")
					|| tag.matches("(?is).*\\baria-labelledby\\s*=.*")
					|| labelledIds.contains(attributeValue(ID_ATTRIBUTE, tag));
			if (!hasAccessibleName) {
				issues.add(RuleSupport.issue("Form control missing label",
						"A form control has no associated label or accessible name.",
						"MEDIUM", "Accessibility", match.lineNumber(),
						"Associate a visible <label> with the control or provide aria-label/aria-labelledby."));
			}
		}
		for (RuleSupport.Match match : RuleSupport.findMatches(BUTTON_WITHOUT_TEXT, context.sourceCode())) {
			issues.add(RuleSupport.issue("Button missing accessible name",
					"An empty button has no text or aria-label for screen readers.",
					"MEDIUM", "Accessibility", match.lineNumber(),
					"Add visible button text or an aria-label that describes the action."));
		}
		return RuleSupport.result(this, issues);
	}

	private Set<String> labelledIds(String source) {
		Set<String> ids = new HashSet<>();
		Matcher matcher = LABEL_FOR.matcher(source);
		while (matcher.find()) {
			ids.add(matcher.group(1));
		}
		return ids;
	}

	private String attributeValue(Pattern pattern, String tag) {
		Matcher matcher = pattern.matcher(tag);
		return matcher.find() ? matcher.group(1) : "";
	}
}
