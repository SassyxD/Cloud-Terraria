# Frontend Overhaul - Terraria Theme 

## Overview
Complete redesign of the Cloud Terraria frontend with a Terraria-inspired theme featuring a dark, space-like aesthetic with vibrant accents and smooth animations.

## Changes Made

### Visual Design

#### Color Palette
- **Background**: Deep space blue (`#0a1628`) with subtle radial gradients
- **Cards**: Layered dark blues (`#1a2537`, `#2a3548`)
- **Accents**: 
  - Primary Blue: `#4a90e2`
  - Success Green: `#5fd35f`
  - Gold: `#f4c430`
  - Purple: `#9b59b6`
  - Error Red: `#e74c3c`

#### Effects
- Twinkling star background animation
- Glow effects on interactive elements
- Shimmer animations on buttons
- Smooth hover transitions
- Gradient borders and backgrounds

### Components Created

#### 1. **CreateServerButton** (`src/components/CreateServerButton.tsx`)
- Modal-based server creation form
- Fields: World Name, Terraria Version, Port
- Animated entrance/exit
- Loading states with spinner
- Error handling display
- Gradient button with glow effect

#### 2. **ServerCard** (`src/components/ServerCard.tsx`)
- Displays server information in a card layout
- State indicators with color coding:
  - 🟢 Running (Green)
  - 🟡 Pending (Yellow)
  - ⚫ Stopped (Gray)
  - 🔴 Error (Red)
- Server details: World name, version, port, instance ID, creation date
- Action buttons: Connect, Settings
- Hover effects with gradient accent line

### Pages Updated

#### **Home Page** (`src/app/page.tsx`)
- **Header Navigation**
  - Logo with gradient text
  - User profile display
  - Sign in/out buttons
  
- **Landing Page** (Not Authenticated)
  - Hero section with gradient title
  - Feature cards highlighting:
    - 🚀 Quick Deploy
    - ⚙️ Easy Management
    - ☁️ Cloud Powered
  - Call-to-action button
  
- **Dashboard** (Authenticated)
  - Welcome message
  - Create server button
  - Server grid display
  - Empty state for no servers
  - Server count indicator

### 🎭 Layout Updates (`src/app/layout.tsx`)
- Updated metadata (title, description)
- Added antialiased class for better text rendering

### 🎨 Styling (`src/styles/globals.css`)
- Custom scrollbar with Terraria colors
- Animation keyframes:
  - `twinkle` - Star animations
  - `shimmer` - Moving gradient effect
  - `fade-in` - Smooth entrance
  - `zoom-in` - Scale entrance
  - `pulse-glow` - Pulsing shadow effect
- Utility classes:
  - `.terraria-glow` - Blue glow
  - `.terraria-glow-green` - Green glow
  - `.terraria-glow-gold` - Gold glow
  - `.shimmer` - Animated gradient
  - `.star` - Twinkling effect
  - `.animate-in` - Entrance animation

### 🔌 API Integration

#### Server Router (`src/server/api/routers/server.ts`)
- Added `getAll` query to fetch user's servers
- Existing `create` mutation for server creation

#### Root Router (`src/server/api/root.ts`)
- Added server router to app router

## Features

### ✅ Implemented
- Responsive design (mobile, tablet, desktop)
- Dark theme with Terraria aesthetics
- Server management dashboard
- Server creation with form validation
- Real-time server state display
- Authentication flow
- Animated backgrounds and effects
- Loading states and error handling

### 🎯 User Experience
- Friendly, gaming-themed interface
- Clear visual feedback
- Smooth transitions and animations
- Intuitive server management
- Professional yet playful design

## Tech Stack
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS v4
- **State Management**: tRPC + React Query
- **Authentication**: NextAuth.js
- **Database**: Prisma with SQLite

## Running the App
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

## Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Future Enhancements
- Server start/stop controls
- Real-time server status updates
- Server logs viewer
- Player management
- World backup/restore
- Performance metrics dashboard
- Dark/light theme toggle
- More Terraria-themed animations and assets
