package com.jdr.platform.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
public class MeController {

	private final UserService users;

	public MeController(UserService users) {
		this.users = users;
	}

	@GetMapping
	public ResponseEntity<MeResponse> me(Authentication authentication) {
		if (authentication instanceof OAuth2AuthenticationToken token) {
			AuthProvider provider = AuthProvider.fromRegistrationId(token.getAuthorizedClientRegistrationId())
					.orElse(null);
			AppUser user = provider == null ? null : users.find(provider, token.getName());
			if (user != null) {
				return ResponseEntity.ok(MeResponse.from(user));
			}
		}
		return ResponseEntity.status(401).build();
	}
}
