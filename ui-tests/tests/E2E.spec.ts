import { test, expect } from '@playwright/test';

const TARGET_URL = process.env.TARGET_URL ?? 'http://localhost:8888/lab/tree/examples/KerasModelPredict.xircuits';

test('Should complete E2E test', async ({
  page,
}) => {
  const logs: string[] = [];

  page.on('console', (message) => {
    logs.push(message.text());
  });

  await page.goto(`${TARGET_URL}/lab`);
  await page.waitForSelector('#jupyterlab-splash', { state: 'detached' });
  await page.pause();

  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });

  await page.locator("xpath=//*[contains(@title, 'Save Xircuits')]").first().click();
  await page.locator("xpath=//*[contains(@title, 'Compile Xircuits')]").first().click();
  await page.locator("xpath=//*[contains(@title, 'Run Xircuits')]").first().click();

  // Start Xircuits
  await page.locator('button:has-text("Start")').click();
  // Select First Kernel
  await page.locator('button:has-text("Select")').click();

  const content = await page.locator("text=Finish Executing").innerHTML()

  expect(content).toContain('Finish Executing')

});
