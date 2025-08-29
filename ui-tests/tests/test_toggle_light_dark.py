from playwright.sync_api import sync_playwright
from xircuits_test_utils import click_toolbar_button, get_official_theme_info, wait_official_theme_change

BTN_TOGGLE_TITLE = "Toggle Light/Dark Mode"

def mode_from_flag(flag):
    return "light" if flag == "true" else "dark" if flag == "false" else None

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, slow_mo=120)
    page = browser.new_page()
    page.goto("http://localhost:8888")
    page.wait_for_selector("#jupyterlab-splash", state="detached")
    page.get_by_text("New Xircuits File", exact=True).click()
    page.wait_for_selector(".xircuits-canvas", timeout=10000)

    # Press toggle twice to sync JupyterLab and Xircuits canvas themes
    click_toolbar_button(page, BTN_TOGGLE_TITLE)
    click_toolbar_button(page, BTN_TOGGLE_TITLE)

    s0 = get_official_theme_info(page) 
    if s0["themeName"] is None and s0["themeLight"] is None:
        raise AssertionError("Missing official JupyterLab theme attributes (data-jp-theme-*)")
    init_mode = mode_from_flag(s0["themeLight"])
    print(f"[✔] Initial: name={s0['themeName']}, lightFlag={s0['themeLight']}, mode≈{init_mode}")

    # Toggle
    exp1 = {"light": "dark", "dark": "light"}.get(init_mode)
    click_toolbar_button(page, BTN_TOGGLE_TITLE)
    wait_official_theme_change(page, before=s0, expect_mode=exp1, timeout=15000)
    s1 = get_official_theme_info(page)
    print(f"After 1st toggle: name={s1['themeName']}, lightFlag={s1['themeLight']}")

    # Toggle back 
    click_toolbar_button(page, BTN_TOGGLE_TITLE)
    wait_official_theme_change(page, before=s1, expect_mode=init_mode, timeout=15000)
    s2 = get_official_theme_info(page)
    print(f"After 2nd toggle: name={s2['themeName']}, lightFlag={s2['themeLight']}")

    print("Light/Dark toggle test passed.")
    browser.close()
