import { Page } from '@playwright/test';

export async function compileAndRunXircuits(page: Page) {
    // Save and compile the Xircuits file, wait for the element to be visible before interacting
    await page.locator("xpath=//*[contains(@title, 'Save (Ctrl+S)')]").first().click();
    await page.locator("xpath=//*[contains(@title, 'Compile Xircuits')]").first().click();
    await page.locator("xpath=//*[contains(@title, 'Compile and Run Xircuits')]").first().click();
  
    // Start and select the kernel for Xircuits
    await page.locator('button:has-text("Start")').click();
    await page.locator('button:has-text("Select")').click();
}

export interface NodeConnection {
    sourceNode: string;
    sourcePort: string;
    targetNode: string;
    targetPort: string;
}
  
export const connectNodes = async (page: Page, connection: NodeConnection) => {
    await page.locator(`div[data-default-node-name="${connection.sourceNode}"] >> div[data-name="${connection.sourcePort}"]`).hover();
    await page.mouse.down();
    await page.locator(`div[data-default-node-name="${connection.targetNode}"] >> div[data-name="${connection.targetPort}"]`).hover();
    await page.mouse.up();
};

export interface UpdateLiteralNode {
    type: string;
    titleName: string;
    updateValue: string;
    inputType?: string;
}

export async function updateLiteral(page, {type, titleName, updateValue, inputType = 'input'}: UpdateLiteralNode) {
    await page.locator(`div[data-default-node-name="${type}"]`).dblclick();
    await page.locator(`${inputType}[name="${titleName}"]`).fill(updateValue);
    await page.locator('.jp-Dialog-button.jp-mod-accept.jp-mod-styled').click();
}