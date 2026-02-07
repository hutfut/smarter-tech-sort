# Smarter Technology — Package Sorting Challenge

A TypeScript implementation of the robotic arm package dispatcher for Smarter Technology's automation factory.

## Problem

Given a package's **width**, **height**, **length** (cm) and **mass** (kg), classify it into one of three dispatch stacks:

| Stack        | Condition                          |
| ------------ | ---------------------------------- |
| **STANDARD** | Neither bulky nor heavy            |
| **SPECIAL**  | Bulky **or** heavy (but not both)  |
| **REJECTED** | Both bulky **and** heavy           |

**Bulky**: volume >= 1,000,000 cm³ *or* any single dimension >= 150 cm.
**Heavy**: mass >= 20 kg.

## Quick Start

```bash
# Install dependencies
npm install

# Run the test suite
npm test

# Run tests in watch mode during development
npm run test:watch
```

## Project Structure

```
src/sort.ts          Core sort() function with input validation
tests/sort.test.ts   Comprehensive test suite (Vitest)
```

## CI

Tests run on every push and pull request to `main`/`master` via GitHub Actions (see [.github/workflows/ci.yml](.github/workflows/ci.yml)).
