import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 });
  }

  const prompt = `Generate a detailed persona as a JSON object for a social media dashboard app. The structure should include:
{
  "name": string,
  "description": string,
  "childhoodExperiences": {
    "personalDevelopment": [{ "ereignis": string, "auswirkung": string }],
    "sexuality": [{ "ereignis": string, "auswirkung": string }],
    "generalExperiences": [{ "ereignis": string, "auswirkung": string }],
    "socialEnvironmentFriendships": [{ "ereignis": string, "auswirkung": string }],
    "educationLearning": [{ "ereignis": string, "auswirkung": string }],
    "familyRelationships": [{ "ereignis": string, "auswirkung": string }]
  },
  "emotionalTriggers": [string],
  "characterTraits": [string],
  "positiveTraits": {
    "socialCommunicative": [string],
    "professionalCognitive": [string],
    "personalIntrinsic": [string]
  },
  "negativeTraits": [string],
  "areasOfInterest": [string],
  "communicationStyle": {
    "tone": string,
    "wordChoice": string,
    "responsePatterns": string,
    "humor": {
      "humorEnabled": boolean,
      "humorTypes": [string],
      "humorIntensity": string,
      "humorExclusionTopics": [string]
    }
  }
}
Respond ONLY with the JSON object, no explanation.`;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1200,
        temperature: 0.8,
      }),
    });
    const openaiData = await openaiRes.json();
    const content = openaiData.choices?.[0]?.message?.content;
    if (!content) throw new Error('No content from OpenAI');
    // Try to parse the JSON from the response
    let persona;
    try {
      persona = JSON.parse(content);
    } catch {
      // Try to extract JSON from code block if present
      const match = content.match(/```json([\s\S]*?)```/);
      if (match) {
        persona = JSON.parse(match[1]);
      } else {
        throw new Error('Could not parse persona JSON');
      }
    }
    return NextResponse.json({ persona });
  } catch {
    return NextResponse.json({ error: 'Failed to generate persona' }, { status: 500 });
  }
} 