package com.jdr.platform.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthTest {

	@Autowired
	MockMvc mockMvc;

	@Autowired
	UserService users;

	@Autowired
	AppUserRepository repository;

	private static OAuth2UserRequest requestFor(String registrationId) {
		OAuth2UserRequest request = mock(OAuth2UserRequest.class);
		when(request.getClientRegistration()).thenReturn(registration(registrationId));
		return request;
	}

	private static ClientRegistration registration(String registrationId) {
		return ClientRegistration.withRegistrationId(registrationId).clientId("x")
				.authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
				.redirectUri("http://localhost/cb").authorizationUri("http://localhost/a")
				.tokenUri("http://localhost/t").userNameAttributeName("id").build();
	}

	private static OAuth2User user(String nameAttribute, Map<String, Object> attrs) {
		return new DefaultOAuth2User(AuthorityUtils.createAuthorityList("ROLE_USER"), attrs, nameAttribute);
	}

	@Test
	void discordLoginCreatesThenUpdatesWithoutDuplicate() {
		var first = LoginUserServices.oauth2(users, r -> user("id",
				Map.of("id", "d-1", "username", "gob", "global_name", "Gobelin", "avatar", "abc")));
		first.loadUser(requestFor("discord"));
		AppUser created = users.find(AuthProvider.DISCORD, "d-1");
		assertNotNull(created);
		assertEquals("Gobelin", created.getDisplayName());
		assertNull(created.getEmail());
		assertEquals("https://cdn.discordapp.com/avatars/d-1/abc.png", created.getAvatarUrl());
		long count = repository.count();

		var second = LoginUserServices.oauth2(users, r -> user("id",
				Map.of("id", "d-1", "username", "gob", "global_name", "Gobelin II")));
		second.loadUser(requestFor("discord"));
		AppUser updated = users.find(AuthProvider.DISCORD, "d-1");
		assertEquals(count, repository.count());
		assertEquals(created.getId(), updated.getId());
		assertEquals("Gobelin II", updated.getDisplayName());
		assertNull(updated.getAvatarUrl());
		assertEquals(created.getCreatedAt(), updated.getCreatedAt());
		assertTrue(!updated.getLastLoginAt().isBefore(created.getLastLoginAt()));
	}

	@Test
	void googleLoginCreatesThenUpdatesWithoutDuplicate() {
		users.registerLogin(ProviderProfile.from(AuthProvider.GOOGLE,
				Map.of("sub", "g-1", "name", "Elfe", "email", "elfe@example.org", "picture", "http://img/1")));
		long count = repository.count();
		users.registerLogin(ProviderProfile.from(AuthProvider.GOOGLE,
				Map.of("sub", "g-1", "name", "Elfe Noire", "email", "elfe@example.org", "picture", "http://img/2")));
		assertEquals(count, repository.count());
		AppUser updated = users.find(AuthProvider.GOOGLE, "g-1");
		assertEquals("Elfe Noire", updated.getDisplayName());
		assertEquals("http://img/2", updated.getAvatarUrl());
		assertEquals("elfe@example.org", updated.getEmail());
	}

	@Test
	void providersAreNotMergedEvenWithSameEmail() {
		users.registerLogin(ProviderProfile.from(AuthProvider.GOOGLE,
				Map.of("sub", "same", "name", "A", "email", "same@example.org")));
		users.registerLogin(ProviderProfile.from(AuthProvider.DISCORD,
				Map.of("id", "same", "username", "A", "email", "same@example.org")));
		AppUser google = users.find(AuthProvider.GOOGLE, "same");
		AppUser discord = users.find(AuthProvider.DISCORD, "same");
		assertNotNull(google);
		assertNotNull(discord);
		assertTrue(!google.getId().equals(discord.getId()));
	}

	@Test
	void meReturnsCurrentUser() throws Exception {
		users.registerLogin(ProviderProfile.from(AuthProvider.DISCORD,
				Map.of("id", "d-me", "username", "moi", "global_name", "Moi")));
		mockMvc.perform(get("/api/me").with(oauth2Login().clientRegistration(registration("discord")).oauth2User(user("id", Map.of("id", "d-me")))
				))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.displayName").value("Moi"))
				.andExpect(jsonPath("$.provider").value("DISCORD"))
				.andExpect(jsonPath("$.email").doesNotExist());
	}

	@Test
	void meIsUnauthorizedWithoutSession() throws Exception {
		mockMvc.perform(get("/api/me")).andExpect(status().isUnauthorized());
	}

	@Test
	void healthStaysPublic() throws Exception {
		mockMvc.perform(get("/api/health")).andExpect(status().isOk());
	}

	@Test
	void logoutEndsSession() throws Exception {
		MockHttpSession session = new MockHttpSession();
		mockMvc.perform(post("/api/logout").with(oauth2Login()).with(csrf()).session(session))
				.andExpect(status().isNoContent());
		assertTrue(session.isInvalid());
	}

	@Test
	void logoutRequiresCsrfToken() throws Exception {
		mockMvc.perform(post("/api/logout").with(oauth2Login())).andExpect(status().isForbidden());
	}

	@Test
	void callbackWithoutAuthorizationRequestRedirectsToLoginPage() throws Exception {
		MockHttpSession session = new MockHttpSession();
		mockMvc.perform(get("/login/oauth2/code/discord").param("error", "access_denied").session(session))
				.andExpect(status().is3xxRedirection())
				.andExpect(redirectedUrl("/login?error=provider"));
	}
}
