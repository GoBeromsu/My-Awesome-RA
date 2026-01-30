import { expect } from 'chai'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import sinon from 'sinon'
import fetchMock from 'fetch-mock'
import React from 'react'

import {
  renderWithEvidenceContext,
  createMockResults,
} from '../helpers/evidence-providers'
import { EvidenceSearchBar } from '../../../../frontend/js/components/evidence-search-bar'
import { EvidenceList } from '../../../../frontend/js/components/evidence-list'

describe('Evidence Panel Components', function () {
  beforeEach(function () {
    fetchMock.removeRoutes().clearHistory()
  })

  afterEach(function () {
    fetchMock.removeRoutes().clearHistory()
    sinon.restore()
  })

  describe('Panel Layout Integration', function () {
    it('renders search bar with correct props', function () {
      const onSearch = sinon.stub()

      renderWithEvidenceContext(
        <EvidenceSearchBar onSearch={onSearch} disabled={false} />
      )

      expect(screen.getByPlaceholderText('Search evidence...')).to.exist
      expect(screen.getByRole('button', { name: 'Search' })).to.exist
    })

    it('renders results list with data', function () {
      const results = createMockResults(3)

      renderWithEvidenceContext(<EvidenceList results={results} />)

      expect(screen.getByRole('list')).to.exist
      expect(screen.getAllByRole('listitem')).to.have.length(3)
    })

    it('passes disabled state correctly to search bar', function () {
      const onSearch = sinon.stub()

      renderWithEvidenceContext(
        <EvidenceSearchBar onSearch={onSearch} disabled={true} />
      )

      const searchInput = screen.getByPlaceholderText('Search evidence...')
      expect(searchInput.hasAttribute('disabled')).to.be.true
    })
  })

  describe('Search Flow', function () {
    it('triggers search callback on form submission', function () {
      const onSearch = sinon.stub()

      renderWithEvidenceContext(
        <EvidenceSearchBar onSearch={onSearch} disabled={false} />
      )

      const searchInput = screen.getByPlaceholderText('Search evidence...')
      const submitButton = screen.getByRole('button', { name: 'Search' })

      fireEvent.change(searchInput, { target: { value: 'quantum computing' } })
      fireEvent.click(submitButton)

      expect(onSearch.calledOnce).to.be.true
      expect(onSearch.calledWith('quantum computing')).to.be.true
    })

    it('prevents search with empty query', function () {
      const onSearch = sinon.stub()

      renderWithEvidenceContext(
        <EvidenceSearchBar onSearch={onSearch} disabled={false} />
      )

      const submitButton = screen.getByRole('button', { name: 'Search' })
      fireEvent.click(submitButton)

      expect(onSearch.called).to.be.false
    })
  })

  describe('Results Display', function () {
    it('shows all result items with correct information', function () {
      const results = createMockResults(2)

      renderWithEvidenceContext(<EvidenceList results={results} />)

      expect(screen.getByText('Document 1')).to.exist
      expect(screen.getByText('Document 2')).to.exist
      expect(screen.getByText('#1')).to.exist
      expect(screen.getByText('#2')).to.exist
    })

    it('returns null for empty results', function () {
      const { container } = renderWithEvidenceContext(
        <EvidenceList results={[]} />
      )

      expect(container.firstChild).to.be.null
    })
  })

  describe('Loading State', function () {
    it('disables search input during loading', function () {
      const onSearch = sinon.stub()

      renderWithEvidenceContext(
        <EvidenceSearchBar onSearch={onSearch} disabled={true} />
      )

      const searchInput = screen.getByPlaceholderText('Search evidence...')
      expect(searchInput.hasAttribute('disabled')).to.be.true
    })

    it('disables submit button during loading', function () {
      const onSearch = sinon.stub()

      renderWithEvidenceContext(
        <EvidenceSearchBar onSearch={onSearch} disabled={true} />
      )

      const submitButton = screen.getByRole('button', { name: 'Search' })
      expect(submitButton.hasAttribute('disabled')).to.be.true
    })
  })

  describe('Accessibility', function () {
    it('has proper ARIA label on search input', function () {
      const onSearch = sinon.stub()

      renderWithEvidenceContext(
        <EvidenceSearchBar onSearch={onSearch} disabled={false} />
      )

      expect(screen.getByLabelText('Search for evidence')).to.exist
    })

    it('results list has proper role', function () {
      const results = createMockResults(1)

      renderWithEvidenceContext(<EvidenceList results={results} />)

      expect(screen.getByRole('list')).to.exist
    })

    it('result items have proper listitem role', function () {
      const results = createMockResults(1)

      renderWithEvidenceContext(<EvidenceList results={results} />)

      expect(screen.getByRole('listitem')).to.exist
    })
  })
})
