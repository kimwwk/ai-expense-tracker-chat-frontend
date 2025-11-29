# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

An AI-powered expense tracking application for personal finance management. This root folder contains multiple git repositories organized as a project bundle.

## Repository Structure

- **docs/**: Project documentation and command history
- **ai-expense-tracker-frontend/**: Next.js 16 frontend application (separate git repo)
- **ai-expense-tracker-service/**: Lightweight backend service (separate git repo)

**Note**: Each subfolder maintains its own git repository. Changes should be committed within the respective project directories.

## Development Philosophy

### Core Beliefs

- **Incremental progress over big bangs** - Small changes that compile and pass tests
- **Learning from existing code** - Study and plan before implementing
- **Pragmatic over dogmatic** - Adapt to project reality
- **Clear intent over clever code** - Be boring and obvious

### Simplicity Means

- Single responsibility per function/class/component
- Avoid premature abstractions
- No clever tricks - choose the boring solution
- If you need to explain it, it's too complex

## Best Practices

Follow these principles when developing:

- **Single Responsibility**: Each component should have one clear purpose
  - Decouple concepts to maintain clean separation of concerns
  - Avoid putting everything into a single function or file

- **Commit Early, Commit Often**: Make small, logical commits after completing discrete tasks
  - Commit when a feature works, not when everything is done
  - Write clear commit messages describing what changed and why
  - Don't wait until the end - commit working code incrementally

- **Test as You Go**: Verify each component works before moving to the next
  - Run quick tests after implementing each feature (health checks, unit tests, integration tests)
  - Catch and fix issues immediately rather than accumulating technical debt
  - Any test is better than no test - even a simple smoke test provides confidence

## Agentic Solution Techniques

This project builds agentic solutions, so these techniques are critical for success.

### Agent Design Principles

To help agents work efficiently and effectively, design agent prompts to be **goal-oriented** rather than procedural. Agents should have autonomy and act as decision engines, not follow deterministic workflows.

### What to Include in Agent Prompts

- **Goals**: Define clear long-term and/or short-term objectives
- **Role**: Establish the agent's perspective and responsibilities
- **Task Instructions**: Provide the task with specific instructions that give strong hints on how to complete it
- **Project Context**: Share relevant background information
- **Soft Guidance**: Offer best practices and principles rather than rigid rules

### What to Avoid in Agent Prompts

- **Step-by-step procedures**: Rigid steps are not always necessary or accurate. Let agents determine their approach based on goals and context.

## Technology Preferences

### Package Management

- **Frontend**: Always use `pnpm` for Node.js/JavaScript projects
- **Backend**: Always use `uv` over `pip` to manage Python projects
