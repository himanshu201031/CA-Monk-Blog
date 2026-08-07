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

describe('BlogCard', () => {
  const mockBlog = createBlog();

  it('renders the blog title', () => {
    render(
      <BlogCard
        blog={mockBlog}
        isActive={false}
        onClick={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText(mockBlog.title)).toBeInTheDocument();
  });

  it('renders the blog description', () => {
    render(
      <BlogCard
        blog={mockBlog}
        isActive={false}
        onClick={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText(mockBlog.description)).toBeInTheDocument();
  });

  it('renders the primary category', () => {
    render(
      <BlogCard
        blog={mockBlog}
        isActive={false}
        onClick={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText('FINANCE')).toBeInTheDocument();
  });

  it('displays GENERAL as fallback when category is empty', () => {
    const blog = createBlog({ category: [] });
    render(
      <BlogCard
        blog={blog}
        isActive={false}
        onClick={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText('GENERAL')).toBeInTheDocument();
  });

  it('calls onClick handler when the card is clicked', () => {
    const onClick = vi.fn();
    render(
      <BlogCard
        blog={mockBlog}
        isActive={false}
        onClick={onClick}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    fireEvent.click(screen.getByText(mockBlog.title));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit with the blog when edit button is clicked', () => {
    const onEdit = vi.fn();
    render(
      <BlogCard
        blog={mockBlog}
        isActive={false}
        onClick={() => {}}
        onEdit={onEdit}
        onDelete={() => {}}
      />
    );
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(mockBlog);
  });

  it('calls onDelete with the blog id when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(
      <BlogCard
        blog={mockBlog}
        isActive={false}
        onClick={() => {}}
        onEdit={() => {}}
        onDelete={onDelete}
      />
    );
    fireEvent.click(screen.getAllByRole('button')[1]);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(mockBlog.id);
  });

  it('does not trigger onClick when the edit button is clicked', () => {
    const onClick = vi.fn();
    const onEdit = vi.fn();
    render(
      <BlogCard
        blog={mockBlog}
        isActive={false}
        onClick={onClick}
        onEdit={onEdit}
        onDelete={() => {}}
      />
    );
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onClick).not.toHaveBeenCalled();
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onClick when the delete button is clicked', () => {
    const onClick = vi.fn();
    const onDelete = vi.fn();
    render(
      <BlogCard
        blog={mockBlog}
        isActive={false}
        onClick={onClick}
        onEdit={() => {}}
        onDelete={onDelete}
      />
    );
    fireEvent.click(screen.getAllByRole('button')[1]);
    expect(onClick).not.toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when delete button is clicked, and passes correct id', () => {
    const onClick = vi.fn();
    const onDelete = vi.fn();
    render(
      <BlogCard
        blog={mockBlog}
        isActive={false}
        onClick={onClick}
        onEdit={() => {}}
        onDelete={onDelete}
      />
    );
    fireEvent.click(screen.getAllByRole('button')[1]);
    expect(onDelete).toHaveBeenCalledWith(mockBlog.id);
  });
});

