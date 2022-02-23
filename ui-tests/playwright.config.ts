import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  timeout: 60000,
  use: {
    // Browser options
    headless: true,

    // Context options
    viewport: { width: 1280, height: 720 },

    // Artifacts
    video: 'off',

    launchOptions: {
      slowMo: 500
    }
  },
};

export default config;
