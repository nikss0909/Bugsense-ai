package com.bugsense.service;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.bugsense.domain.AnalysisResult;
import com.bugsense.exception.ApiException;
import com.bugsense.service.RuleBasedAnalysisService.SourceUnit;
import com.bugsense.util.SourceFileUtil;

@Service
public class RepositoryScanService {

	private static final Logger log = LoggerFactory.getLogger(RepositoryScanService.class);

	private static final Set<String> IGNORED_DIRECTORIES = Set.of(".git", "node_modules", "target", "build",
			"dist", "out", ".gradle", ".idea", ".vscode", "vendor", "coverage", ".next");

	@Value("${app.repository.max-files:220}")
	private int maxFiles;

	@Value("${app.repository.max-file-bytes:250000}")
	private long maxFileBytes;

	@Value("${app.repository.max-source-chars-per-file:50000}")
	private int maxSourceCharsPerFile;

	public RepositoryScanResult cloneAndRead(String repositoryUrl) {
		GitHubRepository repository = parseRepository(repositoryUrl);
		Path tempRoot = null;
		try {
			tempRoot = Files.createTempDirectory("bugsense-repo-");
			Path checkout = tempRoot.resolve("checkout");
			cloneRepository(repository.cloneUrl(), checkout);
			return readSourceUnits(repository, checkout);
		} catch (IOException exception) {
			log.error("Repository scan failed for url={}", repository.safeUrl(), exception);
			throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
					"Could not clone or read the repository. Make sure Git is installed and the repository is public.");
		} finally {
			deleteQuietly(tempRoot);
		}
	}

	private GitHubRepository parseRepository(String value) {
		String input = value == null ? "" : value.trim();
		try {
			URI uri = new URI(input);
			String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);
			String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase(Locale.ROOT);
			if (!"https".equals(scheme) || !"github.com".equals(host)) {
				throw invalidRepositoryUrl();
			}
			String[] parts = uri.getPath() == null ? new String[0] : uri.getPath().replaceFirst("^/", "").split("/");
			if (parts.length < 2) {
				throw invalidRepositoryUrl();
			}
			String owner = sanitizeSegment(parts[0]);
			String repo = sanitizeSegment(parts[1].replaceFirst("\\.git$", ""));
			String repoPath = owner + "/" + repo;
			return new GitHubRepository(repoPath, "https://github.com/" + repoPath + ".git",
					"https://github.com/" + repoPath);
		} catch (URISyntaxException | IllegalArgumentException exception) {
			throw invalidRepositoryUrl();
		}
	}

	private String sanitizeSegment(String segment) {
		if (segment == null || !segment.matches("[A-Za-z0-9_.-]{1,100}")) {
			throw invalidRepositoryUrl();
		}
		return segment;
	}

	private ApiException invalidRepositoryUrl() {
		return new ApiException(HttpStatus.BAD_REQUEST,
				"Enter a valid public GitHub HTTPS repository URL, such as https://github.com/user/project.");
	}

	private void cloneRepository(String cloneUrl, Path checkout) throws IOException {
		ProcessBuilder builder = new ProcessBuilder("git", "clone", "--depth", "1", cloneUrl, checkout.toString());
		builder.redirectErrorStream(true);
		Process process = builder.start();
		try {
			boolean finished = process.waitFor(75, TimeUnit.SECONDS);
			String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
			if (!finished) {
				process.destroyForcibly();
				throw new ApiException(HttpStatus.REQUEST_TIMEOUT,
						"Repository clone timed out. Try a smaller public repository.");
			}
			if (process.exitValue() != 0) {
				log.warn("git clone failed: {}", output);
				throw new ApiException(HttpStatus.BAD_REQUEST,
						"GitHub could not clone this repository. Check that the URL is public and accessible.");
			}
		} catch (InterruptedException exception) {
			Thread.currentThread().interrupt();
			throw new ApiException(HttpStatus.REQUEST_TIMEOUT, "Repository clone was interrupted. Try again.");
		}
	}

	private RepositoryScanResult readSourceUnits(GitHubRepository repository, Path checkout) throws IOException {
		List<SourceUnit> sourceUnits = new ArrayList<>();
		Map<String, Long> languageDistribution = new LinkedHashMap<>();
		long totalBytes = 0;
		int totalFiles = 0;
		int skippedFiles = 0;

		try (Stream<Path> paths = Files.walk(checkout)) {
			for (Path path : paths.filter(Files::isRegularFile).toList()) {
				if (isIgnored(checkout, path)) {
					continue;
				}
				totalFiles++;
				String fileName = checkout.relativize(path).toString().replace("\\", "/");
				String extension = SourceFileUtil.extension(fileName);
				if (!SourceFileUtil.isAllowedExtension(extension) || Files.size(path) > maxFileBytes
						|| sourceUnits.size() >= maxFiles) {
					skippedFiles++;
					continue;
				}
				String source;
				try {
					source = Files.readString(path, StandardCharsets.UTF_8);
				} catch (IOException exception) {
					skippedFiles++;
					log.debug("Skipping unreadable source file path={}", fileName, exception);
					continue;
				}
				if (source.length() > maxSourceCharsPerFile) {
					source = source.substring(0, maxSourceCharsPerFile);
				}
				String language = SourceFileUtil.languageFor(extension);
				long fileSize = Files.size(path);
				totalBytes += fileSize;
				sourceUnits.add(new SourceUnit(fileName, language, source, fileSize));
				languageDistribution.put(language, languageDistribution.getOrDefault(language, 0L) + 1);
			}
		}

		if (sourceUnits.isEmpty()) {
			throw new ApiException(HttpStatus.BAD_REQUEST,
					"No supported source files were found in the repository.");
		}

		AnalysisResult.RepositoryStats stats = new AnalysisResult.RepositoryStats();
		stats.setRepositoryName(repository.name());
		stats.setRepositoryUrl(repository.safeUrl());
		stats.setTotalFiles(totalFiles);
		stats.setAnalyzedFiles(sourceUnits.size());
		stats.setSkippedFiles(skippedFiles);
		stats.setTotalBytes(totalBytes);
		stats.setLanguageDistribution(languageDistribution);
		stats.setClonedAt(Instant.now().toString());
		stats.normalize();

		return new RepositoryScanResult(repository.name(), repository.safeUrl(), sourceUnits, stats,
				sourcePreview(repository.name(), sourceUnits), totalBytes);
	}

	private boolean isIgnored(Path checkout, Path file) {
		Path relative = checkout.relativize(file);
		for (Path part : relative) {
			if (IGNORED_DIRECTORIES.contains(part.toString())) {
				return true;
			}
		}
		return false;
	}

	private String sourcePreview(String repositoryName, List<SourceUnit> sourceUnits) {
		StringBuilder builder = new StringBuilder();
		builder.append("Repository scan: ").append(repositoryName).append('\n');
		builder.append("Analyzed files: ").append(sourceUnits.size()).append("\n\n");
		sourceUnits.stream().limit(8).forEach(unit -> {
			builder.append("== ").append(unit.fileName()).append(" ==\n");
			String preview = SourceFileUtil.preview(unit.sourceCode());
			builder.append(preview, 0, Math.min(preview.length(), 700)).append("\n\n");
		});
		return builder.toString();
	}

	private void deleteQuietly(Path root) {
		if (root == null) {
			return;
		}
		try (Stream<Path> paths = Files.walk(root)) {
			paths.sorted(Comparator.reverseOrder()).forEach(path -> {
				try {
					Files.deleteIfExists(path);
				} catch (IOException exception) {
					log.debug("Could not delete temp repository path={}", path, exception);
				}
			});
		} catch (IOException exception) {
			log.debug("Could not walk temp repository root={}", root, exception);
		}
	}

	public record RepositoryScanResult(String repositoryName, String repositoryUrl, List<SourceUnit> sourceUnits,
			AnalysisResult.RepositoryStats stats, String sourcePreview, long totalBytes) {
	}

	private record GitHubRepository(String name, String cloneUrl, String safeUrl) {
	}
}
