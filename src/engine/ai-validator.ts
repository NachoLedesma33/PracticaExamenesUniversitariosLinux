export type AIProvider = 'openai' | 'anthropic'

export interface AIValidatorConfig {
  provider: AIProvider
  apiKey: string
  model: string
  enabled: boolean
}

function buildSystemPrompt(instruction: string, solution: string): string {
  return `Eres un asistente que evalúa respuestas de ejercicios de Linux/Sistemas Operativos.

Ejercicio: ${instruction}
Respuesta modelo: ${solution}

Evaluá si la respuesta del usuario es conceptualmente correcta, aunque use diferentes palabras o estructura.
- Ignorá diferencias de formato, mayúsculas, puntuación, tildes.
- Aceptá sinónimos técnicos ("archivo" = "fichero", "enlace duro" = "hard link", etc.).
- Para scripts: aceptá cualquier implementación que cumpla la misma funcionalidad.
- Respondé SOLO en este formato JSON:
  {"match": true/false, "confidence": 0.0-1.0, "feedback": "explicación breve de qué falta o qué está bien"}`
}

function buildCommandPrompt(instruction: string, solution: string): string {
  return `Eres un asistente que evalúa comandos de Linux/Sistemas Operativos.

Ejercicio: ${instruction}
Comando modelo: ${solution}

Evaluá si el comando del usuario es funcionalmente equivalente al comando modelo.
- Aceptá diferentes flags si logran el mismo resultado.
- Aceptá pipes, redirecciones, y orden de argumentos diferentes.
- Aceptá comandos equivalentes ("dir" por "ls", "type" por "cat", "del" por "rm", etc.).
- Para scripts: aceptá cualquier implementación que cumpla la misma funcionalidad (while vs for, diferentes nombres de variables).
- Respondé SOLO en este formato JSON:
  {"match": true/false, "confidence": 0.0-1.0, "feedback": "explicación breve"}`
}

export async function validateWithAI(
  userInput: string,
  config: AIValidatorConfig,
  instruction: string,
  solution: string,
  validationType: string,
): Promise<{ match: boolean; confidence: number; feedback?: string } | null> {
  if (!config.enabled || !config.apiKey) return null

  const prompt = validationType === 'command'
    ? buildCommandPrompt(instruction, solution)
    : buildSystemPrompt(instruction, solution)

  try {
    if (config.provider === 'openai') {
      return await callOpenAI(userInput, prompt, config)
    } else if (config.provider === 'anthropic') {
      return await callAnthropic(userInput, prompt, config)
    }
    return null
  } catch {
    return null
  }
}

async function callOpenAI(
  userInput: string,
  systemPrompt: string,
  config: AIValidatorConfig,
): Promise<{ match: boolean; confidence: number; feedback: string }> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Respuesta del usuario:\n${userInput}` },
      ],
      temperature: 0.1,
      max_tokens: 300,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenAI API error ${res.status}: ${text}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content || ''
  return parseAIResponse(content)
}

async function callAnthropic(
  userInput: string,
  systemPrompt: string,
  config: AIValidatorConfig,
): Promise<{ match: boolean; confidence: number; feedback: string }> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model || 'claude-3-haiku-20240307',
      system: systemPrompt,
      messages: [
        { role: 'user', content: `Respuesta del usuario:\n${userInput}` },
      ],
      temperature: 0.1,
      max_tokens: 300,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Anthropic API error ${res.status}: ${text}`)
  }

  const data = await res.json()
  const content = data.content?.[0]?.text || ''
  return parseAIResponse(content)
}

function parseAIResponse(content: string): { match: boolean; confidence: number; feedback: string } {
  try {
    const json = JSON.parse(content)
    return {
      match: Boolean(json.match),
      confidence: typeof json.confidence === 'number' ? json.confidence : 0.5,
      feedback: json.feedback || '',
    }
  } catch {
    const match = /true/i.test(content)
    return {
      match,
      confidence: match ? 0.8 : 0.3,
      feedback: content,
    }
  }
}
