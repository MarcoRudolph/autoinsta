export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 });
  }

  // Use the exact same structure that gets saved (Personality type)
  const structureJson = JSON.stringify({
    "name": "",
    "description": "",
    "childhoodExperiences": {
      "personalDevelopment": [],
      "sexuality": [],
      "generalExperiences": [],
      "socialEnvironmentFriendships": [],
      "educationLearning": [],
      "familyRelationships": []
    },
    "emotionalTriggers": [],
    "characterTraits": [],
    "positiveTraits": {
      "socialCommunicative": [],
      "professionalCognitive": [],
      "personalIntrinsic": []
    },
    "negativeTraits": [],
    "areasOfInterest": [],
    "communicationStyle": {
      "tone": "",
      "wordChoice": "",
      "responsePatterns": "",
      "humor": {
        "humorEnabled": false,
        "humorTypes": [],
        "humorIntensity": "",
        "humorExclusionTopics": []
      }
    },
    "delayMin": 5,
    "delayMax": 10
  });

  const prompt = `Fill out the following JSON structure with a realistic, detailed persona for a social media dashboard app. Use English for all fields. Only return a valid JSON object, matching the structure exactly. Do not add or remove fields.

For characterTraits, areasOfInterest, and other arrays, provide 3-5 realistic items.
For emotionalTriggers, provide 3-5 specific situations or topics that would trigger emotional responses (positive or negative) for this persona.
For communicationStyle.tone, wordChoice, and responsePatterns, provide descriptive text about how the persona communicates.
For childhoodExperiences sections, provide 2-3 relevant experiences for each category:
- personalDevelopment: experiences that shaped their personal growth
- sexuality: experiences related to their understanding of relationships and identity
- generalExperiences: significant life events from childhood
- socialEnvironmentFriendships: experiences with friends and social situations
- educationLearning: experiences in school or learning environments
- familyRelationships: experiences with family members
For communicationStyle.humor:
- Set humorEnabled to true if the persona uses humor in communication
- For humorTypes, provide 2-3 types like "witty", "sarcastic", "playful", "dry", "self-deprecating"
- For humorIntensity, use "light", "moderate", or "high"
- For humorExclusionTopics, list 2-3 topics they avoid joking about

Structure:
${structureJson}`;

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
