# Project Instructions — Minecraft World Archiver Rebuild

## Overview

This project involves redesigning and rebuilding an existing Minecraft world archiving system currently implemented using PHP and a simple Bash script.

The current system:
- Automatically zips Minecraft worlds stored in a specific directory.
- Provides a minimal web interface to list, download, and archive these worlds.

The goal is to completely replace this with a modern web application built using **SvelteKit 2 (Svelte 5 with runes)**.

---

## Goals & Requirements

### Core Functionality
- **List all Minecraft worlds** located in a configured directory.
- **Display metadata** for each world, such as:
  - World name
  - Size on disk
  - Last modified date
- **Allow users to download a zipped archive** of any individual Minecraft world.
- **Allow users to create and download a zip archive containing all worlds at once.**

### Technology Stack
- Use **SvelteKit 2** with **Svelte 5 and runes**.
- Replace all PHP and Bash scripts with SvelteKit endpoints and native Node.js APIs.
- Use **shadcn-svelte** as the component/UI library unless a superior alternative is clearly justified.
- Use **TypeScript** where applicable for type safety.

### User Interface & Experience
- The UI should be:
  - Visually appealing with a slightly quirky, friendly tone.
  - Professional, clean, and easy to navigate.
  - Fully **accessible** (ARIA roles, keyboard navigation, screen reader support, color contrast).
  - Responsive across devices (mobile, tablet, desktop).
- Apply best practices in web design and usability.

### Security & Best Practices
- Properly sanitize and validate all user inputs to avoid directory traversal or injection attacks.
- Secure file handling: only serve files from the intended Minecraft worlds directory.
- Follow SvelteKit best practices for routing, endpoints, and security.
- Error handling should be user-friendly and informative.
    
### Additional Features (Optional / Nice to Have)
- Show a preview or thumbnail of each world if available (e.g., Minecraft map images).
- Allow custom archive naming.
- Provide a simple activity log or history of archive downloads.
- Integrate with cloud storage providers for backup (Dropbox, Google Drive, etc.).

---

## Deliverables & Workflow

### Step 1: Planning
- Create a detailed **plan.md** that breaks down the project into actionable steps.
- Each step should cover backend, frontend, security, and UX components.
- Include expected deliverables for each step.

### Step 2: Implementation
- After the plan is approved, implement the features step-by-step.
- Provide regular updates or commit milestones.
- Maintain clean, documented, and tested code.

### Step 3: Testing & Deployment
- Ensure full functional and accessibility testing.
- Provide instructions for local development and deployment.

---

## Context Notes

- The current PHP + Bash code is located in the adjacent `web` directory.
- Treat the existing implementation as a feature reference only — no need to preserve code structure.
- The new implementation should follow modern SvelteKit 2 patterns and conventions.
- Prioritize maintainability, scalability, and user experience.

---

## Communication

- If anything is unclear or requires prioritization, please ask before proceeding.
- Ensure that the solution balances performance, security, and usability.

---

## Summary

Rebuild the Minecraft world archiving system with:

- SvelteKit 2 + Svelte 5 + runes (https://svelte.dev/)
- shadcn-svelte UI library (https://www.shadcn-svelte.com/)
- Full parity with existing PHP/Bash functionality
- Modern web standards, accessibility, and security
- Slightly quirky but professional, intuitive UI design

---

**Please start by creating a detailed `plan.md` as described above. Once reviewed and approved, proceed with implementation.**

