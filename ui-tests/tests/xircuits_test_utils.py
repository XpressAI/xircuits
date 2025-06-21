from playwright.sync_api import Page

def fill_literal_string_input_and_submit(page: Page, text: str = "Hello Test!"):
    print(f"Filling Literal String input with: {text}")
    page.wait_for_selector("textarea[name='New Literal Input']")
    page.fill("textarea[name='New Literal Input']", text)
    page.click("div.jp-Dialog-buttonLabel:has-text('Submit')")
    page.click(".xircuits-canvas")  
    page.wait_for_timeout(500)

def verify_new_port_spawned(
    page: Page, node_name: str, port_name: str, timeout: int = 5000
) -> None:
    """
    Waits for the new port to be attached to the DOM and verifies its existence.
    Does not rely on visibility since the port may be off-screen.
    """
    selector = (
        f"div.node[data-default-node-name='{node_name}'] "
        f"div.port[data-name='{port_name}']"
    )
    page.wait_for_selector(selector, state="attached", timeout=timeout)
    assert page.locator(selector).count() > 0, (
        f"Port '{port_name}' was NOT created for node '{node_name}'."
    )
    print(f"Port '{port_name}' is present for node '{node_name}'.")


def verify_port_not_spawned(
    page: Page, node_name: str, port_name: str, timeout: int = 5000
) -> None:
    """
    Waits for the port to be detached from the DOM and verifies its absence.
    """
    selector = (
        f"div.node[data-default-node-name='{node_name}'] "
        f"div.port[data-name='{port_name}']"
    )
    try:
        page.wait_for_selector(selector, state="detached", timeout=timeout)
    except TimeoutError:
        pass

    assert page.locator(selector).count() == 0, (
        f"Port '{port_name}' unexpectedly PRESENT for node '{node_name}'."
    )
    print(f"Port '{port_name}' is absent for node '{node_name}' as expected.")

def simulate_drag_component_from_library(page: Page, library_name: str, component_name: str) -> None:
    """
    Opens the specified library and drags the specified component onto the canvas.

    :param page: The Playwright page object.
    :param library_name: Name of the library containing the component (e.g. "GRADIO" or "GENERAL").
    :param component_name: Name of the component to drag (e.g. "GradioInterface" or "Literal String").
    """
    print(f"Opening library: {library_name}")
    page.wait_for_selector("[data-id='table-of-contents']")
    page.click("[data-id='table-of-contents']")
    page.wait_for_selector("[data-id='xircuits-component-sidebar']")
    page.click("[data-id='xircuits-component-sidebar']")
    # Click on the library by visible text
    page.get_by_text(library_name, exact=True).click()
    page.wait_for_timeout(1000)  # Wait a bit for content to appear

    print(f"Dragging component: {component_name} from library {library_name} to canvas...")
    page.evaluate(f"""
    () => {{
      // Find the draggable element that contains the desired text
      const source = [...document.querySelectorAll("[draggable='true']")]
        .find(el => el.innerText.includes("{component_name}"));
      // Target the canvas (ensure this selector matches the actual element)
      const target = document.querySelector(".xircuits-canvas");
  
      if (!source || !target) {{
          console.warn("Component or canvas not found.");
          return;
      }}
  
      // Add dragTo method to HTMLElement
      HTMLElement.prototype.dragTo = function(targetElement) {{
          const dataTransfer = new DataTransfer();
          this.dispatchEvent(new DragEvent('dragstart', {{ dataTransfer, bubbles: true }}));
          targetElement.dispatchEvent(new DragEvent('dragenter', {{ dataTransfer, bubbles: true }}));
          targetElement.dispatchEvent(new DragEvent('dragover', {{ dataTransfer, bubbles: true }}));
          targetElement.dispatchEvent(new DragEvent('drop', {{ dataTransfer, bubbles: true }}));
          this.dispatchEvent(new DragEvent('dragend', {{ dataTransfer, bubbles: true }}));
      }};
  
      // Perform drag and drop
      source.dragTo(target);
      // Final click on canvas to confirm drop
      target.click();
    }}
    """)

