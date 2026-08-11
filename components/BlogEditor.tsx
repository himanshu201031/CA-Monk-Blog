import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import "./BlogEditor.css";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_IMAGE,
  STORE_KEY,
  addCategory,
  blankPost,
  formatDate,
  getCategories,
  loadComments,
  loadPosts,
  loadSettings,
  persistComments,
  persistPosts,
  persistSettings,
  readTime,
  removeCategory,
  statusLabel,
  wordCount,
  type CommentItem,
  type EditorSettings,
  type StoredPost,
} from "../lib/blogStore";

type MainView =
  | "dashboard"
  | "posts"
  | "drafts"
  | "scheduled"
  | "published"
  | "categories"
  | "tags"
  | "analytics"
  | "comments"
  | "settings"
  | "editor";

const navItems = [
  { icon: "⌂", label: "Dashboard", view: "dashboard" as MainView },
  { icon: "▤", label: "All Posts", view: "posts" as MainView },
  { icon: "◫", label: "Drafts", view: "drafts" as MainView },
  { icon: "□", label: "Scheduled", view: "scheduled" as MainView },
  { icon: "✓", label: "Published", view: "published" as MainView },
  { icon: "▦", label: "Categories", view: "categories" as MainView },
  { icon: "◇", label: "Tags", view: "tags" as MainView },
  { icon: "▥", label: "Analytics", view: "analytics" as MainView },
  { icon: "▢", label: "Comments", view: "comments" as MainView },
  { icon: "⚙", label: "Settings", view: "settings" as MainView },
];

const viewTitles: Record<Exclude<MainView, "editor">, { title: string; sub: string }> = {
  dashboard: { title: "Dashboard", sub: "Overview of your blog at a glance" },
  posts: { title: "All Posts", sub: "Every post, draft or published" },
  drafts: { title: "Drafts", sub: "Ideas you're still working on" },
  scheduled: { title: "Scheduled", sub: "Posts queued for later" },
  published: { title: "Published", sub: "Live posts on your blog" },
  categories: { title: "Categories", sub: "Organize posts by topic" },
  tags: { title: "Tags", sub: "Fine-grained topics across posts" },
  analytics: { title: "Analytics", sub: "How your writing adds up" },
  comments: { title: "Comments", sub: "Moderate reader conversations" },
  settings: { title: "Settings", sub: "Site preferences and defaults" },
};

