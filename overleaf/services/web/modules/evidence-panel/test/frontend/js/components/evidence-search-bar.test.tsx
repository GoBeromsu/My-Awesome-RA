import { expect } from 'chai'
import { render, screen, fireEvent } from '@testing-library/react'
import sinon from 'sinon'
import React from 'react'

import { EvidenceSearchBar } from '../../../../frontend/js/components/evidence-search-bar'

describe('<EvidenceSearchBar />', function () {
  afterEach(function () {
    sinon.restore()
  })

  describe('rendering', function () {
    it('renders search input and submit button', function () {
      const onSearch = sinon.stub()

      render(<EvidenceSearchBar onSearch={onSearch} />)

      expect(screen.getByPlaceholderText('Search evidence...')).to.exist
      expect(screen.getByRole('button', { name: 'Search' })).to.exist
      expect(screen.getByLabelText('Search for evidence')).to.exist
    })

    it('renders search icon', function () {
      const onSearch = sinon.stub()

      render(<EvidenceSearchBar onSearch={onSearch} />)

      const searchInput = screen.getByPlaceholderText('Search evidence...')
      expect(searchInput.closest('.evidence-search-input-wrapper')).to.exist
    })
  })

  describe('form submission', function () {
    it('submits search on form submit', function () {
      const onSearch = sinon.stub()

      render(<EvidenceSearchBar onSearch={onSearch} />)

      const searchInput = screen.getByPlaceholderText('Search evidence...')
      const submitButton = screen.getByRole('button', { name: 'Search' })

      fireEvent.change(searchInput, { target: { value: 'test query' } })
      fireEvent.click(submitButton)

      expect(onSearch.calledOnce).to.be.true
      expect(onSearch.calledWith('test query')).to.be.true
    })

    it('submits search on Enter key press', function () {
      const onSearch = sinon.stub()

      render(<EvidenceSearchBar onSearch={onSearch} />)

      const searchInput = screen.getByPlaceholderText('Search evidence...')

      fireEvent.change(searchInput, { target: { value: 'keyboard search' } })
      fireEvent.submit(searchInput.closest('form')!)

      expect(onSearch.calledOnce).to.be.true
      expect(onSearch.calledWith('keyboard search')).to.be.true
    })

    it('trims whitespace from query before submitting', function () {
      const onSearch = sinon.stub()

      render(<EvidenceSearchBar onSearch={onSearch} />)

      const searchInput = screen.getByPlaceholderText('Search evidence...')
      const submitButton = screen.getByRole('button', { name: 'Search' })

      fireEvent.change(searchInput, { target: { value: '  trimmed query  ' } })
      fireEvent.click(submitButton)

      expect(onSearch.calledWith('trimmed query')).to.be.true
    })
  })

  describe('validation', function () {
    it('does not submit empty query', function () {
      const onSearch = sinon.stub()

      render(<EvidenceSearchBar onSearch={onSearch} />)

      const submitButton = screen.getByRole('button', { name: 'Search' })

      fireEvent.click(submitButton)

      expect(onSearch.called).to.be.false
    })

    it('does not submit whitespace-only query', function () {
      const onSearch = sinon.stub()

      render(<EvidenceSearchBar onSearch={onSearch} />)

      const searchInput = screen.getByPlaceholderText('Search evidence...')
      const submitButton = screen.getByRole('button', { name: 'Search' })

      fireEvent.change(searchInput, { target: { value: '   ' } })
      fireEvent.click(submitButton)

      expect(onSearch.called).to.be.false
    })

    it('disables submit button when query is empty', function () {
      const onSearch = sinon.stub()

      render(<EvidenceSearchBar onSearch={onSearch} />)

      const submitButton = screen.getByRole('button', { name: 'Search' })

      expect(submitButton.hasAttribute('disabled')).to.be.true
    })

    it('enables submit button when query has content', function () {
      const onSearch = sinon.stub()

      render(<EvidenceSearchBar onSearch={onSearch} />)

      const searchInput = screen.getByPlaceholderText('Search evidence...')
      const submitButton = screen.getByRole('button', { name: 'Search' })

      fireEvent.change(searchInput, { target: { value: 'test' } })

      expect(submitButton.hasAttribute('disabled')).to.be.false
    })
  })

  describe('disabled state', function () {
    it('disables input when disabled prop is true', function () {
      const onSearch = sinon.stub()

      render(<EvidenceSearchBar onSearch={onSearch} disabled={true} />)

      const searchInput = screen.getByPlaceholderText('Search evidence...')

      expect(searchInput.hasAttribute('disabled')).to.be.true
    })

    it('disables submit button when disabled prop is true', function () {
      const onSearch = sinon.stub()

      render(<EvidenceSearchBar onSearch={onSearch} disabled={true} />)

      const searchInput = screen.getByPlaceholderText('Search evidence...')
      const submitButton = screen.getByRole('button', { name: 'Search' })

      fireEvent.change(searchInput, { target: { value: 'test' } })

      expect(submitButton.hasAttribute('disabled')).to.be.true
    })

    it('does not submit when disabled even with valid query', function () {
      const onSearch = sinon.stub()

      render(<EvidenceSearchBar onSearch={onSearch} disabled={true} />)

      const form = screen.getByPlaceholderText('Search evidence...').closest('form')!

      fireEvent.submit(form)

      expect(onSearch.called).to.be.false
    })
  })

  describe('clear button', function () {
    it('shows clear button when query has content', function () {
      const onSearch = sinon.stub()

      render(<EvidenceSearchBar onSearch={onSearch} />)

      const searchInput = screen.getByPlaceholderText('Search evidence...')

      fireEvent.change(searchInput, { target: { value: 'test' } })

      expect(screen.getByLabelText('Clear search')).to.exist
    })

    it('hides clear button when query is empty', function () {
      const onSearch = sinon.stub()

      render(<EvidenceSearchBar onSearch={onSearch} />)

      expect(screen.queryByLabelText('Clear search')).to.not.exist
    })

    it('clears input when clear button is clicked', function () {
      const onSearch = sinon.stub()

      render(<EvidenceSearchBar onSearch={onSearch} />)

      const searchInput = screen.getByPlaceholderText(
        'Search evidence...'
      ) as HTMLInputElement

      fireEvent.change(searchInput, { target: { value: 'test' } })

      const clearButton = screen.getByLabelText('Clear search')
      fireEvent.click(clearButton)

      expect(searchInput.value).to.equal('')
    })

    it('hides clear button after clearing', function () {
      const onSearch = sinon.stub()

      render(<EvidenceSearchBar onSearch={onSearch} />)

      const searchInput = screen.getByPlaceholderText('Search evidence...')

      fireEvent.change(searchInput, { target: { value: 'test' } })

      const clearButton = screen.getByLabelText('Clear search')
      fireEvent.click(clearButton)

      expect(screen.queryByLabelText('Clear search')).to.not.exist
    })
  })

  describe('input behavior', function () {
    it('updates input value on change', function () {
      const onSearch = sinon.stub()

      render(<EvidenceSearchBar onSearch={onSearch} />)

      const searchInput = screen.getByPlaceholderText(
        'Search evidence...'
      ) as HTMLInputElement

      fireEvent.change(searchInput, { target: { value: 'new value' } })

      expect(searchInput.value).to.equal('new value')
    })

    it('maintains input value after failed submission', function () {
      const onSearch = sinon.stub()

      render(<EvidenceSearchBar onSearch={onSearch} disabled={true} />)

      const searchInput = screen.getByPlaceholderText(
        'Search evidence...'
      ) as HTMLInputElement

      fireEvent.change(searchInput, { target: { value: 'test query' } })
      fireEvent.submit(searchInput.closest('form')!)

      expect(searchInput.value).to.equal('test query')
    })
  })
})
