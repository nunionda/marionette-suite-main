import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdProjectDetail from '../AdProjectDetail';
import React from 'react';
import { ProjectContext } from '../../context/ProjectContext';

// Correct mocking for Context
const mockUpdateProject = vi.fn();
const mockContextValue = {
  updateProject: mockUpdateProject
};

const mockProject = {
  id: 'test-1',
  title: 'Test Project',
  category: 'Commercial',
  adDuration: '30s'
};

describe('AdProjectDetail Component', () => {
  it('renders the project title', () => {
    render(
      <ProjectContext.Provider value={mockContextValue}>
        <AdProjectDetail project={mockProject} />
      </ProjectContext.Provider>
    );
    expect(screen.getByText(/Test Project/i)).toBeInTheDocument();
  });

  it('shows the narrative vitals sidebar section', () => {
    render(
      <ProjectContext.Provider value={mockContextValue}>
        <AdProjectDetail project={mockProject} />
      </ProjectContext.Provider>
    );
    expect(screen.getByText(/Narrative Vitals/i)).toBeInTheDocument();
  });
});
