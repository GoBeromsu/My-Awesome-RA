import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
  FC,
  ReactNode,
} from 'react'

declare global {
  interface Window {
    __EVIDENCE_API_URL__?: string
  }
}

export type DocumentStatus = 'processing' | 'indexed' | 'error'

export interface IndexedDocument {
  documentId: string
  title: string
  status: DocumentStatus
  chunkCount?: number
  indexedAt?: string
  message?: string
}

export interface ReferencesPanelContextValue {
  documents: IndexedDocument[]
  isLoading: boolean
  error: string | null
  fetchDocuments: () => Promise<void>
  uploadDocument: (file: File) => Promise<string | null>
  deleteDocument: (documentId: string) => Promise<void>
  reindexDocument: (documentId: string) => Promise<void>
  getDocumentStatus: (documentId: string) => Promise<DocumentStatus | null>
}

export const ReferencesPanelContext = createContext<
  ReferencesPanelContextValue | undefined
>(undefined)

interface ReferencesPanelProviderProps {
  children: ReactNode
  apiBaseUrl?: string
}

export const ReferencesPanelProvider: FC<ReferencesPanelProviderProps> = ({
  children,
  apiBaseUrl,
}) => {
  const resolvedApiBaseUrl =
    apiBaseUrl || window.__EVIDENCE_API_URL__ || 'http://localhost:8000'

  const [documents, setDocuments] = useState<IndexedDocument[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pollingIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${resolvedApiBaseUrl}/documents`)

      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.statusText}`)
      }

      const data = await response.json()

      const docs: IndexedDocument[] = data.documents.map(
        (doc: {
          document_id: string
          title?: string
          chunk_count?: number
          indexed_at?: string
        }) => ({
          documentId: doc.document_id,
          title: doc.title || doc.document_id,
          status: 'indexed' as DocumentStatus,
          chunkCount: doc.chunk_count,
          indexedAt: doc.indexed_at,
        })
      )

      setDocuments(docs)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch documents'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [resolvedApiBaseUrl])

  const getDocumentStatus = useCallback(
    async (documentId: string): Promise<DocumentStatus | null> => {
      try {
        const response = await fetch(
          `${resolvedApiBaseUrl}/documents/${documentId}/status`
        )

        if (!response.ok) {
          if (response.status === 404) {
            return null
          }
          throw new Error(`Failed to get status: ${response.statusText}`)
        }

        const data = await response.json()
        return data.status as DocumentStatus
      } catch {
        return null
      }
    },
    [resolvedApiBaseUrl]
  )

  const startPollingStatus = useCallback(
    (documentId: string) => {
      // Clear existing polling if any
      const existingInterval = pollingIntervals.current.get(documentId)
      if (existingInterval) {
        clearInterval(existingInterval)
      }

      const interval = setInterval(async () => {
        const status = await getDocumentStatus(documentId)

        if (status === 'indexed' || status === 'error') {
          // Stop polling
          clearInterval(interval)
          pollingIntervals.current.delete(documentId)

          // Refresh document list
          await fetchDocuments()
        } else if (status === 'processing') {
          // Update document status in state
          setDocuments(prev =>
            prev.map(doc =>
              doc.documentId === documentId
                ? { ...doc, status: 'processing' }
                : doc
            )
          )
        }
      }, 2000) // Poll every 2 seconds

      pollingIntervals.current.set(documentId, interval)
    },
    [getDocumentStatus, fetchDocuments]
  )

  const uploadDocument = useCallback(
    async (file: File): Promise<string | null> => {
      setError(null)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${resolvedApiBaseUrl}/documents/upload`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.detail || `Upload failed: ${response.statusText}`
          )
        }

        const data = await response.json()
        const documentId = data.document_id

        // Add to documents list with processing status
        const newDoc: IndexedDocument = {
          documentId,
          title: file.name.replace(/\.pdf$/i, ''),
          status: data.status === 'indexed' ? 'indexed' : 'processing',
          message: data.message,
        }

        setDocuments(prev => {
          // Check if document already exists
          const exists = prev.some(d => d.documentId === documentId)
          if (exists) {
            return prev.map(d =>
              d.documentId === documentId ? newDoc : d
            )
          }
          return [...prev, newDoc]
        })

        // Start polling if processing
        if (data.status === 'processing') {
          startPollingStatus(documentId)
        }

        return documentId
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        setError(message)
        return null
      }
    },
    [resolvedApiBaseUrl, startPollingStatus]
  )

  const deleteDocument = useCallback(
    async (documentId: string) => {
      setError(null)

      try {
        const response = await fetch(
          `${resolvedApiBaseUrl}/documents/${documentId}`,
          {
            method: 'DELETE',
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.detail || `Delete failed: ${response.statusText}`
          )
        }

        // Remove from local state
        setDocuments(prev => prev.filter(d => d.documentId !== documentId))

        // Stop any polling for this document
        const interval = pollingIntervals.current.get(documentId)
        if (interval) {
          clearInterval(interval)
          pollingIntervals.current.delete(documentId)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Delete failed'
        setError(message)
        throw err
      }
    },
    [resolvedApiBaseUrl]
  )

  const reindexDocument = useCallback(
    async (documentId: string) => {
      setError(null)

      try {
        const response = await fetch(
          `${resolvedApiBaseUrl}/documents/${documentId}/reindex`,
          {
            method: 'POST',
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.detail || `Reindex failed: ${response.statusText}`
          )
        }

        // Update status to processing
        setDocuments(prev =>
          prev.map(d =>
            d.documentId === documentId
              ? { ...d, status: 'processing' as DocumentStatus }
              : d
          )
        )

        // Start polling for status
        startPollingStatus(documentId)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Reindex failed'
        setError(message)
        throw err
      }
    },
    [resolvedApiBaseUrl, startPollingStatus]
  )

  // Cleanup polling intervals on unmount
  useEffect(() => {
    return () => {
      pollingIntervals.current.forEach(interval => clearInterval(interval))
      pollingIntervals.current.clear()
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const value = useMemo<ReferencesPanelContextValue>(
    () => ({
      documents,
      isLoading,
      error,
      fetchDocuments,
      uploadDocument,
      deleteDocument,
      reindexDocument,
      getDocumentStatus,
    }),
    [
      documents,
      isLoading,
      error,
      fetchDocuments,
      uploadDocument,
      deleteDocument,
      reindexDocument,
      getDocumentStatus,
    ]
  )

  return (
    <ReferencesPanelContext.Provider value={value}>
      {children}
    </ReferencesPanelContext.Provider>
  )
}

export function useReferencesPanelContext() {
  const context = useContext(ReferencesPanelContext)
  if (!context) {
    throw new Error(
      'useReferencesPanelContext must be used within a ReferencesPanelProvider'
    )
  }
  return context
}
