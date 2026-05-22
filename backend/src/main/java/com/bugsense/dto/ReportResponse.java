package com.bugsense.dto;

import java.time.Instant;

import com.bugsense.domain.AnalysisResult;
import com.bugsense.domain.BugReport;

public record ReportResponse(String id, String fileName, String language, long fileSize, String status,
		String sourcePreview, AnalysisResult analysis, Instant createdAt) {
	public static ReportResponse from(BugReport report) {
		return new ReportResponse(report.getId(), report.getFileName(), report.getLanguage(), report.getFileSize(),
				report.getStatus(), report.getSourcePreview(), report.getAnalysis(), report.getCreatedAt());
	}
}
