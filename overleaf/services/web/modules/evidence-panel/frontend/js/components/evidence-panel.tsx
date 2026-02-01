import React, { useContext } from 'react'
import { useEvidenceContext } from '../context/evidence-context'
import { EvidenceSearchBar } from './evidence-search-bar'
import { EvidenceList } from './evidence-list'
import { FullSizeLoadingSpinner } from '@/shared/components/loading-spinner'
import MaterialIcon from '@/shared/components/material-icon'
import withErrorBoundary from '@/infrastructure/error-boundary'
import { ReferencesContext } from '@/features/ide-react/context/references-context'

import '../../stylesheets/evidence-panel.scss'

const EvidencePanelContent = React.memo(function EvidencePanelContent() {
  const { searchState, searchEvidence, clearResults } = useEvidenceContext()

  const referencesContext = useContext(ReferencesContext)
  const referenceKeys = referencesContext?.referenceKeys

  const { status, results, total, error } = searchState
  const isLoading = status === 'loading'
  const hasResults = results.length > 0

  function renderContent(): React.ReactNode {
    if (isLoading) {
      return (
        <div className="evidence-loading">
          <FullSizeLoadingSpinner delay={200} />
          <div className="evidence-loading-text">Searching...</div>
        </div>
      )
    }

    if (status === 'error') {
      return (
        <div className="evidence-error">
          <MaterialIcon type="error_outline" />
          <div className="evidence-error-message">{error || 'Search failed'}</div>
          <button className="btn btn-secondary btn-sm" onClick={clearResults}>
            Clear
          </button>
        </div>
      )
    }

    if (hasResults) {
      return (
        <>
          <div className="evidence-results-header">
            <span className="evidence-results-count">
              {total} result{total !== 1 ? 's' : ''} found
            </span>
            <span className="evidence-results-note">(Estimated relevance)</span>
          </div>
          <EvidenceList results={results} referenceKeys={referenceKeys} />
        </>
      )
    }

    if (status === 'success') {
      return (
        <div className="evidence-no-results">
          <MaterialIcon type="search_off" />
          <div>No evidence found</div>
          <div className="evidence-no-results-hint">
            Try a different search or check your indexed documents
          </div>
        </div>
      )
    }

    return (
      <div className="evidence-placeholder">
        <MaterialIcon type="auto_stories" />
        <div className="evidence-placeholder-title">Search for evidence</div>
        <div className="evidence-placeholder-hint">
          Enter a query above to search your references
        </div>
      </div>
    )
  }

  return (
    <aside className="evidence-panel" aria-label="Evidence Panel">
      <div className="evidence-panel-header">
        <h2 className="evidence-panel-title">
          <MaterialIcon type="library_books" />
          <span>Evidence</span>
        </h2>
      </div>

      <div className="evidence-search-section">
        <EvidenceSearchBar onSearch={searchEvidence} disabled={isLoading} />
      </div>

      <div className="evidence-panel-content">
        {renderContent()}
      </div>
    </aside>
  )
})

function EvidencePanelFallback() {
  return (
    <div className="evidence-panel evidence-panel-error">
      <div className="evidence-fallback-message">
        <MaterialIcon type="error" />
        <span>Something went wrong</span>
      </div>
    </div>
  )
}

const EvidencePanelWithBoundary = withErrorBoundary(
  EvidencePanelContent,
  () => <EvidencePanelFallback />
)

export function EvidencePanel() {
  return <EvidencePanelWithBoundary />
}

export default EvidencePanel
