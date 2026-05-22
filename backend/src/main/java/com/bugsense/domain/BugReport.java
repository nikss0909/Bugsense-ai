package com.bugsense.domain;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "bug_reports")
public class BugReport {

	@Id
	private String id;

	@Indexed
	private String userId;

	private String fileName;

	private String language;

	private long fileSize;

	private String sourcePreview;

	private String status = "COMPLETED";

	private AnalysisResult analysis;

	private Instant createdAt = Instant.now();

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	public long getFileSize() {
		return fileSize;
	}

	public void setFileSize(long fileSize) {
		this.fileSize = fileSize;
	}

	public String getSourcePreview() {
		return sourcePreview;
	}

	public void setSourcePreview(String sourcePreview) {
		this.sourcePreview = sourcePreview;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public AnalysisResult getAnalysis() {
		return analysis;
	}

	public void setAnalysis(AnalysisResult analysis) {
		this.analysis = analysis;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Instant createdAt) {
		this.createdAt = createdAt;
	}
}
