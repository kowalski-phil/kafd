import { RECIPE_PARSE_PROMPT } from '../lib/parsePrompt'
import type { ClaudeParseResult } from '../lib/types'

export async function parseRecipePhoto(imageBase64: string, mimeType: string): Promise<ClaudeParseResult> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured')
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
            {
              type: 'text',
              text: RECIPE_PARSE_PROMPT,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(
      `API Fehler: ${(err as Record<string, Record<string, string>>).error?.message || response.statusText}`
    )
  }

  const result = await response.json()
  const text = (result as { choices: { message: { content: string } }[] }).choices[0].message.content

  // Strip potential markdown code fences
  const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()

  return JSON.parse(cleaned) as ClaudeParseResult
}
