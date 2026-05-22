package com.bugsense.controller;

import java.security.Principal;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bugsense.dto.DashboardStats;
import com.bugsense.service.ReportService;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

	private final ReportService reportService;

	public DashboardController(ReportService reportService) {
		this.reportService = reportService;
	}

	@GetMapping("/stats")
	public DashboardStats stats(Principal principal) {
		return reportService.dashboardStats(principal.getName());
	}
}
