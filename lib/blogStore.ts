/* Shared persistence for the Blogify editor + public blog pages. */

export type PublishStatus = "draft" | "schedule" | "published";

export interface StoredPost {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  excerpt: string;
  featuredImage: string | null;
  status: PublishStatus;
  allowComments: boolean;
  newsletter: boolean;
  socialSharing: boolean;
  date: string;
}

export interface CommentItem {
  id: number;
  postId: number;
  author: string;
  text: string;
  date: string;
  approved: boolean;
}

export interface EditorSettings {
  siteName: string;
  tagline: string;
  allowCommentsDefault: boolean;
  newsletterDefault: boolean;
  socialSharingDefault: boolean;
  autosave: boolean;
}

export const STORE_KEY = "blogify_posts";
export const SETTINGS_KEY = "blogify_settings";
export const COMMENTS_KEY = "blogify_comments";
export const CATEGORIES_KEY = "blogify_categories";

export const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200";

export const DEFAULT_CATEGORIES = [
  "Technology",
  "Lifestyle",
  "Productivity",
  "Design",
  "Travel",
  "Business",
];

export const statusLabel: Record<PublishStatus, string> = {
  draft: "Draft",
  schedule: "Scheduled",
  published: "Published",
};

const seedPosts = (): StoredPost[] => [
  {
    id: 1,
    title: "Future of Fintech",
    content:
      "The intersection of finance and technology, often referred to as Fintech, is currently undergoing a massive transformation. Artificial Intelligence (AI) is personalizing banking experiences, while Blockchain technology is securing transactions and reducing costs.\n\nIn this blog, we delve deep into the core shifts that will define the next decade of financial interaction. From decentralized finance (DeFi) to the integration of machine learning in risk assessment, the landscape is shifting from traditional legacy systems to agile, cloud-native solutions.",
    category: "Technology",
    tags: ["fintech", "ai", "blockchain"],
    excerpt: "Exploring how AI and blockchain are reshaping financial services",
    featuredImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
    status: "published",
    allowComments: true,
    newsletter: false,
    socialSharing: true,
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 2,
    title: "The Rise of Remote Work",
    content:
      "Remote work is no longer just a perk; it's a fundamental shift in how we approach our professional lives. From digital nomads to suburban parents, the flexibility of distributed work is changing urban landscapes and corporate cultures alike.\n\nCompanies that embrace asynchronous communication and outcome-based performance tracking are finding themselves at a significant advantage in the global talent war.",
    category: "Productivity",
    tags: ["remote", "work", "culture"],
    excerpt: "How the pandemic accelerated the shift to distributed teams",
    featuredImage:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200",
    status: "published",
    allowComments: true,
    newsletter: true,
    socialSharing: true,
    date: new Date(Date.now() - 172800000).toISOString(),
  },
];

export function loadPosts(): StoredPost[] {
  try {
    const stored = localStorage.getItem(STORE_KEY);
    if (stored) return JSON.parse(stored) as StoredPost[];
  } catch {
    /* corrupted store -> reseed */
  }
  const seeds = seedPosts();
  localStorage.setItem(STORE_KEY, JSON.stringify(seeds));
  return seeds;
}

export function persistPosts(posts: StoredPost[]) {
  localStorage.setItem(STORE_KEY, JSON.stringify(posts));
}

export function blankPost(settings?: EditorSettings): StoredPost {
  const s = settings ?? loadSettings();
  return {
    id: Date.now(),
    title: "",
    content: "",
    category: "",
    tags: [],
    excerpt: "",
    featuredImage: null,
    status: "draft",
    allowComments: s.allowCommentsDefault,
    newsletter: s.newsletterDefault,
    socialSharing: s.socialSharingDefault,
    date: new Date().toISOString(),
  };
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function wordCount(content: string) {
  return content.trim() ? content.trim().split(/\s+/).length : 0;
}

export function readTime(content: string) {
  return Math.max(1, Math.ceil(wordCount(content) / 200));
}

/* ---------------- categories ---------------- */

export function getCategories(): string[] {
  try {
    const stored = localStorage.getItem(CATEGORIES_KEY);
    const custom = stored ? (JSON.parse(stored) as string[]) : [];
    return [...DEFAULT_CATEGORIES, ...custom.filter((c) => !DEFAULT_CATEGORIES.includes(c))];
  } catch {
    return [...DEFAULT_CATEGORIES];
  }
}

export function addCategory(name: string) {
  const current = getCategories();
  if (current.some((c) => c.toLowerCase() === name.toLowerCase())) return false;
  const custom = current.filter((c) => !DEFAULT_CATEGORIES.includes(c));
  custom.push(name);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(custom));
  return true;
}

export function removeCategory(name: string) {
  const custom = getCategories().filter(
    (c) => !DEFAULT_CATEGORIES.includes(c) && c !== name
  );
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(custom));
}

/* ---------------- settings ---------------- */

export const defaultSettings: EditorSettings = {
  siteName: "Blogify",
  tagline: "Stories & insights for curious minds",
  allowCommentsDefault: true,
  newsletterDefault: false,
  socialSharingDefault: false,
  autosave: true,
};

export function loadSettings(): EditorSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
  } catch {
    /* fall through */
  }
  return { ...defaultSettings };
}

export function persistSettings(settings: EditorSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/* ---------------- comments ---------------- */

const seedComments = (): CommentItem[] => [
  {
    id: 1,
    postId: 1,
    author: "Priya Sharma",
    text: "Great breakdown of how AI is personalizing banking — the DeFi angle was especially useful.",
    date: new Date(Date.now() - 3600000).toISOString(),
    approved: true,
  },
  {
    id: 2,
    postId: 1,
    author: "Daniel Kim",
    text: "Would love a follow-up on how smaller firms can adopt these cloud-native tools.",
    date: new Date(Date.now() - 7200000).toISOString(),
    approved: false,
  },
  {
    id: 3,
    postId: 2,
    author: "Amelia Ross",
    text: "The asynchronous communication tip changed how our team runs standups. Thank you!",
    date: new Date(Date.now() - 10800000).toISOString(),
    approved: true,
  },
];

export function loadComments(): CommentItem[] {
  try {
    const stored = localStorage.getItem(COMMENTS_KEY);
    if (stored) return JSON.parse(stored) as CommentItem[];
  } catch {
    /* fall through */
  }
  const seeds = seedComments();
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(seeds));
  return seeds;
}

export function persistComments(comments: CommentItem[]) {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}
