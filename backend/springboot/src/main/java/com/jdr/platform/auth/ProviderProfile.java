package com.jdr.platform.auth;

import java.util.Map;

/** Profil utilisateur normalisé, extrait des attributs renvoyés par un fournisseur. */
public record ProviderProfile(AuthProvider provider, String providerUserId, String displayName, String email,
		String avatarUrl) {

	private static final String DISCORD_AVATAR_URL = "https://cdn.discordapp.com/avatars/%s/%s.png";

	public static ProviderProfile from(AuthProvider provider, Map<String, Object> attributes) {
		return switch (provider) {
			case GOOGLE -> google(attributes);
			case DISCORD -> discord(attributes);
		};
	}

	private static ProviderProfile google(Map<String, Object> a) {
		String id = text(a, "sub");
		String email = text(a, "email");
		return new ProviderProfile(AuthProvider.GOOGLE, id, firstNonBlank(text(a, "name"), email, id), email,
				text(a, "picture"));
	}

	private static ProviderProfile discord(Map<String, Object> a) {
		String id = text(a, "id");
		String avatarHash = text(a, "avatar");
		String avatar = avatarHash == null ? null : DISCORD_AVATAR_URL.formatted(id, avatarHash);
		return new ProviderProfile(AuthProvider.DISCORD, id,
				firstNonBlank(text(a, "global_name"), text(a, "username"), id), text(a, "email"), avatar);
	}

	private static String text(Map<String, Object> attributes, String key) {
		Object value = attributes.get(key);
		if (value == null || value.toString().isBlank()) {
			return null;
		}
		return value.toString();
	}

	private static String firstNonBlank(String... values) {
		for (String value : values) {
			if (value != null) {
				return value;
			}
		}
		return null;
	}
}