export default function BlogEditor() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const initialPostId = params.id ? Number(params.id) : undefined;
  const initialCategory = searchParams.get("category") ?? undefined;
  const initialSearch = searchParams.get("q") ?? undefined;
  const searchFocus = searchParams.get("focus") === "1";

  const [posts, setPosts] = useState<StoredPost[]>(() => loadPosts());
  const [post, setPost] = useState<StoredPost>(() => blankPost());
  const [view, setView] = useState<MainView>("editor");
  const [tagInput, setTagInput] = useState("");
  const [saved, setSaved] = useState(true);
  const [showSeo, setShowSeo] = useState(false);
  const [showPublishMenu, setShowPublishMenu] = useState(false);
  const [search, setSearch] = useState(initialSearch ?? "");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<StoredPost | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [settings, setSettings] = useState<EditorSettings>(() => loadSettings());
  const [comments, setComments] = useState<CommentItem[]>(() => loadComments());
  const [commentFilter, setCommentFilter] = useState<"all" | "pending" | "approved">("all");
  const [customCategories, setCustomCategories] = useState<string[]>(() =>
    getCategories().filter((c) => !DEFAULT_CATEGORIES.includes(c))
  );
  const [newCategory, setNewCategory] = useState("");

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const categories = useMemo(
    () => [...DEFAULT_CATEGORIES, ...customCategories],
    [customCategories]
  );

  const words = useMemo(() => wordCount(post.content), [post.content]);
  const characters = post.content.length;

  /* ---------- derived ---------- */
  const statusPosts = (status: StoredPost["status"]) =>
    posts.filter((p) => p.status === status);

  const counts = useMemo(
    () => ({
      draft: statusPosts("draft").length,
      schedule: statusPosts("schedule").length,
      published: statusPosts("published").length,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [posts]
  );

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts
      .filter((p) => {
        if (!q) return true;
        return (
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [posts, search]);

  const viewPosts = useMemo(() => {
    if (view === "drafts") return filteredPosts.filter((p) => p.status === "draft");
    if (view === "scheduled") return filteredPosts.filter((p) => p.status === "schedule");
    if (view === "published") return filteredPosts.filter((p) => p.status === "published");
    return filteredPosts;
  }, [view, filteredPosts]);

  /* ---------- initial props ---------- */
  useEffect(() => {
    if (initialCategory) {
      setSearch(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (searchFocus) searchRef.current?.focus();
  }, [searchFocus]);

  useEffect(() => {
    if (initialPostId) {
      const p = posts.find((x) => x.id === initialPostId);
      if (p) {
        setPost({ ...p });
        setSaved(true);
        setView("editor");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPostId]);

  /* ---------- toast ---------- */
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  /* ---------- mutations ---------- */
  const updatePost = <K extends keyof StoredPost>(key: K, value: StoredPost[K]) => {
    setPost((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const upsert = (next: StoredPost) => {
    const exists = posts.some((p) => p.id === next.id);
    const updated = exists
      ? posts.map((p) => (p.id === next.id ? next : p))
      : [next, ...posts];
    setPosts(updated);
    persistPosts(updated);
  };

  const commitPost = (status: StoredPost["status"]) => {
    if (!post.title.trim() || !post.content.trim()) return;
    const next: StoredPost = {
      ...post,
      status,
      featuredImage: post.featuredImage || DEFAULT_IMAGE,
      date: post.date || new Date().toISOString(),
    };
    upsert(next);
    setPost(next);
    setSaved(true);
  };

  /* Autosave — persists edits while typing */
  useEffect(() => {
    if (saved || !settings.autosave) return;
    const timer = setTimeout(() => {
      if (post.title.trim() || post.content.trim()) {
        upsert({ ...post, featuredImage: post.featuredImage || DEFAULT_IMAGE });
      }
      setSaved(true);
    }, 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post, saved, settings.autosave]);

  const selectPost = (p: StoredPost) => {
    setPost({ ...p });
    setTagInput("");
    setSaved(true);
    setView("editor");
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const newPost = () => {
    setPost(blankPost(settings));
    setTagInput("");
    setSaved(false);
    setView("editor");
    setSidebarOpen(false);
    setToast("New draft created");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const publishPost = () => {
    if (!post.title.trim()) return setToast("Please add a title first");
    if (!post.content.trim()) return setToast("Please write some content first");
    commitPost("published");
    setShowPublishMenu(false);
    setToast("Post published successfully 🎉");
  };

  const saveDraft = () => {
    if (!post.title.trim() && !post.content.trim()) return setToast("Nothing to save yet");
    commitPost("draft");
    setShowPublishMenu(false);
    setToast("Draft saved");
  };

  const schedulePost = () => {
    if (!post.title.trim()) return setToast("Please add a title first");
    commitPost("schedule");
    setShowPublishMenu(false);
    setToast("Post scheduled");
  };

  const removePost = (target: StoredPost | null = confirmDelete) => {
    if (!target) return;
    const next = posts.filter((p) => p.id !== target.id);
    setPosts(next);
    persistPosts(next);
    if (post.id === target.id) {
      setPost(blankPost(settings));
      setSaved(true);
    }
    setToast("Post deleted");
    setConfirmDelete(null);
  };

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, "");
    if (!tag) return;
    if (!post.tags.includes(tag)) updatePost("tags", [...post.tags, tag]);
    setTagInput("");
  };

  const removeTag = (tag: string) =>
    updatePost("tags", post.tags.filter((item) => item !== tag));

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updatePost("featuredImage", reader.result as string);
    reader.onerror = () => setToast("Could not read that image");
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const insertFormatting = (type: string) => {
    const textarea = document.getElementById("blog-content") as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = post.content.slice(start, end);

    let formattedText = selectedText;
    switch (type) {
      case "bold":
        formattedText = `**${selectedText || "bold text"}**`;
        break;
      case "italic":
        formattedText = `*${selectedText || "italic text"}*`;
        break;
      case "heading":
        formattedText = `## ${selectedText || "Heading"}`;
        break;
      case "quote":
        formattedText = `> ${selectedText || "Quote"}`;
        break;
      case "code":
        formattedText = `\`${selectedText || "code"}\``;
        break;
      case "link":
        formattedText = `[${selectedText || "link text"}](https://example.com)`;
        break;
      case "bullet":
        formattedText = `- ${selectedText || "List item"}`;
        break;
      case "number":
        formattedText = `1. ${selectedText || "List item"}`;
        break;
      default:
        break;
    }

    const newContent =
      post.content.slice(0, start) + formattedText + post.content.slice(end);
    updatePost("content", newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + formattedText.length);
    }, 0);
  };

  const slug =
    post.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "your-post-slug";

  const checklist = [
    { done: !!post.title, text: "Add a title" },
    { done: !!post.excerpt, text: "Add an excerpt" },
    { done: !!post.featuredImage, text: "Add a featured image" },
    { done: post.tags.length > 0, text: "Add at least one tag" },
    { done: !!post.category, text: "Select a category" },
    { done: words >= 300, text: "Content is at least 300 words" },
  ];

  /* ---------- tags / categories / analytics / comments derived ---------- */
  const allTags = useMemo(() => {
    const map = new Map<string, number>();
    posts.forEach((p) => p.tags.forEach((t) => map.set(t, (map.get(t) ?? 0) + 1)));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [posts]);

  const categoryCounts = useMemo(
    () =>
      categories
        .map((c) => ({ name: c, count: posts.filter((p) => p.category === c).length }))
        .sort((a, b) => b.count - a.count),
    [categories, posts]
  );

  const totalWords = useMemo(() => posts.reduce((sum, p) => sum + wordCount(p.content), 0), [posts]);

  const visibleComments = useMemo(
    () =>
      comments
        .filter((c) => (commentFilter === "all" ? true : commentFilter === "approved" ? c.approved : !c.approved))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [comments, commentFilter]
  );

  const postTitle = (id: number) => posts.find((p) => p.id === id)?.title || "Untitled";

  /* ---------- settings ---------- */
  const updateSettings = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    persistSettings(next);
  };

  return (
    <div className={`blog-app ${sidebarOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />

      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✦</div>
          <span>{settings.siteName || "Blogify"}</span>
        </div>

        <button className="new-post-btn" onClick={newPost}>
          <span>＋</span>
          New Post
        </button>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const count =
              item.label === "Drafts"
                ? counts.draft
                : item.label === "Scheduled"
                ? counts.schedule
                : item.label === "Published"
                ? counts.published
                : null;
            const active = view === item.view;
            return (
              <button
                key={item.label}
                className={`nav-item ${active ? "active" : ""}`}
                onClick={() => {
                  setView(item.view);
                  setSidebarOpen(false);
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {count !== null && <span className="nav-count">{count}</span>}
              </button>
            );
          })}
        </nav>

        {/* Posts panel */}
        <div className="posts-panel">
          <div className="posts-panel-header">
            <strong>Posts</strong>
            <strong>{filteredPosts.length}</strong>
          </div>
          <div className="posts-search">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search posts..."
              aria-label="Search posts"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="posts-list">
            {filteredPosts.length === 0 ? (
              <div className="posts-empty">
                {search.trim() ? "No posts match your search" : "No posts here yet"}
                <br />
                Hit “New Post” to get started.
              </div>
            ) : (
              filteredPosts.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  role="button"
                  tabIndex={0}
                  onClick={() => selectPost(p)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      selectPost(p);
                    }
                  }}
                  className={`post-item ${post.id === p.id && view === "editor" ? "active" : ""}`}
                >
                  <span className="post-item-title">{p.title || "Untitled post"}</span>
                  <span className="post-item-meta">
                    <span className={`status-dot ${p.status}`} />
                    {statusLabel[p.status]} · {formatDate(p.date)}
                  </span>
                  <button
                    className="post-item-delete"
                    aria-label={`Delete ${p.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(p);
                    }}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="ai-card">
          <div className="ai-card-icon">✨</div>
          <h4>Write better content</h4>
          <p>Use our writing tools to craft engaging posts your audience will love.</p>
          <button className="tips-btn" onClick={() => setToast("Writing tips coming soon ✨")}>
            View Writing Tips →
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-toggle" aria-label="Toggle sidebar" onClick={() => setSidebarOpen((o) => !o)}>
              ☰
            </button>
            <button className="back-button" onClick={() => navigate("/blogs")}>
              ←<span>Back to Blogs</span>
            </button>
          </div>

          <div className="topbar-actions">
            <span className={`save-status ${saved ? "saved" : "saving"}`}>
              <span className="save-dot" />
              {saved ? "Saved just now" : "Saving..."}
            </span>
            <button className="top-icon" aria-label="Notifications">♧</button>
            <div className="profile">
              <div className="avatar">H</div>
              <span>⌄</span>
            </div>
          </div>
        </header>

        {/* ================= VIEW: EDITOR ================= */}
        {view === "editor" ? (
          <div className="page">
            <div className="page-header">
              <div>
                <h1>{post.title ? "Edit Blog Post" : "Create New Blog Post"}</h1>
                <p>Share your ideas with the world.</p>
              </div>

              <div className="header-buttons">
                <button className="preview-button" onClick={() => setPreviewOpen(true)}>
                  Preview
                </button>
                <div className="publish-wrapper">
                  <button className="publish-button" onClick={publishPost}>
                    {post.status === "published" ? "Update" : "Publish"}
                  </button>
                  <button
                    className="publish-arrow"
                    aria-label="Publish options"
                    onClick={() => setShowPublishMenu((o) => !o)}
                  >
                    ⌄
                  </button>
                  <AnimatePresence>
                    {showPublishMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        className="publish-menu"
                      >
                        <button onClick={saveDraft}>Save as Draft</button>
                        <button onClick={schedulePost}>Schedule</button>
                        <button onClick={publishPost}>Publish Now</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="workspace">
              <section className="editor-section">
                <div className="title-wrapper">
                  <input
                    type="text"
                    className="title-input"
                    placeholder="Enter an attention-grabbing title..."
                    value={post.title}
                    maxLength={100}
                    onChange={(e) => updatePost("title", e.target.value)}
                  />
                  <span className="title-counter">{post.title.length}/100</span>
                </div>

                <div className="permalink">
                  <span>Permalink:</span>
                  <strong>blogify.com/blog/{slug}</strong>
                  <button onClick={() => setToast("Custom slugs coming soon")}>Edit</button>
                </div>

                <div className="editor">
                  <div className="toolbar">
                    <select onChange={() => insertFormatting("heading")} defaultValue="paragraph">
                      <option value="paragraph">Paragraph</option>
                      <option value="heading">Heading</option>
                    </select>
                    <button title="Bold" onClick={() => insertFormatting("bold")}><b>B</b></button>
                    <button title="Italic" onClick={() => insertFormatting("italic")}><i>I</i></button>
                    <button title="Underline" onClick={() => setToast("Underline not supported in markdown")}><u>U</u></button>
                    <button title="Strikethrough" onClick={() => setToast("Strikethrough not supported in markdown")}>S</button>
                    <button title="Code" onClick={() => insertFormatting("code")}>{"</>"}</button>
                    <button title="Link" onClick={() => insertFormatting("link")}>🔗</button>
                    <button title="Quote" onClick={() => insertFormatting("quote")}>❝</button>
                    <button title="Bullet list" onClick={() => insertFormatting("bullet")}>☷</button>
                    <button title="Numbered list" onClick={() => insertFormatting("number")}>#</button>
                    <button title="More tools" onClick={() => setToast("More tools coming soon")}>•••</button>
                  </div>

                  <textarea
                    id="blog-content"
                    className="content-editor"
                    placeholder="Start writing your story... (markdown supported)"
                    value={post.content}
                    onChange={(e) => updatePost("content", e.target.value)}
                  />

                  <div className="editor-footer">
                    <div>Words: {words}</div>
                    <div>Characters: {characters}</div>
                    <div className="markdown">
                      Write in Markdown <b>M↓</b>
                    </div>
                  </div>
                </div>

                <div className="image-upload">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageUpload}
                  />
                  {post.featuredImage ? (
                    <div className="uploaded-image">
                      <img src={post.featuredImage} alt="Featured" />
                      <button onClick={() => updatePost("featuredImage", null)}>Remove</button>
                    </div>
                  ) : (
                    <>
                      <div className="upload-icon">▧</div>
                      <div className="upload-text">
                        <strong>Add a featured image</strong>
                        <span>JPG, PNG or WebP. Max size 5MB.</span>
                      </div>
                      <button className="upload-button" onClick={() => imageInputRef.current?.click()}>
                        Upload Image
                      </button>
                    </>
                  )}
                </div>

                <div className="additional-options">
                  <h3>Additional Options</h3>
                  <ToggleRow
                    icon="▣"
                    title="Allow Comments"
                    description="Let readers comment on this post"
                    checked={post.allowComments}
                    onChange={(value) => updatePost("allowComments", value)}
                  />
                  <ToggleRow
                    icon="✉"
                    title="Newsletter"
                    description="Send this post to subscribers"
                    checked={post.newsletter}
                    onChange={(value) => updatePost("newsletter", value)}
                  />
                  <ToggleRow
                    icon="▧"
                    title="Social Sharing Image"
                    description="Customize image for social media sharing (optional)"
                    checked={post.socialSharing}
                    onChange={(value) => updatePost("socialSharing", value)}
                  />
                </div>
              </section>

              <aside className="settings">
                <div className="settings-card">
                  <h2>Post Settings</h2>

                  <div className="field">
                    <label>Category</label>
                    <select
                      value={post.category}
                      onChange={(e) => updatePost("category", e.target.value)}
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <button className="add-category" onClick={() => setView("categories")}>
                      + Add New Category
                    </button>
                  </div>

                  <div className="field">
                    <label>Tags</label>
                    <input
                      type="text"
                      placeholder="Add tags (press Enter)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    {post.tags.length > 0 && (
                      <div className="tags">
                        {post.tags.map((tag) => (
                          <span className="tag" key={tag}>
                            {tag}
                            <button onClick={() => removeTag(tag)}>×</button>
                          </span>
                        ))}
                      </div>
                    )}
                    <small>Add relevant tags to help readers find your post.</small>
                  </div>

                  <div className="field">
                    <label>Excerpt</label>
                    <textarea
                      placeholder="Write a short summary of your post..."
                      maxLength={160}
                      value={post.excerpt}
                      onChange={(e) => updatePost("excerpt", e.target.value)}
                    />
                    <div className="character-limit">{post.excerpt.length}/160</div>
                    <small>This will appear in post previews and SEO results.</small>
                  </div>

                  <div className="field">
                    <label>Featured Image</label>
                    {post.featuredImage ? (
                      <img className="settings-image" src={post.featuredImage} alt="Featured" />
                    ) : (
                      <div className="image-placeholder">No image selected</div>
                    )}
                    <button className="change-image" onClick={() => imageInputRef.current?.click()}>
                      {post.featuredImage ? "Change Image" : "Upload Image"}
                    </button>
                    <small>Recommended size: 1200×630px</small>
                  </div>

                  <div className="field">
                    <label>Status</label>
                    <StatusRadio
                      value="draft"
                      current={post.status}
                      title="Draft"
                      description="Save as draft"
                      onChange={() => updatePost("status", "draft")}
                    />
                    <StatusRadio
                      value="schedule"
                      current={post.status}
                      title="Schedule"
                      description="Schedule for later"
                      onChange={() => updatePost("status", "schedule")}
                    />
                    <StatusRadio
                      value="published"
                      current={post.status}
                      title="Publish Now"
                      description="Make it live"
                      onChange={() => updatePost("status", "published")}
                    />
                  </div>

                  <button className="collapse-header" onClick={() => setShowSeo(!showSeo)}>
                    <span>SEO Settings</span>
                    <span>{showSeo ? "⌃" : "⌄"}</span>
                  </button>
                  <AnimatePresence>
                    {showSeo && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="seo-box"
                        style={{ overflow: "hidden" }}
                      >
                        <label>SEO Title</label>
                        <input placeholder="SEO title" defaultValue={post.title} />
                        <label>Meta Description</label>
                        <textarea placeholder="Meta description" defaultValue={post.excerpt} />
                        <label>URL Slug</label>
                        <input placeholder={slug} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="checklist">
                    <div className="checklist-header">
                      <strong>Post Checklist</strong>
                      <span>{checklist.filter((c) => c.done).length}/6</span>
                    </div>
                    {checklist.map((item) => (
                      <ChecklistItem key={item.text} done={item.done} text={item.text} />
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        ) : (
          /* ================= OTHER VIEWS ================= */
          <div className="page">
            <div className="page-header">
              <div>
                <h1>{viewTitles[view].title}</h1>
                <p>{viewTitles[view].sub}</p>
              </div>
              <div className="header-buttons">
                {view === "posts" || view === "drafts" || view === "scheduled" || view === "published" ? (
                  <button className="preview-button" onClick={newPost}>
                    ＋ New Post
                  </button>
                ) : null}
              </div>
            </div>

            {view === "dashboard" && (
              <DashboardView
                posts={posts}
                counts={counts}
                totalWords={totalWords}
                onNewPost={newPost}
                onEdit={selectPost}
                onGo={setView}
              />
            )}

            {(view === "posts" || view === "drafts" || view === "scheduled" || view === "published") && (
              <PostsListView
                posts={viewPosts}
                onEdit={selectPost}
                onDelete={(p) => setConfirmDelete(p)}
                emptyHint={
                  search.trim()
                    ? "No posts match your search"
                    : view === "drafts"
                    ? "No drafts yet — hit New Post to start one"
                    : view === "scheduled"
                    ? "No scheduled posts — use the publish menu to queue one"
                    : view === "published"
                    ? "Nothing published yet — hit New Post and Publish"
                    : "No posts yet — hit New Post to get started"
                }
              />
            )}

            {view === "categories" && (
              <CategoriesView
                categories={categories}
                categoryCounts={categoryCounts}
                newCategory={newCategory}
                setNewCategory={setNewCategory}
                onAdd={(name) => {
                  if (addCategory(name)) {
                    setCustomCategories(getCategories().filter((c) => !DEFAULT_CATEGORIES.includes(c)));
                    setNewCategory("");
                    setToast(`Category “${name}” added`);
                  } else {
                    setToast("That category already exists");
                  }
                }}
                onRemove={(name) => {
                  const used = posts.some((p) => p.category === name);
                  if (used) return setToast("Move posts out of this category first");
                  removeCategory(name);
                  setCustomCategories(getCategories().filter((c) => !DEFAULT_CATEGORIES.includes(c)));
                  setToast(`Category “${name}” removed`);
                }}
                onBrowse={(name) => {
                  setSearch(name);
                  setView("posts");
                }}
              />
            )}

            {view === "tags" && (
              <TagsView
                tags={allTags}
                onRemove={(tag) => {
                  const next = posts.map((p) =>
                    p.tags.includes(tag) ? { ...p, tags: p.tags.filter((t) => t !== tag) } : p
                  );
                  setPosts(next);
                  persistPosts(next);
                  setToast(`Tag “${tag}” removed`);
                }}
                onBrowse={(tag) => {
                  setSearch(tag);
                  setView("posts");
                }}
              />
            )}

            {view === "analytics" && (
              <AnalyticsView posts={posts} counts={counts} totalWords={totalWords} categories={categoryCounts} />
            )}

            {view === "comments" && (
              <CommentsView
                comments={visibleComments}
                filter={commentFilter}
                setFilter={setCommentFilter}
                postTitle={postTitle}
                onApprove={(id) => {
                  const next = comments.map((c) => (c.id === id ? { ...c, approved: !c.approved } : c));
                  setComments(next);
                  persistComments(next);
                }}
                onDelete={(id) => {
                  const next = comments.filter((c) => c.id !== id);
                  setComments(next);
                  persistComments(next);
                  setToast("Comment deleted");
                }}
                onAdd={(postId, text) => {
                  const next = [
                    {
                      id: Date.now(),
                      postId,
                      author: "You",
                      text,
                      date: new Date().toISOString(),
                      approved: true,
                    },
                    ...comments,
                  ];
                  setComments(next);
                  persistComments(next);
                  setToast("Comment added");
                }}
                posts={posts}
              />
            )}

            {view === "settings" && (
              <SettingsView
                settings={settings}
                onChange={updateSettings}
                onReset={() => {
                  const fresh = loadSettings();
                  setSettings(fresh);
                  setToast("Settings reset");
                }}
              />
            )}
          </div>
        )}

        {/* ================= BOTTOM BAR (mobile, editor only) ================= */}
        {view === "editor" && (
          <footer className="bottom-bar">
            <button className="bottom-publish" onClick={publishPost}>
              {post.status === "published" ? "Update Post" : "Publish"}
            </button>
            <button className="bottom-draft" onClick={saveDraft}>
              Save as Draft
            </button>
          </footer>
        )}
      </main>

      {/* ================= TOAST ================= */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="toast"
          >
            <span className="toast-icon">✓</span>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= DELETE CONFIRM ================= */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              transition={{ duration: 0.25 }}
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-icon">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3>Delete this post?</h3>
              <p>
                “{confirmDelete.title || "Untitled post"}” will be permanently removed. This action cannot be undone.
              </p>
              <div className="modal-actions">
                <button className="modal-cancel" onClick={() => setConfirmDelete(null)}>
                  Cancel
                </button>
                <button className="modal-danger" onClick={() => removePost(confirmDelete)}>
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= PREVIEW ================= */}
      <AnimatePresence>
        {previewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={() => setPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 20 }}
              transition={{ duration: 0.25 }}
              className="modal-card preview"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={post.featuredImage || DEFAULT_IMAGE} alt="" className="preview-cover" />
              <div className="preview-body">
                <span className="preview-cat">{post.category || "General"}</span>
                <h2>{post.title || "Untitled post"}</h2>
                <p className="preview-excerpt">{post.excerpt || "No excerpt written yet."}</p>
                <div className="preview-content">{post.content || "Start writing to see a live preview..."}</div>
              </div>
              <div className="preview-meta">
                <span>{words} words</span>
                <span>·</span>
                <span>{Math.max(1, Math.ceil(words / 200))} min read</span>
                <button className="preview-close" onClick={() => setPreviewOpen(false)}>
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   DASHBOARD
============================================================ */

function DashboardView({
  posts,
  counts,
  totalWords,
  onNewPost,
  onEdit,
  onGo,
}: {
  posts: StoredPost[];
  counts: { draft: number; schedule: number; published: number };
  totalWords: number;
  onNewPost: () => void;
  onEdit: (p: StoredPost) => void;
  onGo: (v: MainView) => void;
}) {
  const total = posts.length;
  const recent = [...posts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  const totalRead = posts.reduce((sum, p) => sum + readTime(p.content), 0);

  const stats = [
    { label: "Total Posts", value: total, accent: "#4c44d4" },
    { label: "Published", value: counts.published, accent: "#10b981" },
    { label: "Drafts", value: counts.draft, accent: "#94a3b8" },
    { label: "Scheduled", value: counts.schedule, accent: "#f59e0b" },
    { label: "Words Written", value: totalWords.toLocaleString(), accent: "#6366f1" },
    { label: "Read Time", value: `${totalRead} min`, accent: "#ec4899" },
  ];

  const segments = [
    { label: "Published", value: counts.published, color: "#10b981" },
    { label: "Drafts", value: counts.draft, color: "#94a3b8" },
    { label: "Scheduled", value: counts.schedule, color: "#f59e0b" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="stats-grid">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="stat-tile"
          >
            <span className="stat-dot" style={{ background: s.accent }} />
            <p className="stat-value">{s.value}</p>
            <p className="stat-label">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="dash-card">
          <div className="dash-card-header">
            <strong>Status Breakdown</strong>
            <span>{total} total</span>
          </div>
          <div className="segments-bar">
            {segments.map((seg) =>
              seg.value === 0 ? null : (
                <div
                  key={seg.label}
                  style={{
                    width: `${total ? (seg.value / total) * 100 : 0}%`,
                    background: seg.color,
                  }}
                />
              )
            )}
          </div>
          <div className="segments-legend">
            {segments.map((seg) => (
              <span key={seg.label}>
                <i style={{ background: seg.color }} />
                {seg.label} · {seg.value}
              </span>
            ))}
          </div>

          <div className="quick-actions">
            <button className="upload-button" onClick={onNewPost}>＋ New Post</button>
            <button className="small-upload" onClick={() => onGo("published")}>View Published →</button>
            <button className="small-upload" onClick={() => onGo("analytics")}>Analytics →</button>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <strong>Recent Posts</strong>
            <span>{recent.length} shown</span>
          </div>
          {recent.length === 0 ? (
            <div className="posts-empty">No posts yet — create your first one!</div>
          ) : (
            <div className="recent-list">
              {recent.map((p) => (
                <div key={p.id} className="recent-item">
                  <div className="recent-info">
                    <span className="recent-title">{p.title || "Untitled post"}</span>
                    <span className="recent-meta">
                      <span className={`status-dot ${p.status}`} />
                      {statusLabel[p.status]} · {formatDate(p.date)}
                    </span>
                  </div>
                  <button className="recent-edit" onClick={() => onEdit(p)}>
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   POSTS LIST
============================================================ */

function PostsListView({
  posts,
  onEdit,
  onDelete,
  emptyHint,
}: {
  posts: StoredPost[];
  onEdit: (p: StoredPost) => void;
  onDelete: (p: StoredPost) => void;
  emptyHint: string;
}) {
  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📝</div>
        <p>{emptyHint}</p>
      </div>
    );
  }

  return (
    <motion.div className="post-table" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {posts.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
          className="post-row"
        >
          <div className="post-row-thumb">
            {p.featuredImage ? (
              <img src={p.featuredImage} alt="" />
            ) : (
              <span>📄</span>
            )}
          </div>
          <div className="post-row-main">
            <p className="post-row-title">{p.title || "Untitled post"}</p>
            <p className="post-row-excerpt">{p.excerpt || "No excerpt yet."}</p>
            <div className="post-row-chips">
              {p.category && <span className="chip chip-cat">{p.category}</span>}
              <span className={`chip chip-status chip-${p.status}`}>{statusLabel[p.status]}</span>
              <span className="chip">{formatDate(p.date)}</span>
              <span className="chip">{readTime(p.content)} min read</span>
            </div>
          </div>
          <div className="post-row-actions">
            <button className="small-upload" onClick={() => onEdit(p)}>Edit</button>
            <button className="row-delete" aria-label={`Delete ${p.title}`} onClick={() => onDelete(p)}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ============================================================
   CATEGORIES
============================================================ */

function CategoriesView({
  categories,
  categoryCounts,
  newCategory,
  setNewCategory,
  onAdd,
  onRemove,
  onBrowse,
}: {
  categories: string[];
  categoryCounts: { name: string; count: number }[];
  newCategory: string;
  setNewCategory: (v: string) => void;
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
  onBrowse: (name: string) => void;
}) {
  return (
    <div className="panel-card">
      <div className="add-category-row">
        <input
          type="text"
          placeholder="New category name..."
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newCategory.trim()) onAdd(newCategory.trim());
          }}
        />
        <button className="upload-button" onClick={() => newCategory.trim() && onAdd(newCategory.trim())}>
          Add Category
        </button>
      </div>

      <div className="chip-grid">
        {categoryCounts.map((c) => (
          <div key={c.name} className="manage-chip">
            <button className="manage-chip-main" onClick={() => onBrowse(c.name)}>
              {c.name}
              <span className="manage-chip-count">{c.count}</span>
            </button>
            <button className="manage-chip-x" aria-label={`Remove ${c.name}`} onClick={() => onRemove(c.name)}>
              ×
            </button>
          </div>
        ))}
        {categories.length === 0 && <div className="posts-empty">No categories yet.</div>}
      </div>
    </div>
  );
}

/* ============================================================
   TAGS
============================================================ */

function TagsView({
  tags,
  onRemove,
  onBrowse,
}: {
  tags: [string, number][];
  onRemove: (tag: string) => void;
  onBrowse: (tag: string) => void;
}) {
  if (tags.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🏷️</div>
        <p>No tags yet — add tags to your posts and they'll show up here.</p>
      </div>
    );
  }
  return (
    <div className="panel-card">
      <div className="chip-grid">
        {tags.map(([tag, count]) => (
          <div key={tag} className="manage-chip">
            <button className="manage-chip-main" onClick={() => onBrowse(tag)}>
              #{tag}
              <span className="manage-chip-count">{count}</span>
            </button>
            <button className="manage-chip-x" aria-label={`Remove ${tag}`} onClick={() => onRemove(tag)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   ANALYTICS
============================================================ */

function AnalyticsView({
  posts,
  counts,
  totalWords,
  categories,
}: {
  posts: StoredPost[];
  counts: { draft: number; schedule: number; published: number };
  totalWords: number;
  categories: { name: string; count: number }[];
}) {
  const totalRead = posts.reduce((sum, p) => sum + readTime(p.content), 0);
  const topPosts = [...posts]
    .sort((a, b) => wordCount(b.content) - wordCount(a.content))
    .slice(0, 6);
  const maxWords = topPosts.length ? wordCount(topPosts[0].content) : 1;
  const maxCat = Math.max(...categories.map((c) => c.count), 1);

  const tiles = [
    { label: "Posts", value: posts.length },
    { label: "Published", value: counts.published },
    { label: "Total Words", value: totalWords.toLocaleString() },
    { label: "Read Time", value: `${totalRead} min` },
    { label: "Avg Words / Post", value: posts.length ? Math.round(totalWords / posts.length).toLocaleString() : "0" },
    { label: "Avg Read / Post", value: posts.length ? `${Math.round(totalRead / posts.length)} min` : "0 min" },
  ];

  return (
    <div className="dash-grid">
      <div className="dash-card">
        <div className="dash-card-header"><strong>Highlights</strong><span>all time</span></div>
        <div className="stats-grid stats-grid-small">
          {tiles.map((t) => (
            <div key={t.label} className="stat-tile">
              <p className="stat-value">{t.value}</p>
              <p className="stat-label">{t.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-header"><strong>Words by Post</strong><span>top {topPosts.length}</span></div>
        <div className="bars">
          {topPosts.map((p) => {
            const w = wordCount(p.content);
            return (
              <div key={p.id} className="bar-row">
                <span className="bar-label">{p.title || "Untitled"}</span>
                <div className="bar-track">
                  <motion.div
                    className="bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${(w / maxWords) * 100}%` }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <span className="bar-value">{w}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-header"><strong>Posts by Category</strong><span>{categories.length}</span></div>
        <div className="bars">
          {categories.map((c) => (
            <div key={c.name} className="bar-row">
              <span className="bar-label">{c.name}</span>
              <div className="bar-track">
                <motion.div
                  className="bar-fill bar-fill-purple"
                  initial={{ width: 0 }}
                  animate={{ width: `${(c.count / maxCat) * 100}%` }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <span className="bar-value">{c.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   COMMENTS
============================================================ */

function CommentsView({
  comments,
  filter,
  setFilter,
  postTitle,
  onApprove,
  onDelete,
  onAdd,
  posts,
}: {
  comments: CommentItem[];
  filter: "all" | "pending" | "approved";
  setFilter: (f: "all" | "pending" | "approved") => void;
  postTitle: (id: number) => string;
  onApprove: (id: number) => void;
  onDelete: (id: number) => void;
  onAdd: (postId: number, text: string) => void;
  posts: StoredPost[];
}) {
  const [draft, setDraft] = useState("");
  const [targetPost, setTargetPost] = useState<number | "">("");

  return (
    <div className="panel-card">
      <div className="filter-chips">
        {(["all", "pending", "approved"] as const).map((f) => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f === "pending" ? "Pending" : "Approved"}
          </button>
        ))}
      </div>

      {comments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <p>No {filter === "all" ? "" : filter} comments right now.</p>
        </div>
      ) : (
        <div className="comment-list">
          {comments.map((c) => (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="comment-item"
            >
              <div className="comment-avatar">{c.author[0]?.toUpperCase()}</div>
              <div className="comment-body">
                <div className="comment-head">
                  <strong>{c.author}</strong>
                  <span>on “{postTitle(c.postId)}”</span>
                  {c.approved ? (
                    <span className="chip chip-approved">Approved</span>
                  ) : (
                    <span className="chip chip-pending">Pending</span>
                  )}
                </div>
                <p>{c.text}</p>
                <span className="comment-date">{formatDate(c.date)}</span>
              </div>
              <div className="comment-actions">
                <button className="small-upload" onClick={() => onApprove(c.id)}>
                  {c.approved ? "Unapprove" : "Approve"}
                </button>
                <button className="row-delete" aria-label="Delete comment" onClick={() => onDelete(c.id)}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {posts.length > 0 && (
        <div className="add-comment-row">
          <select value={targetPost} onChange={(e) => setTargetPost(Number(e.target.value))}>
            <option value="">Reply to a post…</option>
            {posts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title || "Untitled"}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Write a comment as an admin…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim() && targetPost) {
                onAdd(Number(targetPost), draft.trim());
                setDraft("");
              }
            }}
          />
          <button
            className="upload-button"
            onClick={() => {
              if (draft.trim() && targetPost) {
                onAdd(Number(targetPost), draft.trim());
                setDraft("");
              }
            }}
          >
            Post
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SETTINGS
============================================================ */

function SettingsView({
  settings,
  onChange,
  onReset,
}: {
  settings: EditorSettings;
  onChange: <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => void;
  onReset: () => void;
}) {
  return (
    <div className="panel-card settings-view">
      <div className="field">
        <label>Site Name</label>
        <input
          type="text"
          value={settings.siteName}
          onChange={(e) => onChange("siteName", e.target.value)}
        />
      </div>
      <div className="field">
        <label>Tagline</label>
        <input
          type="text"
          value={settings.tagline}
          onChange={(e) => onChange("tagline", e.target.value)}
        />
      </div>

      <h3 className="settings-section-title">Defaults for new posts</h3>
      <ToggleRow
        icon="▣"
        title="Allow comments by default"
        description="New posts start with comments enabled"
        checked={settings.allowCommentsDefault}
        onChange={(v) => onChange("allowCommentsDefault", v)}
      />
      <ToggleRow
        icon="✉"
        title="Newsletter by default"
        description="New posts start opted into the newsletter"
        checked={settings.newsletterDefault}
        onChange={(v) => onChange("newsletterDefault", v)}
      />
      <ToggleRow
        icon="▧"
        title="Social sharing by default"
        description="New posts start with social sharing enabled"
        checked={settings.socialSharingDefault}
        onChange={(v) => onChange("socialSharingDefault", v)}
      />
      <ToggleRow
        icon="◷"
        title="Autosave drafts"
        description="Automatically save your work while typing"
        checked={settings.autosave}
        onChange={(v) => onChange("autosave", v)}
      />

      <div className="settings-footer-row">
        <span className="save-status saved"><span className="save-dot" />Changes save automatically</span>
        <button className="small-upload" onClick={onReset}>Reset to defaults</button>
      </div>
    </div>
  );
}

/* =========================
   TOGGLE COMPONENT
========================= */

interface ToggleRowProps {
  icon: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function ToggleRow({ icon, title, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="option-row">
      <div className="option-icon">{icon}</div>
      <div className="option-content">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      <button
        className={`toggle ${checked ? "active" : ""}`}
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );
}

/* =========================
   STATUS RADIO
========================= */

interface StatusRadioProps {
  value: StoredPost["status"];
  current: StoredPost["status"];
  title: string;
  description: string;
  onChange: () => void;
}

function StatusRadio({ value, current, title, description, onChange }: StatusRadioProps) {
  const active = value === current;
  return (
    <button className={`status-option ${active ? "selected" : ""}`} onClick={onChange}>
      <span className={`radio ${active ? "selected" : ""}`} />
      <span className="status-content">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
    </button>
  );
}

/* =========================
   CHECKLIST
========================= */

function ChecklistItem({ done, text }: { done: boolean; text: string }) {
  return (
    <div className="check-item">
      <span className={`check-circle ${done ? "done" : ""}`}>{done ? "✓" : ""}</span>
      <span>{text}</span>
    </div>
  );
}
