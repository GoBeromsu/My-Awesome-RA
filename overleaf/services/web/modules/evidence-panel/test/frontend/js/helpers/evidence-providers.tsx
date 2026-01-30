import React, { ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import {
  EvidenceContext,
  EvidenceContextValue,
  EvidenceSearchState,
} from '../../../../frontend/js/context/evidence-context'

const defaultSearchState: EvidenceSearchState = {
  status: 'idle',
  results: [],
  query: '',
  error: null,
  total: 0,
}

const defaultContextValue: EvidenceContextValue = {
  searchState: defaultSearchState,
  currentParagraph: '',
  autoMode: false,
  setAutoMode: () => {},
  searchEvidence: async () => {},
  setCurrentParagraph: () => {},
  clearResults: () => {},
}

interface EvidenceProviderWrapperProps {
  children: ReactNode
  value?: Partial<EvidenceContextValue>
}

export function EvidenceProviderWrapper({
  children,
  value = {},
}: EvidenceProviderWrapperProps) {
  const contextValue = {
    ...defaultContextValue,
    ...value,
    searchState: {
      ...defaultSearchState,
      ...(value.searchState || {}),
    },
  }

  return (
    <EvidenceContext.Provider value={contextValue}>
      {children}
    </EvidenceContext.Provider>
  )
}

interface RenderWithEvidenceContextOptions {
  contextValue?: Partial<EvidenceContextValue>
  renderOptions?: RenderOptions
}

export function renderWithEvidenceContext(
  component: React.ReactElement,
  options: RenderWithEvidenceContextOptions = {}
) {
  const { contextValue = {}, renderOptions = {} } = options

  const wrapper = ({ children }: { children: ReactNode }) => (
    <EvidenceProviderWrapper value={contextValue}>
      {children}
    </EvidenceProviderWrapper>
  )

  return render(component, {
    wrapper,
    ...renderOptions,
  })
}

export function createMockResult(overrides = {}) {
  return {
    id: 'result_1',
    title: 'Test Document Title',
    authors: 'Smith, J. and Doe, A.',
    year: 2023,
    snippet: 'This is a test snippet from the document.',
    score: 0.85,
    sourcePdf: '/documents/test.pdf',
    page: 5,
    documentId: 'doc_1',
    chunkId: 'chunk_1',
    ...overrides,
  }
}

export function createMockResults(count: number) {
  return Array.from({ length: count }, (_, i) =>
    createMockResult({
      id: `result_${i + 1}`,
      title: `Document ${i + 1}`,
      score: 0.9 - i * 0.1,
      documentId: `doc_${i + 1}`,
      chunkId: `chunk_${i + 1}`,
    })
  )
}
