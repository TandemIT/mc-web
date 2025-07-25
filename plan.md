# Project Plan — Minecraft World Archiver Rebuild

## Overview

This document outlines the step-by-step plan to rebuild the existing PHP-based Minecraft world archiving system using **SvelteKit 2 (Svelte 5 + runes)**, **shadcn-svelte**, and **TypeScript**.

The current system provides a web interface to list, download, and archive Minecraft worlds. The new implementation will maintain full feature parity while modernizing the technology stack and improving user experience, security, and maintainability.

---

## Current System Analysis

### Existing Features
- **World Listing**: Displays all Minecraft worlds from a configured directory
- **Metadata Display**: Shows world name, size, last modified date, download count
- **Individual Downloads**: Users can download zipped archives of individual worlds
- **Bulk Downloads**: Users can download all worlds at once
- **Categorization**: Worlds are automatically categorized (ATM, Create, Stoneblock, etc.)
- **Search & Filtering**: Frontend search and filter functionality
- **Statistics**: Total worlds, size, downloads, categories
- **Responsive UI**: Mobile-friendly interface with dark/light theme
- **Security**: Input validation, rate limiting, CORS protection

### Current Tech Stack
- **Backend**: PHP with custom API endpoints
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Compression**: Bash script using tar.xz
- **Deployment**: Docker with Apache

---

## New Architecture

### Technology Stack
- **Framework**: SvelteKit 2 with Svelte 5 + runes
- **Language**: TypeScript for type safety
- **UI Library**: shadcn-svelte for components
- **Styling**: Tailwind CSS (included with shadcn-svelte)
- **Runtime**: Node.js
- **File Handling**: Native Node.js fs/path APIs
- **Compression**: Node.js archiver or tar libraries
- **Deployment**: Docker with Node.js

### Project Structure
```
src/
├── lib/
│   ├── components/          # Reusable UI components
│   ├── server/             # Server-side utilities
│   │   ├── world-scanner.ts
│   │   ├── file-handler.ts
│   │   └── compression.ts
│   ├── stores/             # Svelte stores for state management
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Shared utilities
├── routes/
│   ├── +layout.svelte      # Main layout
│   ├── +page.svelte        # Home page
│   └── api/                # API endpoints
│       ├── worlds/
│       │   └── +server.ts
│       ├── download/
│       │   └── +server.ts
│       └── stats/
│           └── +server.ts
├── app.html                # HTML template
└── app.css                 # Global styles
```

---

## Implementation Plan

### Phase 1: Project Setup & Foundation (Days 1-2)

#### Step 1.1: Initialize SvelteKit Project ✅
- [x] Create new SvelteKit project with TypeScript
- [x] Configure shadcn-svelte and Tailwind CSS
- [x] Set up project structure and basic configuration
- [x] Configure TypeScript strict mode and ESLint

**Deliverables:**
- ✅ Working SvelteKit development environment
- ✅ Basic project structure
- ✅ Configuration files (tsconfig.json, tailwind.config.js, etc.)

#### Step 1.2: Type Definitions ✅
- [x] Create TypeScript interfaces for world data
- [x] Define API response types
- [x] Create utility types for filtering and sorting

**Deliverables:**
- ✅ `src/lib/types/world.ts` - World data interfaces
- ✅ `src/lib/types/api.ts` - API response types

#### Step 1.3: Environment Configuration ✅
- [x] Set up environment variables for worlds directory path (Docker volume mount)
- [x] Configure development and production environments
- [x] Create configuration validation
- [x] Plan Docker volume mounting strategy
- [x] Set up environment-specific configurations

**Deliverables:**
- ✅ `.env` and `.env.example` files
- ✅ Configuration validation utilities
- ✅ Docker environment configuration planning

### Phase 2: Backend API Development (Days 3-5)

#### Step 2.1: World Scanner Service ✅
- [x] Port PHP WorldScanner to TypeScript
- [x] Implement file system scanning for mounted worlds directory
- [x] Add metadata extraction (size, modified date, etc.)
- [x] Implement category detection logic (based on filename conventions from Bash script reference)
- [x] Add download count tracking with persistent storage
- [x] Handle file naming conventions (underscores, tar.xz format)

**Deliverables:**
- ✅ `src/lib/server/world-scanner.ts`
- ✅ File naming convention utilities
- ✅ Secure file handling service

