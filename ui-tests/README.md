# UI Integration Tests – Playwright (Python)

These scripts exercise key user journeys inside **Xircuits** running in JupyterLab. They drive the browser with Playwright Python and verify that nodes, ports and dialogs behave as expected.

---

## 1  Prerequisites

1. Python 3.9+.
2. Xircuits.    
3. Playwright
```bash
# 1. Install Playwright
pip install playwright 
playwright install
```

The tests talk to a live JupyterLab on **[http://localhost:8888](http://localhost:8888)** with no token or password.

---

## 2  Running the tests

```bash
# 1. Start JupyterLab (terminal 1)
jupyter lab \
  --ServerApp.token= \
  --ServerApp.password= \
  --LabApp.default_url=/lab?reset

# 2. Install the test component library (first run only)
xircuits install tests

# 3. Run a test script (terminal 2)
cd ui-tests/tests
python connecting-nodes-test.py        # pick any script listed below
```

---

## 3  Test scripts

| Script                               | What it covers                                                                                                                                                                             |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **connecting-nodes-test.py**         | Connects **9 literal nodes** (String, Integer, Float, Boolean, List, Tuple, Dict, Secret, Chat) to **AllLiteralTypes**, runs the workflow, and checks that every inbound value is printed. |
| **connecting-args-test.py**          | Connects **Argument** nodes (string, int, float, boolean, secret) to **AllLiteralTypes** and verifies the output panel shows each value.                                                   |
| **editing-literal-nodes-test.py**    | Opens each **Literal** node dialog, updates the value, and confirms both the canvas label and the workflow output reflect the new value.                                                   |
| **parameter-names-spawn.py**         | Links a string argument to **DynaportTester** and asserts a new dynamic port (`*-inputs-1`) is spawned.                                                                                    |
| **parameter-names-autoshift.py**     | Adds a second argument confirms **DynaportTester** now shows the second numbered port.                                                                                      |
| **parameter-names-despawn.py**       | Deletes the upstream node and checks that the corresponding dynamic port disappears from **DynaportTester**.                                                                               |
| **protected-nodes-and-lock-test.py** | Verifies that **Start** and **Finish** cannot be deleted and that a manually locked node is also protected.                                                                                |
| **remote\_run\_arguments\_test.py**  | Drives the **Remote Run** dialog, supplies string / float / boolean arguments, and checks that the generated CLI flags include all three values.                                           |

All scripts share functions in **`xircuits_test_utils.py`** (drag‑and‑drop, connections, zoom, etc.).

---

## 4  Debugging tips

* **Headless** mode is on by default. Pass `headless=False` when launching the browser to watch the actions.
* Use `slow_mo=500` ms (or any value) to slow down each step and follow the flow.
