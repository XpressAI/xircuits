# Test

The test will produce a video to help debugging and check what happened.

To execute integration tests, you have two options:

- use docker-compose (cons: needs to know and use docker) - this is a more reliable solution.
- run tests locally (cons: will interact with your JupyterLab user settings)

## Test on docker

1. Compile the extension:

```
jlpm install
jlpm run build:prod
```

2. Execute the docker stack in the example folder:

```
docker-compose -f ../end-to-end-tests/docker-compose.yml --env-file ./ui-tests/.env build --no-cache
docker-compose -f ../end-to-end-tests/docker-compose.yml --env-file ./ui-tests/.env run --rm e2e
docker-compose -f ../end-to-end-tests/docker-compose.yml --env-file ./ui-tests/.env down
```



## Test Xircuits locally

1. Ensure that you have Xircuits installed. If you're developing core features, ensure that you've installed your changes.

```
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Enable the server extension
jupyter server extension enable xircuits
```

Otherwise a simple 
```
pip install xircuits
```
will suffice. 

2. Install the Test Component Library

```
xircuits install tests
```

3. Start JupyterLab _with the extension installed_ without any token or password

```
jupyter lab --ServerApp.token= --ServerApp.password= --LabApp.default_url=/lab\?reset
```

4. Execute in another console the [Playwright](https://playwright.dev/docs/intro) tests:

```
cd ui-tests
jlpm install
npx playwright install
npx playwright test
```


# Create tests

To create tests, the easiest way is to use the code generator tool of playwright:

1. Compile the extension:

```
jlpm install
jlpm run build:prod
```

2. Start JupyterLab _with the extension installed_ without any token or password:

**Using docker**

```
docker-compose -f ../end-to-end-tests/docker-compose.yml --env-file ./ui-tests/.env run --rm -p 8888:8888 lab
```

**Using local installation**

```
jupyter lab --ServerApp.token= --ServerApp.password=
```

3. Launch the code generator tool:

```
cd ui-tests
jlpm install
npx playwright install
npx playwright codegen localhost:8888
```

# Debug tests

To debug tests, a good way is to use the inspector tool of playwright:

1. Compile the extension:

```
jlpm install
jlpm run build:prod
```

2. Start JupyterLab _with the extension installed_ without any token or password:

**Using docker**

```
docker-compose -f ../end-to-end-tests/docker-compose.yml --env-file ./ui-tests/.env run --rm -p 8888:8888 lab
```

**Using local installation**

```
jupyter lab --ServerApp.token= --ServerApp.password= --LabApp.default_url=/lab\?reset
```

3. Launch the debug tool:

```
cd ui-tests
jlpm install
npx playwright install
PWDEBUG=1 npx playwright test
```
Alternatively, if you would like to debug in the browser console:
```
PWDEBUG=console npx playwright test testname.spec.ts
```

## Run Python-based Playwright UI Tests

This section describes how to run the new **Python-based UI tests** located in the `ui-tests/` folder using [Playwright](https://playwright.dev/python).

These tests simulate user interactions with Xircuits inside JupyterLab and cover various UI behaviors such as argument input, remote run, port spawning, and node protection.

---

### Prerequisites

Ensure you have the following:

- Python 3.11 or later (recommended)
- `pip` and `virtualenv`
- Xircuits

Install Playwright for Python:

```bash
pip install playwright
playwright install
```

---

### Running the tests

1. Launch JupyterLab in one terminal:

```bash
jupyter lab --ServerApp.token= --ServerApp.password= --LabApp.default_url=/lab\?reset
```

2. In a separate terminal, run one of the test scripts:

```bash
cd ui-tests
python arg_input_ui_test.py
python remote_run_arguments_test.py
python autospawn_and_despawn_ports_test.py
python protected-nodes-and-lock-test.py
```

> Tip: you can pause tests at the end with `input("any")` to let you inspect the result before closing the browser.

---

### Tests Overview

- **`arg_input_ui_test.py`**  
  Verifies that argument input prompts appear correctly.

- **`remote_run_arguments_test.py`**  
  Tests remote run with string, float, and boolean arguments.

- **`autospawn_and_despawn_ports_test.py`**  
  Checks dynamic port spawning and removal when components are connected/disconnected.

- **`protected-nodes-and-lock-test.py`**  
  Ensures that Start/Finish nodes can't be deleted and locked components remain protected.

For more details about the helper functions, refer to `ui-tests/xircuits_test_utils.py`.