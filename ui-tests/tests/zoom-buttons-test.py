from playwright.sync_api import sync_playwright

def extract_background_size(style_str: str) -> str:
    """Extracts background-size value from style string."""
    for part in style_str.split(";"):
        if "background-size" in part:
            return part.strip().split(":")[1].strip()
    return ""

def poke_canvas(page):
    canvas = page.locator('div.xircuits-canvas')
    box = canvas.bounding_box()
    page.mouse.move(box["x"] + 5, box["y"] + 5)
    page.mouse.move(box["x"] + 20, box["y"] + 20)

def relocate_zoom_controls(page, offset=12):
    """
    Move ZoomControls container to the top‑left corner **during tests only**
    because the default bottom‑right position is sometimes covered by
    a JupyterLab toast notification that intercepts clicks.
    """
    page.evaluate(f"""
    (() => {{
      const btn = document.querySelector('button[title="Zoom In"]');
      if (!btn) return;
      // climb up until we hit the flex‑column ZoomControls container
      let node = btn.parentElement;
      while (node && node.tagName !== 'BODY') {{
        const cs = getComputedStyle(node);
        if (cs.display === 'flex' && cs.flexDirection === 'column') {{
          node.style.position       = 'fixed';
          node.style.top            = '{offset}px';
          node.style.left           = '{offset}px';
          node.style.right          = 'auto';
          node.style.bottom         = 'auto';
          node.style.opacity        = '1';
          node.style.pointerEvents  = 'auto';
          node.style.transition     = 'none';
          return;
        }}
        node = node.parentElement;
      }}
    }})();
    """)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False, slow_mo=50)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:8888")
    page.wait_for_selector('#jupyterlab-splash', state='detached')
    page.get_by_text('New Xircuits File', exact=True).click()

    # Move ZoomControls container to the top‑left corner
    poke_canvas(page)
    page.wait_for_timeout(300)
    page.wait_for_selector('button[title="Zoom In"]')
    relocate_zoom_controls(page)

    canvas = page.locator('div.xircuits-canvas')
    original_style = canvas.get_attribute("style")
    original_size = extract_background_size(original_style)
    print(f"Original background-size: {original_size}")

    # 1. Zoom In
    poke_canvas(page)
    page.wait_for_timeout(300)
    page.locator('button[title="Zoom In"]').click()
    page.wait_for_timeout(500)
    zoomed_in_size = extract_background_size(canvas.get_attribute("style"))
    print(f"After Zoom In background-size: {zoomed_in_size}")
    assert zoomed_in_size != original_size, "Zoom In did not change background-size"
    print("Zoom In button works correctly.")

    # 2. Zoom Out
    poke_canvas(page)
    page.wait_for_timeout(300)
    page.locator('button[title="Zoom Out"]').click()
    page.wait_for_timeout(500)
    zoomed_out_size = extract_background_size(canvas.get_attribute("style"))
    print(f"After Zoom Out background-size: {zoomed_out_size}")
    assert zoomed_out_size != zoomed_in_size, "Zoom Out did not change background-size"
    print("Zoom Out button works correctly.")

    # 3. Fit All Nodes
    poke_canvas(page)
    page.wait_for_timeout(300)
    page.locator('button[title="Fit all nodes"]').click()
    page.wait_for_timeout(500)
    fit_size = extract_background_size(canvas.get_attribute("style"))
    print(f"After Fit All Nodes background-size: {fit_size}")
    assert fit_size != zoomed_out_size, "Fit all nodes did not change background-size"
    print("Fit All Nodes button works correctly.")

  