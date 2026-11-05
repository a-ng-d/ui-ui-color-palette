import {
  STRUCTURE_MAX_ISSUES,
  STRUCTURE_MAX_QUESTION_OPTIONS,
  STRUCTURE_MAX_QUESTIONS,
  StructureIssue,
  StructureQuestion,
} from '../types/structureChat'

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== ''

const isStringArray = (value: unknown): value is Array<string> =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

export const sanitizeStructureQuestions = (
  raw: unknown
): Array<StructureQuestion> => {
  if (!Array.isArray(raw)) return []

  const seenIds = new Set<string>()

  return raw
    .filter(
      (item): item is { id: unknown; text: unknown; options?: unknown } =>
        typeof item === 'object' && item !== null
    )
    .filter((item) => isNonEmptyString(item.text))
    .map((item, index) => {
      let id = isNonEmptyString(item.id) ? item.id : `q${index + 1}`
      if (seenIds.has(id)) id = `${id}-${index + 1}`
      seenIds.add(id)

      const options = isStringArray(item.options)
        ? [...new Set(item.options.filter(isNonEmptyString))].slice(
            0,
            STRUCTURE_MAX_QUESTION_OPTIONS
          )
        : []

      return {
        id,
        text: (item.text as string).trim(),
        ...(options.length >= 2 ? { options } : {}),
      }
    })
    .slice(0, STRUCTURE_MAX_QUESTIONS)
}

export const sanitizeStructureIssues = (
  raw: unknown
): Array<StructureIssue> => {
  if (!Array.isArray(raw)) return []

  return raw
    .filter(
      (
        item
      ): item is { severity: unknown; message: unknown; paths?: unknown } =>
        typeof item === 'object' && item !== null
    )
    .filter((item) => isNonEmptyString(item.message))
    .map((item) => {
      const severity: StructureIssue['severity'] =
        item.severity === 'ERROR' ||
        item.severity === 'WARNING' ||
        item.severity === 'INFO'
          ? item.severity
          : 'WARNING'
      const paths = Array.isArray(item.paths)
        ? item.paths.filter(isStringArray)
        : []

      return {
        severity,
        message: (item.message as string).trim(),
        ...(paths.length > 0 ? { paths } : {}),
      }
    })
    .slice(0, STRUCTURE_MAX_ISSUES)
}
