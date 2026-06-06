package com.bugsense.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.bugsense.domain.AnalysisResult;
import com.bugsense.domain.BugReport;
import com.bugsense.domain.Issue;
import com.bugsense.domain.User;
import com.bugsense.exception.ApiException;
import com.bugsense.repository.BugReportRepository;

@Service
public class PdfReportService {

	private static final Logger log = LoggerFactory.getLogger(PdfReportService.class);

	private static final float MARGIN = 48;

	private static final float PAGE_WIDTH = PDRectangle.LETTER.getWidth();

	private static final float PAGE_HEIGHT = PDRectangle.LETTER.getHeight();

	private static final float CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

	private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("MMM d, yyyy HH:mm z")
			.withZone(ZoneId.systemDefault());

	private final BugReportRepository reportRepository;

	private final AuthService authService;

	public PdfReportService(BugReportRepository reportRepository, AuthService authService) {
		this.reportRepository = reportRepository;
		this.authService = authService;
	}

	public byte[] generateReportPdf(String reportId, String email) {
		User user = authService.currentUser(email);
		BugReport report = reportRepository.findByIdAndUserId(reportId, user.getId())
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Report was not found."));

		try (PDDocument document = new PDDocument();
				ByteArrayOutputStream output = new ByteArrayOutputStream();
				PdfCanvas canvas = new PdfCanvas(document)) {
			writeReport(canvas, report);
			document.save(output);
			log.info("Generated PDF report reportId={} userId={}", report.getId(), user.getId());
			return output.toByteArray();
		} catch (IOException exception) {
			log.error("Could not generate PDF report reportId={} userId={}", report.getId(), user.getId(), exception);
			throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not generate PDF report.");
		}
	}

	private void writeReport(PdfCanvas canvas, BugReport report) throws IOException {
		AnalysisResult analysis = report.getAnalysis() == null ? new AnalysisResult() : report.getAnalysis();
		analysis.normalize();

		canvas.heading("BugSense Static Analysis Report");
		canvas.subheading(report.getFileName());
		canvas.paragraph("Language: " + report.getLanguage());
		canvas.paragraph("File size: " + report.getFileSize() + " bytes");
		canvas.paragraph("Created: " + DATE_FORMAT.format(report.getCreatedAt()));
		canvas.paragraph("Engine: " + analysis.getEngine());
		canvas.spacer(8);

		canvas.section("Summary");
		canvas.paragraph(analysis.getSummary());
		canvas.paragraph("Quality score: " + analysis.getQualityScore() + "/100");
		canvas.paragraph("Estimated technical debt: " + analysis.getTechnicalDebt());
		canvas.spacer(6);

		canvas.section("Severity Chart");
		int maxSeverityCount = analysis.getSeverityCounts().values().stream().mapToInt(Integer::intValue).max().orElse(0);
		for (Map.Entry<String, Integer> entry : analysis.getSeverityCounts().entrySet()) {
			canvas.paragraph(capitalize(entry.getKey()) + " | " + bar(entry.getValue(), maxSeverityCount) + " "
					+ entry.getValue());
		}
		canvas.spacer(6);

		List<Issue> issues = analysis.getIssues();
		canvas.section("Issue Table");
		if (issues.isEmpty()) {
			canvas.paragraph("No rule violations were reported.");
		}
		if (!issues.isEmpty()) {
			canvas.tableRow("Line", "Severity", "Category", "Issue");
		}
		for (Issue issue : issues) {
			canvas.tableRow(issue.getLineNumber() == null ? "-" : String.valueOf(issue.getLineNumber()),
					capitalize(issue.getSeverity()), issue.getCategory(), issue.getTitle());
		}
		canvas.spacer(6);

		canvas.section("Issue Details");
		for (Issue issue : issues) {
			canvas.subheading(issue.getTitle() + " [" + capitalize(issue.getSeverity()) + "]");
			canvas.paragraph("Category: " + issue.getCategory() + " | Line: "
					+ (issue.getLineNumber() == null ? "unknown" : issue.getLineNumber()));
			canvas.paragraph("Description: " + issue.getDescription());
			canvas.paragraph("Solution: " + issue.getSolution());
			canvas.spacer(4);
		}

		canvas.section("Verification Suggestions");
		writeTests(canvas, analysis.getTestSuggestions());

		canvas.section("Recommendations");
		if (analysis.getFixRecommendations().isEmpty()) {
			canvas.paragraph("No recommendations were returned.");
		}
		for (int index = 0; index < analysis.getFixRecommendations().size(); index++) {
			canvas.paragraph((index + 1) + ". " + analysis.getFixRecommendations().get(index));
		}

		canvas.section("Source Preview");
		canvas.codeBlock(report.getSourcePreview());
	}

	private String bar(int count, int max) {
		if (max <= 0 || count <= 0) {
			return "";
		}
		int width = Math.max(1, Math.round((count / (float) max) * 24));
		return "#".repeat(width);
	}

	private void writeTests(PdfCanvas canvas, List<AnalysisResult.TestSuggestion> tests) throws IOException {
		if (tests.isEmpty()) {
			canvas.paragraph("No test suggestions were returned.");
			return;
		}
		for (AnalysisResult.TestSuggestion test : tests) {
			canvas.subheading(test.getName());
			canvas.paragraph("Type: " + test.getType() + " | Priority: " + capitalize(test.getPriority()));
			canvas.paragraph(test.getDescription());
			if (test.getSampleTestCode() != null && !test.getSampleTestCode().isBlank()) {
				canvas.codeBlock(test.getSampleTestCode());
			}
			canvas.spacer(4);
		}
	}

