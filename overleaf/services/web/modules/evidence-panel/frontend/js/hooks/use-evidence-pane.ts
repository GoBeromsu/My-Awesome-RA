import { useCallback, useRef, useState, useEffect } from 'react'
import { ImperativePanelHandle } from 'react-resizable-panels'
import useCollapsiblePanel from '@/features/ide-react/hooks/use-collapsible-panel'
import useDebounce from '@/shared/hooks/use-debounce'
import usePersistedState from '@/shared/hooks/use-persisted-state'

export const useEvidencePane = () => {
  const [isOpen, setIsOpen] = usePersistedState<boolean>(
    'ui.evidencePanelOpen',
    false
  )
  const [resizing, setResizing] = useState(false)
  const panelRef = useRef<ImperativePanelHandle>(null)

  // Keep track of a debounced local state variable for panel openness
  const [localIsOpen, setLocalIsOpen] = useState(isOpen)
  const debouncedLocalIsOpen = useDebounce(localIsOpen, 100)

  useCollapsiblePanel(isOpen, panelRef)

  const togglePane = useCallback(() => {
    setIsOpen(value => !value)
  }, [setIsOpen])

  const handlePaneExpand = useCallback(() => {
    setLocalIsOpen(true)
  }, [])

  const handlePaneCollapse = useCallback(() => {
    setLocalIsOpen(false)
  }, [])

  useEffect(() => {
    setIsOpen(debouncedLocalIsOpen)
  }, [debouncedLocalIsOpen, setIsOpen])

  return {
    isOpen,
    panelRef,
    resizing,
    setResizing,
    togglePane,
    handlePaneExpand,
    handlePaneCollapse,
  }
}
