# CA Monk - Modern Blog Platform

A modern, responsive blog application built with React, TypeScript, and Vite. Features a real-time backend powered by JSON Server with full CRUD capabilities.

## ✨ Features

- **📱 Responsive Design** - Beautiful UI that works on all devices using Tailwind CSS
- **📚 Blog Management** - Create, read, update, and delete blog posts
- **🎯 Real-time Updates** - Instant synchronization between frontend and backend
- **🗂️ Category Organization** - Organize blogs by multiple categories
- **🖼️ Image Support** - Upload and display cover images
- **⚡ Fast Performance** - Built with Vite for lightning-fast development and builds
- **🎨 Modern UI** - Clean, professional design with smooth animations
- **💾 Data Persistence** - All data persisted in JSON Server database

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Data fetching and caching
- **Axios** - HTTP client

### Backend
- **JSON Server** - Mock REST API
- **Node.js** - JavaScript runtime

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## 🚀 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd blog
```

2. **Install dependencies**
```bash
npm install
```

## 💻 Running the Project

### Start the development server and backend together

Open two terminal windows:

**Terminal 1 - Start the frontend (Vite dev server)**
```bash
npm run dev
```
Frontend runs on: `http://localhost:5173/`

**Terminal 2 - Start the backend (JSON Server)**
```bash
npm run server
```
Backend API runs on: `http://localhost:3001/`

## 📁 Project Structure

```
blog/
├── components/
│   ├── BlogCard.tsx          # Blog card component for listing
│   ├── BlogDetail.tsx         # Detailed blog view component
│   └── CreateBlogForm.tsx     # Form for creating new blogs
├── App.tsx                    # Main application component
├── api.ts                     # API integration and data fetching
├── types.ts                   # TypeScript type definitions
├── index.tsx                  # React entry point
├── index.html                 # HTML template
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── db.json                    # JSON Server database
└── package.json               # Dependencies and scripts
```

## 📡 API Endpoints

### Get All Blogs
```
GET http://localhost:3001/blogs
```
Returns array of all blogs

### Get Blog by ID
```
GET http://localhost:3001/blogs/:id
```
Returns a single blog by ID

### Create New Blog
```
POST http://localhost:3001/blogs
Content-Type: application/json

{
  "title": "Blog Title",
  "category": ["TECH", "FINANCE"],
  "description": "Short description",
  "content": "Full blog content",
  "coverImage": "https://image-url.com/image.jpg",
  "date": "2026-01-19T10:00:00.000Z"
}
```

### Update Blog
```
PATCH http://localhost:3001/blogs/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}
```

### Delete Blog
```
DELETE http://localhost:3001/blogs/:id
```

## 🗄️ Database Schema

Each blog object has the following structure:

```json
{
  "id": 1,
  "title": "Future of Fintech",
  "category": ["FINANCE", "TECH"],
  "description": "Exploring how AI and blockchain are reshaping financial services",
  "date": "2026-01-11T09:12:45.120Z",
  "coverImage": "https://images.unsplash.com/...",
  "content": "Full blog content..."
}
```

## 🏗️ Build for Production

```bash
npm run build
```

Creates an optimized production build in the `dist/` directory.

## 👀 Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing.

## 🎯 Key Components

### App.tsx
Main application component that handles:
- Blog list display
- Blog selection and detail view
- Create, edit, and delete operations
- Modal management for forms

### BlogCard.tsx
Displays individual blog cards in the sidebar with:
- Blog title and category
- Description preview
- Interactive hover effects

### BlogDetail.tsx
Shows detailed blog view with:
- Cover image
- Full blog content
- Author information
- Share functionality

### CreateBlogForm.tsx
Form for creating new blogs with:
- Title and description inputs
- Image upload
- Content editor
- Category selection

## 🔄 Data Flow

1. **Fetch**: `fetchBlogs()` retrieves all blogs from JSON Server
2. **Display**: App component displays list of blogs
3. **Select**: User clicks blog to view details
4. **Fetch Detail**: `fetchBlogById()` retrieves selected blog
5. **Create**: User submits form → `createBlog()` posts to server
6. **Update**: User edits blog → `updateBlog()` patches server
7. **Delete**: User confirms delete → `deleteBlog()` removes from server
8. **Refetch**: Query cache invalidates, fresh data fetched

## 🔌 Fallback Mechanism

If JSON Server is not available, the app automatically uses localStorage as a fallback:
- Reads initial blogs from localStorage
- Stores new/updated blogs in localStorage
- Ensures app functionality even without backend

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (single column layout)
- **Tablet**: 768px - 1024px (optimized padding)
- **Desktop**: > 1024px (full layout with sidebar)

## 🎨 Color Scheme

- **Primary**: #25D366 (Green)
- **Dark**: #1a1a1a (Almost Black)
- **Light**: #f8f9fb (Off-white)
- **Border**: #e2e8f0 (Light Gray)

## 📝 Customization

### Add More Blogs
Edit `db.json` and add new blog objects to the `blogs` array.

### Modify Styling
Update Tailwind classes in component files or customize in `tailwind.config.js`.

### Add Features
Extend components and add new endpoints as needed.

## 🐛 Troubleshooting

### Port Already in Use
If ports 5173 or 3001 are already in use:
- Change port in `vite.config.ts` for frontend
- Change port in `package.json` server script for backend

### CORS Issues
JSON Server and frontend are on different ports. CORS is handled by default in JSON Server.

### Data Not Loading
1. Verify JSON Server is running on `http://localhost:3001`
2. Check browser console for errors
3. Ensure `db.json` is properly formatted

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)
- [React Query](https://tanstack.com/query/latest)
- [JSON Server](https://github.com/typicode/json-server)

## 🔄 CI/CD Pipeline

This project uses GitHub Actions for continuous integration and continuous deployment.

### Workflows

**1. Test (`test.yml`)** — Runs on every push and pull request to `main`:
- Installs dependencies (`npm ci`)
- Installs Playwright Chromium (`npx playwright install --with-deps chromium`)
- Runs unit tests with Vitest
- Runs E2E tests with Playwright
- Uploads the Playwright HTML report as an artifact on failure

**2. Deploy (`deploy.yml`)** — Runs on every push to `main` (and manual dispatch):
- Builds the production bundle with the correct GitHub Pages `base` path
- Uploads the `dist/` folder as a Pages artifact
- Deploys to GitHub Pages

### Live Site

The app is deployed to GitHub Pages at:
```
https://himanshu201031.github.io/CA-Monk-Blog/
```

> **Note:** The deployed site uses the app's automatic localStorage fallback (no live JSON Server backend), so it works fully standalone in the browser.

### Local E2E Testing

```bash
npm run test:e2e          # headless Chromium
npm run test:e2e:headed   # run in a visible browser
npm run test:e2e:ui       # interactive Playwright UI
```

### CI Environment

- Node.js v20
- `ubuntu-latest` runner
- Test job timeout: 15 minutes

## 📄 License

This project is open source and available under the MIT License.



---

**Happy Blogging! 📝**