	private String capitalize(String value) {
		if (value == null || value.isBlank()) {
			return "";
		}
		return value.substring(0, 1).toUpperCase() + value.substring(1).toLowerCase();
	}

	private static class PdfCanvas implements AutoCloseable {

		private final PDDocument document;

		private final PDFont regularFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

		private final PDFont boldFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);

		private final PDFont monoFont = new PDType1Font(Standard14Fonts.FontName.COURIER);

		private PDPageContentStream content;

		private float y;

		PdfCanvas(PDDocument document) throws IOException {
			this.document = document;
			newPage();
		}

		void heading(String text) throws IOException {
			writeWrapped(text, boldFont, 20, 25);
			spacer(6);
		}

		void section(String text) throws IOException {
			spacer(8);
			writeWrapped(text, boldFont, 14, 18);
		}

		void subheading(String text) throws IOException {
			writeWrapped(text, boldFont, 11, 15);
		}

		void paragraph(String text) throws IOException {
			writeWrapped(text, regularFont, 10, 14);
		}

		void codeBlock(String text) throws IOException {
			spacer(3);
			writeWrapped(text == null ? "" : text, monoFont, 8, 11);
			spacer(4);
		}

		void tableRow(String line, String severity, String category, String title) throws IOException {
			String row = pad(line, 8) + pad(severity, 11) + pad(category, 18) + title;
			writeWrapped(row, monoFont, 8, 11);
		}

		void spacer(float height) throws IOException {
			ensureSpace(height);
			y -= height;
		}

		private void writeWrapped(String text, PDFont font, float size, float lineHeight) throws IOException {
			String safeText = sanitize(text);
			String[] paragraphs = safeText.split("\\R", -1);
			for (String paragraph : paragraphs) {
				List<String> lines = wrap(paragraph, font, size);
				for (String line : lines) {
					writeLine(line, font, size, lineHeight);
				}
			}
		}

		private void writeLine(String text, PDFont font, float size, float lineHeight) throws IOException {
			ensureSpace(lineHeight);
			content.beginText();
			content.setFont(font, size);
			content.newLineAtOffset(MARGIN, y);
			content.showText(text);
			content.endText();
			y -= lineHeight;
		}

		private List<String> wrap(String text, PDFont font, float size) throws IOException {
			if (text == null || text.isBlank()) {
				return List.of("");
			}
			java.util.ArrayList<String> lines = new java.util.ArrayList<>();
			StringBuilder current = new StringBuilder();
			for (String word : text.split(" ")) {
				String next = current.isEmpty() ? word : current + " " + word;
				if (width(next, font, size) <= CONTENT_WIDTH) {
					current.setLength(0);
					current.append(next);
					continue;
				}
				if (!current.isEmpty()) {
					lines.add(current.toString());
					current.setLength(0);
				}
				if (width(word, font, size) <= CONTENT_WIDTH) {
					current.append(word);
				} else {
					lines.addAll(splitLongToken(word, font, size));
				}
			}
			if (!current.isEmpty()) {
				lines.add(current.toString());
			}
			return lines.isEmpty() ? List.of("") : lines;
		}

		private List<String> splitLongToken(String token, PDFont font, float size) throws IOException {
			java.util.ArrayList<String> chunks = new java.util.ArrayList<>();
			StringBuilder current = new StringBuilder();
			for (int index = 0; index < token.length(); index++) {
				String next = current.toString() + token.charAt(index);
				if (width(next, font, size) <= CONTENT_WIDTH) {
					current.append(token.charAt(index));
					continue;
				}
				if (!current.isEmpty()) {
					chunks.add(current.toString());
					current.setLength(0);
				}
				current.append(token.charAt(index));
			}
			if (!current.isEmpty()) {
				chunks.add(current.toString());
			}
			return chunks;
		}

		private float width(String text, PDFont font, float size) throws IOException {
			return font.getStringWidth(text) / 1000 * size;
		}

		private void ensureSpace(float requiredHeight) throws IOException {
			if (y - requiredHeight < MARGIN) {
				newPage();
			}
		}

		private void newPage() throws IOException {
			if (content != null) {
				content.close();
			}
			PDPage page = new PDPage(PDRectangle.LETTER);
			document.addPage(page);
			content = new PDPageContentStream(document, page);
			y = PAGE_HEIGHT - MARGIN;
		}

		private String sanitize(String text) {
			String value = text == null ? "" : text.replace('\t', ' ');
			StringBuilder builder = new StringBuilder(value.length());
			for (int index = 0; index < value.length(); index++) {
				char current = value.charAt(index);
				if (current == '\n' || current == '\r' || (current >= 32 && current <= 126)) {
					builder.append(current);
				} else {
					builder.append('?');
				}
			}
			return builder.toString();
		}

		private String pad(String value, int width) {
			String safeValue = value == null ? "" : value;
			if (safeValue.length() >= width) {
				return safeValue.substring(0, width - 1) + " ";
			}
			return safeValue + " ".repeat(width - safeValue.length());
		}

		@Override
		public void close() throws IOException {
			if (content != null) {
				content.close();
			}
		}
	}
}
