import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'steps/*.ts',
});

export default defineConfig({
  testDir,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      // Backend avec la base H2 du profil de test : aucun service externe requis.
      command: `${process.platform === 'win32' ? '.\\mvnw.cmd' : './mvnw'} -B -q spring-boot:run -Dspring-boot.run.useTestClasspath=true`,
      env: {
        DB_URL: 'jdbc:h2:mem:jdr;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1',
        DB_USER: 'sa',
        DB_PASSWORD: '',
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
