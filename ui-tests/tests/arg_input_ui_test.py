"""
Test that running a workflow with an argument component spawns the input field.

This test ensures that when a 'Get Argument String Name' component is added to the canvas,
compiled, and run, the 'Execute Workflow' dialog appears with the input box for the argument.
"""
from playwright.sync_api import sync_playwright
from xircuits_test_utils import connect_nodes, compile_and_run_workflow ,simulate_drag_component_from_library, define_argument_parameter, assert_all_texts_exist

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:8888")
    page.wait_for_selector('#jupyterlab-splash', state='detached')
    page.get_by_text('New Xircuits File', exact=True).click()

    simulate_drag_component_from_library(page, "UTILS", "PrettyPrint")
    connect_nodes(page, {
            "sourceNode": "Start",
            "sourcePort": "out-0",
            "targetNode": "PrettyPrint",
            "targetPort": "in-0"
        })
    
    connect_nodes(page, {
            "sourceNode": "PrettyPrint",
            "sourcePort": "out-0",
            "targetNode": "Finish",
            "targetPort": "in-0"
        })
        
    simulate_drag_component_from_library(page, "GENERAL", "Get Argument String Name")
    define_argument_parameter(page, "String")

    simulate_drag_component_from_library(page, "GENERAL", "Get Argument Integer Name")
    define_argument_parameter(page, "Integer")

    simulate_drag_component_from_library(page, "GENERAL", "Get Argument Float Name")
    define_argument_parameter(page, "Float")

    simulate_drag_component_from_library(page, "GENERAL", "Get Argument Boolean Name")
    define_argument_parameter(page, "Boolean")

    simulate_drag_component_from_library(page, "GENERAL", "Get Argument Secret Name")
    define_argument_parameter(page, "Secret")

    simulate_drag_component_from_library(page, "GENERAL", "Get Argument Any Name")
    define_argument_parameter(page, "Any")

    connect_nodes(page, {
    "sourceNode": "Argument (string): String",
    "sourcePort": "parameter-out-0",
    "targetNode": "PrettyPrint",
    "targetPort": "parameter-any-msg"
        })
    compile_and_run_workflow(page)
    page.wait_for_timeout(2000)

    words = ["Execute Workflow", "String", "Float", "Boolean", "Secret", "Any"]
    assert_all_texts_exist(page, words)

    print("Execute Workflow window appeared with argument input field.")
