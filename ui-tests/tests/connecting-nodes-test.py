import textwrap
from pathlib import Path
from playwright.sync_api import sync_playwright
from xircuits_test_utils import connect_nodes, compile_and_run_workflow, clean_xircuits_directory, copy_xircuits_file

base_file = "DataTypes-TestNodeConnect.xircuits"
browsers_to_test = ["chromium", "firefox"]

with sync_playwright() as p:
    for browser_name in browsers_to_test:
        print(f"\nRunning test on: {browser_name}")
        browser = getattr(p, browser_name).launch(headless=True, slow_mo=200)
        context = browser.new_context()
        page = context.new_page()

        clean_xircuits_directory(page, browser_name)
        copy_xircuits_file(page, base_file, browser_name)

        page.get_by_text(base_file, exact=True).dblclick()
        page.wait_for_timeout(3000)

        connections = [
            {"sourceNode": "Literal String",  "sourcePort": "out-0", "targetNode": "AllLiteralTypes", "targetPort": "parameter-string-string_port"},
            {"sourceNode": "Literal Integer", "sourcePort": "out-0", "targetNode": "AllLiteralTypes", "targetPort": "parameter-int-int_port"},
            {"sourceNode": "Literal Float",   "sourcePort": "out-0", "targetNode": "AllLiteralTypes", "targetPort": "parameter-float-float_port"},
            {"sourceNode": "Literal Boolean", "sourcePort": "out-0", "targetNode": "AllLiteralTypes", "targetPort": "parameter-boolean-boolean_port"},
            {"sourceNode": "Literal List",    "sourcePort": "out-0", "targetNode": "AllLiteralTypes", "targetPort": "parameter-list-list_port"},
            {"sourceNode": "Literal Tuple",   "sourcePort": "out-0", "targetNode": "AllLiteralTypes", "targetPort": "parameter-tuple-tuple_port"},
            {"sourceNode": "Literal Dict",    "sourcePort": "out-0", "targetNode": "AllLiteralTypes", "targetPort": "parameter-dict-dict_port"},
            {"sourceNode": "Literal Secret",  "sourcePort": "out-0", "targetNode": "AllLiteralTypes", "targetPort": "parameter-secret-secret_port"},
            {"sourceNode": "Literal Chat",    "sourcePort": "out-0", "targetNode": "AllLiteralTypes", "targetPort": "parameter-chat-chat_port"},
            {"sourceNode": "Start",           "sourcePort": "out-0", "targetNode": "AllLiteralTypes", "targetPort": "in-0"},
            {"sourceNode": "AllLiteralTypes", "sourcePort": "out-0", "targetNode": "Finish",          "targetPort": "in-0"},
        ]

        for conn in connections:
            connect_nodes(page, conn)

        page.locator('jp-button[title="Reload all nodes"] >>> button').click()
        page.wait_for_selector('#jupyterlab-splash', state='detached')

        compile_and_run_workflow(page)
        page.click("div.jp-Dialog-buttonLabel:has-text('Start')")
        page.click("div.jp-Dialog-buttonLabel:has-text('Select')")
        page.wait_for_timeout(5000)

        essential_lines = [
            "String inPort:\nabc",
            "Integer inPort:\n123",
            "Float inPort:\n12.3",
            "Boolean inPort:\nTrue",
            "List inPort:\n['a', 'b', 'c']",
            "Tuple inPort:\n('a', 'b', 'c')",
            "Dict inPort:\n{'a': 'apple', 'b': 'banana', 'c': 2022}",
            "Secret inPort:\n554",
            "Chat inPort:\n[{'role': 'system', 'content': 'abc'}, {'role': 'user', 'content': 'def'}]",
        ]

        all_outputs = page.locator('.jp-OutputArea-output').all_inner_texts()
        combined_output = "\n".join(all_outputs)

        for line in essential_lines:
            assert line in combined_output, f"{browser_name} - Missing expected line: {line}"

        print(f"{browser_name}: Test passed ")
        print("Output verified successfully.")

        context.close()
        browser.close()
