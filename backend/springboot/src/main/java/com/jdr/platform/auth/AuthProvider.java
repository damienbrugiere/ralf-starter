package com.jdr.platform.auth;

import java.util.Optional;

public enum AuthProvider {
	DISCORD, GOOGLE;

	public static Optional<AuthProvider> fromRegistrationId(String registrationId) {
		for (AuthProvider provider : values()) {
			if (provider.name().equalsIgnoreCase(registrationId)) {
				return Optional.of(provider);
			}
		}
		return Optional.empty();
	}
}