def connect_nodes(page: Page, connection: dict) -> None:
    """
    Connects a port from a source node to a port on a target node
    and asserts that a new link (flow or data) was actually created.
    """
    source = connection['sourceNode']
    target = connection['targetNode']
    print(f"🔗 Connecting {source} (port {connection['sourcePort']}) "
          f"→ {target} (port {connection['targetPort']})...")

    before_count = page.locator("g[data-linkid]").count()

    result = page.evaluate(f"""
    () => {{
        function getCenter(el) {{
            const rect = el.getBoundingClientRect();
            return {{ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }};
        }}

        const sourcePort = document.querySelector(
            "div.node[data-default-node-name='{source}'] div.port[data-name='{connection['sourcePort']}']"
        );
        const targetPort = document.querySelector(
            "div.node[data-default-node-name='{target}'] div.port[data-name='{connection['targetPort']}']"
        );

        if (!sourcePort || !targetPort) return false;

        const from = getCenter(sourcePort);
        const to   = getCenter(targetPort);
        const dt   = new DataTransfer();

        function fire(el, type, x, y) {{
            el.dispatchEvent(new DragEvent(type, {{
                bubbles: true, cancelable: true, composed: true,
                clientX: x, clientY: y, dataTransfer: dt
            }}));
        }}

        fire(sourcePort, "mousedown", from.x, from.y);
        fire(document,  "mousemove", (from.x+to.x)/2, (from.y+to.y)/2);
        fire(document,  "mousemove", to.x, to.y);
        fire(targetPort, "mouseup", to.x, to.y);

        return true;
    }}
    """)

    if not result:
        raise AssertionError(f"Failed to initiate connection between {source} and {target}.")

    page.wait_for_function(
    "(n) => document.querySelectorAll('g[data-linkid]').length >= n",
    arg=before_count + 1,
    timeout=10000
)
    after_count = page.locator("g[data-linkid]").count()

    assert after_count > before_count, (
        f"No link created between {source} and {target}:\n"
        f"  before={before_count}, after={after_count}"
    )

    print(f"Link created. Links before: {before_count}, after: {after_count}")

def lock_component(page, component_name: str):
    """
    Attempts to toggle the lock of the specified component by directly dispatching a click event
    on its lock toggle element.
    
    :param page: Playwright Page object.
    :param component_name: The name of the component as shown in data-default-node-name attribute.
    """
    print(f"Locking component: {component_name} ...")
    
    result = page.evaluate(f"""
    () => {{
        const node = Array.from(document.querySelectorAll("div.node"))
                       .find(el => el.getAttribute("data-default-node-name") === "{component_name}");
        if (!node) {{
            console.warn("Component '{component_name}' not found.");
            return false;
        }}
        const lockToggle = node.querySelector("div.react-toggle.lock");
        if (!lockToggle) {{
            console.warn("Lock toggle for '{component_name}' not found.");
            return false;
        }}
        lockToggle.click();
        return true;
    }}
    """)
    
    if result:
        print(f"Lock toggled for {component_name}.")
    else:
        print(f"Failed to toggle lock for {component_name}.")

def simulate_zoom_ctrl_wheel(page: Page, zoom_in: bool = True, delta: int = 120) -> None:
    """
    Simulates zooming in or out using Ctrl + mouse wheel,
    with mouse movement over the canvas first.
    
    :param page: The Playwright Page object.
    :param zoom_in: True to zoom in, False to zoom out.
    :param delta: Scroll delta in pixels; use negative for zoom in, positive for zoom out.
    """
    print("Moving mouse to the canvas area...")
    page.hover(".xircuits-canvas")
    
    if zoom_in:
        print("Simulating zoom in using Ctrl + mouse wheel (scroll up).")
        page.keyboard.down("Control")
        page.mouse.wheel(0, -delta)  
        page.keyboard.up("Control")
    else:
        print("Simulating zoom out using Ctrl + mouse wheel (scroll down).")
        page.keyboard.down("Control")
        page.mouse.wheel(0, delta)   
        page.keyboard.up("Control")

def compile_and_run_workflow(page):
    # Save
    page.wait_for_timeout(500)
    page.locator('jp-button[title="Save (Ctrl+S)"] >>> button').click()
    page.wait_for_timeout(1000)

    # Compile
    page.wait_for_timeout(500)
    page.locator('jp-button[title="Compile Xircuits"] >>> button').click()
    page.wait_for_timeout(500)
    page.locator('jp-button[title="Compile Xircuits"] >>> button').click()
    page.wait_for_timeout(2000)

    # Compile and Run
    page.wait_for_timeout(500)
    page.locator('jp-button[title="Compile and Run Xircuits"] >>> button').click()
    page.wait_for_timeout(1000)

