package com.jdr.platform.auth;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

@Service
public class UserService {

	private final AppUserRepository repository;
	private final TransactionTemplate transactions;

	public UserService(AppUserRepository repository, TransactionTemplate transactions) {
		this.repository = repository;
		this.transactions = transactions;
	}

	/** Crée l'utilisateur à la première connexion, met à jour ses informations aux suivantes. */
	public AppUser registerLogin(ProviderProfile profile) {
		try {
			return transactions.execute(status -> upsert(profile));
		} catch (DataIntegrityViolationException concurrentInsert) {
			return transactions.execute(status -> upsert(profile));
		}
	}

	public AppUser find(AuthProvider provider, String providerUserId) {
		return repository.findByProviderAndProviderUserId(provider, providerUserId).orElse(null);
	}

	private AppUser upsert(ProviderProfile profile) {
		AppUser user = repository.findByProviderAndProviderUserId(profile.provider(), profile.providerUserId())
				.orElse(null);
		if (user == null) {
			return repository.saveAndFlush(new AppUser(profile.provider(), profile.providerUserId(),
					profile.displayName(), profile.email(), profile.avatarUrl()));
		}
		user.recordLogin(profile.displayName(), profile.email(), profile.avatarUrl());
		return repository.saveAndFlush(user);
	}
}
