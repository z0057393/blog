---
sidebar_label: Get Started
sidebar_position: 1
---

# Get Started

---

## Install

```sh
npm install --save-dev husky
```

## Husky Init

The **init** command simplifies setting up husky in a project. It creates a **pre-commit** script in **.husky/** and updates the prepare script in **package.json**. Modifications can be made later to suit your workflow.

```sh
npx husky install
```

## Pre-commit hook

```sh

touch .husky/pre-commit
echo "npm run test" > .husky/pre-commit

```

## Try It

```sh
git commit -m "Keep calm and commit"
```
