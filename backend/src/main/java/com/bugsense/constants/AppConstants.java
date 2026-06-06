package com.bugsense.constants;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

public final class AppConstants {

	public static final List<String> SEVERITY_ORDER = List.of("critical", "high", "medium", "low");

	public static final Set<String> ALLOWED_SOURCE_EXTENSIONS = Set.of("js", "jsx", "ts", "tsx", "java", "py",
			"cs", "go", "rb", "php", "kt", "swift", "cpp", "c", "h", "hpp", "rs", "sql", "html", "css",
			"json", "yml", "yaml", "xml");

	public static final Map<String, String> LANGUAGE_BY_EXTENSION = languageMap();

	public static final String REPORT_STATUS_COMPLETED = "COMPLETED";

	public static final int SOURCE_PREVIEW_CHARS = 2400;

	public static final int DEFAULT_MAX_SOURCE_CHARS = 50000;

	private AppConstants() {
	}

	private static Map<String, String> languageMap() {
		Map<String, String> languages = new LinkedHashMap<>();
		languages.put("js", "JavaScript");
		languages.put("jsx", "React JSX");
		languages.put("ts", "TypeScript");
		languages.put("tsx", "React TSX");
		languages.put("java", "Java");
		languages.put("py", "Python");
		languages.put("cs", "C#");
		languages.put("go", "Go");
		languages.put("rb", "Ruby");
		languages.put("php", "PHP");
		languages.put("kt", "Kotlin");
		languages.put("swift", "Swift");
		languages.put("cpp", "C++");
		languages.put("c", "C");
		languages.put("h", "C/C++ Header");
		languages.put("hpp", "C++ Header");
		languages.put("rs", "Rust");
		languages.put("sql", "SQL");
		languages.put("html", "HTML");
		languages.put("css", "CSS");
		languages.put("json", "JSON");
		languages.put("yml", "YAML");
		languages.put("yaml", "YAML");
		languages.put("xml", "XML");
		return Map.copyOf(languages);
	}
}
