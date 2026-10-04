package com.jdr.platform.game;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
		return mockMvc.perform(post("/api/games").with(oauth2Login()).with(csrf())
				.contentType(MediaType.APPLICATION_JSON).content(body));
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
	void listsEmptyWhenNoGame() throws Exception {
		repository.deleteAll();
		mockMvc.perform(get("/api/games").with(oauth2Login()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$").isArray())
				.andExpect(jsonPath("$.length()").value(0));
	}

	@Test
	void listsGamesMostRecentFirst() throws Exception {
		repository.deleteAll();
		postJson("{\"name\":\"Première\"}").andExpect(status().isCreated());
		postJson("{\"name\":\"Seconde\",\"description\":\"d\"}").andExpect(status().isCreated());
		mockMvc.perform(get("/api/games").with(oauth2Login()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(2))
				.andExpect(jsonPath("$[0].name").value("Seconde"))
				.andExpect(jsonPath("$[0].description").value("d"))
				.andExpect(jsonPath("$[1].name").value("Première"));
	}

	@Test
	void rejectsListingWithoutSession() throws Exception {
		mockMvc.perform(get("/api/games")).andExpect(status().isUnauthorized());
	}

	@Test
	void rejectsCreationWithoutSession() throws Exception {
		long before = repository.count();
		mockMvc.perform(post("/api/games").with(csrf()).contentType(MediaType.APPLICATION_JSON)
				.content("{\"name\":\"Anonyme\"}")).andExpect(status().isUnauthorized());
		assertEquals(before, repository.count());
	}

	@Test
	void rejectsMalformedBody()throws Exception {
		postJson("{not json")
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("Corps de requête invalide"));
	}
}
