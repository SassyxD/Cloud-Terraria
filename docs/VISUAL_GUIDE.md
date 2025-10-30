# Visual Design Preview - Cloud Terraria

## Page Layouts

### Landing Page (Not Authenticated)
```
┌─────────────────────────────────────────────────────────────┐
│  🌍 Cloud Terraria                    [Sign In Button]      │
│     Server Management                                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                       Stars Background                      │
│                                                              │
│           Cloud Terraria (Gradient Text)                    │
│     Deploy and manage your Terraria servers in the          │
│            cloud with just a few clicks!                    │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Quick Deploy│  │     Easy      │  │    Cloud     │      │
│  │              │  │  Management   │  │   Powered    │      │
│  │   Launch in  │  │   Intuitive   │  │   Reliable   │      │
│  │   minutes    │  │   dashboard   │  │     AWS      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│              [Get Started Now →] (Glow Button)              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Dashboard (Authenticated)
```
┌─────────────────────────────────────────────────────────────┐
│  🌍 Cloud Terraria    👤 User Avatar    [Sign Out]         │
│     Server Management     John Doe                          │
├─────────────────────────────────────────────────────────────┤
│                       Stars Background                      │
│                                                              │
│           Welcome, Adventurer!                              │
│     Manage your Terraria servers with ease.                 │
│                                                              │
│              [Create New Server] (Green Glow)               │
│                                                              │
│  Your Servers                         Total: 3              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   MyWorld   │  │  PvP Arena  │  │   Builder   │         │
│  │ v1.4.4      │  │ vLatest     │  │ vLatest      │         │
│  │  Running    │  │  Pending    │  │  Stopped     │         │
│  │             │  │             │  │              │         │
│  │ Port: 7777  │  │ Port: 7778  │  │ Port: 7779   │         │
│  │ ID: i-abc...│  │ ID: i-def...│  │ ID: i-ghi... │         │
│  │ 2024-10-13  │  │ 2024-10-13  │  │ 2024-10-12   │         │
│  │             │  │             │  │              │         │
│  │ [Connect] ⚙ │  │ [Connect] ⚙ │  │ [Connect] ⚙  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Create Server Modal
```
┌────────────────────────────────────────────┐
│  Create Terraria Server               ✕   │
├────────────────────────────────────────────┤
│                                            │
│  World Name                                │
│  ┌──────────────────────────────────────┐ │
│  │ MyWorld                              │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Terraria Version                          │
│  ┌──────────────────────────────────────┐ │
│  │ Latest                          ▼    │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Port                                      │
│  ┌──────────────────────────────────────┐ │
│  │ 7777                                 │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌────────────┐  ┌────────────────────┐  │
│  │  Cancel    │  │  Create Server     │  │
│  └────────────┘  └────────────────────┘  │
│                                            │
└────────────────────────────────────────────┘
```

---

## Color Scheme Visualization

### Primary Palette
```
╔═══════════════════════════════════════════════╗
║ Background          #0a1628  ████████████████ ║
║ Card Background     #1a2537  ████████████████ ║
║ Elevated Surface    #2a3548  ████████████████ ║
╠═══════════════════════════════════════════════╣
║ Accent Blue         #4a90e2  ████████████████ ║
║ Accent Green        #5fd35f  ████████████████ ║
║ Accent Gold         #f4c430  ████████████████ ║
║ Accent Purple       #9b59b6  ████████████████ ║
║ Accent Red          #e74c3c  ████████████████ ║
╚═══════════════════════════════════════════════╝
```

### Gradients
```
Primary Button:    [#5fd35f → #4a90e2]
                   Green ─────────→ Blue

Header Text:       [#4a90e2 → #9b59b6 → #f4c430]
                   Blue ─→ Purple ─→ Gold

Card Accent:       [#4a90e2 → #9b59b6 → #f4c430]
                   (Bottom border line)
```

---

## Animation States

### Button Hover States
```
Default State:
┌────────────────────┐
│  Create Server     │  No glow
└────────────────────┘

Hover State:
┌────────────────────┐
│  Create Server     │  ← Glow effect
└────────────────────┘  ← Shimmer animation

Loading State:
┌────────────────────┐
│  ⟳ Creating...     │  ← Spinner
└────────────────────┘
```

