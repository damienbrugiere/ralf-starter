package com.jdr.platform.auth;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record MeResponse(Long id, AuthProvider provider, String displayName, String email, String avatarUrl) {

	public static MeResponse from(AppUser user) {
		return new MeResponse(user.getId(), user.getProvider(), user.getDisplayName(), user.getEmail(),
				user.getAvatarUrl());
	}
}
