import { Config } from '../types/config'
import { MistralUsage } from '../external/mistral/types'

export type AiCreditsKind = 'bindings' | 'structureChat'

type AiCreditsPricing = Config['plan']['aiCredits']

const INSTRUCTIONS_TOKENS: Record<AiCreditsKind, number> = {
  bindings: 900,
  structureChat: 2100,
}
const CHARS_PER_TOKEN = 4

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export const sumUsage = (usages: Array<MistralUsage>): MistralUsage =>
  usages.reduce(
    (acc, usage) => ({
      promptTokens: acc.promptTokens + usage.promptTokens,
      completionTokens: acc.completionTokens + usage.completionTokens,
    }),
    { promptTokens: 0, completionTokens: 0 }
  )

export const computeAiCost = (
  usage: MistralUsage,
  pricing: AiCreditsPricing,
  kind: AiCreditsKind
): number => {
  const weightedTokens =
    usage.promptTokens + pricing.outputTokenWeight * usage.completionTokens
  const { min, max } = pricing[kind]

  return clamp(Math.ceil(weightedTokens / pricing.tokensPerCredit), min, max)
}

export const estimateAiCost = (
  inputChars: number,
  expectedOutputTokens: number,
  pricing: AiCreditsPricing,
  kind: AiCreditsKind,
  requests = 1
): number =>
  computeAiCost(
    {
      promptTokens:
        Math.ceil(inputChars / CHARS_PER_TOKEN) +
        INSTRUCTIONS_TOKENS[kind] * requests,
      completionTokens: expectedOutputTokens,
    },
    pricing,
    kind
  )

export const EXPECTED_TOKENS_PER_BINDING = 60
export const EXPECTED_CHAT_REPLY_TOKENS = 500