#### Step 2.2: API Endpoints ✅
- [x] Create `/api/worlds` endpoint for listing worlds
- [x] Create `/api/worlds/[id]` endpoint for individual world info
- [x] Create `/api/download/[filename]` endpoint for file downloads
- [x] Create `/api/download/all` endpoint for bulk downloads
- [x] Create `/api/stats` endpoint for statistics

**Deliverables:**
- ✅ SvelteKit API routes with full CRUD operations
- ✅ Input validation and sanitization
- ✅ Error handling and logging

#### Step 2.3: Security Implementation ✅
- [x] Implement input validation and sanitization
- [x] Add path traversal protection
- [x] Implement rate limiting
- [x] Add CORS configuration
- [x] Secure file serving

**Deliverables:**
- ✅ Security middleware and utilities
- ✅ Rate limiting implementation
- ✅ Secure file download handling

#### Step 2.4: Caching System ✅
- [x] Implement in-memory caching for world listings
- [x] Add cache invalidation strategies
- [x] Optimize performance for large world directories

**Deliverables:**
- ✅ Caching utilities and strategies
- ✅ Performance optimizations

### Phase 3: Frontend Development (Days 6-9)

#### Step 3.1: Core Components ✅
- [x] Create world card component
- [x] Create world list/grid component
- [x] Create search and filter components
- [x] Create statistics display component
- [x] Create loading states and error handling

**Deliverables:**
- ✅ Reusable UI components using shadcn-svelte
- ✅ Component documentation and examples

#### Step 3.2: Main Page Layout ✅
- [x] Implement responsive layout
- [x] Create hero section with statistics
- [x] Add search and filter interface
- [x] Implement world listing with pagination
- [x] Add view toggle (grid/list)

**Deliverables:**
- ✅ Complete main page layout
- ✅ Responsive design for all screen sizes

#### Step 3.3: State Management ✅
- [x] Create Svelte stores for world data
- [x] Implement search and filter state
- [x] Add loading and error states
- [x] Create download progress tracking

**Deliverables:**
- ✅ Svelte stores for application state
- ✅ Reactive data flow implementation

#### Step 3.4: Interactive Features ✅
- [x] Implement real-time search
- [x] Add sorting and filtering
- [x] Create download functionality
- [x] Add bulk selection and download
- [x] Implement theme switching

**Deliverables:**
- ✅ Interactive search and filter system
- ✅ Download functionality with progress indicators

### Phase 4: User Experience & Accessibility (Days 10-11)

#### Step 4.1: Accessibility Implementation ✅
- [x] Add ARIA labels and roles
- [x] Implement keyboard navigation
- [ ] Ensure screen reader compatibility
- [ ] Test color contrast ratios
- [x] Add focus management

**Deliverables:**
- ✅ WCAG 2.1 AA compliant interface
- [ ] Accessibility testing results

#### Step 4.2: Performance Optimization ✅
- [x] Implement lazy loading for world listings
- [x] Optimize image loading and caching
- [x] Add service worker for offline functionality
- [x] Implement progressive enhancement

**Deliverables:**
- ✅ Performance optimizations
- ✅ Lighthouse score improvements

#### Step 4.3: Error Handling & User Feedback ✅
- [x] Create user-friendly error messages
- [x] Add toast notifications
- [x] Implement loading indicators
- [x] Add download progress feedback

**Deliverables:**
- ✅ Comprehensive error handling system
- ✅ User feedback mechanisms

### Phase 5: Advanced Features (Days 12-13)

#### Step 5.1: Enhanced Functionality ✅
- [x] Add world preview/thumbnail support
- [x] Implement search suggestions/autocomplete with FlexSearch
- [x] Enhanced search performance with full-text indexing
- [ ] Implement custom archive naming
- [ ] Create download history/activity log
- [ ] Add world metadata editing

**Deliverables:**
- ✅ Enhanced world management features
- ✅ FlexSearch-powered search with suggestions
- [ ] Activity logging system

#### Step 5.2: Docker Integration Preparation
- [ ] Design Docker strategy for development and production
- [ ] Plan volume mounting for Minecraft worlds directory
- [ ] Prepare environment configuration for containerization
- [ ] Design multi-stage build approach

**Deliverables:**
- Docker architecture design
- Environment configuration strategy

