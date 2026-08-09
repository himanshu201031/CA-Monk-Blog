import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateBlogForm } from '../components/CreateBlogForm';

// Mock the api module
vi.mock('../api', () => ({
  createBlog: vi.fn(),
}));

import { createBlog } from '../api';

// Mock the FileReader API for image upload tests
class MockFileReader {
  constructor() {
    this.shouldError = false;
  }
  readAsDataURL() {
    // Set the result on the reader instance (component reads reader.result)
    this.result = 'data:image/png;base64,mockbase64data';
    // Defer the onload/onerror call so the component can assign the handler first
    setTimeout(() => {
      if (this.shouldError) {
        this.onerror(new Error('File read failed'));
      } else {
        this.onload({ target: { result: this.result } });
      }
    }, 10);
  }
}

global.FileReader = MockFileReader;

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
    fireEvent.change(screen.getByPlaceholderText('Short description...'), {
      target: { value: 'A short summary' },
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
        description: 'A short summary',
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

  it('updates the preview and coverImage when an image file is selected', async () => {
    createBlog.mockResolvedValue({ id: 3 });
    const onFinish = vi.fn();
    const { container } = renderCreateBlogForm({ onFinish });

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = container.querySelector('input[type="file"]');
    
    // Set the files property on the input and trigger the change event
    Object.defineProperty(fileInput, 'files', { value: [file], configurable: true });
    await act(async () => {
      fireEvent.change(fileInput);
    });

    // Preview image should appear
    expect(await screen.findByAltText('Preview')).toBeInTheDocument();
    expect(screen.queryByText('Upload Image')).not.toBeInTheDocument();

    // Fill in required fields and submit
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
    expect(createBlog.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        title: 'My New Post',
        content: 'This is the content of the post.',
        coverImage: 'data:image/png;base64,mockbase64data',
      })
    );
  });

  it('does not update the preview when no file is selected', () => {
    const { container } = renderCreateBlogForm();

    const fileInput = container.querySelector('input[type="file"]');
    Object.defineProperty(fileInput, 'files', { value: [], configurable: true });
    fireEvent.change(fileInput);

    expect(screen.getByText('Upload Image')).toBeInTheDocument();
    expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
  });

  it('handles FileReader error when reading an image file', async () => {
    const { container } = renderCreateBlogForm();

    // Set the mock to trigger an error
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = container.querySelector('input[type="file"]');
    Object.defineProperty(fileInput, 'files', { value: [file], configurable: true });

    // Override the FileReader to trigger an error
    const originalFileReader = global.FileReader;
    global.FileReader = class extends MockFileReader {
      constructor() {
        super();
        this.shouldError = true;
      }
    };

    await act(async () => {
      fireEvent.change(fileInput);
    });

    // Restore the original mock
    global.FileReader = originalFileReader;

    // The preview should not appear since the read failed
    expect(screen.getByText('Upload Image')).toBeInTheDocument();
    expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
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
