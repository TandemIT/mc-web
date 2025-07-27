# Project Plan — Minecraft World Archiver Rebuild

## Current Status 🔄

**Last Updated:** January 27, 2025  
**Phase:** 3 (Frontend Components) - In Progress  
**Overall Progress:** ~70% Complete

### ✅ Completed
- **Phase 1:** Project Setup & Foundation (100%)
- **Phase 2:** Core Backend Logic (95%)
- **Phase 3:** Frontend Components (60%)

### 🔄 Currently Working On
- Debugging server startup issues
- Testing API endpoints
- Finalizing frontend integration

### 🎯 Next Steps
- Fix server initialization
- Complete FlexSearch integration
- Add theme toggle and navigation
- Test full application flow

---

## Overview

This plan outlines the complete rebuild of the Minecraft world archiving system from PHP to **SvelteKit 2 with Svelte 5 and runes**. The system will maintain full feature parity with the existing PHP implementation while modernizing the architecture, improving security, and enhancing user experience.

---

## Current System Analysis

### Existing Features (PHP Implementation)
- **World Listing**: Scans `/worlds` directory for `.tar.xz` files
- **Metadata Extraction**: Parses filenames to extract modpack info, versions, categories
- **Download Functionality**: Secure file serving with download tracking
- **Statistics**: Total worlds, size, downloads, categories
- **Caching**: 5-minute cache for world listings
- **Security**: Input validation, path traversal protection, rate limiting
- **UI**: Modern responsive interface with search, filtering, sorting

### File Naming Convention (from compress.sh)
- Pattern: `{modpack}_{version}__{world_name}.tar.xz`
- Examples: `atm_atm10_v2.42__main.tar.xz`, `tandem_create__default.tar.xz`
- Hyphens converted to underscores for safety
- Output directory: `/root/web/src/worlds` (will be `./worlds` in new system)

---

## Technology Stack

### Core Framework
- **SvelteKit 2** with **Svelte 5 + runes** (full-stack framework)
- **TypeScript** for type safety
- **Node.js adapter** for server-side rendering and API endpoints

### Database & ORM
- **SQLite** for statistics and download tracking
- **Drizzle ORM** for type-safe database operations
- **Drizzle Kit** for schema migrations

### UI/UX
- **shadcn-svelte** component library
- **Tailwind CSS** for styling
- **Lucide Svelte** for icons
- **FlexSearch** for fast client-side search functionality
- Responsive design (mobile-first)
- Full accessibility compliance (WCAG 2.1 AA)

### Development Tools
- **Vite** for build tooling
- **ESLint** + **Prettier** for code quality
- **Vitest** for testing
- **TypeScript** strict mode

### Deployment
- **Docker** containerization with **Node.js adapter**
- **Nginx reverse proxy** (handles compression, TLS, caching)
- **SvelteKit server endpoints** (handles dynamic logic, file streaming, API responses, file downloading)
- Volume mounting for worlds directory

---

## Project Structure

