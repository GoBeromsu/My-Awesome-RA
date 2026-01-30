import React from 'react'
import { EvidenceItem } from './evidence-item'
import { EvidenceResult } from '../context/evidence-context'

interface EvidenceListProps {
  results: EvidenceResult[]
}

export const EvidenceList: React.FC<EvidenceListProps> = React.memo(
  function EvidenceList({ results }) {
    if (results.length === 0) {
      return null
    }

    return (
      <div className="evidence-list" role="list">
        {results.map((result, index) => (
          <EvidenceItem
            key={result.id}
            result={result}
            rank={index + 1}
          />
        ))}
      </div>
    )
  }
)
