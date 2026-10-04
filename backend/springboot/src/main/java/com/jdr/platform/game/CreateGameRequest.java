package com.jdr.platform.game;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateGameRequest(
		@NotBlank(message = "Le nom est obligatoire")
		@Size(max = 100, message = "Le nom ne doit pas dépasser 100 caractères")
		String name,
		@Size(max = 2000, message = "La description ne doit pas dépasser 2000 caractères")
		String description) {
}
