import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import MaterialIcon from '@/shared/components/material-icon'
import OLTooltip from '@/shared/components/ol/ol-tooltip'
import OLButton from '@/shared/components/ol/ol-button'

interface AnalyzeToggleButtonProps {
  showAnalyze: boolean
  onToggle: () => void
  tooltipId?: string
}

function AnalyzeToggleButton({
  showAnalyze,
  onToggle,
  tooltipId = 'toggle-analyze-tooltip',
}: AnalyzeToggleButtonProps): JSX.Element {
  const { t } = useTranslation()
  const description = showAnalyze ? t('show_pdf') : t('ask_assistant')
  const iconType = showAnalyze ? 'picture_as_pdf' : 'forum'

  return (
    <OLTooltip
      id={tooltipId}
      description={description}
      overlayProps={{ placement: 'bottom' }}
    >
      <OLButton
        variant="link"
        active={showAnalyze}
        className="pdf-toolbar-btn toolbar-item"
        onClick={onToggle}
        aria-pressed={showAnalyze}
        aria-label={description}
      >
        <MaterialIcon type={iconType} />
      </OLButton>
    </OLTooltip>
  )
}

export default memo(AnalyzeToggleButton)
