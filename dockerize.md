# Dockerization Instructions — Minecraft World Archiver

## Purpose

This document outlines how to properly containerize the Minecraft World Archiver application built with **SvelteKit 2 (Svelte 5 + runes)**.

The goal is to provide a reproducible, isolated environment for local development, testing, and production deployment using **Docker**. The Dockerized application should behave identically to the non-containerized version and follow best practices for security, performance, and maintainability.

---

## Goals & Requirements

### Base Functionality

- Dockerize the full application stack using a single `Dockerfile` (multi-stage builds if needed).
- Support both development and production use cases (e.g., use Vite dev server in dev, adapter output in prod).
- Provide a `docker-compose.yml` if multiple services are needed (e.g., backups, cron jobs, volumes).
- Mount or copy the **Minecraft worlds directory** into the container at runtime (as a volume or bind mount).

---

## Technical Requirements

### Build & Runtime

- Use a **minimal Node base image** (e.g., `node:20-alpine`).
- Ensure support for:
  - File system access for reading, zipping, and serving Minecraft worlds.
  - SvelteKit's adapter for static or Node output (depending on target).
- Environment-specific configs using `.env` and `.env.production`.

### Volumes & Persistence

- The Minecraft worlds should reside **outside the container**, mounted into it via volume or bind mount.
- World zips and generated data should persist across container restarts.

### Security

- Avoid running the container as root inside the image.
- Use non-root user in final stage of Dockerfile.
- Expose only required ports and avoid unnecessary packages in the image.

### Developer Experience

- Hot reloading / live rebuilds enabled in development container.
- Fast, cache-efficient builds.
- Logging output available on the console (no hidden background processes).

---

## Deliverables

1. A `Dockerfile` for building and running the app.
2. Optional `docker-compose.yml` if needed (e.g., for separating backend logic or backups).
3. Clear instructions in a `README.md` or section of this file for:
   - Building the image
   - Running in development mode
   - Running in production mode
   - Mounting the Minecraft worlds directory
   - Debugging or accessing logs

---

## Optional Enhancements

- Automatically rebuild/restart container on file change in dev (e.g., using `nodemon`, `vite`, or `watchexec`).
- Add an Nginx container for production proxying (TLS termination, compression, etc.).
- Health checks and restart policies for container resilience.
- Use Docker secrets or `.env` for sensitive configuration (e.g., cloud storage tokens).

---

## Summary

Dockerize the SvelteKit 2 Minecraft Archiver application using best practices:

- Use a minimal, secure base image
- Separate build and runtime concerns via multi-stage Dockerfile
- Support both development and production workflows
- Ensure persistent access to Minecraft world data via volumes
- Provide clear documentation for usage

---

**Please start by designing a Docker strategy and creating a working `Dockerfile`. Follow up with any supporting files (`docker-compose.yml`, scripts, etc.) and test the setup end-to-end.**
