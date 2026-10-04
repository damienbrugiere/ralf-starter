package com.jdr.platform.game;

import java.time.Instant;

public record GameResponse(Long id, String name, String description, Instant createdAt) {

	static GameResponse from(Game game) {
		return new GameResponse(game.getId(), game.getName(), game.getDescription(), game.getCreatedAt());
	}
}
