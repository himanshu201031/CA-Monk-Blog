# Playwright E2E Testing Setup Plan

## Goal: Add end-to-end testing using Playwright for the CA Monk blog app

### Steps:
- [x] Install Playwright (`@playwright/test`) and Chromium browser
- [x] Create `playwright.config.js` with webServer config for Vite
- [x] Create `e2e/app.spec.js` - blog list & detail navigation tests
- [x] Create `e2e/createBlog.spec.js` - create a post via modal
- [x] Create `e2e/editBlog.spec.js` - edit an existing post
- [x] Create `e2e/deleteBlog.spec.js` - delete a post
- [x] Add npm scripts (`test:e2e`, `test:e2e:ui`, `test:e2e:headed`)
- [x] Update `.gitignore` for Playwright artifacts
- [ ] Run the E2E test suite and verify tests pass

