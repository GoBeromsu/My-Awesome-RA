import { Panel, PanelGroup } from 'react-resizable-panels'
import { ElementType, FC, lazy, Suspense } from 'react'
import { HorizontalResizeHandle } from '../resize/horizontal-resize-handle'
import classNames from 'classnames'
import { useLayoutContext } from '@/shared/context/layout-context'
import EditorNavigationToolbar from '@/features/ide-react/components/editor-navigation-toolbar'
import ChatPane from '@/features/chat/components/chat-pane'
import { HorizontalToggler } from '@/features/ide-react/components/resize/horizontal-toggler'
import { HistorySidebar } from '@/features/ide-react/components/history-sidebar'
import EditorSidebar from '@/features/ide-react/components/editor-sidebar'
import { useTranslation } from 'react-i18next'
import { useSidebarPane } from '@/features/ide-react/hooks/use-sidebar-pane'
import { useChatPane } from '@/features/ide-react/hooks/use-chat-pane'
import { useEvidencePane } from '../../../../../../modules/evidence-panel/frontend/js/hooks/use-evidence-pane'
import { EditorAndPdf } from '@/features/ide-react/components/editor-and-pdf'
import HistoryContainer from '@/features/ide-react/components/history-container'
import getMeta from '@/utils/meta'
import { useEditorContext } from '@/shared/context/editor-context'
import { FullSizeLoadingSpinner } from '@/shared/components/loading-spinner'
import importOverleafModules from '../../../../../macros/import-overleaf-module.macro'

// Lazy load the Evidence Panel to reduce initial bundle size
const EvidencePanel = lazy(
  () =>
    import(
      '../../../../../../modules/evidence-panel/frontend/js/components/evidence-panel'
    )
)

const mainEditorLayoutModalsModules: Array<{
  import: { default: ElementType }
  path: string
}> = importOverleafModules('mainEditorLayoutModals')

export const MainLayout: FC = () => {
  const { view } = useLayoutContext()
  const { isRestrictedTokenMember } = useEditorContext()

  const {
    isOpen: sidebarIsOpen,
    setIsOpen: setSidebarIsOpen,
    panelRef: sidebarPanelRef,
    togglePane: toggleSidebar,
    handlePaneExpand: handleSidebarExpand,
    handlePaneCollapse: handleSidebarCollapse,
    resizing: sidebarResizing,
    setResizing: setSidebarResizing,
  } = useSidebarPane()

  const {
    isOpen: chatIsOpen,
    panelRef: chatPanelRef,
    togglePane: toggleChat,
    resizing: chatResizing,
    setResizing: setChatResizing,
    handlePaneCollapse: handleChatCollapse,
    handlePaneExpand: handleChatExpand,
  } = useChatPane()

  const {
    isOpen: evidencePanelIsOpen,
    panelRef: evidencePanelRef,
    togglePane: toggleEvidencePanel,
    resizing: evidencePanelResizing,
    setResizing: setEvidencePanelResizing,
    handlePaneCollapse: handleEvidencePanelCollapse,
    handlePaneExpand: handleEvidencePanelExpand,
  } = useEvidencePane()

  const chatEnabled =
    getMeta('ol-capabilities')?.includes('chat') && !isRestrictedTokenMember

  // Evidence panel is always enabled (can be controlled via settings later)
  const evidencePanelEnabled = true

  const { t } = useTranslation()

  return (
    <div className="ide-react-main">
      <EditorNavigationToolbar />
      <div className="ide-react-body">
        <PanelGroup
          autoSaveId="ide-outer-layout"
          direction="horizontal"
          className={classNames({
            'ide-panel-group-resizing':
              sidebarResizing || chatResizing || evidencePanelResizing,
          })}
        >
          {/* sidebar */}
          <Panel
            ref={sidebarPanelRef}
            id="panel-sidebar"
            order={1}
            defaultSize={15}
            minSize={5}
            maxSize={80}
            collapsible
            onCollapse={handleSidebarCollapse}
            onExpand={handleSidebarExpand}
          >
            <EditorSidebar />
            {view === 'history' && <HistorySidebar />}
          </Panel>

          <HorizontalResizeHandle
            onDoubleClick={toggleSidebar}
            resizable={sidebarIsOpen}
            onDragging={setSidebarResizing}
            hitAreaMargins={{ coarse: 0, fine: 0 }}
          >
            <HorizontalToggler
              id="panel-sidebar"
              togglerType="west"
              isOpen={sidebarIsOpen}
              setIsOpen={setSidebarIsOpen}
              tooltipWhenOpen={t('tooltip_hide_filetree')}
              tooltipWhenClosed={t('tooltip_show_filetree')}
            />
          </HorizontalResizeHandle>

          <Panel id="panel-outer-main" order={2}>
            <PanelGroup autoSaveId="ide-inner-layout" direction="horizontal">
              <Panel className="ide-react-panel" id="panel-main" order={1}>
                <HistoryContainer />
                <EditorAndPdf />
              </Panel>

              {evidencePanelEnabled && (
                <>
                  <HorizontalResizeHandle
                    onDoubleClick={toggleEvidencePanel}
                    resizable={evidencePanelIsOpen}
                    onDragging={setEvidencePanelResizing}
                    hitAreaMargins={{ coarse: 0, fine: 0 }}
                  />

                  {/* evidence panel */}
                  <Panel
                    ref={evidencePanelRef}
                    id="panel-evidence"
                    order={2}
                    defaultSize={25}
                    minSize={10}
                    maxSize={40}
                    collapsible
                    onCollapse={handleEvidencePanelCollapse}
                    onExpand={handleEvidencePanelExpand}
                  >
                    <Suspense
                      fallback={
                        <FullSizeLoadingSpinner delay={500} className="pt-4" />
                      }
                    >
                      <EvidencePanel />
                    </Suspense>
                  </Panel>
                </>
              )}

              {chatEnabled && (
                <>
                  <HorizontalResizeHandle
                    onDoubleClick={toggleChat}
                    resizable={chatIsOpen}
                    onDragging={setChatResizing}
                    hitAreaMargins={{ coarse: 0, fine: 0 }}
                  />

                  {/* chat */}
                  <Panel
                    ref={chatPanelRef}
                    id="panel-chat"
                    order={3}
                    defaultSize={20}
                    minSize={5}
                    maxSize={30}
                    collapsible
                    onCollapse={handleChatCollapse}
                    onExpand={handleChatExpand}
                  >
                    <ChatPane />
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
      {mainEditorLayoutModalsModules.map(
        ({ import: { default: Component }, path }) => (
          <Component key={path} />
        )
      )}
    </div>
  )
}