def connect_nodes_simple(page: Page, connection: dict) -> None:
    """
    Connects a port from the source node to a port on the target node
    using mouse events and hover simulation, similar to TypeScript behavior.

    :param page: The Playwright page object.
    :param connection: A dictionary containing the following keys:
        - sourceNode: Name of the source node
        - sourcePort: Name of the source port
        - targetNode: Name of the target node
        - targetPort: Name of the target port
    """
    print(f"Connecting {connection['sourceNode']} ({connection['sourcePort']}) --> {connection['targetNode']} ({connection['targetPort']})")

    # Hover over the source port
    source_locator = page.locator(f'div[data-default-node-name="{connection["sourceNode"]}"] >> div[data-name="{connection["sourcePort"]}"]')
    source_locator.hover()
    page.wait_for_timeout(100)

    # Press mouse button to start dragging
    page.mouse.down()

    # Hover over the target port
    target_locator = page.locator(f'div[data-default-node-name="{connection["targetNode"]}"] >> div[data-name="{connection["targetPort"]}"]')
    target_locator.hover()
    page.wait_for_timeout(100)

    # Release mouse button to drop the connection
    page.mouse.up()

    print("Connection simulated.")

def delete_component_simple(page: Page, node_name: str) -> None:
    """
    Deletes a visible component from the canvas by simulating click and pressing Delete key.

    :param page: Playwright page object.
    :param node_name: Node name as shown in data-default-node-name.
    """
    print(f"Deleting component '{node_name}' via click and Delete key...")

    # Scroll and click the node
    node = page.locator(f"div.node[data-default-node-name='{node_name}']")
    node.scroll_into_view_if_needed()
    node.click()

    # Press Delete
    page.keyboard.press("Delete")
    print(f"Component '{node_name}' deletion triggered.")

def define_argument_parameter(page: Page, value: str):
    """
    Waits for the parameter input dialog, fills it with the given value, and submits.

    :param page: Playwright page object.
    :param value: The name to define for the argument parameter.
    """
    print(f"Defining argument parameter: {value}")
    page.wait_for_selector("input[name='Please define parameter']")
    page.fill("input[name='Please define parameter']", value)
    page.click("div.jp-Dialog-buttonLabel:has-text('Submit')")
    page.click(".xircuits-canvas")
    page.wait_for_timeout(500)

def assert_all_texts_exist(page: Page, words: list[str]):
    missing = [word for word in words if page.locator(f"text={word}").count() == 0]
    assert not missing, f"The following texts were not found: {missing}"

def delete_component_directly(page: Page, node_name: str) -> None:
    """
    Deletes a component from the canvas directly using JavaScript without needing it to be visible.

    :param page: The Playwright page object.
    :param node_name: The node name as in data-default-node-name.
    """
    print(f"Attempting to delete component: {node_name} programmatically (without visibility)...")

    result = page.evaluate(f"""
    () => {{
        const target = document.querySelector("div.node[data-default-node-name='{node_name}']");
        if (!target) {{
            console.warn("Component not found in DOM.");
            return false;
        }}

        function getCenter(el) {{
            const rect = el.getBoundingClientRect();
            return {{
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            }};
        }}

        const center = getCenter(target);

        // Simulate mouse events to select the element, then delete it via keyboard event
        const mouseDown = new MouseEvent('mousedown', {{
            bubbles: true,
            cancelable: true,
            clientX: center.x,
            clientY: center.y
        }});
        const mouseUp = new MouseEvent('mouseup', {{
            bubbles: true,
            cancelable: true,
            clientX: center.x,
            clientY: center.y
        }});
        target.dispatchEvent(mouseDown);
        target.dispatchEvent(mouseUp);

        // Dispatch Delete key event on document
        const deleteEvent = new KeyboardEvent('keydown', {{
            key: 'Delete',
            code: 'Delete',
            keyCode: 46,
            which: 46,
            bubbles: true,
            cancelable: true
        }});
        document.dispatchEvent(deleteEvent);

        return true;
    }}
    """)

    if result:
        print(f"Component '{node_name}' deleted (if supported by canvas logic).")
    else:
        print(f"Failed to delete component '{node_name}'. Check DOM or logic.")

