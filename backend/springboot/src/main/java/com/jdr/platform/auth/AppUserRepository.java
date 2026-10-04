package com.jdr.platform.auth;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

	Optional<AppUser> findByProviderAndProviderUserId(AuthProvider provider, String providerUserId);
}
