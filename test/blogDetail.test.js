import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BlogDetail } from '../components/BlogDetail';

// Mock the api module
vi.mock('../api', () => ({
  fetchBlogById: vi.fn(),
}));

import { fetchBlogById } from '../api';

// Helper to create a sample blog object
const createBlog = (overrides = {}) => ({
  id: 1,
  title: 'The Future of Fintech',
  category: ['FINANCE', 'TECH'],
  description: 'Exploring how AI is reshaping financial services.',
  date: '2026-01-11T09:12:45.120Z',
  coverImage: 'https://images.unsplash.com/photo-1',
  content: 'Full content here.',
  ...overrides,
});

// Render BlogDetail wrapped in a QueryClientProvider
const renderBlogDetail = (id) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(BlogDetail, { id })
    )
  );
};

describe('BlogDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "Select an Article" prompt when id is null', () => {
    renderBlogDetail(null);
    expect(screen.getByText('Select an Article')).toBeInTheDocument();
  });

  it('renders "Loading story..." while data is loading', () => {
    fetchBlogById.mockImplementation(() => new Promise(() => {}));
    renderBlogDetail(1);
    expect(screen.getByText('Loading story...')).toBeInTheDocument();
  });

  it('renders the blog title, description, content, and category after data loads', async () => {
    fetchBlogById.mockResolvedValue(createBlog());
    renderBlogDetail(1);
    expect(await screen.findByText('The Future of Fintech')).toBeInTheDocument();
    expect(
      screen.getByText('Exploring how AI is reshaping financial services.')
    ).toBeInTheDocument();
    expect(screen.getByText('Full content here.')).toBeInTheDocument();
    expect(screen.getByText('FINANCE')).toBeInTheDocument();
  });

  it('renders fallback "Untitled" and "GENERAL" when data is missing fields', async () => {
    fetchBlogById.mockResolvedValue(
      createBlog({ title: '', category: [], description: '', content: '' })
    );
    renderBlogDetail(1);
    expect(await screen.findByText('Untitled')).toBeInTheDocument();
    expect(screen.getAllByText('GENERAL').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('No description available')).toBeInTheDocument();
    expect(screen.getByText('No content available')).toBeInTheDocument();
  });
});
