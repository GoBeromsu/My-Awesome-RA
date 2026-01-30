import { expect } from 'chai'
import { render, screen } from '@testing-library/react'
import React from 'react'

import { EvidenceList } from '../../../../frontend/js/components/evidence-list'
import { createMockResult, createMockResults } from '../helpers/evidence-providers'

describe('<EvidenceList />', function () {
  describe('rendering', function () {
    it('renders a list of evidence items', function () {
      const results = createMockResults(3)

      render(<EvidenceList results={results} />)

      expect(screen.getByRole('list')).to.exist
      expect(screen.getAllByRole('listitem')).to.have.length(3)
    })

    it('returns null when results array is empty', function () {
      const { container } = render(<EvidenceList results={[]} />)

      expect(container.firstChild).to.be.null
    })

    it('renders items in order with correct rank numbers', function () {
      const results = createMockResults(3)

      render(<EvidenceList results={results} />)

      expect(screen.getByText('#1')).to.exist
      expect(screen.getByText('#2')).to.exist
      expect(screen.getByText('#3')).to.exist
    })

    it('displays all document titles', function () {
      const results = [
        createMockResult({ id: '1', title: 'First Document' }),
        createMockResult({ id: '2', title: 'Second Document' }),
        createMockResult({ id: '3', title: 'Third Document' }),
      ]

      render(<EvidenceList results={results} />)

      expect(screen.getByText('First Document')).to.exist
      expect(screen.getByText('Second Document')).to.exist
      expect(screen.getByText('Third Document')).to.exist
    })

    it('uses result id as key for items', function () {
      const results = [
        createMockResult({ id: 'unique-id-1' }),
        createMockResult({ id: 'unique-id-2' }),
      ]

      render(<EvidenceList results={results} />)

      // Just verify the list renders correctly with unique ids
      expect(screen.getAllByRole('listitem')).to.have.length(2)
    })
  })

  describe('accessibility', function () {
    it('has list role for accessibility', function () {
      const results = createMockResults(1)

      render(<EvidenceList results={results} />)

      expect(screen.getByRole('list')).to.exist
    })

    it('applies correct class for styling', function () {
      const results = createMockResults(1)

      render(<EvidenceList results={results} />)

      const list = screen.getByRole('list')
      expect(list.classList.contains('evidence-list')).to.be.true
    })
  })

  describe('edge cases', function () {
    it('handles single item', function () {
      const results = createMockResults(1)

      render(<EvidenceList results={results} />)

      expect(screen.getAllByRole('listitem')).to.have.length(1)
      expect(screen.getByText('#1')).to.exist
    })

    it('handles large number of items', function () {
      const results = createMockResults(50)

      render(<EvidenceList results={results} />)

      expect(screen.getAllByRole('listitem')).to.have.length(50)
    })

    it('renders items with different scores', function () {
      const results = [
        createMockResult({ id: '1', score: 0.95 }),
        createMockResult({ id: '2', score: 0.75 }),
        createMockResult({ id: '3', score: 0.45 }),
      ]

      render(<EvidenceList results={results} />)

      expect(screen.getByText('95%')).to.exist
      expect(screen.getByText('75%')).to.exist
      expect(screen.getByText('45%')).to.exist
    })
  })
})
