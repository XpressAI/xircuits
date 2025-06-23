import textwrap
from pathlib import Path
from playwright.sync_api import sync_playwright
from xircuits_test_utils import update_literal_value, compile_and_run_workflow, clean_xircuits_directory, copy_xircuits_file, update_literal_chat

base_file = "DataTypes-TestNodeEdit.xircuits"
browsers_to_test = ["chromium", "firefox"]

with sync_playwright() as p:
    for browser_name in browsers_to_test:
        print(f"\nRunning edit test on: {browser_name}")
        browser = getattr(p, browser_name).launch(headless=True, slow_mo=200)
        context = browser.new_context()
        page = context.new_page()

        clean_xircuits_directory(page, browser_name)
        copy_xircuits_file(page, base_file, browser_name)

        page.get_by_text(base_file, exact=True).dblclick()
        page.wait_for_timeout(2000)

        params_list = [
            { "type": "Literal String",  "value": "Updated String" },
            { "type": "Literal Integer", "value": "456e1" },
            { "type": "Literal Float",   "value": "456e-1" },
            { "type": "Literal Boolean", "value": "false" },
            { "type": "Literal List",    "value": '"d", "e", "f"' },
            { "type": "Literal Tuple",   "value": '"g", "h", "i"' },
            { "type": "Literal Dict",    "value": '"x": "xenon", "y": "yellow", "z": 2023' },
            { "type": "Literal Secret",  "value": "def", "expected": "*****" },
        ]

        for item in params_list:
            update_literal_value(page, item["type"], item["value"])

            node_text = page.locator(f"div[data-default-node-name='{item['type']}']").inner_text()
            expected = item.get("expected") or item["value"]
            if item["value"] == "false":
                expected = "False"
            assert expected in node_text
            print(f"{item['type']} updated and verified.")
        update_literal_chat(page, [
            {"role": "user", "content": "updated user message"},
            {"role": "assistant", "content": "new assistant message"},
        ])

        expected_output_lines = [
            "String inPort:\nUpdated String",
            "Integer inPort:\n4560.0",
            "Float inPort:\n45.6",
            "Boolean inPort:\nFalse",
            "List inPort:\n['d', 'e', 'f']",
            "Tuple inPort:\n('g', 'h', 'i')",
            "Dict inPort:\n{'x': 'xenon', 'y': 'yellow', 'z': 2023}",
            "Secret inPort:\ndef",
            "Chat inPort:\n[{'role': 'user', 'content': 'updated user message'}, {'role': 'assistant', 'content': 'new assistant message'}]"
        ]

        compile_and_run_workflow(page)
        page.click("div.jp-Dialog-buttonLabel:has-text('Start')")
        page.click("div.jp-Dialog-buttonLabel:has-text('Select')")
        page.wait_for_timeout(5000)
        all_outputs = page.locator('.jp-OutputArea-output').all_inner_texts()
        combined_output = "\n".join(all_outputs)

        for line in expected_output_lines:
            assert line in combined_output, f"Missing line: {line}"
        
        print(f"{browser_name}: Test passed ")
        print("Output verified successfully.")

        context.close()
        browser.close()