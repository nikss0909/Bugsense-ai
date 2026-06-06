package com.bugsense.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.bugsense.constants.AppConstants;
import com.bugsense.domain.AnalysisResult;
import com.bugsense.domain.BugReport;
import com.bugsense.domain.User;
import com.bugsense.dto.DashboardStats;
import com.bugsense.dto.RepositoryScanRequest;
import com.bugsense.dto.ReportResponse;
import com.bugsense.exception.ApiException;
import com.bugsense.repository.BugReportRepository;
import com.bugsense.service.RepositoryScanService.RepositoryScanResult;
import com.bugsense.util.SourceFileUtil;

@Service
public class ReportService {

	private final BugReportRepository reportRepository;

	private final AuthService authService;

	private final RuleBasedAnalysisService analysisService;

	private final RepositoryScanService repositoryScanService;

	@Value("${app.upload.max-source-chars:50000}")
	private int maxSourceChars;

	public ReportService(BugReportRepository reportRepository, AuthService authService,
			RuleBasedAnalysisService analysisService, RepositoryScanService repositoryScanService) {
		this.reportRepository = reportRepository;
		this.authService = authService;
		this.analysisService = analysisService;
		this.repositoryScanService = repositoryScanService;
	}

	public ReportResponse analyzeUpload(MultipartFile file, String email) {
		User user = authService.currentUser(email);
		if (file == null || file.isEmpty()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Upload a non-empty source code file.");
		}
		String fileName = SourceFileUtil.cleanFileName(file.getOriginalFilename());
		String extension = SourceFileUtil.extension(fileName);
		if (!SourceFileUtil.isAllowedExtension(extension)) {
			throw new ApiException(HttpStatus.BAD_REQUEST,
					"Unsupported file type. Upload a source file such as .js, .ts, .java, .py, .go, .sql, or .html.");
		}

		String sourceCode = readSource(file);
		String limitedSource = sourceCode.length() > maxSourceChars ? sourceCode.substring(0, maxSourceChars) : sourceCode;
		String language = SourceFileUtil.languageFor(extension);
		AnalysisResult analysis = analysisService.analyze(fileName, language, limitedSource);

		BugReport report = new BugReport();
		report.setUserId(user.getId());
		report.setFileName(fileName);
		report.setLanguage(language);
		report.setFileSize(file.getSize());
		report.setSourcePreview(SourceFileUtil.preview(limitedSource));
		report.setAnalysis(analysis);
		report.setStatus(AppConstants.REPORT_STATUS_COMPLETED);
		return ReportResponse.from(reportRepository.save(report));
	}

	public ReportResponse analyzeRepository(RepositoryScanRequest request, String email) {
		User user = authService.currentUser(email);
		RepositoryScanResult repository = repositoryScanService.cloneAndRead(request.repositoryUrl());
		AnalysisResult analysis = analysisService.analyzeRepository(repository.repositoryName(),
				repository.sourceUnits(), repository.stats());

		BugReport report = new BugReport();
		report.setUserId(user.getId());
		report.setFileName(repository.repositoryName());
		report.setLanguage("Repository");
		report.setFileSize(repository.totalBytes());
		report.setSourcePreview(SourceFileUtil.preview(repository.sourcePreview()));
		report.setAnalysis(analysis);
		report.setStatus(AppConstants.REPORT_STATUS_COMPLETED);
		return ReportResponse.from(reportRepository.save(report));
	}

	public List<ReportResponse> reportsFor(String email) {
		User user = authService.currentUser(email);
		return reportRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
				.map(ReportResponse::from)
				.toList();
	}

	public List<ReportResponse> recentReportsFor(String email) {
		User user = authService.currentUser(email);
		return reportRepository.findTop5ByUserIdOrderByCreatedAtDesc(user.getId()).stream()
				.map(ReportResponse::from)
				.toList();
	}

	public ReportResponse reportById(String id, String email) {
		User user = authService.currentUser(email);
		return reportRepository.findByIdAndUserId(id, user.getId())
				.map(ReportResponse::from)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Report was not found."));
	}

	public DashboardStats dashboardStats(String email) {
		User user = authService.currentUser(email);
		List<BugReport> reports = reportRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
		Map<String, Integer> severityTotals = AnalysisResult.defaultSeverityCounts();
		Map<String, Long> issueTypes = new LinkedHashMap<>();
		int totalFindings = 0;
		double qualityTotal = 0;

		for (BugReport report : reports) {
			AnalysisResult analysis = report.getAnalysis();
			if (analysis == null) {
				continue;
			}
			analysis.normalize();
			qualityTotal += analysis.getQualityScore();
			totalFindings += analysis.getIssues() == null ? 0 : analysis.getIssues().size();
			if (analysis.getIssues() != null) {
				analysis.getIssues().forEach(issue -> issueTypes.put(issue.getTitle(),
						issueTypes.getOrDefault(issue.getTitle(), 0L) + 1));
			}
			if (analysis.getSeverityCounts() != null) {
				analysis.getSeverityCounts().forEach((severity, count) -> {
					if (severityTotals.containsKey(severity)) {
						severityTotals.put(severity, severityTotals.get(severity) + count);
					}
				});
			}
		}

		Map<String, Long> languageUsage = reports.stream()
				.collect(Collectors.groupingBy(BugReport::getLanguage, LinkedHashMap::new, Collectors.counting()));
		double averageQuality = reports.isEmpty() ? 0 : Math.round((qualityTotal / reports.size()) * 10.0) / 10.0;
		Map<String, Long> mostCommonIssueTypes = issueTypes.entrySet().stream()
				.sorted(Map.Entry.<String, Long>comparingByValue().reversed())
				.limit(6)
				.collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (left, right) -> left,
						LinkedHashMap::new));
		List<ReportResponse> recentReports = reports.stream().limit(5).map(ReportResponse::from).toList();
		return new DashboardStats(reports.size(), reports.size(), totalFindings, averageQuality, severityTotals,
				languageUsage, mostCommonIssueTypes, recentReports);
	}

	private String readSource(MultipartFile file) {
		try {
			return new String(file.getBytes(), StandardCharsets.UTF_8);
		} catch (IOException exception) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Could not read the uploaded file.");
		}
	}
}
