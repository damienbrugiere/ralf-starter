package com.jdr.platform.game;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GameService {

	private final GameRepository repository;

	public GameService(GameRepository repository) {
		this.repository = repository;
	}

	@Transactional
	public GameResponse create(CreateGameRequest request) {
		String description = request.description() == null || request.description().isBlank()
				? null
				: request.description().strip();
		return GameResponse.from(repository.save(new Game(request.name().strip(), description)));
	}
}