def simulate_drag_component_to_position(page: Page, library_name: str, component_name: str, drop_x: int, drop_y: int) -> None:
    """
    Opens the specified library and drags the specified component to a given position on the canvas.

    :param page: The Playwright page object.
    :param library_name: Name of the library containing the component (e.g. "GRADIO" or "GENERAL").
    :param component_name: Name of the component to drag (e.g. "GradioInterface" or "Literal String").
    :param drop_x: X coordinate on the canvas to drop the component.
    :param drop_y: Y coordinate on the canvas to drop the component.
    """
    print(f"Opening library: {library_name}")
    page.wait_for_selector("[data-id='table-of-contents']")
    page.click("[data-id='table-of-contents']")
    page.wait_for_selector("[data-id='xircuits-component-sidebar']")
    page.click("[data-id='xircuits-component-sidebar']")
    page.get_by_text(library_name, exact=True).click()
    page.wait_for_timeout(1000)

    print(f"Dragging component: {component_name} to ({drop_x}, {drop_y})")

    page.evaluate(f"""
    () => {{
      const source = [...document.querySelectorAll("[draggable='true']")]
        .find(el => el.innerText.includes("{component_name}"));
      const target = document.querySelector(".xircuits-canvas");

      if (!source || !target) {{
          console.warn("Component or canvas not found.");
          return;
      }}

      HTMLElement.prototype.dragTo = function(targetElement, x, y) {{
          const dataTransfer = new DataTransfer();
          const rect = targetElement.getBoundingClientRect();

          const clientX = rect.left + x;
          const clientY = rect.top + y;

          this.dispatchEvent(new DragEvent('dragstart', {{ dataTransfer, bubbles: true }}));
          targetElement.dispatchEvent(new DragEvent('dragenter', {{ dataTransfer, bubbles: true, clientX, clientY }}));
          targetElement.dispatchEvent(new DragEvent('dragover', {{ dataTransfer, bubbles: true, clientX, clientY }}));
          targetElement.dispatchEvent(new DragEvent('drop', {{ dataTransfer, bubbles: true, clientX, clientY }}));
          this.dispatchEvent(new DragEvent('dragend', {{ dataTransfer, bubbles: true }}));
      }};

      source.dragTo(target, {drop_x}, {drop_y});
      target.click();
    }}
    """)


def align_start(page: Page, first_component_name: str, offset: int = 150):
    """
    Moves the Start node to the left of the first component with a customizable offset.

    :param page: The Playwright page object.
    :param first_component_name: The name of the first component dropped.
    :param offset: Distance in pixels to shift Start from the first component.
    """
    first_box = page.locator(f"div[data-default-node-name='{first_component_name}']").bounding_box()
    if first_box is None:
        raise Exception(f"Component '{first_component_name}' not found.")

    start_box = page.locator("div[data-default-node-name='Start']").bounding_box()
    if start_box is None:
        raise Exception("Start node not found.")

    new_x = first_box["x"] - offset
    new_y = first_box["y"]

    page.mouse.move(start_box["x"] + 5, start_box["y"] + 5)
    page.mouse.down()
    page.mouse.move(new_x, new_y)
    page.mouse.up()

    print(f"Moved Start to ({new_x}, {new_y}) with offset {offset}px")

def align_finish(page: Page, last_component_name: str, offset: int = 150):
    """
    Moves the Finish node to the right of the last component with a customizable offset.

    :param page: The Playwright page object.
    :param last_component_name: The name of the last component dropped.
    :param offset: Distance in pixels to shift Finish from the last component.
    """
    last_box = page.locator(f"div[data-default-node-name='{last_component_name}']").bounding_box()
    if last_box is None:
        raise Exception(f"Component '{last_component_name}' not found.")

    finish_box = page.locator("div[data-default-node-name='Finish']").bounding_box()
    if finish_box is None:
        raise Exception("Finish node not found.")

    new_x = last_box["x"] + offset
    new_y = last_box["y"]

    page.mouse.move(finish_box["x"] + 5, finish_box["y"] + 5)
    page.mouse.down()
    page.mouse.move(new_x, new_y)
    page.mouse.up()

    print(f"Moved Finish to ({new_x}, {new_y}) with offset {offset}px")

