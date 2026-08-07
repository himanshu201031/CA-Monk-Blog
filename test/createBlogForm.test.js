import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateBlogForm } from '../components/CreateBlogForm';

// Mock the api module
vi.mock('../api', () => ({
  createBlog: vi.fn(),
}));

import { createBlog } from '../api';

// Render CreateBlogForm wrapped in a QueryClientProvider
const renderCreateBlogForm = (props = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(CreateBlogForm, props)
    )
  );
};

describe('CreateBlogForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form title, summary, and narrative fields', () => {
    renderCreateBlogForm();
    expect(screen.getByPlaceholderText("What's the title?")).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Short description...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write your story...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Publish Insight/i })).toBeInTheDocument();
  });

  it('renders the default cover image upload area', () => {
    renderCreateBlogForm();
    expect(screen.getByText('Upload Image')).toBeInTheDocument();
  });

  it('does not call createBlog when title and content are empty', () => {
    renderCreateBlogForm();
    fireEvent.click(screen.getByRole('button', { name: /Publish Insight/i }));
    expect(createBlog).not.toHaveBeenCalled();
  });

  it('does not call createBlog when only title is filled but content is empty', () => {
    renderCreateBlogForm();
    fireEvent.change(screen.getByPlaceholderText("What's the title?"), {
      target: { value: 'My New Post' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Publish Insight/i }));
    expect(createBlog).not.toHaveBeenCalled();
  });

  it('calls createBlog with the form data on valid submit', async () => {
    createBlog.mockResolvedValue({ id: 3 });
    const onFinish = vi.fn();
    renderCreateBlogForm({ onFinish });

    fireEvent.change(screen.getByPlaceholderText("What's the title?"), {
      target: { value: 'My New Post' },
    });
    fireEvent.change(screen.getByPlaceholderText('Write your story...'), {
      target: { value: 'This is the content of the post.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Publish Insight/i }));

    await waitFor(() => {
      expect(createBlog).toHaveBeenCalledTimes(1);
    });
    // React Query's mutate passes the variables as the first argument.
    expect(createBlog.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        title: 'My New Post',
        content: 'This is the content of the post.',
        category: ['GENERAL'],
      })
    );
  });

  it('calls onFinish after a successful submit', async () => {
    createBlog.mockResolvedValue({ id: 3 });
    const onFinish = vi.fn();
    renderCreateBlogForm({ onFinish });

    fireEvent.change(screen.getByPlaceholderText("What's the title?"), {
      target: { value: 'My New Post' },
    });
    fireEvent.change(screen.getByPlaceholderText('Write your story...'), {
      target: { value: 'This is the content of the post.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Publish Insight/i }));

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledTimes(1);
    });
  });

  it('shows "Publishing..." text while the mutation is pending', async () => {
    let resolveMutation;
    createBlog.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveMutation = resolve;
        })
    );
    renderCreateBlogForm();

    fireEvent.change(screen.getByPlaceholderText("What's the title?"), {
      target: { value: 'My New Post' },
    });
    fireEvent.change(screen.getByPlaceholderText('Write your story...'), {
      target: { value: 'This is the content of the post.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Publish Insight/i }));

    expect(await screen.findByText('Publishing...')).toBeInTheDocument();
    resolveMutation({ id: 3 });
  });
});
