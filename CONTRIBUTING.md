# Contributing to Xircuits

Welcome to Xircuits!

The following is a set of guidelines for contributing to Xircuits on GitHub. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Table Of Contents

[What should I know before I get started?](#what-should-i-know-before-i-get-started)
  * [Xircuits Structure](#xircuits-structure)
  * [Design Decisions](#design-decisions)

[How Can I Contribute?](#how-can-i-contribute)
  * [New Features](#new-features)
  * [Feature Requests](#feature-requests)
  * [Reporting Bugs](#reporting-bugs)
  
[Chat with the Devs!](#chat-with-the-devs)


## What should I know before I get started?

### Xircuits Structure

Xircuits is a Jupyterlab-based extension with React Diagram as its core canvas. 

Here's a list of the main feature categories:

* ### Xircuits Core
   
  [Jupyterlab](https://github.com/jupyterlab/jupyterlab) related features. Includes but not limited to:
  * Document
  * Toolbar
  * Server
  * Kernel Output
  * Logger
  * Component Tray Extension
  * Right Click Menu (Context)

* ### Xircuits Canvas 

  [React Diagram](https://github.com/projectstorm/react-diagrams) related changes. Includes:
  * Custom Nodes
  * Custom Ports & Logic
  * Custom Events & Actions
 
* ### Xircuits Component Library
  Python-based components that can implement any python-based libraries out there. Some that are included in the base Xircuits installation are Tensorflow, Pytorch, and Pyspark. 

* ### Testing Automation
  [Playwright](https://github.com/microsoft/playwright)-based UI tests. 

* ### Documentation 
  We have our docs [here](https://github.com/XpressAI/xircuits.io).

Some features may overlap with each other (such as codegen being an overlap between Core and Canvas), but this list should be a good overview of where you want to focus your contribution on.

## Design Decisions

When we make a significant decision in implementing features, we should document it in the [architecture decision records](https://github.com/XpressAI/xircuits/tree/master/adr). If you have a question around why we do things, check to see if it is documented there. 

## How Can I Contribute?

### New Features

Contributors are always welcome in any of the categories whether it's Core features or Xircuits libraries. Please use the template when submitting a pull request.

### Feature Requests

Xircuits is still very young in its age and we have a long list of features that we want to implement. Please check the project tab to see if we have that feature already in our road map, and if not then use the [feature request template](https://github.com/xircuits/.github/ISSUE_TEMPLATE/feature-request.md) to request that feature. 

### Reporting Bugs

Before creating bug reports, please check [this list](#before-submitting-a-bug-report) as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible. Fill out [the required template](https://github.com/xircuits/.github/ISSUE_TEMPLATE/bug-report.md), the information it asks for helps us resolve issues faster.

> **Note:** If you find a **Closed** issue that seems like it is the same thing that you're experiencing, open a new issue and include a link to the original issue in the body of your new one.

## Chat with the Devs!

We have our Dev Discord [here](https://discord.gg/vgEg2ZtxCw). Feel free to ping any of us with a dev tag if you need support or have any questions. 