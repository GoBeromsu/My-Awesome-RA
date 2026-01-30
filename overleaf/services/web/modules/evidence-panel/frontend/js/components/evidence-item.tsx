import React, { useCallback, useState } from 'react'
import MaterialIcon from '@/shared/components/material-icon'
import { EvidenceResult } from '../context/evidence-context'

interface EvidenceItemProps {
  result: EvidenceResult
  rank: number
}

export const EvidenceItem: React.FC<EvidenceItemProps> = React.memo(
  function EvidenceItem({ result, rank }) {
    const [isExpanded, setIsExpanded] = useState(false)

    const toggleExpand = useCallback(() => {
      setIsExpanded(prev => !prev)
    }, [])

    const scorePercentage = Math.round(result.score * 100)
    const scoreClass =
      scorePercentage >= 80
        ? 'high'
        : scorePercentage >= 60
          ? 'medium'
          : 'low'

    const handleCopySnippet = useCallback(() => {
      navigator.clipboard.writeText(result.snippet)
    }, [result.snippet])

    const formatCitation = () => {
      const parts = []
      if (result.authors) {
        parts.push(result.authors)
      }
      if (result.year) {
        parts.push(`(${result.year})`)
      }
      return parts.join(' ')
    }

    return (
      <div className="evidence-item" role="listitem">
        <div className="evidence-item-header" onClick={toggleExpand}>
          <div className="evidence-item-rank">#{rank}</div>
          <div className="evidence-item-meta">
            <div className="evidence-item-title" title={result.title}>
              {result.title}
            </div>
            <div className="evidence-item-citation">{formatCitation()}</div>
          </div>
          <div className={`evidence-item-score score-${scoreClass}`}>
            {scorePercentage}%
          </div>
          <button
            className="evidence-item-expand-btn"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <MaterialIcon
              type={isExpanded ? 'expand_less' : 'expand_more'}
            />
          </button>
        </div>

        {isExpanded && (
          <div className="evidence-item-body">
            <div className="evidence-item-snippet">
              <blockquote>{result.snippet}</blockquote>
            </div>

            <div className="evidence-item-details">
              {result.page && (
                <span className="evidence-item-page">
                  <MaterialIcon type="description" />
                  Page {result.page}
                </span>
              )}
              {result.sourcePdf && (
                <span className="evidence-item-source">
                  <MaterialIcon type="picture_as_pdf" />
                  {result.sourcePdf.split('/').pop()}
                </span>
              )}
            </div>

            <div className="evidence-item-actions">
              <button
                className="btn btn-xs btn-secondary"
                onClick={handleCopySnippet}
                title="Copy snippet to clipboard"
              >
                <MaterialIcon type="content_copy" />
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
)
