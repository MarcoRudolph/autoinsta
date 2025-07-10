import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// export const runtime = 'edge'; // Disable edge runtime to allow fs

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 });
  }

  // Read the structure from structure.json
  const structurePath = path.join(process.cwd(), 'public', 'structure.json');
  let structureJson = '';
  try {
    structureJson = await fs.readFile(structurePath, 'utf-8');
  } catch {
    return NextResponse.json({ error: 'Could not read structure.json' }, { status: 500 });
  }

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
    // Save persona as template.json in public folder
    const filePath = path.join(process.cwd(), 'public', 'template.json');
    await fs.writeFile(filePath, JSON.stringify(persona, null, 2), 'utf-8');
    return NextResponse.json({ persona });
  } catch {
    return NextResponse.json({ error: 'Failed to generate persona' }, { status: 500 });
  }
} 