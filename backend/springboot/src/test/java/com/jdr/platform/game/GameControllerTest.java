package com.jdr.platform.game;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GameControllerTest {

	@Autowired
	MockMvc mockMvc;

	@Autowired
	GameRepository repository;

	private org.springframework.test.web.servlet.ResultActions postJson(String body) throws Exception {
		return mockMvc.perform(post("/api/games").contentType(MediaType.APPLICATION_JSON).content(body));
	}

	@Test
	void createsGameWithDescription() throws Exception {
		postJson("{\"name\":\"  La Mine perdue \",\"description\":\"Une aventure\"}")
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").isNumber())
				.andExpect(jsonPath("$.name").value("La Mine perdue"))
				.andExpect(jsonPath("$.description").value("Une aventure"));
	}

	@Test
	void createsGameWithoutDescription() throws Exception {
		long before = repository.count();
		postJson("{\"name\":\"Sans description\"}")
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.description").doesNotExist());
		assertEquals(before + 1, repository.count());
	}

	@Test
	void rejectsBlankName() throws Exception {
		long before = repository.count();
		postJson("{\"name\":\"   \"}")
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.fieldErrors.name").value("Le nom est obligatoire"));
		assertEquals(before, repository.count());
	}

	@Test
	void rejectsTooLongName() throws Exception {
		postJson("{\"name\":\"" + "a".repeat(101) + "\"}")
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.fieldErrors.name").exists());
	}

	@Test
	void rejectsMalformedBody() throws Exception {
		postJson("{not json")
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("Corps de requête invalide"));
	}
}
