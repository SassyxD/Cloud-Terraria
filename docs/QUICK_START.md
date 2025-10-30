# Quick Start Guide - Cloud Terraria

## Getting Started in 3 Steps

### 1️⃣ Install Dependencies
```bash
pnpm install
```

### 2️⃣ Set Up Environment Variables
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Provider (Discord/GitHub/Google)
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# AWS (if you have Lambda configured)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
```

### 3️⃣ Initialize Database
```bash
pnpm db:push
```

### 4️⃣ Run Development Server
```bash
pnpm dev
```

Visit http://localhost:3000 to see your beautiful new Terraria-themed frontend!

---

## First Time Setup

### Sign In
1. Click "Sign In" in the top right
2. Choose your OAuth provider
3. Authorize the application

### Create Your First Server
1. Click "Create New Server" button
2. Enter details:
   - **World Name**: e.g., "Adventure World"
   - **Version**: Select from dropdown (default: latest)
   - **Port**: Leave default (7777) or customize
3. Click "Create Server"
4. Wait for deployment (status will show as Pending)

### View Your Servers
- All servers display in a grid
- Each card shows:
  - World name
  - Version
  - Port number
  - Instance ID (when deployed)
  - Creation date
  - Status indicator

---

## Using the Interface

### Header Navigation
- **Logo**: Returns to home
- **Profile**: Shows your user info
- **Sign Out**: End your session

### Dashboard Features
- **Server Count**: Total servers in top right
- **Grid Layout**: Responsive (1-3 columns)
- **Search**: (Coming soon) Filter servers
- **Sort**: (Coming soon) Order by date/name

### Server Actions
- **Connect**: Join server when running
- **Settings**: Configure server options
- **More options**: (Future) Start/stop/delete

---

## Development Commands

```bash
# Development
pnpm dev              # Start dev server with Turbo
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:push          # Push schema changes
pnpm db:studio        # Open Prisma Studio
pnpm db:generate      # Generate Prisma client

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint errors
pnpm typecheck        # Run TypeScript check
pnpm format:check     # Check Prettier formatting
pnpm format:write     # Format with Prettier
```

---

## Customization Tips

### Change Colors
Edit `src/styles/globals.css`:
```css
/* Change primary accent */
--accent-blue: #4a90e2;  /* Your color here */
```

### Modify Animations
Adjust animation speeds in `globals.css`:
```css
@keyframes twinkle {
  /* Modify timing */
}
```

### Add More Features
Create new components in `src/components/`:
```tsx
// src/components/MyComponent.tsx
export function MyComponent() {
  return <div>...</div>;
}
```

---

## 📁 Project Structure

```
src/
├── app/                  # Next.js app router
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── api/             # API routes
├── components/          # Reusable components
│   ├── CreateServerButton.tsx
│   ├── ServerCard.tsx
│   ├── Loading.tsx
│   └── EmptyState.tsx
├── server/              # Backend logic
│   ├── api/            # tRPC routers
│   ├── auth/           # NextAuth config
│   └── aws/            # AWS Lambda client
├── styles/             # Global styles
│   └── globals.css
└── trpc/               # tRPC client setup
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
```

### Database Issues
```bash
# Reset database
pnpm db:push --force-reset
```

### Auth Not Working
1. Check `.env` file exists
2. Verify OAuth credentials
3. Ensure NEXTAUTH_URL is correct

### Styles Not Loading
1. Clear `.next` cache
2. Restart dev server
3. Check Tailwind config

---

## Pro Tips

### Performance
- Use server components when possible
- Lazy load heavy components
- Optimize images with Next/Image

### SEO
- Add metadata to pages
- Use semantic HTML
- Include alt text on images

### Security
- Never commit `.env` file
- Use environment variables
- Validate user input

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [tRPC](https://trpc.io/docs)
- [Prisma](https://www.prisma.io/docs)
- [NextAuth](https://next-auth.js.org/)

---

## What's Next?

Now that your frontend is set up, you can:

1. **Configure AWS** - Set up Lambda and EC2
2. **Add OAuth** - Configure Discord/GitHub auth
3. **Deploy** - Push to Vercel or your hosting
4. **Customize** - Make it your own!

Happy coding!

---

**Need help?** Check the docs or create an issue!
