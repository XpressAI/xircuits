import { test, type Page, expect } from '@playwright/test';
import { copyFile, compileAndRunXircuits, NodeConnection, connectNodes, updateLiteral, cleanDirectoryFromRelativePath } from '../xircuits_test_utils'
import { datatype_test_1, datatype_test_2 } from './expected_outputs/01_datatypes'

test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
});

test.afterAll(async () => {
  await page.close();
});


test('Init data type test', async ({ page, browserName }, testInfo) => {

  if (testInfo.retry)
    await cleanDirectoryFromRelativePath(page, `xai_components/xai_tests/${browserName}`);

  await page.goto('http://localhost:8888');
  await page.locator('[aria-label="File\\ Browser\\ Section"] >> text=xai_components').dblclick();
  await page.locator('[aria-label="File\\ Browser\\ Section"] >> text=xai_tests').dblclick();
  await page.locator('[aria-label="File\\ Browser\\ Section"] >> text=DataTypes.xircuits').click();
  await page.keyboard.press('Control+C');
  await page.locator(`[aria-label="File\\ Browser\\ Section"] >> text=${browserName}`).dblclick();
  await page.locator('.jp-DirListing-content').click({ button: 'right' });
  await page.getByText("Ctrl+V").click();
});


test('Test connecting nodes', async ({ page, browserName }) => {

  let testFileName = "DataTypes-TestNodeConnect.xircuits"

  await cleanDirectoryFromRelativePath(page, `xai_components/xai_tests/${browserName}`);
  await copyFile(page, 
    `xai_components/xai_tests/${testFileName}`, 
    `xai_components/xai_tests/${browserName}/${testFileName}`);

  await page.goto(`http://localhost:8888/lab/tree/xai_components/xai_tests/${browserName}/${testFileName}`);

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
});


test('Test editing literal nodes', async ({ page, browserName }) => {

  let testFileName = "DataTypes-TestNodeEdit.xircuits"

  await cleanDirectoryFromRelativePath(page, `xai_components/xai_tests/${browserName}`);

  await copyFile(page, 
        `xai_components/xai_tests/${testFileName}`, 
        `xai_components/xai_tests/${browserName}/${testFileName}`);

  await page.goto(`http://localhost:8888/lab/tree/xai_components/xai_tests/${browserName}/${testFileName}`);

  const updateParamsList = [
    { type: "Literal String",   updateValue: "Updated String" },
    { type: "Literal Integer",  updateValue: "456e1" },
    { type: "Literal Float",    updateValue: "456e-1" },
    { type: "Literal Boolean",  updateValue: false },
    { type: "Literal List",     updateValue: '"d", "e", "f"' },
    { type: "Literal Tuple",    updateValue: '"g", "h", "i"' },
    { type: "Literal Dict",     updateValue: '"x": "xenon", "y": "yellow", "z": 2023' },
    { type: "Literal Secret",   updateValue: "def", expectedText: '*****' },
  ];
  
  for (const params of updateParamsList) {
    const { type, updateValue, expectedText } = params;
    await updateLiteral(page, { type, updateValue });
    const visibleText = expectedText ? expectedText : (typeof updateValue === "boolean" ? (updateValue ? "True" : "False") : String(updateValue));
    const content = await page.$eval(`div[data-default-node-name="${type}"]`, (div:any) => div.innerText);
    expect(content).toContain(visibleText);
    }

  await page.locator(`div[data-default-node-name='Literal Chat']`).dblclick();
  await page.locator('div').filter({ hasText: /^Select a rolesystemuserassistantfunctionRemovedef$/ }).getByRole('button').click();
  await page.locator('select[name="role-0"]').selectOption('user');
  await page.locator('select[name="role-0"]').click();
  await page.locator('textarea[name="content-0"]').filter({ hasText: 'abc' }).fill('updated user message');
  await page.getByRole('button', { name: 'Add Message' }).click();
  await page.locator('select[name="role-1"]').selectOption('assistant');
  await page.locator('textarea[name="content-1"]').click();
  await page.locator('textarea[name="content-1"]').fill('new assistant message');
  await page.getByRole('button', { name: 'Submit' }).click();

  await compileAndRunXircuits(page);

  const updated_content = await page.locator('.jp-OutputArea-output').innerText();
  expect(updated_content).toContain(datatype_test_2);
});