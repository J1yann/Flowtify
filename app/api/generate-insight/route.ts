import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check if AI is enabled
    const aiEnabled = process.env.NEXT_PUBLIC_ENABLE_AI === 'true';
    if (!aiEnabled) {
      return NextResponse.json({ 
        insight: 'Your music taste is unique and wonderful! Keep discovering new sounds.' 
      });
    }

    const { tracks, artists, genres, period } = await request.json();
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        insight: 'Your music taste is unique and wonderful! Keep discovering new sounds.' 
      });
    }

    // Format tracks with artists for better context
    const tracksList = tracks.map((t: any) => `"${t.name}" by ${t.artist}`).join(', ');
    const artistsList = artists.map((a: any) => {
      const genreText = a.genres.length > 0 ? ` (${a.genres.join(', ')})` : '';
      return `${a.name}${genreText}`;
    }).join(', ');

    const prompt = `You are an enthusiastic music analyst who loves discovering patterns in people's listening habits. 

Based on this user's Spotify data from the ${period}, write a warm, positive, and insightful observation about their music taste. Be specific about the songs and artists they love!

Top 5 Tracks: ${tracksList}

Top 5 Artists: ${artistsList}

Main Genres: ${genres.slice(0, 6).join(', ')}

Write 2-3 engaging sentences that:
1. Mention specific songs or artists they've been loving
2. Describe their overall vibe or mood
3. Give them a positive, fun compliment about their taste

Keep it under 60 words and make it feel personal!`;

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
            temperature: 0.9,
            maxOutputTokens: 100,
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
    const insight = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Your music taste is amazing!';

    return NextResponse.json({ insight });
  } catch (error) {
    console.error('Error generating insight:', error);
    return NextResponse.json(
      { insight: 'Your music taste is unique and wonderful! Keep discovering new sounds.' },
      { status: 200 }
    );
  }
}
