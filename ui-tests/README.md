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
``