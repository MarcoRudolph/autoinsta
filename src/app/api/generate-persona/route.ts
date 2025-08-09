import { NextResponse } from 'next/server';

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 });
  }

  // Use inline structure instead of reading from file system
  const structureJson = JSON.stringify({
    "name": "",
    "age": 0,
    "location": "",
    "occupation": "",
    "personality": {
      "traits": [],
      "communication_style": "",
      "tone": ""
    },
    "interests": [],
    "background": "",
    "communication_preferences": {
      "response_length": "",
      "emoji_usage": "",
      "formality_level": ""
    },
    "goals_and_motivations": [],
    "typical_responses": {
      "greeting": "",
      "question_about_services": "",
      "compliment": "",
      "complaint": ""
    }
  });

  const prompt = `Fill out the following JSON structure with a realistic, detailed persona for a social media dashboard app. Use English for all fields. Only return a valid JSON object, matching the structure exactly. Do not add or remove fields.\n\nStructure:\n${structureJson}`;

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
    // Return the persona directly instead of saving to file system
    return NextResponse.json({ persona });
  } catch {
    return NextResponse.json({ error: 'Failed to generate persona' }, { status: 500 });
  }
} 