def clean_xircuits_directory(page, subfolder_name: str):
    """Deletes all files in the specified subfolder inside xai_tests."""
    print(f"Cleaning directory: {subfolder_name}")
    page.goto("http://localhost:8888")
    page.wait_for_selector('#jupyterlab-splash', state='detached')

    page.get_by_text("xai_components", exact=True).dblclick()
    page.wait_for_selector("text=xai_tests", timeout=10000)
    page.get_by_text("xai_tests", exact=True).dblclick()
    page.get_by_text(subfolder_name, exact=True).dblclick()
    page.wait_for_timeout(1000)

    while True:
        try:
            file = page.locator(".jp-DirListing-item[data-isdir='false']").first
            file.wait_for(timeout=2000)
            file.click(button="right")
            page.get_by_text("Move to Trash").click()
            page.get_by_role("button", name="Move to Trash").click()
            page.wait_for_timeout(500)
        except Exception:
            print("No more files to delete.")
            break

    print("All files moved to trash.")

def copy_xircuits_file(page, source_file: str, target_folder: str):
    print(f"Copying {source_file} to {target_folder}")
    page.wait_for_timeout(1000)
    
    page.goto("http://localhost:8888")
    page.wait_for_selector('#jupyterlab-splash', state='detached')
    page.wait_for_timeout(1000)
    page.get_by_text("xai_components", exact=True).dblclick()
    locator = page.locator("text=xai_tests")
    locator.wait_for(state="attached", timeout=10000)
    locator.scroll_into_view_if_needed()
    locator.dblclick()

    page.get_by_text(source_file, exact=True).click()
    page.keyboard.press("Control+C")

    page.get_by_text(target_folder, exact=True).dblclick()
    page.locator(".jp-DirListing-content").click(button="right")
    page.get_by_text("Ctrl+V").click()
    page.wait_for_timeout(1000)
    print("Copy completed.")

literal_type_mapping = {
    "Literal String":  { "title": "Update string",  "type": "textarea" },
    "Literal Integer": { "title": "Update int",     "type": "input" },
    "Literal Float":   { "title": "Update float",   "type": "input" },
    "Literal List":    { "title": "Update list",    "type": "textarea" },
    "Literal Tuple":   { "title": "Update tuple",   "type": "textarea" },
    "Literal Dict":    { "title": "Update dict",    "type": "textarea" },
    "Literal Secret":  { "title": "Update secret",  "type": "input" },
    "Literal Boolean": { "title": "Update boolean" },  # handled differently
}

def update_literal_value(page, node_type: str, value):
    print(f"Updating: {node_type} = {value}")
    node = page.locator(f"div[data-default-node-name='{node_type}']")
    node.scroll_into_view_if_needed()
    node.hover()
    page.wait_for_timeout(500)

    node.dblclick()
    page.wait_for_timeout(500)
    
    if node_type == "Literal Boolean":
        switch = page.locator("input[role='switch']")
        current = switch.get_attribute("aria-checked") == "true"
        if str(current).lower() != str(value).lower():
            page.locator(".react-switch-handle").click()
        page.get_by_role("button", name="Submit").click()
        return

    config = literal_type_mapping.get(node_type)
    if not config:
        raise Exception(f"Unknown node type: {node_type}")

    selector = f"{config['type']}[name='{config['title']}']"
    editor = page.locator(selector)
    editor.wait_for(timeout=2000)
    editor.fill(str(value))
    page.get_by_role("button", name="Submit").click()
    page.wait_for_timeout(500)

def update_literal_chat(page, messages):
    print("Updating Literal Chat...")
    page.locator("div[data-default-node-name='Literal Chat']").dblclick()
    page.wait_for_timeout(500)

    while True:
        remove_button = page.locator("button").filter(has_text="Remove").first
        if not remove_button.is_visible():
            break
        remove_button.click()
        page.wait_for_timeout(200)
    
    page.get_by_role("button", name="Add Message").click()

    for i, msg in enumerate(messages):
        role_selector = f'select[name=\"role-{i}\"]'
        content_selector = f'textarea[name=\"content-{i}\"]'

        page.locator(role_selector).select_option(msg["role"])
        page.locator(content_selector).fill(msg["content"])

        if i < len(messages) - 1:
            page.get_by_role("button", name="Add Message").click()

    page.get_by_role("button", name="Submit").click()
    page.wait_for_timeout(500)