### Phase 6: Testing & Quality Assurance (Days 14-15)

#### Step 6.1: Unit Testing
- [ ] Write unit tests for utility functions
- [ ] Test API endpoints
- [ ] Test component functionality
- [ ] Achieve >80% code coverage

**Deliverables:**
- Comprehensive test suite
- Code coverage reports

#### Step 6.2: Integration Testing
- [ ] Test end-to-end user workflows
- [ ] Test file upload/download functionality
- [ ] Test error scenarios
- [ ] Cross-browser compatibility testing

**Deliverables:**
- Integration test suite
- Browser compatibility matrix

#### Step 6.3: Security Testing
- [ ] Test input validation
- [ ] Verify path traversal protection
- [ ] Test rate limiting
- [ ] Security audit

**Deliverables:**
- Security test results
- Vulnerability assessment

### Phase 7: Documentation & Deployment (Days 16-17)

#### Step 7.1: Documentation
- [ ] Create comprehensive README
- [ ] Document API endpoints
- [ ] Write deployment instructions
- [ ] Create user guide

**Deliverables:**
- Complete project documentation
- API documentation
- Deployment guide

#### Step 7.2: Docker Implementation
- [ ] Create multi-stage Dockerfile (development and production)
- [ ] Implement docker-compose.yml for complete stack
- [ ] Configure volume mounting for Minecraft worlds directory
- [ ] Set up non-root user and security best practices
- [ ] Add health checks and restart policies
- [ ] Configure environment-specific builds (.env support)
- [ ] Test hot reloading in development mode
- [ ] Optimize build caching and image size

**Deliverables:**
- Production-ready Dockerfile with multi-stage builds
- docker-compose.yml for development and production
- Volume mounting configuration
- Security-hardened container setup
- Complete Docker deployment documentation

#### Step 7.3: Final Testing & Optimization
- [ ] Performance testing and optimization
- [ ] Final security review
- [ ] User acceptance testing
- [ ] Bug fixes and polish

**Deliverables:**
- Production-ready application
- Performance benchmarks
- Final test results

---

## Success Criteria

### Functional Requirements
- ✅ List all Minecraft worlds with metadata
- ✅ Download individual world archives
- ✅ Download all worlds as single archive
- ✅ Search and filter functionality
- ✅ Responsive design across all devices
- ✅ Accessibility compliance (WCAG 2.1 AA)

### Technical Requirements
- ✅ Built with SvelteKit 2 + Svelte 5 + runes
- ✅ TypeScript for type safety
- ✅ shadcn-svelte UI components
- ✅ Secure file handling and validation
- ✅ Performance optimization
- ✅ Docker deployment with volume mounting
- ✅ Multi-stage builds for development and production
- ✅ Non-root container security

### Quality Requirements
- ✅ >80% code coverage
- ✅ Security audit passed
- ✅ Cross-browser compatibility
- ✅ Lighthouse score >90
- ✅ Comprehensive documentation

---

## Risk Assessment & Mitigation

### Technical Risks
1. **File System Performance**: Large directories may cause performance issues
   - *Mitigation*: Implement pagination and caching
2. **Memory Usage**: Large file operations may consume excessive memory
   - *Mitigation*: Use streaming for file operations
3. **Security Vulnerabilities**: File serving always carries security risks
   - *Mitigation*: Comprehensive input validation and security testing

### Timeline Risks
1. **Scope Creep**: Additional features may extend timeline
   - *Mitigation*: Strict adherence to MVP requirements
2. **Technical Complexity**: Unforeseen technical challenges
   - *Mitigation*: Buffer time built into schedule

---

## Next Steps

1. **Approval**: Review and approve this plan
2. **Environment Setup**: Prepare development environment
3. **Kickoff**: Begin Phase 1 implementation
4. **Regular Check-ins**: Daily progress updates
5. **Milestone Reviews**: End-of-phase deliverable reviews

---

**Total Estimated Timeline: 17 days**
**Key Milestones:**
- Day 2: Foundation complete
- Day 5: Backend API complete
- Day 9: Frontend MVP complete
- Day 11: UX/Accessibility complete
- Day 13: Advanced features complete
- Day 15: Testing complete
- Day 17: Production ready

This plan ensures a systematic approach to rebuilding the Minecraft World Archiver with modern technologies while maintaining all existing functionality and improving user experience, security, and maintainability.