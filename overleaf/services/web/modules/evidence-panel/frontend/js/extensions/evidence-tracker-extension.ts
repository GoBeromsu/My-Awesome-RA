/**
 * Evidence Tracker Extension Registration
 *
 * This file exports the evidence tracker extension for registration
 * with the source editor via the module system.
 */

import { Extension } from '@codemirror/state'
import { evidenceTracker } from '@/features/source-editor/extensions/evidence-tracker'

/**
 * Extension factory function that returns the evidence tracker extension.
 * This follows the pattern expected by the module system.
 */
export const extension = (_options: Record<string, unknown>): Extension => {
  return evidenceTracker
}