```
mc-web/
├── src/
│   ├── lib/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/             # shadcn-svelte components
│   │   │   ├── WorldCard.svelte
│   │   │   ├── WorldGrid.svelte
│   │   │   ├── SearchBar.svelte
│   │   │   ├── FlexSearchProvider.svelte
│   │   │   └── StatsDisplay.svelte
│   │   ├── server/             # Server-side utilities
│   │   │   ├── worldScanner.ts
│   │   │   ├── fileHandler.ts
│   │   │   ├── cache.ts
│   │   │   ├── database.ts     # Drizzle database connection
│   │   │   └── security.ts
│   │   ├── db/                 # Database layer
│   │   │   ├── schema.ts       # Drizzle schema definitions
│   │   │   ├── queries.ts      # Database queries
│   │   │   └── migrations/     # Schema migrations
│   │   ├── stores/             # Svelte stores
│   │   │   ├── worlds.ts
│   │   │   ├── search.ts
│   │   │   └── ui.ts
│   │   ├── types/              # TypeScript definitions
│   │   │   ├── world.ts
│   │   │   └── api.ts
│   │   └── utils/              # Utility functions
│   │       ├── formatting.ts
│   │       ├── validation.ts
│   │       ├── constants.ts
│   │       └── flexsearch.ts
│   ├── routes/
│   │   ├── +layout.svelte      # Main layout
│   │   ├── +page.svelte        # Home page
│   │   ├── +page.server.ts     # Server-side data loading
│   │   ├── api/
│   │   │   ├── worlds/
│   │   │   │   └── +server.ts  # World listing endpoint
│   │   │   ├── stats/
│   │   │   │   └── +server.ts  # Statistics endpoint
│   │   │   └── refresh/
│   │   │       └── +server.ts  # Cache refresh endpoint
│   │   └── download/
│   │       └── [filename]/
│   │           └── +server.ts  # File download handler
│   ├── app.html                # HTML template
│   └── app.css                 # Global styles
├── static/                     # Static assets
├── worlds/                     # Minecraft world files (volume mount)
├── compress.sh                 # Bash script (maintained)
├── Dockerfile
├── docker-compose.yml
├── package.json
├── svelte.config.js
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## SvelteKit Architecture Strategy

### Full-Stack SvelteKit Approach

This project will leverage **SvelteKit's native full-stack capabilities** rather than treating it as a thin wrapper around Express-style APIs:

#### **Server-Side Rendering & Data Loading**
- **`+page.server.ts`**: Initial world data loading with server-side caching
- **Server endpoints (`+server.ts`)**: Handle API requests, file downloads, and dynamic operations
- **Form actions**: Handle any form submissions (if needed for admin features)

#### **File Serving Strategy**
- **SvelteKit endpoints**: Handle file downloads with proper security, logging, and download tracking
- **Nginx reverse proxy**: Handles static assets, compression, TLS termination
- **Volume mounting**: Worlds directory mounted into container for direct file access

#### **Reactive Data Flow**
- **Runes**: Modern Svelte 5 reactivity for component state
- **Stores**: Global state management for worlds data, search state, UI preferences
- **FlexSearch**: Client-side search index for instant filtering and search

#### **Modular Architecture Benefits**
- **Scalable**: Easy to add new endpoints, components, and features
- **Maintainable**: Clear separation between server logic, client logic, and UI components
- **Testable**: Each layer can be tested independently
- **Flexible**: Can handle increasing update frequencies without architectural changes

#### **Integration with Existing Tooling**
- **Bash script compatibility**: Maintains existing file naming conventions
- **Docker deployment**: Containerized for easy deployment and scaling
- **Nginx integration**: Optimized for reverse proxy deployment

---

## Implementation

### Phase 1: Project Setup & Foundation (Day 1) ✅ COMPLETED

#### 1.1 Initialize SvelteKit Project
- [x] Create new SvelteKit project with TypeScript and Node.js adapter
- [x] Configure Vite, ESLint, Prettier
- [x] Set up Tailwind CSS 4
- [x] Install and configure shadcn-svelte
- [ ] Install and configure FlexSearch for client-side search
- [x] Install and configure Drizzle ORM with SQLite
- [x] Create SvelteKit file-based routing structure

#### 1.2 Database Schema & Types
- [x] Define Drizzle schema for downloads and statistics
- [x] Create database migrations
- [x] Define `World` interface based on PHP WorldScanner
- [x] Create API response types
- [x] Set up utility types for search/filtering

#### 1.3 Basic Layout & Routing
- [x] Create `+layout.svelte` with responsive design
- [ ] Implement navigation header with theme toggle
- [x] Set up `+page.svelte` for main world listing
- [x] Create initial server endpoints structure

**Deliverables:**
- Working SvelteKit project with TypeScript
- Basic responsive layout
- Type definitions for core entities

### Phase 2: Core Backend Logic (Day 2) ✅ COMPLETED

#### 2.1 World Scanner Service
- [x] Port PHP WorldScanner to TypeScript
- [x] Implement file system scanning
- [x] Add filename parsing logic (category, version, group)
- [x] Create metadata extraction functions

#### 2.2 Database Operations
- [x] Implement download tracking with Drizzle ORM
- [x] Create statistics aggregation queries
- [x] Set up database connection and query utilities
- [ ] Implement data migration from existing downloads.json (if exists)

#### 2.3 SvelteKit Server Endpoints
- [x] `routes/api/worlds/+server.ts` - World listing with metadata
- [x] `routes/download/[filename]/+server.ts` - Secure file streaming with DB tracking
- [x] `routes/api/stats/+server.ts` - Statistics endpoint using database
- [ ] `routes/+page.server.ts` - Server-side data loading for main page
- [x] Implement server-side caching mechanism (5-minute TTL)

#### 2.4 Security Implementation
- [x] Input validation and sanitization
- [x] Path traversal protection
- [ ] Rate limiting middleware
- [x] File access security checks

**Deliverables:**
- Complete SvelteKit server endpoints matching PHP functionality
- SQLite database with Drizzle ORM for statistics tracking
- Secure file streaming with database-backed download tracking
- Server-side caching and data loading

### Phase 3: Frontend Components (Day 3) 🔄 IN PROGRESS

#### 3.1 Core Components
- [x] `WorldCard` - Individual world display (integrated in main page)
- [x] `WorldGrid` - Grid/list view container (integrated in main page)
- [x] `SearchBar` - Search interface (basic implementation)
- [ ] `FlexSearchProvider` - FlexSearch index management
- [x] `StatsDisplay` - Statistics dashboard (integrated in main page)

#### 3.2 State Management
- [x] Worlds store with reactive updates (using Svelte 5 runes)
- [x] Search/filter state management (using Svelte 5 runes)
- [ ] UI state (view mode, theme, etc.)

#### 3.3 Data Fetching & Search
- [x] Implement world data fetching
- [ ] Set up FlexSearch index with world data
- [x] Add loading states and error handling
- [ ] Implement reactive search with FlexSearch

**Deliverables:**
- Complete UI component library
- Reactive state management
- Data fetching with proper error handling

### Phase 4: Advanced Features (Day 4)

#### 4.1 Search & Filtering
- [ ] Real-time search with FlexSearch (fuzzy matching, typo tolerance)
- [ ] Category-based filtering with FlexSearch facets
- [ ] Sorting options (name, size, date, downloads)
- [ ] Advanced filters (version, tags) integrated with FlexSearch
- [ ] Search result highlighting and suggestions

#### 4.2 Enhanced UI/UX
- [ ] Loading animations and skeletons
- [ ] Infinite scroll or pagination
- [ ] Keyboard navigation
- [ ] Mobile-optimized interactions

#### 4.3 Download Features
- [ ] Individual world downloads
- [ ] Bulk download functionality
- [ ] Download progress indicators
- [ ] Download history/tracking

**Deliverables:**
- Advanced FlexSearch-powered search and filtering
- Enhanced user experience features
- Complete download functionality

### Phase 5: Accessibility & Polish (Day 5)

#### 5.1 Accessibility Implementation
- [ ] ARIA labels and roles
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast compliance
- [ ] Focus management

#### 5.2 Performance Optimization
- [ ] Code splitting and lazy loading
- [ ] Image optimization
- [ ] Bundle size optimization
- [ ] Caching strategies

#### 5.3 Error Handling & Validation
- [ ] Comprehensive error boundaries
- [ ] User-friendly error messages
- [ ] Form validation
- [ ] Network error handling

**Deliverables:**
- Fully accessible application
- Optimized performance
- Robust error handling

### Phase 6: Testing & Documentation (Day 6)

#### 6.1 Testing Implementation
- [ ] Unit tests for utilities and services
- [ ] Component testing with Testing Library
- [ ] API endpoint testing
- [ ] Integration tests

#### 6.2 Documentation
- [ ] API documentation
- [ ] Component documentation
- [ ] Deployment guide
- [ ] Development setup guide

#### 6.3 Code Quality
- [ ] ESLint configuration and fixes
- [ ] TypeScript strict mode compliance
- [ ] Code review and refactoring

**Deliverables:**
- Comprehensive test suite
- Complete documentation
- Production-ready code quality

### Phase 7: Dockerization & Deployment (Day 7)

#### 7.1 Docker Configuration
- [ ] Multi-stage Dockerfile
- [ ] Development and production configurations
- [ ] Volume mounting for worlds directory
- [ ] Security hardening

#### 7.2 Docker Compose Setup
- [ ] Development environment
- [ ] Production environment
- [ ] Health checks and restart policies
- [ ] Environment variable management

#### 7.3 Deployment Testing
- [ ] Local Docker testing
- [ ] Production deployment verification
- [ ] Performance testing
- [ ] Security audit

**Deliverables:**
- Complete Docker setup
- Production-ready deployment
- Deployment documentation

---

## Technical Specifications

### SvelteKit Server Endpoints

#### GET /api/worlds (+server.ts)
```typescript
interface WorldsResponse {
  success: boolean;
  worlds: World[];
  statistics: Statistics;
  generated_at: string;
  cache_expires: string;
}
```

#### GET /download/[filename] (+server.ts)
- Secure file streaming with `Response` object
- Download count tracking via server-side logic
- Proper Content-Disposition headers
- Path traversal protection and validation

#### GET /api/stats (+server.ts)
```typescript
interface Statistics {
  total_worlds: number;
  total_size: number;
  total_downloads: number;
  categories: Record<string, number>;
}
```

#### Server-Side Data Loading (+page.server.ts)
```typescript
interface PageData {
  worlds: World[];
  statistics: Statistics;
  initialSearchIndex: FlexSearchIndex;
}
```

### Database Schema (Drizzle ORM)

#### Downloads Table
```typescript
// lib/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const downloads = sqliteTable('downloads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filename: text('filename').notNull().unique(),
  count: integer('count').notNull().default(0),
  firstDownload: integer('first_download', { mode: 'timestamp' }).notNull(),
  lastDownload: integer('last_download', { mode: 'timestamp' }).notNull(),
});

