// Semantic search for the registry. Sends item summaries to Groq and returns ranked IDs.
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

const SYSTEM_PROMPT = `You are a campus lost-and-found search assistant. Given a user search query and a list of items, rank the items by how likely they match the query. Consider semantic similarity, not just exact keyword matches. For example, "jacket" should match "hoodie" or "coat" with moderate confidence.

Return ONLY a valid JSON array of objects with "id" and "confidence" (0.0 to 1.0) fields. Only include items with confidence >= 0.2. Sort by confidence descending. No markdown, no prose, no explanation. Just the JSON array.

Example output: [{"id":"ex-001","confidence":0.95},{"id":"ex-003","confidence":0.6}]

If nothing matches at all, return: []`;

function parseRankedIds(content) {
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(item => item.confidence >= 0.2)
      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
      .map(item => item.id);
  } catch {
    if (content.toLowerCase().includes('none') || content.trim() === '[]') {
      return [];
    }
    return [];
  }
}

export async function rankItemsByQuery(searchQuery, candidateItems) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API key not configured (VITE_GROQ_API_KEY missing from .env)');
  }

  const itemSummaries = candidateItems.map(item => ({
    id: item.id,
    title: item.title || '',
    category: item.category || '',
    description: item.description || '',
    location: item.location_name || item.location || '',
  }));

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Search query: "${searchQuery}"\n\nItems to evaluate:\n${JSON.stringify(itemSummaries)}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => null);
    const errMsg = errBody?.error?.message || `HTTP ${response.status}`;
    throw new Error(`Groq API: ${errMsg}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '[]';
  return parseRankedIds(content);
}
