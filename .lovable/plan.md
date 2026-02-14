

# OpportunityX — Complete Job Portal Frontend

## Overview
A fully responsive, modern job portal frontend built with React + Vite + Tailwind CSS. All pages and components will be built with a centralized API service layer for connecting to your custom Node.js backend. Dark/light mode, glassmorphism accents, smooth animations, and mobile-first design throughout.

## Design System
- **Color palette**: Professional blues/indigos with accent colors for status indicators
- **Dark/light mode** toggle with system preference detection
- **Glassmorphism** cards and panels with backdrop blur effects
- **Typography**: Clean, accessible font sizing with proper hierarchy
- **Animations**: Framer-motion-style transitions on page loads, modals, and interactions
- **Fully responsive**: Mobile-first with breakpoints for tablet and desktop

## API Service Layer
- Centralized API client with interceptors for JWT token handling
- Request/response error handling with toast notifications
- Role-based route guards (Candidate, Recruiter, Admin)
- Environment-based API URL configuration

---

## Pages & Features

### 1. Landing Page
- Hero section with search bar (job title + location)
- Featured jobs carousel
- Statistics section (jobs posted, companies, candidates)
- Testimonials, how-it-works section
- CTA for sign up
- Footer with links

### 2. Authentication
- **Login** page with email/password
- **Register** page with role selection (Candidate/Recruiter)
- **Forgot Password** flow
- **OTP verification** page
- JWT token storage and auto-refresh logic
- Protected route wrapper component

### 3. Candidate Dashboard
- **Profile Builder**: Personal info, education, experience, skills tags, portfolio links
- **Resume Upload**: Drag-and-drop file upload with preview
- **Applied Jobs**: List with application status timeline (Applied → Reviewed → Shortlisted → Interview → Offer/Rejected)
- **Saved/Bookmarked Jobs**: Quick access list
- **Job Alerts**: Preferences for email notifications
- **Recommended Jobs**: AI-powered suggestions section (calls your backend AI endpoint)

### 4. Recruiter Dashboard
- **Post Job**: Rich form with job details, requirements, salary range, job type, remote options
- **Manage Jobs**: Edit, delete, toggle active/inactive
- **Applicant Management**: View applicants per job, filter, shortlist/reject with notes
- **Company Profile**: Logo, description, culture, benefits, social links
- **Analytics**: Views, applications, conversion charts per job posting

### 5. Admin Panel
- **User Management**: List, search, activate/deactivate users by role
- **Job Moderation**: Approve/reject/flag job postings
- **Analytics Dashboard**: Charts for users, jobs, applications over time (using Recharts)
- **Reports**: Exportable data tables

### 6. Job Search & Listings
- **Advanced Search**: Full-text search with filters — location, salary range, experience level, job type (full-time/part-time/contract), remote/hybrid/onsite, industry, date posted
- **Job Cards**: Clean card layout with key info, save button, apply button
- **Job Detail Page**: Full description, company info, similar jobs, apply CTA
- **Map view** option for location-based search

### 7. Chat System
- Real-time messaging UI between recruiter and candidate
- Conversation list sidebar
- Message input with basic formatting
- Unread message indicators
- (Connects to your backend WebSocket/polling endpoint)

### 8. Notifications
- Notification bell with dropdown
- Notification center page with filters (all, unread, by type)
- Types: application updates, new messages, job alerts, system notices

### 9. Resume Parsing
- Upload resume UI with drag-and-drop
- Parsed data preview (calls your backend parsing endpoint)
- Auto-fill profile fields from parsed data

### 10. Payment / Premium
- Premium listing upgrade page for recruiters
- Pricing cards for plans
- Payment form UI (connects to your backend payment endpoint)
- Subscription management section

### 11. Blog / Career Resources
- Blog listing page with categories
- Individual blog post page
- Career tips, interview guides, salary calculator tool

### 12. Shared Components
- Responsive navbar with role-based menu items
- Sidebar navigation for dashboards
- Footer
- Loading skeletons
- Empty states
- Error boundaries
- Toast notification system
- Confirmation dialogs
- Data tables with sorting/pagination
- File upload component
- Rich text display

