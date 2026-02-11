import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SubtitleSidebar } from '@/components/SubtitleSidebar';
import { DualSubtitleEntry } from '@/domain/types';

describe('SubtitleSidebar', () => {
  const mockSubtitles: DualSubtitleEntry[] = [
    {
      startTime: 0,
      endTime: 2,
      textEn: 'Hello World',
      textVi: 'Xin chào thế giới',
    },
    {
      startTime: 2,
      endTime: 4,
      textEn: 'How are you?',
      textVi: 'Bạn khỏe không?',
    },
    {
      startTime: 4,
      endTime: 6,
      textEn: 'Good morning',
      textVi: 'Chào buổi sáng',
    },
  ];

  const mockOnSubtitleClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all subtitles', () => {
    render(
      <SubtitleSidebar
        subtitles={mockSubtitles}
        currentTime={0}
        onSubtitleClick={mockOnSubtitleClick}
      />
    );

    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('Xin chào thế giới')).toBeInTheDocument();
    expect(screen.getByText('How are you?')).toBeInTheDocument();
    expect(screen.getByText('Bạn khỏe không?')).toBeInTheDocument();
  });

  it('should highlight active subtitle', () => {
    const { container } = render(
      <SubtitleSidebar
        subtitles={mockSubtitles}
        currentTime={3}
        onSubtitleClick={mockOnSubtitleClick}
      />
    );

    const subtitleElements = container.querySelectorAll('[class*="p-3"]');
    // The second subtitle (2-4s) should be active at time 3s
    expect(subtitleElements[1]).toHaveClass('bg-blue-100');
  });

  it('should call onSubtitleClick when subtitle is clicked', () => {
    render(
      <SubtitleSidebar
        subtitles={mockSubtitles}
        currentTime={0}
        onSubtitleClick={mockOnSubtitleClick}
      />
    );

    const firstSubtitle = screen.getByText('Hello World').closest('div');
    if (firstSubtitle) {
      fireEvent.click(firstSubtitle);
      expect(mockOnSubtitleClick).toHaveBeenCalledWith(0);
    }
  });

  it('should format time correctly', () => {
    render(
      <SubtitleSidebar
        subtitles={mockSubtitles}
        currentTime={0}
        onSubtitleClick={mockOnSubtitleClick}
      />
    );

    expect(screen.getByText('00:00 - 00:02')).toBeInTheDocument();
    expect(screen.getByText('00:02 - 00:04')).toBeInTheDocument();
    expect(screen.getByText('00:04 - 00:06')).toBeInTheDocument();
  });

  it('should render empty state when no subtitles', () => {
    const { container } = render(
      <SubtitleSidebar
        subtitles={[]}
        currentTime={0}
        onSubtitleClick={mockOnSubtitleClick}
      />
    );

    const subtitleElements = container.querySelectorAll('[class*="p-3"]');
    expect(subtitleElements.length).toBe(0);
  });
});
