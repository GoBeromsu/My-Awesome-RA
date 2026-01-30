import { useEffect, useCallback, useRef } from 'react'
import { useEvidenceContext } from '../context/evidence-context'
import {
  EVIDENCE_PARAGRAPH_CHANGE_EVENT,
  ParagraphChangeDetail,
} from '@/features/source-editor/extensions/evidence-tracker'

/**
 * Hook that integrates the CodeMirror evidence tracker with the Evidence Panel.
 * Listens for paragraph change events and triggers searches in auto mode.
 */
export const useEvidenceTrackerIntegration = () => {
  const { autoMode, searchEvidence, setCurrentParagraph } = useEvidenceContext()
  const lastParagraphRef = useRef<string>('')

  const handleParagraphChange = useCallback(
    (event: Event) => {
      if (!autoMode) {
        return
      }

      const customEvent = event as CustomEvent<ParagraphChangeDetail>
      const { paragraph } = customEvent.detail

      // Skip if paragraph hasn't changed
      if (paragraph === lastParagraphRef.current) {
        return
      }

      lastParagraphRef.current = paragraph
      setCurrentParagraph(paragraph)

      // Trigger search if paragraph is meaningful
      if (paragraph && paragraph.length >= 20) {
        searchEvidence(paragraph)
      }
    },
    [autoMode, searchEvidence, setCurrentParagraph]
  )

  useEffect(() => {
    // Listen for paragraph change events from the CodeMirror extension
    document.addEventListener(
      EVIDENCE_PARAGRAPH_CHANGE_EVENT,
      handleParagraphChange
    )

    return () => {
      document.removeEventListener(
        EVIDENCE_PARAGRAPH_CHANGE_EVENT,
        handleParagraphChange
      )
    }
  }, [handleParagraphChange])

  // Reset last paragraph when auto mode is toggled off
  useEffect(() => {
    if (!autoMode) {
      lastParagraphRef.current = ''
    }
  }, [autoMode])
}
