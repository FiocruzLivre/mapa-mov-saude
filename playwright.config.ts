import { defineConfig } from '@playwright/test'

const root = process.env.MEDIAWIKI_ROOT
if (!root) {
  throw new Error('Defina MEDIAWIKI_ROOT para a instalação MediaWiki descartável')
}

export default defineConfig({
  testDir: './tests/e2e',
  retries: 0,
  workers: 1,
  timeout: 60_000,
  snapshotPathTemplate: 'img/screenshots/{arg}.png',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.001,
    },
  },
  use: {
    browserName: 'chromium',
    locale: 'pt-BR',
    viewport: { width: 1180, height: 840 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
  },
  webServer: {
    command: 'php -S 127.0.0.1:8765 -t "' + root + '"',
    url: 'http://127.0.0.1:8765/api.php?action=query&format=json',
    reuseExistingServer: false,
    timeout: 45_000,
  },
})
