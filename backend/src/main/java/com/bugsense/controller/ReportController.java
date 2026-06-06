package com.bugsense.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.bugsense.dto.RepositoryScanRequest;
import com.bugsense.dto.ReportResponse;
import com.bugsense.service.PdfReportService;
import com.bugsense.service.ReportService;
import com.bugsense.util.SourceFileUtil;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

	private final ReportService reportService;

	private final PdfReportService pdfReportService;

	public ReportController(ReportService reportService, PdfReportService pdfReportService) {
		this.reportService = reportService;
		this.pdfReportService = pdfReportService;
	}

	@PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ReportResponse analyze(@RequestPart("file") MultipartFile file, Principal principal) {
		return reportService.analyzeUpload(file, principal.getName());
	}

	@PostMapping("/analyze-repository")
	public ReportResponse analyzeRepository(@Valid @RequestBody RepositoryScanRequest request, Principal principal) {
		return reportService.analyzeRepository(request, principal.getName());
	}

	@GetMapping
	public List<ReportResponse> all(Principal principal) {
		return reportService.reportsFor(principal.getName());
	}

	@GetMapping("/recent")
	public List<ReportResponse> recent(Principal principal) {
		return reportService.recentReportsFor(principal.getName());
	}

	@GetMapping("/{id}")
	public ReportResponse byId(@PathVariable String id, Principal principal) {
		return reportService.reportById(id, principal.getName());
	}

	@GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
	public ResponseEntity<byte[]> pdf(@PathVariable String id, Principal principal) {
		ReportResponse report = reportService.reportById(id, principal.getName());
		byte[] pdf = pdfReportService.generateReportPdf(id, principal.getName());
		String fileName = SourceFileUtil.downloadableFileName(report.fileName(), "-static-analysis", "pdf");
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION,
						ContentDisposition.attachment().filename(fileName).build().toString())
				.contentType(MediaType.APPLICATION_PDF)
				.body(pdf);
	}
}
