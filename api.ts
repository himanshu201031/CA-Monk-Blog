
import axios from 'axios';
import { Blog, CreateBlogDto } from './types';

const BASE_URL = 'http://localhost:3000';

const API = axios.create({
  baseURL: BASE_URL,
});

const INITIAL_BLOGS: Blog[] = [
  {
    id: 1,
    title: "Future of Fintech",
    category: ["FINANCE", "TECH"],
    description: "Exploring how AI and blockchain are reshaping financial services",
    date: new Date(Date.now() - 86400000).toISOString(),
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
    content: "The intersection of finance and technology, often referred to as Fintech, is currently undergoing a massive transformation. Artificial Intelligence (AI) is personalizing banking experiences, while Blockchain technology is securing transactions and reducing costs.\n\nIn this blog, we delve deep into the core shifts that will define the next decade of financial interaction. From decentralized finance (DeFi) to the integration of machine learning in risk assessment, the landscape is shifting from traditional legacy systems to agile, cloud-native solutions."
  },
  {
    id: 2,
    title: "The Rise of Remote Work",
    category: ["WORK", "LIFESTYLE"],
    description: "How the pandemic accelerated the shift to distributed teams",
    date: new Date(Date.now() - 172800000).toISOString(),
    coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200",
    content: "Remote work is no longer just a perk; it's a fundamental shift in how we approach our professional lives. From digital nomads in Bali to suburban parents, the flexibility of distributed work is changing urban landscapes and corporate cultures alike.\n\nCompanies that embrace asynchronous communication and outcome-based performance tracking are finding themselves at a significant advantage in the global talent war."
  }
];

const getLocalBlogs = (): Blog[] => {
  const stored = localStorage.getItem('camonk_blogs');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('camonk_blogs', JSON.stringify(INITIAL_BLOGS));
  return INITIAL_BLOGS;
};

export const fetchBlogs = async (): Promise<Blog[]> => {
  try {
    const response = await API.get('/blogs');
    const data = response.data;
    // Ensure we always return an array
    if (Array.isArray(data)) {
      return data;
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.warn("JSON Server not detected, using localStorage mock");
    return getLocalBlogs().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
};

export const fetchBlogById = async (id: number): Promise<Blog> => {
  try {
    const response = await API.get(`/blogs/${id}`);
    return response.data;
  } catch (error) {
    const blogs = getLocalBlogs();
    const blog = blogs.find(b => b.id === id);
    if (!blog) throw new Error("Blog not found");
    return blog;
  }
};

export const createBlog = async (data: CreateBlogDto): Promise<Blog> => {
  try {
    const response = await API.post('/blogs', {
      ...data,
      date: new Date().toISOString(),
    });
    return response.data;
  } catch (error) {
    const blogs = getLocalBlogs();
    const newBlog: Blog = {
      ...data,
      id: Math.max(...blogs.map(b => b.id), 0) + 1,
      date: new Date().toISOString(),
      coverImage: data.coverImage || `https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1200`
    };
    const updated = [newBlog, ...blogs];
    localStorage.setItem('camonk_blogs', JSON.stringify(updated));
    return newBlog;
  }
};

export const updateBlog = async (id: number, data: Partial<Blog>): Promise<Blog> => {
  try {
    const response = await API.patch(`/blogs/${id}`, data);
    return response.data;
  } catch (error) {
    const blogs = getLocalBlogs();
    const index = blogs.findIndex(b => b.id === id);
    if (index === -1) throw new Error("Blog not found");
    const updatedBlog = { ...blogs[index], ...data };
    blogs[index] = updatedBlog;
    localStorage.setItem('camonk_blogs', JSON.stringify(blogs));
    return updatedBlog;
  }
};

export const deleteBlog = async (id: number): Promise<void> => {
  try {
    await API.delete(`/blogs/${id}`);
  } catch (error) {
    const blogs = getLocalBlogs();
    const updated = blogs.filter(b => b.id !== id);
    localStorage.setItem('camonk_blogs', JSON.stringify(updated));
  }
};
