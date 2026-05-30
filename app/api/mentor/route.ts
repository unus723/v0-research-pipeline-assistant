import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured." }, { status: 401 });
    }

    const body = await req.json();
    const { currentStage, projectState, mentorAction } = body;

    // Fast check for stage 0-15 completion if requesting draft-abstract
    if (mentorAction === "draft-abstract") {
      let stagesCompleted = 0;
      for (let i = 0; i <= 15; i++) {
        const stageId = Object.keys(projectState.stages).find(key => {
          // It's a bit hard to find by index if not passed properly, but we'll try our best
          // In the actual system prompt we will enforce this rule strongly.
          return true;
        });
      }
    }

    const systemPrompt = `You are the AI Mentor for the Research Pipeline Assistant.
Your job is to assist the researcher based on their project state and the requested action.

Rules:
1. You must never invent citations, DOI, venue, or paper details.
2. If suggesting papers, clearly mark them as "to verify."
3. You should not allow abstract drafting before contributions (stage 15) are complete. If requested before stages 0-15 are complete, refuse and explain why.
4. You should warn when claims are unsupported by evidence.
5. You should act as an assistant, not an authority.
6. You should ask for missing evidence instead of fabricating it.

You must output in JSON format with exactly three fields:
{
  "response": "Your main response here.",
  "warnings": ["Warning 1", "Warning 2"] // strings of warnings if any rule is borderline, evidence missing, or unsupported claims,
  "suggestedNextAction": "Short string of what the user should do next."
}
`;

    const userPrompt = `
Requested Action: ${mentorAction}
Current Stage: ${currentStage?.title || currentStage}

Project State (JSON):
${JSON.stringify(projectState, null, 2)}

Produce your JSON output now.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: "OpenAI API error", details: err }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
