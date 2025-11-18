# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js-based integrated brand hub website for 최범희 (Choi Beom-hee) PD, combining three core identities:
1. **Education**: Smartphone startup strategist ("최PD의 스마트폰 연구소")
2. **Media**: Publisher of Korean Environmental Journal (한국환경저널)
3. **Works**: Author and mobile sketch artist

**Status**: Project is in planning phase. See `prd.md` for complete product requirements.

## Technology Stack

- **Framework**: Next.js v16+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Database**: SQLite

## Architecture Principles

### Database Schema (SQLite)

The application uses a single SQLite database with the following core tables:

- **Courses**: Education programs (id, title, description, type, price, thumbnail_url, external_link)
- **Posts**: Blog-style announcements and community content (id, title, content, category, created_at, published)
- **Works**: Gallery images and press coverage (id, title, description, image_url, category: 'gallery' | 'press')
- **Inquiries**: B2B/B2G lead capture (id, name, email, phone, message, type: 'b2b' | 'contact', created_at)
- **Leads**: Newsletter subscriptions (id, email, subscribed_at)
- **Users**: Admin authentication (id, username, password_hash)

### State Management (Zustand)

Use minimal, focused stores:
- **uiStore**: `isMobileMenuOpen`, `isModalOpen`
- **formStore**: `isLoading`, `error` - shared across all form submissions

### Key Architectural Patterns

1. **CMS-Driven Content**: All dynamic content (courses, posts, gallery, press) is managed via `/admin` routes with CRUD operations backed by SQLite
2. **Mobile-First Responsive**: Tailwind CSS with mobile-first breakpoints, leveraging shadcn/ui components
3. **ISR for Performance**: Use Next.js Incremental Static Regeneration for dynamic feeds (latest courses, environmental journal activities)
4. **API Routes**: All database operations go through Next.js API Routes in `/app/api/` (never direct DB access from client)
5. **External Payment Integration**: VOD courses link to external payment platforms (Stripe, TossPayments) - SQLite only stores course metadata, not transactions

## Core Features Structure

### Main Sections
- **Home** (`/`): Hero with multi-faceted identity, service hub cards (Education/Media/Works), dynamic feed
- **Education** (`/education`): Course catalog, B2B/B2G inquiry forms, VOD course links
- **Media** (`/media`): Korean Environmental Journal introduction, publisher's message, key activities archive
- **Works** (`/works`): Book showcase, mobile sketch gallery, press archive
- **Community** (`/community`): Announcements, student testimonials, newsletter signup
- **Admin** (`/admin`): Protected CMS for content management and lead tracking

### Admin System
- Authentication middleware required for `/admin` routes
- CRUD interfaces for all content types
- Lead management dashboard with CSV export capability
- All admin operations use Next.js API Routes with SQLite backend

## Target Audiences

- **B2C**: Baby boomers (50-60s) interested in second careers via smartphone entrepreneurship
- **B2B**: Small business owners needing digital marketing education
- **B2G/Social**: Organizations interested in environmental journalism and media literacy training

## Development Commands

(To be added once project scaffold is created)

## SEO & Performance Requirements

- All major pages must have optimized meta tags and semantic HTML
- Target fast LCP (Largest Contentful Paint) using SSR/SSG
- Mobile-first responsive design required for all pages
- SQLite database must have regular backup strategy

## Future Phases

- **Phase 2**: Self-hosted VOD payment system, student-only community area
- **Phase 3**: Korean Environmental Journal RSS/API integration