### Card Hover Animation
```
Default:                    Hover:
┌─────────────────┐        ┌─────────────────┐
│ 🌍 Server Name  │        │ 🌍 Server Name  │
│                 │   →    │   (Brighter)    │
│                 │        │                 │
└─────────────────┘        └─────────────────┘
                           ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
                           Gradient line appears
```

### Star Animation
```
Frame 1:  ✦ (dim)
Frame 2:  ✧ (medium)
Frame 3:  ★ (bright)
Frame 4:  ✧ (medium)
Frame 5:  ✦ (dim)
(Repeats)
```

---

## Responsive Layouts

### Mobile (< 640px)
```
┌───────────────┐
│  Header       │
├───────────────┤
│               │
│  ┌─────────┐  │
│  │ Server  │  │
│  │  Card   │  │
│  └─────────┘  │
│               │
│  ┌─────────┐  │
│  │ Server  │  │
│  │  Card   │  │
│  └─────────┘  │
│               │
│  ┌─────────┐  │
│  │ Server  │  │
│  │  Card   │  │
│  └─────────┘  │
│               │
└───────────────┘
(1 column)
```

### Tablet (640-1024px)
```
┌─────────────────────────┐
│  Header                 │
├─────────────────────────┤
│                         │
│  ┌─────────┐ ┌────────┐│
│  │ Server  │ │ Server ││
│  │  Card   │ │  Card  ││
│  └─────────┘ └────────┘│
│                         │
│  ┌─────────┐ ┌────────┐│
│  │ Server  │ │ Server ││
│  │  Card   │ │  Card  ││
│  └─────────┘ └────────┘│
│                         │
└─────────────────────────┘
(2 columns)
```

### Desktop (> 1024px)
```
┌──────────────────────────────────────┐
│  Header                              │
├──────────────────────────────────────┤
│                                      │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │ Server │ │ Server │ │ Server │  │
│  │  Card  │ │  Card  │ │  Card  │  │
│  └────────┘ └────────┘ └────────┘  │
│                                      │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │ Server │ │ Server │ │ Server │  │
│  │  Card  │ │  Card  │ │  Card  │  │
│  └────────┘ └────────┘ └────────┘  │
│                                      │
└──────────────────────────────────────┘
(3 columns)
```

---

## Status Indicators

```
RUNNING   Green (#5fd35f)    Active server, ready to connect
PENDING   Gold (#f4c430)     Deploying, please wait
STOPPED   Gray (#6b7280)     Server is offline
ERROR     Red (#e74c3c)      Something went wrong
```

---

## Special Effects

### Glow Effect Visualization
```
Normal Button:
┌──────────────┐
│   Button     │
└──────────────┘

With Glow:
    ╭─────╮
  ╭─────────╮
┌──────────────┐
│   Button     │
└──────────────┘
  ╰─────────╯
    ╰─────╯
(Blue/Green/Gold aura)
```

### Shimmer Animation
```
Time 0s:   ░░░░░░░░░░
Time 1s:   ▓░░░░░░░░░
Time 2s:   ░▓░░░░░░░░
Time 3s:   ░░▓░░░░░░░
Time 4s:   ░░░▓░░░░░░
           (continues →)
```

---

## Typography Hierarchy

```
╔═══════════════════════════════════════╗
║ Hero Title      5xl  Bold  Gradient   ║
║ Section Title   2xl  Bold  White      ║
║ Card Title      xl   Bold  White      ║
║ Body Text       base Normal Gray-300  ║
║ Caption         sm   Normal Gray-400  ║
║ Code/ID         xs   Mono  Gray-300   ║
╚═══════════════════════════════════════╝
```

---

## Interactive Elements

### Form Inputs
```
Default:
┌─────────────────────────────┐
│ Enter text...               │
└─────────────────────────────┘
(Border: #4a90e2/30)

Focused:
┌═════════════════════════════┐
│ Enter text...█              │
└═════════════════════════════┘
(Border: #4a90e2, Glow ring)
```

### Dropdown
```
┌─────────────────────────────┐
│ Latest                    ▼ │
├─────────────────────────────┤
│ Latest                      │
│ 1.4.4                       │
│ 1.4.3                       │
└─────────────────────────────┘
```

---

## Theme Consistency

Every element follows the Terraria theme:
- Magical glow effects (like enchanted items)
- Dark space background (night sky)
- Twinkling stars (environmental effect)
- Vibrant gradients (legendary item names)
- Color-coded states (buff/debuff indicators)
- Smooth animations (fluid gameplay)

---

**This visual guide helps you understand the design system at a glance!**
