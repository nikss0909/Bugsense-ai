package com.bugsense.util;

import java.util.Locale;

import com.bugsense.constants.AppConstants;

public final class SourceFileUtil {

	private SourceFileUtil() {
	}

	public static String cleanFileName(String originalName) {
		String name = originalName == null || originalName.isBlank() ? "source.txt" : originalName.replace("\\", "/");
		int lastSlash = name.lastIndexOf('/');
		return lastSlash >= 0 ? name.substring(lastSlash + 1) : name;
	}

	public static String extension(String fileName) {
		int dot = fileName.lastIndexOf('.');
		return dot >= 0 && dot < fileName.length() - 1 ? fileName.substring(dot + 1).toLowerCase(Locale.ROOT) : "";
	}

	public static boolean isAllowedExtension(String extension) {
		return AppConstants.ALLOWED_SOURCE_EXTENSIONS.contains(extension);
	}

	public static String languageFor(String extension) {
		return AppConstants.LANGUAGE_BY_EXTENSION.getOrDefault(extension, extension.toUpperCase(Locale.ROOT));
	}

	public static String preview(String source) {
		if (source == null) {
			return "";
		}
		return source.length() <= AppConstants.SOURCE_PREVIEW_CHARS ? source
				: source.substring(0, AppConstants.SOURCE_PREVIEW_CHARS) + "\n...";
	}

	public static String downloadableFileName(String fileName, String suffix, String extension) {
		String base = cleanFileName(fileName).replaceAll("[^A-Za-z0-9._-]", "_");
		int dot = base.lastIndexOf('.');
		if (dot > 0) {
			base = base.substring(0, dot);
		}
		if (base.isBlank()) {
			base = "bugsense-report";
		}
		return base + suffix + "." + extension;
	}
}
