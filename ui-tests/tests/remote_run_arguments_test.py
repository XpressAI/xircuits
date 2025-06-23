"""
Test the full remote run flow with multiple argument types.

This test sets up a remote run using string, float, and boolean argument nodes.
It fills the inputs in the remote run dialog, submits them, and asserts that the
command generated includes all the expected argument values.
"""
from playwright.sync_api import sync_playwright
from xircuits_test_utils import connect_nodes, compile_and_run_workflow ,simulate_drag_component_from_library, simulate_zoom_ctrl_wheel

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False, slow_mo=200)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:8888")
    page.wait_for_selector('#jupyterlab-splash', state='detached')
    page.get_by_text('New Xircuits File', exact=True).click()

    simulate_drag_component_from_library(page, "UTILS", "PrettyPrint")
    connect_nodes(page, {
            "sourceNode": "Start",
            "sourcePort": "out-0",
            "targetNode": "PrettyPrint",
            "targetPort": "in-0"
        })
    
    connect_nodes(page, {
            "sourceNode": "PrettyPrint",
            "sourcePort": "out-0",
            "targetNode": "Finish",
            "targetPort": "in-0"
        })
        
    simulate_drag_component_from_library(page, "GENERAL", "Get Argument String Name")
    page.wait_for_selector("input[name='Please define parameter']")
    page.fill("input[name='Please define parameter']", "String")
    page.click("div.jp-Dialog-buttonLabel:has-text('Submit')")
    page.click(".xircuits-canvas")
    page.wait_for_timeout(500)

    connect_nodes(page, {
    "sourceNode": "Argument (string): String",
    "sourcePort": "parameter-out-0",
    "targetNode": "PrettyPrint",
    "targetPort": "parameter-any-msg"
        })
    simulate_drag_component_from_library(page, "GENERAL", "Get Argument Float Name")
    page.wait_for_selector("input[name='Please define parameter']")
    page.fill("input[name='Please define parameter']", "Float")
    page.click("div.jp-Dialog-buttonLabel:has-text('Submit')")
    page.click(".xircuits-canvas")
    page.wait_for_timeout(500)  

    simulate_drag_component_from_library(page, "GENERAL", "Get Argument Boolean Name")
    page.wait_for_selector("input[name='Please define parameter']")
    page.fill("input[name='Please define parameter']", "Boolean")
    page.click("div.jp-Dialog-buttonLabel:has-text('Submit')")
    page.click(".xircuits-canvas")
    page.wait_for_timeout(500)
    page.get_by_label("Run type").select_option("remote-run")

    compile_and_run_workflow(page)

    page.get_by_label("Available run types").select_option("EXAMPLE")
    page.get_by_label("Run Configuration").select_option("USING_PLACEHOLDERS")
    page.fill("input[name='String']", "Hello World")
    page.get_by_text("Boolean").locator("..").locator("div.react-switch-bg").click()

    page.locator("input[name='Float']").press("ArrowUp") 
    page.click("div.jp-Dialog-buttonLabel:has-text('Start')")
    page.click("div.jp-Dialog-buttonLabel:has-text('Select')")
    page.wait_for_timeout(5000)

    assert page.is_visible("text=--String Hello World")
    assert page.is_visible("text=--Boolean")
    assert page.is_visible("text=--Float 0.10")

    print("Remote run argument test passed successfully!")



