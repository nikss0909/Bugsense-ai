package com.bugsense.dto;

import java.util.List;
import java.util.Map;

public record DashboardStats(long totalReports, long totalScans, int totalFindings, double averageQualityScore,
		Map<String, Integer> severityTotals, Map<String, Long> languageUsage, Map<String, Long> mostCommonIssueTypes,
		List<ReportResponse> recentReports) {
}
