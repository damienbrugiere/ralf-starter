import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'steps/*.ts',
});

export default defineConfig({
  testDir,
  // Un seul worker : le faux fournisseur OAuth2 a un état partagé (refus de la prochaine connexion).
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node mock-oauth/server.js',
      url: 'http://localhost:9100/health',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      // Backend avec la base H2 du profil de test : aucun service externe requis.
      command: `${process.platform === 'win32' ? '.\\mvnw.cmd' : './mvnw'} -B -q spring-boot:run -Dspring-boot.run.useTestClasspath=true`,
      env: {
        DB_URL: 'jdbc:h2:mem:jdr;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1',
        DB_USER: 'sa',
        DB_PASSWORD: '',
        // Discord pointe vers le faux fournisseur OAuth2 (mock-oauth/server.js).
        SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_DISCORD_CLIENT_ID: 'e2e-client',
        SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_DISCORD_CLIENT_SECRET: 'e2e-secret',
        DISCORD_AUTHORIZATION_URI: 'http://localhost:9100/authorize',
        DISCORD_TOKEN_URI: 'http://localhost:9100/token',
        DISCORD_USER_INFO_URI: 'http://localhost:9100/userinfo',
      },
      cwd: '../backend/springboot',
      url: 'http://localhost:8080/actuator/health',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command: 'npm run start -- --port 4200',
      cwd: '../frontend/angular',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
