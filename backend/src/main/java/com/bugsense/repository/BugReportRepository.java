package com.bugsense.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.bugsense.domain.BugReport;

public interface BugReportRepository extends MongoRepository<BugReport, String> {
	List<BugReport> findByUserIdOrderByCreatedAtDesc(String userId);

	List<BugReport> findTop5ByUserIdOrderByCreatedAtDesc(String userId);

	Optional<BugReport> findByIdAndUserId(String id, String userId);
}
