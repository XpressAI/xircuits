import { test, expect } from '@playwright/test';
import { compileAndRunXircuits, NodeConnection, connectNodes, UpdateLiteralNode, updateLiteral } from '../xircuits_test_utils'
import { datatype_test_1, datatype_test_2 } from './expected_outputs/01_datatypes'

test('test', async ({ page, browserName }) => {
  await page.goto('http://localhost:8888');
  await page.locator('[aria-label="File\\ Browser\\ Section"] >> text=xai_components').dblclick();
  await page.locator('[aria-label="File\\ Browser\\ Section"] >> text=xai_tests').dblclick();
  await page.locator('[aria-label="File\\ Browser\\ Section"] >> text=DataTypes.xircuits').click();
  await page.keyboard.press('Control+C'); // duplicate
  await page.locator(`[aria-label="File\\ Browser\\ Section"] >> text=${browserName}`).dblclick();
  await page.locator('.jp-DirListing-content').click({ button: 'right' });
  await page.getByText("Ctrl+V").click();
  await page.locator('[aria-label="File\\ Browser\\ Section"] >> text=DataTypes.xircuits').dblclick();
  
  const nodeConnections: NodeConnection[] = [
    { sourceNode: "Literal String",   sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-string-string_port" },
    { sourceNode: "Literal Integer",  sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-int-int_port" },
    { sourceNode: "Literal Float",    sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-float-float_port" },
    { sourceNode: "Literal Boolean",  sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-boolean-boolean_port" },
    { sourceNode: "Literal List",     sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-list-list_port" },
    { sourceNode: "Literal Tuple",    sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-tuple-tuple_port" },
    { sourceNode: "Literal Dict",     sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-dict-dict_port" },
    { sourceNode: "Literal Secret",   sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-secret-secret_port" },
    { sourceNode: "Literal Chat",     sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "parameter-chat-chat_port" },
    { sourceNode: "Start",            sourcePort: "out-0", targetNode: "AllLiteralTypes", targetPort: "in-0" },
    { sourceNode: "AllLiteralTypes",  sourcePort: "out-0", targetNode: "Finish",          targetPort: "in-0" }
  ];
  
  for (const connection of nodeConnections) {
    await connectNodes(page, connection);
  }

  await compileAndRunXircuits(page);

  const content = await page.locator('.jp-OutputArea-output').innerText();
  expect(content).toContain(datatype_test_1);
  await page.locator('li[data-id="xircuit-output-panel"] >> svg[data-icon="ui-components:close"]').click();
  
  const updateParamsList = [
    { type: "Literal String",   titleName: "Update string", updateValue: "Updated String", inputType: 'textarea' },
    { type: "Literal Integer",  titleName: "Update int",    updateValue: "456" },
    { type: "Literal Float",    titleName: "Update float",  updateValue: "4.56" },
    { type: "Literal List",     titleName: "Update list",   updateValue: '"d", "e", "f"' },
    { type: "Literal Tuple",    titleName: "Update tuple",  updateValue: '"g", "h", "i"' },
    { type: "Literal Dict",     titleName: "Update dict",   updateValue: '"x": "xenon", "y": "yellow", "z": 2023' },
    { type: "Literal Secret",   titleName: "Update secret", updateValue: "def", expectedText: '*****' },
  ];
  
  for (const params of updateParamsList) {
    const { type, titleName, updateValue, expectedText, inputType } = params;
    await updateLiteral(page, { type, titleName, updateValue, inputType });
    const visibleText = expectedText ? expectedText : updateValue;
    await expect(page.getByText(visibleText)).toBeVisible();
}
  
  // Handling Boolean separately
  await page.locator(`div[data-default-node-name="Literal Boolean"]`).dblclick();
  await page.locator('.react-switch-handle').click();
  await page.locator('.jp-Dialog-button.jp-mod-accept.jp-mod-styled').click();
  await expect(page.getByText('False')).toBeVisible();

  await page.getByText('Literal Chat').dblclick();
  await page.locator('div').filter({ hasText: /^Select a rolesystemuserassistantfunctionRemovedef$/ }).getByRole('button').click();
  await page.locator('select[name="role"]').selectOption('user');
  await page.locator('select[name="role"]').click();
  await page.getByText('abc', { exact: true }).fill('updated user message');
  await page.getByRole('button', { name: 'Add Message' }).click();
  await page.getByRole('combobox').nth(2).selectOption('assistant');
  await page.getByRole('textbox').nth(2).click();
  await page.getByRole('textbox').nth(2).fill('new assistant message');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('False')).toBeVisible();

  [{"role":"user","content":"updated user message"},{"role":"assistant","content":"new assistant message"}]

  await compileAndRunXircuits(page);

  const updated_content = await page.locator('.jp-OutputArea-output').innerText();
  expect(updated_content).toContain(datatype_test_2);
});