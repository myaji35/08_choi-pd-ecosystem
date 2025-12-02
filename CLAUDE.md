# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project Name**: imPD (I'm PD - Interactive Management Platform for Distribution)

This is a Next.js-based integrated brand hub and distribution platform for 최범희 (Choi Beom-hee) PD:

### Core Identities
1. **Education**: Smartphone startup strategist ("최PD의 스마트폰 연구소")
2. **Media**: Publisher of Korean Environmental Journal (한국환경저널)
3. **Works**: Author and mobile sketch artist

### Platform Purpose
- **Primary**: Distribution platform for reselling the brand ecosystem to end customers
- **Secondary**: Content management system for the PD's own brand management

**Status**: Active development. See `prd.md` for complete product requirements.

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

**Content Tables**:
- **Courses**: Education programs (id, title, description, type, price, thumbnail_url, external_link)
- **Posts**: Blog-style announcements and community content (id, title, content, category, created_at, published)
- **Works**: Gallery images and press coverage (id, title, description, image_url, category: 'gallery' | 'press')
- **Inquiries**: B2B/B2G lead capture (id, name, email, phone, message, type: 'b2b' | 'contact', created_at)
- **Leads**: Newsletter subscriptions (id, email, subscribed_at)

**Admin Tables**:
- **AdminUsers**: Admin authentication (id, username, password, role, created_at, updated_at)
- **Settings**: Site settings (id, key, value, updated_at)
- **HeroImages**: Hero section images (id, filename, url, alt_text, is_active)

**SNS Integration Tables**:
- **SnsAccounts**: SNS platform connections (id, platform, account_name, access_token, is_active)
- **SnsScheduledPosts**: Scheduled posts (id, content_type, content_id, platform, message, scheduled_at, status)
- **SnsPostHistory**: Post history logs (id, scheduled_post_id, action, status, response)

**Distribution Platform Tables** (NEW):
- **Distributors**: Reseller/distributor management (id, name, email, business_type, region, status, subscription_plan, total_revenue)
- **DistributorActivityLog**: Activity tracking (id, distributor_id, activity_type, description, metadata, created_at)
- **DistributorResources**: Resources for distributors (id, title, file_url, file_type, category, required_plan, download_count)

### State Management (Zustand)

Use minimal, focused stores:
- **uiStore**: `isMobileMenuOpen`, `isModalOpen`
- **formStore**: `isLoading`, `error` - shared across all form submissions

### Key Architectural Patterns

1. **Dual Admin System**:
   - `/admin/*`: Distribution platform management (distributors, resources, analytics)
   - `/pd/*`: PD's personal content management (profile, social media, hero images, kanban)
2. **CMS-Driven Content**: All dynamic content (courses, posts, gallery, press) is managed via admin routes with CRUD operations backed by SQLite
3. **Mobile-First Responsive**: Tailwind CSS with mobile-first breakpoints, leveraging shadcn/ui components
4. **ISR for Performance**: Use Next.js Incremental Static Regeneration for dynamic feeds (latest courses, environmental journal activities)
5. **API Routes**: All database operations go through Next.js API Routes in `/app/api/` (never direct DB access from client)
6. **External Payment Integration**: VOD courses link to external payment platforms (Stripe, TossPayments) - SQLite only stores course metadata, not transactions

## Core Features Structure

### Main Sections
- **Home** (`/`): Hero with multi-faceted identity, service hub cards (Education/Media/Works), dynamic feed
- **Education** (`/education`): Course catalog, B2B/B2G inquiry forms, VOD course links
- **Media** (`/media`): Korean Environmental Journal introduction, publisher's message, key activities archive
- **Works** (`/works`): Book showcase, mobile sketch gallery, press archive
- **Community** (`/community`): Announcements, student testimonials, newsletter signup

### Admin Systems

#### Distribution Platform Admin (`/admin/*`)
**Purpose**: Manage distributors/resellers who want to adopt the imPD platform
- Distributor management (registration, approval, status tracking)
- Resource library management (marketing materials, training docs, templates)
- Activity log and analytics
- Revenue tracking and reporting
- Authentication middleware required for all `/admin` routes

#### PD Personal Dashboard (`/pd/*`)
**Purpose**: PD's own brand and content management
- Profile photo management
- Social media account integration
- Hero image uploads
- Kanban project board
- Newsletter subscriber management
- Authentication middleware required for all `/pd` routes

**Shared Authentication**: Both admin areas use the same authentication system (Clerk in production, dev-mode in development)

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
