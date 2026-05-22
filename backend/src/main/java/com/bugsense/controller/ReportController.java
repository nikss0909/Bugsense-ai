package com.bugsense.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.bugsense.dto.ReportResponse;
import com.bugsense.service.ReportService;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

	private final ReportService reportService;

	public ReportController(ReportService reportService) {
		this.reportService = reportService;
	}

	@PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ReportResponse analyze(@RequestPart("file") MultipartFile file, Principal principal) {
		return reportService.analyzeUpload(file, principal.getName());
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
}
