# Project Instructions — Minecraft World Archiver Rebuild

## Overview

This project involves redesigning and rebuilding an existing Minecraft world archiving system currently implemented using PHP and a simple Bash script.

The current system:
- Automatically zips Minecraft worlds stored in a specific directory using a Bash script.
- Provides a minimal web interface to list, download, and archive these worlds.

The goal is to completely replace the web interface with a modern web application built using **SvelteKit 2 (Svelte 5 with runes)**.

> **Note:** The **Bash script will remain in use** on the Minecraft host for managing archive generation. It may be updated to align with the new architecture or naming standards, but will **not be replaced** by Node.js logic.

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
- Replace all PHP-based logic with SvelteKit endpoints and native Node.js APIs.
- The Bash script used for world compression will **remain in place** but can be **modified** for compatibility.
- Use **shadcn-svelte** as the component/UI library unless a superior alternative is clearly justified.
- Use **TypeScript** where applicable for type safety.

### User Interface & Experience
- The UI should be:
  - Visually appealing with a slightly quirky, friendly tone.
  - Professional, clean, and easy to navigate.
  - Fully **accessible** (ARIA roles, keyboard navigation, screen reader support, color contrast).
  - Responsive across devices (mobile, tablet, desktop).
- Apply best practices in web design and usability.

### Modularity & Naming
- The entire application must be built with **modular architecture** in mind:
  - Isolate concerns by feature (e.g., file handling, UI, API logic, utilities).
  - Each component, endpoint, and utility should be independently testable and reusable.
- The naming conventions used for compressed archive files must **match** those defined in the existing `compress.sh` script.
  - The script itself is treated as **the source of truth** for naming conventions.
  - If necessary, the script may be updated to improve consistency or compatibility — but **it is not to be replaced** by Node-based logic. The copy in the root of the project is the one that may be updated. NOT the one in the web directory.

### Security & Best Practices
- Properly sanitize and validate all user inputs to avoid directory traversal or injection attacks.
- Secure file handling: only serve files from the intended Minecraft worlds directory.
- Follow SvelteKit best practices for routing, endpoints, and security.
- Error handling should be user-friendly and informative.
    
### Additional Features (Optional / Nice to Have)
- Show a preview or thumbnail of each world if available (e.g., Minecraft map images).
- Allow custom archive naming (if aligned with existing naming constraints).
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
- The Bash script (`compress.sh`) is **executed directly on the Minecraft host** and is **not replaced** in this project.
  - It may be updated as needed to ensure compatibility with the new application.
- Treat the PHP as a functional reference only — it will be replaced by a clean SvelteKit 2 implementation.
- The new implementation should follow modern SvelteKit patterns and conventions.
- Prioritize maintainability, modularity, and user experience.
- Cloud provider setup is **not required** — the project will be Dockerized (see `docker.md` for details).
- The project will need to keep in mind, that the worlds directory will be in the root of this project via the compress.sh script.


---

## Communication

- If anything is unclear or requires prioritization, please ask before proceeding.
- Ensure that the solution balances performance, security, and usability.

---

## Summary

Rebuild the Minecraft world archiving interface with:

- SvelteKit 2 + Svelte 5 + runes (https://svelte.dev/)
- shadcn-svelte UI library (https://www.shadcn-svelte.com/)
- Modular architecture with feature-based separation
- Naming convention compatibility with `compress.sh` (still in use)
- Docker-first deployment strategy (see `docker.md`)
- Full parity with existing PHP/Bash functionality
- Modern web standards, accessibility, and security
- Slightly quirky but professional, intuitive UI design

---

**Please start by creating a detailed `plan.md` as described above. Once reviewed and approved, proceed with implementation.**
