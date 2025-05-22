from playwright.sync_api import sync_playwright
from xircuits_test_utils import simulate_drag_component_from_library, fill_literal_string_input_and_submit, connect_nodes, verify_new_port_spawned

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, slow_mo=200)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:8888")
    page.wait_for_selector('#jupyterlab-splash', state='detached')
    page.get_by_text('New Xircuits File', exact=True).click()

    simulate_drag_component_from_library(page, "TESTS", "DynaportTester")

    simulate_drag_component_from_library(page, "GENERAL", "Literal String")

    fill_literal_string_input_and_submit(page, "Hello")

    connect_nodes(page, {
        "sourceNode": "Literal String",
        "sourcePort": "out-0",
        "targetNode": "DynaportTester",
        "targetPort": "parameter-dynalist-inputs"
    })

    verify_new_port_spawned(page,"DynaportTester", "parameter-dynalist-inputs-1")