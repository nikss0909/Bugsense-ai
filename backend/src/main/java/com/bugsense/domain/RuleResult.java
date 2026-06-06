package com.bugsense.domain;

import java.util.ArrayList;
import java.util.List;

public class RuleResult {

	private String ruleId;

	private String ruleName;

	private List<Issue> issues = new ArrayList<>();

	public RuleResult() {
	}

	public RuleResult(String ruleId, String ruleName, List<Issue> issues) {
		this.ruleId = ruleId;
		this.ruleName = ruleName;
		this.issues = issues == null ? new ArrayList<>() : new ArrayList<>(issues);
		normalize();
	}

	public static RuleResult empty(String ruleId, String ruleName) {
		return new RuleResult(ruleId, ruleName, List.of());
	}

	public void addIssue(Issue issue) {
		if (issue != null) {
			issues.add(issue);
		}
	}

	public void normalize() {
		if (ruleId == null || ruleId.isBlank()) {
			ruleId = "unknown-rule";
		}
		if (ruleName == null || ruleName.isBlank()) {
			ruleName = ruleId;
		}
		if (issues == null) {
			issues = new ArrayList<>();
		}
		issues.forEach(Issue::normalize);
	}

	public String getRuleId() {
		return ruleId;
	}

	public void setRuleId(String ruleId) {
		this.ruleId = ruleId;
	}

	public String getRuleName() {
		return ruleName;
	}

	public void setRuleName(String ruleName) {
		this.ruleName = ruleName;
	}

	public List<Issue> getIssues() {
		return issues;
	}

	public void setIssues(List<Issue> issues) {
		this.issues = issues;
	}
}
