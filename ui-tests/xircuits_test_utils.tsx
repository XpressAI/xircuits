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

const literalTypeMapping = {
    "Literal String": { titleName: "Update string", inputType: 'textarea' },
    "Literal Integer": { titleName: "Update int", inputType: 'input' },
    "Literal Float": { titleName: "Update float", inputType: 'input' },
    "Literal List": { titleName: "Update list", inputType: 'input' },
    "Literal Tuple": { titleName: "Update tuple", inputType: 'input' },
    "Literal Dict": { titleName: "Update dict", inputType: 'input' },
    "Literal Secret": { titleName: "Update secret", inputType: 'input' },
    "Literal Boolean": { titleName: "Update boolean" },
};

export interface UpdateLiteralNode {
    type: string;
    updateValue: string | boolean;
}

export async function updateLiteral(page, {type, updateValue}: UpdateLiteralNode) {
    if (type === 'Literal Boolean') {
        await page.locator(`div[data-default-node-name="${type}"]`).dblclick();
        const isChecked = (await page.locator('input[role="switch"]').getAttribute('aria-checked')) === 'true';
        if (isChecked !== updateValue) {
            await page.locator('.react-switch-handle').click();
        }
        await page.locator('.jp-Dialog-button.jp-mod-accept.jp-mod-styled').click();
    } else {
        const { titleName, inputType } = literalTypeMapping[type];
        await page.locator(`div[data-default-node-name="${type}"]`).dblclick();
        await page.locator(`${inputType}[name="${titleName}"]`).fill(String(updateValue));
        await page.locator('.jp-Dialog-button.jp-mod-accept.jp-mod-styled').click();
    }
}