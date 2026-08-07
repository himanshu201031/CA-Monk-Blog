import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BlogCard } from '../components/BlogCard';

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

// render a BlogCard with the given props
const renderBlogCard = (props = {}) => {
  const baseProps = {
    blog: createBlog(),
    isActive: false,
    onClick: () => {},
    onEdit: () => {},
    onDelete: () => {},
    ...props,
  };
  return render(React.createElement(BlogCard, baseProps));
};

describe('BlogCard', () => {
  it('renders the blog title', () => {
    renderBlogCard();
    expect(screen.getByText('The Future of Fintech')).toBeInTheDocument();
  });

  it('renders the blog description', () => {
    renderBlogCard();
    expect(
      screen.getByText('Exploring how AI is reshaping financial services.')
    ).toBeInTheDocument();
  });

  it('renders the primary category', () => {
    renderBlogCard();
    expect(screen.getByText('FINANCE')).toBeInTheDocument();
  });

  it('displays GENERAL as fallback when category is empty', () => {
    renderBlogCard({ blog: createBlog({ category: [] }) });
    expect(screen.getByText('GENERAL')).toBeInTheDocument();
  });

  it('calls onClick handler when the card is clicked', () => {
    const onClick = vi.fn();
    renderBlogCard({ onClick });
    fireEvent.click(screen.getByText('The Future of Fintech'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit with the blog when edit button is clicked', () => {
    const onEdit = vi.fn();
    const blog = createBlog();
    renderBlogCard({ onEdit });
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(blog);
  });

  it('calls onDelete with the blog id when delete button is clicked', () => {
    const onDelete = vi.fn();
    renderBlogCard({ onDelete });
    fireEvent.click(screen.getAllByRole('button')[1]);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('does not trigger onClick when the edit button is clicked (stopPropagation)', () => {
    const onClick = vi.fn();
    const onEdit = vi.fn();
    renderBlogCard({ onClick, onEdit });
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onClick).not.toHaveBeenCalled();
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onClick when the delete button is clicked (stopPropagation)', () => {
    const onClick = vi.fn();
    const onDelete = vi.fn();
    renderBlogCard({ onClick, onDelete });
    fireEvent.click(screen.getAllByRole('button')[1]);
    expect(onClick).not.toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
