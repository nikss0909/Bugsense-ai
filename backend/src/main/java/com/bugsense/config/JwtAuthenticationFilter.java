package com.bugsense.config;

import java.io.IOException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.bugsense.repository.UserRepository;
import com.bugsense.security.JwtService;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

	private final JwtService jwtService;

	private final UserRepository userRepository;

	public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
		this.jwtService = jwtService;
		this.userRepository = userRepository;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String authHeader = request.getHeader("Authorization");
		if (authHeader != null && authHeader.startsWith("Bearer ")
				&& SecurityContextHolder.getContext().getAuthentication() == null) {
			try {
				String token = authHeader.substring(7);
				String email = jwtService.extractEmail(token);
				userRepository.findByEmail(email).ifPresent(user -> {
					List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(user.getRole()));
					UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
							user.getEmail(), null, authorities);
					authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
					SecurityContextHolder.getContext().setAuthentication(authentication);
				});
			} catch (JwtException | IllegalArgumentException exception) {
				log.warn("Rejected invalid JWT for {} {}: {}", request.getMethod(), request.getRequestURI(),
						exception.getMessage());
				SecurityContextHolder.clearContext();
			} catch (RuntimeException exception) {
				log.error("JWT authentication failed for {} {}", request.getMethod(), request.getRequestURI(),
						exception);
				SecurityContextHolder.clearContext();
			}
		}
		filterChain.doFilter(request, response);
	}
}
