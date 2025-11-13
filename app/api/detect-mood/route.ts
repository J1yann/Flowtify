import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check if AI is enabled
    const aiEnabled = process.env.NEXT_PUBLIC_ENABLE_AI === 'true';
    if (!aiEnabled) {
      return NextResponse.json({ 
        mood: 'Vibing with great music! 🎵' 
      });
    }

    const { tracks } = await request.json();
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        mood: 'Vibing with great music! 🎵' 
      });
    }

    // Take up to 20 tracks
    const tracksToAnalyze = tracks.slice(0, 20);
    
    // Format tracks with artists and genres
    const tracksList = tracksToAnalyze.map((t: any) => {
      const genres = t.genres && t.genres.length > 0 ? ` [${t.genres.join(', ')}]` : '';
      return `"${t.name}" by ${t.artist}${genres}`;
    }).join('\n');

   const prompt = `
You are a friendly music psychologist interpreting someone's mood based on what they've listened to today.

Songs listened to:
${tracksList}

Write a mood description that is:
- **10–15 words**
- Warm, welcoming, and emotionally supportive
- Clear and easy to understand (no metaphors or overly poetic language)
- Gives a small boost of positive encouragement
- Uses **1–2 emojis** that fit the tone naturally
- Sounds like a caring human, not a dramatic narrator

Good tone examples:
- "You seem calm and thoughtful today — a gentle, grounded energy shines through 😊"
- "Feeling mellow and reflective, but there's a hopeful spark lifting you up ✨"
- "Your vibe is relaxed and steady — you're doing better than you think 💛"

Your response (10–15 words):
`;



    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 50,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', response.status, errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const mood = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Vibing with great music! 🎵';
    const isAIGenerated = !!data.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({ mood, isAIGenerated });
  } catch (error) {
    console.error('Error detecting mood:', error);
    return NextResponse.json(
      { mood: 'Vibing with great music! 🎵', isAIGenerated: false },
      { status: 200 }
    );
  }
}
