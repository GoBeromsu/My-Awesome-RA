/**
 * LaTeX parsing utilities for extracting sections and cleaning content.
 */

interface LatexSection {
  title: string
  content: string
  startLine: number
  endLine: number
}

/**
 * Parse LaTeX content into sections based on \section{} commands.
 */
export function parseLatexSections(content: string): LatexSection[] {
  const lines = content.split('\n')
  const sections: LatexSection[] = []

  // Match \section{Title}, \subsection{Title}, etc.
  const sectionRegex = /^\\(section|subsection|subsubsection)\*?\{([^}]+)\}/

  let currentSection: LatexSection | null = null
  let currentContent: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const match = line.match(sectionRegex)

    if (match) {
      // Save previous section
      if (currentSection) {
        currentSection.content = currentContent.join('\n').trim()
        currentSection.endLine = i - 1
        if (currentSection.content) {
          sections.push(currentSection)
        }
      }

      // Start new section
      currentSection = {
        title: match[2].trim(),
        content: '',
        startLine: i,
        endLine: i,
      }
      currentContent = []
    } else if (currentSection) {
      currentContent.push(line)
    }
  }

  // Save last section
  if (currentSection) {
    currentSection.content = currentContent.join('\n').trim()
    currentSection.endLine = lines.length - 1
    if (currentSection.content) {
      sections.push(currentSection)
    }
  }

  return sections
}

/**
 * Strip LaTeX commands from text, leaving readable content.
 */
export function stripLatexCommands(text: string): string {
  let result = text

  // Remove comments
  result = result.replace(/%.*$/gm, '')

  // Remove \begin{...} and \end{...}
  result = result.replace(/\\(begin|end)\{[^}]+\}/g, '')

  // Remove common formatting commands but keep content
  // \textbf{text} -> text
  result = result.replace(/\\(textbf|textit|emph|underline|texttt)\{([^}]*)\}/g, '$2')

  // Remove \cite{...} references
  result = result.replace(/\\cite\{[^}]*\}/g, '[citation]')

  // Remove \ref{...} and \label{...}
  result = result.replace(/\\(ref|label|eqref)\{[^}]*\}/g, '')

  // Remove figure/table environments content
  result = result.replace(/\\begin\{(figure|table)\}[\s\S]*?\\end\{\1\}/g, '[figure/table]')

  // Remove \includegraphics
  result = result.replace(/\\includegraphics(\[[^\]]*\])?\{[^}]*\}/g, '')

  // Remove other common commands
  result = result.replace(/\\(item|hline|centering|caption)\b/g, '')

  // Remove remaining simple commands like \newline, \par, etc.
  result = result.replace(/\\[a-zA-Z]+\b/g, '')

  // Clean up curly braces
  result = result.replace(/[{}]/g, '')

  // Clean up multiple spaces and newlines
  result = result.replace(/\s+/g, ' ')
  result = result.replace(/\n\s*\n/g, '\n\n')

  return result.trim()
}

/**
 * Merge short sections into longer ones for better analysis.
 */
export function mergeShortSections(
  sections: LatexSection[],
  minLength: number = 100
): LatexSection[] {
  if (sections.length === 0) {
    return []
  }

  const merged: LatexSection[] = []
  let current: LatexSection | null = null

  for (const section of sections) {
    if (!current) {
      current = { ...section }
      continue
    }

    // If current section is too short, merge with next
    if (current.content.length < minLength) {
      current = {
        title: current.title,
        content: `${current.content}\n\n${section.title}\n${section.content}`,
        startLine: current.startLine,
        endLine: section.endLine,
      }
    } else {
      merged.push(current)
      current = { ...section }
    }
  }

  // Add last section
  if (current) {
    merged.push(current)
  }

  return merged
}
