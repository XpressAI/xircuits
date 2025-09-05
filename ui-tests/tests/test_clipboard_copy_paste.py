from playwright.sync_api import sync_playwright
from xircuits_test_utils import  simulate_drag_component_to_position, click_toolbar_button, wait_for_count, click_node_center 

PRINT_NAME = "Print"
PRINT_SEL  = f'div.node[data-default-node-name="{PRINT_NAME}"]'

BTN_COPY_TITLE  = "Copy selected nodes"
BTN_PASTE_TITLE = "Paste nodes from the clipboard"
BTN_CUT_TITLE   = "Cut selected nodes"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, slow_mo=120)
    page = browser.new_page()
    page.goto("http://localhost:8888")
    page.wait_for_selector("#jupyterlab-splash", state="detached")
    page.get_by_text("New Xircuits File", exact=True).click()
    page.wait_for_selector(".xircuits-canvas", timeout=10000)

    print("Dropping Print...")
    simulate_drag_component_to_position(page, "UTILS", PRINT_NAME, drop_x=520, drop_y=360)

    page.wait_for_function("(sel)=>document.querySelectorAll(sel).length>=1", arg=PRINT_SEL)
    base = page.locator(PRINT_SEL).count()
    print(f"found {base} Print node(s).")

    click_node_center(page, PRINT_SEL)

    # Copy → Paste (+1)
    click_toolbar_button(page, BTN_COPY_TITLE)
    click_toolbar_button(page, BTN_PASTE_TITLE)
    wait_for_count(page, PRINT_SEL, base + 1)
    print(f"After Copy+Paste: count is {base + 1}.")

    # Paste again (+2 total)
    click_toolbar_button(page, BTN_PASTE_TITLE)
    wait_for_count(page, PRINT_SEL, base + 2)
    print(f"After extra Paste: count is {base + 2}.")

    # Cut one (−1)
    click_node_center(page, PRINT_SEL)
    click_toolbar_button(page, BTN_CUT_TITLE)
    wait_for_count(page, PRINT_SEL, base + 1)
    print(f"After Cut: count is {base + 1}.")

    # Paste after Cut (+1 back)
    click_toolbar_button(page, BTN_PASTE_TITLE)
    wait_for_count(page, PRINT_SEL, base + 2)
    print(f"After Paste post-Cut: count is {base + 2}.")

    print("Clipboard test on a single Print node passed cleanly.")
    browser.close()
