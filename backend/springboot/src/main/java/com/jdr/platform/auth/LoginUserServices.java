package com.jdr.platform.auth;

import java.util.Map;

import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;

/** Services de chargement d'utilisateur : délèguent à Spring Security puis enregistrent l'utilisateur en base. */
final class LoginUserServices {

	private LoginUserServices() {
	}

	static void register(UserService users, String registrationId, Map<String, Object> attributes) {
		AuthProvider provider = AuthProvider.fromRegistrationId(registrationId)
				.orElseThrow(() -> new OAuth2AuthenticationException(
						new OAuth2Error("unsupported_provider", "Fournisseur non supporté : " + registrationId, null)));
		ProviderProfile profile = ProviderProfile.from(provider, attributes);
		if (profile.providerUserId() == null) {
			throw new OAuth2AuthenticationException(
					new OAuth2Error("invalid_user_info_response", "Identifiant fournisseur manquant", null));
		}
		users.registerLogin(profile);
	}

	static OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2(UserService users) {
		return oauth2(users, new DefaultOAuth2UserService());
	}

	static OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2(UserService users,
			OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate) {
		return request -> {
			OAuth2User user = delegate.loadUser(request);
			register(users, request.getClientRegistration().getRegistrationId(), user.getAttributes());
			return user;
		};
	}

	static OAuth2UserService<OidcUserRequest, OidcUser> oidc(UserService users) {
		return oidc(users, new OidcUserService());
	}

	static OAuth2UserService<OidcUserRequest, OidcUser> oidc(UserService users,
			OAuth2UserService<OidcUserRequest, OidcUser> delegate) {
		return request -> {
			OidcUser user = delegate.loadUser(request);
			register(users, request.getClientRegistration().getRegistrationId(), user.getAttributes());
			return user;
		};
	}
}
