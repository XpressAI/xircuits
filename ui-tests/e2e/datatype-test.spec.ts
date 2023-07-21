import { Page, test, expect } from '@playwright/test';
import { datatype_test_1, datatype_test_2 } from './expected_outputs/01_datatypes'

interface NodeConnection {
  sourceNode: string;
  sourcePort: string;
  targetNode: string;
  targetPort: string;
}

const connectNodes = async (page: Page, connection: NodeConnection) => {
  await page.locator(`div[data-default-node-name="${connection.sourceNode}"] >> div[data-name="${connection.sourcePort}"]`).hover();
  await page.mouse.down();
  await page.locator(`div[data-default-node-name="${connection.targetNode}"] >> div[data-name="${connection.targetPort}"]`).hover();
  await page.mouse.up();
};
test('test', async ({ page, browserName }) => {
  await page.goto('http://localhost:8888');
  await page.locator('[aria-label="File\\ Browser\\ Section"] >> text=xai_components').dblclick();
  await page.locator('[aria-label="File\\ Browser\\ Section"] >> text=xai_tests').dblclick();
  await page.locator('[aria-label="File\\ Browser\\ Section"] >> text=DataTypes.xircuits').click();
  await page.keyboard.press('Control+D', { delay: 100 }); // duplicate
  await page.locator('[aria-label="File\\ Browser\\ Section"] >> text=DataTypes-Copy').click();
  await page.keyboard.press('F2', { delay: 100 }); // rename
  await page.keyboard.type(browserName, { delay: 100 });
  await page.keyboard.press('Enter', { delay: 100 });
  await page.keyboard.press('Enter');
  
  await connectNodes(page, { sourceNode: "Literal String", sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-string-string_port" });
  await connectNodes(page, { sourceNode: "Literal Integer", sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-int-int_port" });
  await connectNodes(page, { sourceNode: "Literal Float", sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-float-float_port" });
  await connectNodes(page, { sourceNode: "Literal Boolean", sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-boolean-boolean_port" });
  await connectNodes(page, { sourceNode: "Literal List", sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-list-list_port" });
  await connectNodes(page, { sourceNode: "Literal Tuple", sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-tuple-tuple_port" });
  await connectNodes(page, { sourceNode: "Literal Dict", sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-dict-dict_port" });
  await connectNodes(page, { sourceNode: "Literal Secret", sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-secret-secret_port" });
  await connectNodes(page, { sourceNode: "Literal Chat", sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-chat-chat_port" });

  await connectNodes(page, { sourceNode: "Start", sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "in-0" });
  await connectNodes(page, { sourceNode: "AllLiteralTypes", sourcePort: "out-0", targetNode: "Finish", targetPort: "in-0" });

  // Save and compile the Xircuits file, wait for the element to be visible before interacting
  await page.locator("xpath=//*[contains(@title, 'Save (Ctrl+S)')]").first().click();
  await page.locator("xpath=//*[contains(@title, 'Compile Xircuits')]").first().click();
  await page.locator("xpath=//*[contains(@title, 'Compile and Run Xircuits')]").first().click();

  // Start and select the kernel for Xircuits
  await page.locator('button:has-text("Start")').click();
  await page.locator('button:has-text("Select")').click();

  const content = await page.locator('.jp-OutputArea-output').innerText();

  expect(content).toContain(datatype_test_1);
  await page.locator('li[data-id="xircuit-output-panel"] >> svg[data-icon="ui-components:close"]').click();
  
  await page.locator(`div[data-default-node-name="Literal String"]`).dblclick();
  await page.locator('textarea[name="Update string"]').fill("Updated String")
  await page.locator('.jp-Dialog-button.jp-mod-accept.jp-mod-styled').click();
  await expect(page.getByText('Updated String')).toBeVisible();

  await page.locator(`div[data-default-node-name="Literal Integer"]`).dblclick();
  await page.locator('input[name="Update int"]').fill("456")
  await page.locator('.jp-Dialog-button.jp-mod-accept.jp-mod-styled').click();
  await expect(page.getByText('456')).toBeVisible();

  await page.locator(`div[data-default-node-name="Literal Float"]`).dblclick();
  await page.locator('input[name="Update float"]').fill("4.56")
  await page.locator('.jp-Dialog-button.jp-mod-accept.jp-mod-styled').click();
  await expect(page.getByText('4.56')).toBeVisible();

  await page.locator(`div[data-default-node-name="Literal Boolean"]`).dblclick();
  await page.locator('.react-switch-handle').click();
  await page.locator('.jp-Dialog-button.jp-mod-accept.jp-mod-styled').click();
  await expect(page.getByText('False')).toBeVisible();

  await page.locator(`div[data-default-node-name="Literal List"]`).dblclick();
  await page.locator('input[name="Update list"]').fill('"d", "e", "f"')
  await page.locator('.jp-Dialog-button.jp-mod-accept.jp-mod-styled').click();
  await expect(page.getByText('"d", "e", "f"')).toBeVisible();

  await page.locator(`div[data-default-node-name="Literal Tuple"]`).dblclick();
  await page.locator('input[name="Update tuple"]').fill('"g", "h", "i"')
  await page.locator('.jp-Dialog-button.jp-mod-accept.jp-mod-styled').click();
  await expect(page.getByText('"g", "h", "i"')).toBeVisible();

  await page.locator(`div[data-default-node-name="Literal Dict"]`).dblclick();
  await page.locator('input[name="Update dict"]').fill('"x": "xenon", "y": "yellow", "z": 2023')
  await page.locator('.jp-Dialog-button.jp-mod-accept.jp-mod-styled').click();
  await expect(page.getByText('"x": "xenon", "y": "yellow", "z": 2023')).toBeVisible();

  await page.locator(`div[data-default-node-name="Literal Secret"]`).dblclick();
  await page.locator('input[name="Update secret"]').fill("Whose eyes are those eyes?")
  await page.locator('.jp-Dialog-button.jp-mod-accept.jp-mod-styled').click();
  await expect(page.getByText('*****')).toBeVisible();


  // Save and compile the Xircuits file, wait for the element to be visible before interacting
  await page.locator("xpath=//*[contains(@title, 'Save (Ctrl+S)')]").first().click();
  await page.locator("xpath=//*[contains(@title, 'Compile Xircuits')]").first().click();
  await page.locator("xpath=//*[contains(@title, 'Compile and Run Xircuits')]").first().click();

  // Start and select the kernel for Xircuits
  await page.locator('button:has-text("Start")').click();
  await page.locator('button:has-text("Select")').click();

  const updated_content = await page.locator('.jp-OutputArea-output').innerText();

  expect(updated_content).toContain(datatype_test_2);
});