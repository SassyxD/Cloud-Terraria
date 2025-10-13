# Cloud Terraria - Frontend Design System

## 🎨 Color Palette

### Primary Colors
```css
/* Backgrounds */
--bg-primary: #0a1628      /* Deep space blue */
--bg-secondary: #1a2537    /* Card background */
--bg-tertiary: #2a3548     /* Elevated surfaces */

/* Accents */
--accent-blue: #4a90e2     /* Primary actions */
--accent-green: #5fd35f    /* Success states */
--accent-gold: #f4c430     /* Premium features */
--accent-purple: #9b59b6   /* Secondary actions */
--accent-red: #e74c3c      /* Errors/warnings */
--accent-orange: #ff8c42   /* Highlights */
```

## 🎭 Component Variants

### Buttons

#### Primary Button (Create Server)
- Gradient: Green to Blue (`#5fd35f` → `#4a90e2`)
- Glow effect on hover
- Shimmer animation
- Size: Large (px-8 py-4)

#### Secondary Button
- Background: `#2a3548`
- Border: `#4a90e2` with 30% opacity
- Hover: Slightly lighter background

#### Danger Button
- Hover: Red tint with red border

### Cards

#### Server Card
- Background: `#1a2537`
- Border: `#2a3548` (default) → `#4a90e2` (hover)
- Gradient overlay on hover
- Accent line at bottom (gradient from blue → purple → gold)

#### Feature Card (Landing Page)
- Background: `#1a2537`
- Border matches feature color (blue/purple/gold)
- Glow effect matching border color

### Status Badges

```
Running:  🟢 Green background (#5fd35f)
Pending:  🟡 Yellow background (#f4c430)
Stopped:  ⚫ Gray background (#6b7280)
Error:    🔴 Red background (#e74c3c)
```

## 📐 Layout Structure

### Header
- Fixed top navigation
- Semi-transparent background with blur
- Border bottom
- Logo + Title + User Profile + Actions

### Main Content
- Container with max-width
- Responsive padding (px-4 on mobile, more on desktop)
- Centered alignment

### Grid Layout
- 1 column on mobile
- 2 columns on tablet (md:)
- 3 columns on desktop (lg:)
- Gap: 6 (1.5rem)

## ✨ Animations

### Entrance Animations
```css
.animate-in {
  animation: fade-in 0.2s ease-out, zoom-in 0.2s ease-out;
}
```

### Background Effects
- **Stars**: 50 randomly positioned dots with twinkle animation
- **Radial Gradients**: Subtle blue and purple glows

### Interactive Effects
- **Hover**: Scale, brightness, glow changes
- **Active**: Slight scale down
- **Focus**: Ring with accent color

## 📱 Responsive Breakpoints

```
Mobile:   < 640px   (1 column layout)
Tablet:   640-1024px (2 column layout)
Desktop:  > 1024px   (3 column layout)
```

## 🎯 Typography

### Headings
- Main Title: 4xl-5xl, gradient text
- Section Title: 2xl, white/gradient
- Card Title: xl, white
- Labels: sm, gray-300

### Font Family
- Geist Sans (primary)
- Monospace for code/IDs

## 🌟 Special Effects

### Glow Classes
```css
.terraria-glow        /* Blue glow for primary elements */
.terraria-glow-green  /* Green glow for success */
.terraria-glow-gold   /* Gold glow for premium */
```

### Shimmer Effect
```css
.shimmer  /* Animated gradient sweep */
```

### Custom Scrollbar
- Track: `#1a2537`
- Thumb: `#4a90e2`
- Width: 12px
- Rounded corners

## 🎮 Theme Inspiration

The design draws inspiration from Terraria's aesthetic:
- **Dark Background**: Like the night sky in Terraria
- **Vibrant Accents**: Reminiscent of magical items and ores
- **Stars**: The starry night background
- **Glow Effects**: Similar to item glow and lighting effects
- **Gradient Text**: Like legendary/mythical item names

## 🔧 Usage Examples

### Creating a Glowing Button
```tsx
<button className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#5fd35f] to-[#4a90e2] hover:from-[#6fe46f] hover:to-[#5fa3e8] transition-all font-bold text-lg shadow-lg terraria-glow-green">
  Create Server
</button>
```

### Creating a Card
```tsx
<div className="rounded-xl bg-[#1a2537] border border-[#2a3548] hover:border-[#4a90e2] transition-all p-6">
  {/* Content */}
</div>
```

### Adding Star Background
```tsx
{[...Array(50)].map((_, i) => (
  <div
    key={i}
    className="star absolute w-1 h-1 bg-white rounded-full"
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
    }}
  />
))}
```

## 🎨 Gradient Combinations

### Primary Gradient (Blue → Purple)
```css
from-[#4a90e2] to-[#9b59b6]
```

### Success Gradient (Green → Blue)
```css
from-[#5fd35f] to-[#4a90e2]
```

### Premium Gradient (Blue → Purple → Gold)
```css
from-[#4a90e2] via-[#9b59b6] to-[#f4c430]
```

## 🌈 Accessibility

- Contrast ratios meet WCAG AA standards
- Focus indicators on all interactive elements
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly labels

## 📦 Component Library

All reusable components are in `src/components/`:
- `CreateServerButton.tsx` - Server creation modal
- `ServerCard.tsx` - Server display card
- `Loading.tsx` - Loading states and spinners

## 🎬 Animation Timing

- Quick transitions: 0.2s
- Standard transitions: 0.3s
- Background animations: 3s (twinkle), 20s (shimmer)
- Hover effects: ease-out
- Entrance animations: ease-out
