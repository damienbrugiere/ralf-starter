package com.jdr.platform.auth;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "app_user")
public class AppUser {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private AuthProvider provider;

	@Column(name = "provider_user_id", nullable = false)
	private String providerUserId;

	@Column(name = "display_name", nullable = false)
	private String displayName;

	private String email;

	@Column(name = "avatar_url", length = 500)
	private String avatarUrl;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "last_login_at", nullable = false)
	private Instant lastLoginAt;

	protected AppUser() {
	}

	public AppUser(AuthProvider provider, String providerUserId, String displayName, String email, String avatarUrl) {
		this.provider = provider;
		this.providerUserId = providerUserId;
		this.displayName = displayName;
		this.email = email;
		this.avatarUrl = avatarUrl;
		this.createdAt = Instant.now();
		this.lastLoginAt = this.createdAt;
	}

	public void recordLogin(String displayName, String email, String avatarUrl) {
		this.displayName = displayName;
		this.avatarUrl = avatarUrl;
		if (email != null) {
			this.email = email;
		}
		this.lastLoginAt = Instant.now();
	}

	public Long getId() {
		return id;
	}

	public AuthProvider getProvider() {
		return provider;
	}

	public String getProviderUserId() {
		return providerUserId;
	}

	public String getDisplayName() {
		return displayName;
	}

	public String getEmail() {
		return email;
	}

	public String getAvatarUrl() {
		return avatarUrl;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getLastLoginAt() {
		return lastLoginAt;
	}
}
