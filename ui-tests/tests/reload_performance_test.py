from playwright.sync_api import sync_playwright
from xircuits_test_utils import ( clean_xircuits_directory,copy_xircuits_file, get_js_heap_used, get_dom_counters, collect_gc, trigger_reload_and_wait )

MAX_DELTA_MB = 10.0 
MAX_NET_GROWTH_MB = 20.0  

RUNS = 5
WARMUP = 1
BASE_FILE = "LargeCanvas.xircuits"
BROWSER = ["chromium"]

with sync_playwright() as p:
    for browser_name in BROWSER:
        print(f"\n========== [START] Reload memory & update check — {browser_name} ==========")
        browser = getattr(p, browser_name).launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        clean_xircuits_directory(page, browser_name)
        copy_xircuits_file(page, BASE_FILE, browser_name)

        page.get_by_text(BASE_FILE, exact=True).dblclick()
        page.wait_for_timeout(3000)

        trigger_reload_and_wait(page)
        page.wait_for_timeout(500)  
        assert page.locator('div.port[data-name*="day"]').count() > 0, \
            "Reload didn't update node to include 'day' port"
        print("Reload updated nodes correctly (found 'day' port).")

        if browser_name == "chromium":
            deltas = []

            dom_before = get_dom_counters(page)
            if dom_before:
                print(f"DOM before: {dom_before}")

            heap0 = get_js_heap_used(page)

            for i in range(RUNS):
                heap_before = get_js_heap_used(page)

                trigger_reload_and_wait(page)

                collect_gc(page)
                page.wait_for_timeout(200)

                heap_after = get_js_heap_used(page)
                delta_mb = (heap_after - heap_before) / (1024 * 1024)

                label = "Warm-up" if i < WARMUP else f"Run {i - WARMUP + 1}"
                print(f"[{label}] Δheap={delta_mb:.1f} MB")

                if i >= WARMUP:
                    deltas.append(delta_mb)

            dom_after = get_dom_counters(page)
            if dom_after:
                print(f"DOM after:  {dom_after}")

            net_growth_mb = (get_js_heap_used(page) - heap0) / (1024 * 1024)

            print("\n=== Reload Memory Summary (Chromium) ===")
            if deltas:
                print(f"Δheap per run (MB): {', '.join(f'{d:.1f}' for d in deltas)}")
            print(f"net growth across runs: {net_growth_mb:.1f} MB")

            violations = []
            for i, d in enumerate(deltas, 1):
                if d > MAX_DELTA_MB:
                    violations.append(f"Run {i}: Δheap {d:.1f}MB > {MAX_DELTA_MB}MB")
            if net_growth_mb > MAX_NET_GROWTH_MB:
                violations.append(f"Net heap growth {net_growth_mb:.1f}MB > {MAX_NET_GROWTH_MB}MB")
            if violations:
                raise AssertionError("Memory performance test failed:\n" + "\n".join(violations))

        context.close()
        browser.close()

        print(f"========== [END]   Reload memory & update check — {browser_name} ==========\n")
