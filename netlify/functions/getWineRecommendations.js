import Anthropic from "@anthropic-ai/sdk";

export const handler = async (event) => {
  try {
    // Parse the prompt from React
    const body = JSON.parse(event.body);
    const prompt = body.myPrompt || body.prompt;

    // Initialize Anthropic client with API key from environment
    const apiKey =
      process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Missing Anthropic API key. Set ANTHROPIC_API_KEY in Netlify env or .env.local.",
      );
    }
    const anthropic = new Anthropic({
      apiKey,
    });

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    const winePairing =
      response?.content?.[0]?.text ??
      response?.completion ??
      response?.output ??
      "Could not parse completion";

    return {
      statusCode: 200,
      body: JSON.stringify({ winePairing }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
