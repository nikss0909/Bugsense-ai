package com.bugsense.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.bugsense.domain.AnalysisResult;
import com.bugsense.domain.BugReport;
import com.bugsense.domain.User;
import com.bugsense.dto.DashboardStats;
import com.bugsense.dto.ReportResponse;
import com.bugsense.exception.ApiException;
import com.bugsense.repository.BugReportRepository;

@Service
public class ReportService {

	private static final Set<String> ALLOWED_EXTENSIONS = Set.of("js", "jsx", "ts", "tsx", "java", "py", "cs",
			"go", "rb", "php", "kt", "swift", "cpp", "c", "h", "hpp", "rs", "sql", "html", "css", "json",
			"yml", "yaml", "xml");

	private static final Map<String, String> LANGUAGE_BY_EXTENSION = Map.ofEntries(
			Map.entry("js", "JavaScript"),
			Map.entry("jsx", "React JSX"),
			Map.entry("ts", "TypeScript"),
			Map.entry("tsx", "React TSX"),
			Map.entry("java", "Java"),
			Map.entry("py", "Python"),
			Map.entry("cs", "C#"),
			Map.entry("go", "Go"),
			Map.entry("rb", "Ruby"),
			Map.entry("php", "PHP"),
			Map.entry("kt", "Kotlin"),
			Map.entry("swift", "Swift"),
			Map.entry("cpp", "C++"),
			Map.entry("c", "C"),
			Map.entry("h", "C/C++ Header"),
			Map.entry("hpp", "C++ Header"),
			Map.entry("rs", "Rust"),
			Map.entry("sql", "SQL"),
			Map.entry("html", "HTML"),
			Map.entry("css", "CSS"),
			Map.entry("json", "JSON"),
			Map.entry("yml", "YAML"),
			Map.entry("yaml", "YAML"),
			Map.entry("xml", "XML"));

	private final BugReportRepository reportRepository;

	private final AuthService authService;

	private final GeminiAnalysisService analysisService;

	@Value("${app.upload.max-source-chars:50000}")
	private int maxSourceChars;

	public ReportService(BugReportRepository reportRepository, AuthService authService,
			GeminiAnalysisService analysisService) {
		this.reportRepository = reportRepository;
		this.authService = authService;
		this.analysisService = analysisService;
	}

	public ReportResponse analyzeUpload(MultipartFile file, String email) {
		User user = authService.currentUser(email);
		if (file == null || file.isEmpty()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Upload a non-empty source code file.");
		}
		String fileName = cleanFileName(file.getOriginalFilename());
		String extension = extension(fileName);
		if (!ALLOWED_EXTENSIONS.contains(extension)) {
			throw new ApiException(HttpStatus.BAD_REQUEST,
					"Unsupported file type. Upload a source file such as .js, .ts, .java, .py, .go, .sql, or .html.");
		}

		String sourceCode = readSource(file);
		String limitedSource = sourceCode.length() > maxSourceChars ? sourceCode.substring(0, maxSourceChars) : sourceCode;
		String language = LANGUAGE_BY_EXTENSION.getOrDefault(extension, extension.toUpperCase(Locale.ROOT));
		AnalysisResult analysis = analysisService.analyze(fileName, language, limitedSource);

		BugReport report = new BugReport();
		report.setUserId(user.getId());
		report.setFileName(fileName);
		report.setLanguage(language);
		report.setFileSize(file.getSize());
		report.setSourcePreview(preview(limitedSource));
		report.setAnalysis(analysis);
		report.setStatus("COMPLETED");
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
		int totalFindings = 0;
		double qualityTotal = 0;

		for (BugReport report : reports) {
			AnalysisResult analysis = report.getAnalysis();
			if (analysis == null) {
				continue;
			}
			qualityTotal += analysis.getQualityScore();
			totalFindings += analysis.getFindings() == null ? 0 : analysis.getFindings().size();
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
		List<ReportResponse> recentReports = reports.stream().limit(5).map(ReportResponse::from).toList();
		return new DashboardStats(reports.size(), totalFindings, averageQuality, severityTotals, languageUsage,
				recentReports);
	}

	private String readSource(MultipartFile file) {
		try {
			return new String(file.getBytes(), StandardCharsets.UTF_8);
		} catch (IOException exception) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Could not read the uploaded file.");
		}
	}

	private String cleanFileName(String originalName) {
		String name = originalName == null || originalName.isBlank() ? "source.txt" : originalName.replace("\\", "/");
		int lastSlash = name.lastIndexOf('/');
		return lastSlash >= 0 ? name.substring(lastSlash + 1) : name;
	}

	private String extension(String fileName) {
		int dot = fileName.lastIndexOf('.');
		return dot >= 0 && dot < fileName.length() - 1 ? fileName.substring(dot + 1).toLowerCase(Locale.ROOT) : "";
	}

	private String preview(String source) {
		return source.length() <= 2400 ? source : source.substring(0, 2400) + "\n...";
	}
}
