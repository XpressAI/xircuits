""" 
Verify that Start and Finish nodes cannot be deleted, 
and that locked components are also protected from deletion.
"""
from playwright.sync_api import sync_playwright
from xircuits_test_utils import delete_component_directly, lock_component, simulate_drag_component_from_library, simulate_zoom_ctrl_wheel

with sync_playwright() as p:

    browser = p.chromium.launch(headless=True, slow_mo=200)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:8888")
    page.wait_for_selector('#jupyterlab-splash', state='detached')
    page.get_by_text('New Xircuits File', exact=True).click()

    delete_component_directly(page, "Start")
    page.locator("button:has-text('OK')").click(timeout=1000)

    delete_component_directly(page, "Finish")
    page.locator("button:has-text('OK')").click(timeout=1000)

    try:
        page.wait_for_selector("div.node[data-default-node-name='Start']", timeout=2000)
        print("Start node is still present — cannot be deleted as expected.")
    except:
        raise AssertionError("Start node was deleted — this should not happen.")

    try:
        page.wait_for_selector("div.node[data-default-node-name='Finish']", timeout=2000)
        print("Finish node is still present — cannot be deleted as expected.")
    except:
        raise AssertionError("Finish node was deleted — this should not happen.")

    simulate_drag_component_from_library(page, "UTILS", "Print")
    simulate_zoom_ctrl_wheel(page, zoom_in=False, delta=120)

    lock_component(page, "Print")
    page.wait_for_timeout(3000)
    delete_component_directly(page, "Print")
    page.wait_for_timeout(1000)

    try:
        page.wait_for_selector("div.node[data-default-node-name='Print']", timeout=2000)
        print("Print node is still present — cannot be deleted as expected.")
    except:
        raise AssertionError("Print node was deleted — this should not happen.")
