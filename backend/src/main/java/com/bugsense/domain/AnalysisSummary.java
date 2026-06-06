package com.bugsense.domain;

import java.util.List;

public class AnalysisSummary {

	private int totalIssues;

	private int criticalIssues;

	private int highIssues;

	private int mediumIssues;

	private int lowIssues;

	private int qualityScore;

	public AnalysisSummary() {
	}

	public AnalysisSummary(int totalIssues, int criticalIssues, int highIssues, int mediumIssues, int lowIssues,
			int qualityScore) {
		this.totalIssues = totalIssues;
		this.criticalIssues = criticalIssues;
		this.highIssues = highIssues;
		this.mediumIssues = mediumIssues;
		this.lowIssues = lowIssues;
		this.qualityScore = qualityScore;
	}

	public static AnalysisSummary from(List<Issue> issues, int qualityScore) {
		int critical = 0;
		int high = 0;
		int medium = 0;
		int low = 0;
		if (issues != null) {
			for (Issue issue : issues) {
				String severity = Issue.normalizedSeverity(issue.getSeverity());
				if ("CRITICAL".equals(severity)) {
					critical++;
				} else if ("HIGH".equals(severity)) {
					high++;
				} else if ("MEDIUM".equals(severity)) {
					medium++;
				} else {
					low++;
				}
			}
		}
		return new AnalysisSummary(critical + high + medium + low, critical, high, medium, low, qualityScore);
	}

	public int getTotalIssues() {
		return totalIssues;
	}

	public void setTotalIssues(int totalIssues) {
		this.totalIssues = totalIssues;
	}

	public int getCriticalIssues() {
		return criticalIssues;
	}

	public void setCriticalIssues(int criticalIssues) {
		this.criticalIssues = criticalIssues;
	}

	public int getHighIssues() {
		return highIssues;
	}

	public void setHighIssues(int highIssues) {
		this.highIssues = highIssues;
	}

	public int getMediumIssues() {
		return mediumIssues;
	}

	public void setMediumIssues(int mediumIssues) {
		this.mediumIssues = mediumIssues;
	}

	public int getLowIssues() {
		return lowIssues;
	}

	public void setLowIssues(int lowIssues) {
		this.lowIssues = lowIssues;
	}

	public int getQualityScore() {
		return qualityScore;
	}

	public void setQualityScore(int qualityScore) {
		this.qualityScore = qualityScore;
	}
}
