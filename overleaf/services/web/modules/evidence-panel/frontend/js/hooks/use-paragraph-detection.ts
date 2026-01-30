import { useCallback, useEffect, useRef } from 'react'
import { useEvidenceContext } from '../context/evidence-context'

const DEBOUNCE_DELAY = 500

/**
 * Hook that detects the current paragraph based on cursor position
 * and triggers evidence search when the paragraph changes.
 */
export const useParagraphDetection = () => {
  const { autoMode, searchEvidence, setCurrentParagraph } = useEvidenceContext()
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastParagraphRef = useRef<string>('')

  const detectParagraph = useCallback(
    (text: string, cursorPosition: number): string => {
      if (!text || cursorPosition < 0) {
        return ''
      }

      // Find paragraph boundaries (blank lines)
      const lines = text.split('\n')
      let currentPos = 0
      let paragraphStart = 0
      let paragraphEnd = text.length

      for (let i = 0; i < lines.length; i++) {
        const lineLength = lines[i].length + 1 // +1 for newline
        const lineEnd = currentPos + lineLength

        // Check if this is a blank line (paragraph delimiter)
        const isBlankLine = lines[i].trim() === ''

        if (isBlankLine) {
          if (currentPos < cursorPosition) {
            // This blank line is before cursor, update paragraph start
            paragraphStart = lineEnd
          } else {
            // This blank line is at or after cursor, set paragraph end
            paragraphEnd = currentPos
            break
          }
        }

        currentPos = lineEnd
      }

      // Extract paragraph text
      const paragraph = text.slice(paragraphStart, paragraphEnd).trim()

      // Skip very short paragraphs or LaTeX commands only
      if (paragraph.length < 20) {
        return ''
      }

      // Remove LaTeX commands for cleaner search
      const cleanedParagraph = paragraph
        .replace(/\\[a-zA-Z]+\{[^}]*\}/g, '') // Remove \command{content}
        .replace(/\\[a-zA-Z]+/g, '') // Remove \command
        .replace(/[{}[\]$%&]/g, '') // Remove special chars
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()

      return cleanedParagraph
    },
    []
  )

  const handleParagraphChange = useCallback(
    (paragraph: string) => {
      if (!autoMode || paragraph === lastParagraphRef.current) {
        return
      }

      lastParagraphRef.current = paragraph
      setCurrentParagraph(paragraph)

      // Clear any pending debounce
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      if (!paragraph) {
        return
      }

      // Debounce the search
      debounceTimerRef.current = setTimeout(() => {
        searchEvidence(paragraph)
      }, DEBOUNCE_DELAY)
    },
    [autoMode, searchEvidence, setCurrentParagraph]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return {
    detectParagraph,
    handleParagraphChange,
  }
}