export const downloadLogs = sqliteTable('download_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filename: text('filename').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'), // Optional for rate limiting
  userAgent: text('user_agent'), // Optional for analytics
});
```

#### Database Queries
```typescript
// lib/db/queries.ts
import { db } from './database';
import { downloads, downloadLogs } from './schema';
import { eq, sql } from 'drizzle-orm';

export async function incrementDownload(filename: string, ipAddress?: string) {
  await db.transaction(async (tx) => {
    // Insert or update download count
    await tx.insert(downloads)
      .values({
        filename,
        count: 1,
        firstDownload: new Date(),
        lastDownload: new Date(),
      })
      .onConflictDoUpdate({
        target: downloads.filename,
        set: {
          count: sql`${downloads.count} + 1`,
          lastDownload: new Date(),
        },
      });

    // Log the download
    await tx.insert(downloadLogs).values({
      filename,
      timestamp: new Date(),
      ipAddress,
    });
  });
}

export async function getDownloadStats() {
  return await db.select({
    filename: downloads.filename,
    count: downloads.count,
    lastDownload: downloads.lastDownload,
  }).from(downloads);
}
```

### Data Types

```typescript
interface World {
  filename: string;
  displayName: string;
  size: number;
  formatted_size: string;
  modified: string;
  formatted_modified: string;
  downloads: number;
  category: string;
  group: string;
  version: string | null;
  description: string;
  tags: string[];
  download_url: string;
}
```

### Security Measures

1. **Input Validation**: All user inputs sanitized and validated
2. **Path Traversal Protection**: Strict filename validation
3. **Rate Limiting**: 100 requests per hour per IP
4. **CORS Configuration**: Restricted to allowed origins
5. **File Access Control**: Only serve files from worlds directory

### Performance Targets

- **Initial Load**: < 2 seconds
- **Search Response**: < 100ms
- **Download Start**: < 500ms
- **Bundle Size**: < 500KB (gzipped)
- **Lighthouse Score**: > 90 (all categories)

---

## Migration Strategy

### Data Compatibility
- Maintain existing filename conventions
- Preserve download counts from PHP system
- Ensure cache compatibility during transition

### Deployment Strategy
1. Deploy new system alongside existing PHP
2. Test with subset of users
3. Gradual migration with fallback capability
4. Complete switchover after validation

### Rollback Plan
- Keep PHP system as backup
- Database/cache export/import procedures
- Quick deployment rollback capability

---

## Success Criteria

### Functional Requirements
- [ ] All existing PHP features replicated
- [ ] Improved performance and user experience
- [ ] Full accessibility compliance
- [ ] Mobile-responsive design

### Technical Requirements
- [ ] TypeScript strict mode compliance
- [ ] 90%+ test coverage
- [ ] Docker deployment working
- [ ] Security audit passed

### User Experience
- [ ] Faster load times than PHP version
- [ ] Intuitive search and filtering
- [ ] Smooth mobile experience
- [ ] Accessible to all users

---

## Risk Mitigation

### Technical Risks
- **File System Access**: Test thoroughly on target deployment environment
- **Performance**: Implement caching and optimization early
- **Security**: Regular security audits and penetration testing

### Project Risks
- **Scope Creep**: Stick to feature parity first, enhancements later
- **Timeline**: Daily checkpoints and milestone reviews
- **Quality**: Automated testing and code review processes

---

## Next Steps

1. **Approval**: Review and approve this plan
2. **Environment Setup**: Prepare development environment
3. **Phase 1 Execution**: Begin with project setup and foundation
4. **Daily Standups**: Track progress and address blockers
5. **Milestone Reviews**: Assess deliverables at each phase

---

**This plan provides a comprehensive roadmap for rebuilding the Minecraft World Archiver with modern technologies while maintaining all existing functionality and improving user experience. Each phase builds upon the previous one, ensuring a systematic and reliable development process.**