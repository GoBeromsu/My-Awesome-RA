import React, { useCallback, useState, useRef, FormEvent } from 'react'
import MaterialIcon from '@/shared/components/material-icon'

interface EvidenceSearchBarProps {
  onSearch: (query: string) => void
  disabled?: boolean
}

export const EvidenceSearchBar: React.FC<EvidenceSearchBarProps> = React.memo(
  function EvidenceSearchBar({ onSearch, disabled = false }) {
    const [query, setQuery] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    const handleSubmit = useCallback(
      (e: FormEvent) => {
        e.preventDefault()
        if (query.trim() && !disabled) {
          onSearch(query.trim())
        }
      },
      [query, onSearch, disabled]
    )

    const handleClear = useCallback(() => {
      setQuery('')
      inputRef.current?.focus()
    }, [])

    return (
      <form className="evidence-search-bar" onSubmit={handleSubmit}>
        <div className="evidence-search-input-wrapper">
          <MaterialIcon type="search" className="evidence-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="evidence-search-input"
            placeholder="Search evidence..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            disabled={disabled}
            aria-label="Search for evidence"
          />
          {query && (
            <button
              type="button"
              className="evidence-search-clear"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <MaterialIcon type="close" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="btn btn-primary evidence-search-submit"
          disabled={disabled || !query.trim()}
        >
          Search
        </button>
      </form>
    )
  }
)
