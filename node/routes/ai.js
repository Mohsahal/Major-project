const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Use environment variable; never hardcode keys
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn(
    "GEMINI_API_KEY is not set. AI routes will not work until configured."
  );
}
const ai = new GoogleGenerativeAI(apiKey);

// Generate professional summary
router.post("/generate-summary", async (req, res) => {
  try {
    const { jobTitle } = req.body;

    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
You are an expert resume writer specializing in entry-level positions and fresh graduates. Write a compelling professional summary for a resume for the following job title: "${jobTitle}".

Focus on:
- Academic achievements and relevant coursework
- Key technical skills and tools learned
- Any internships, projects, or relevant experience
- Soft skills and learning capabilities
- Career goals and enthusiasm for the role

The summary should:
- Be 3-4 lines long
- Highlight potential and eagerness to learn
- Emphasize transferable skills
- Be tailored for an entry-level position
- Use professional but enthusiastic tone
- Not include any options, instructions, or extra text

Only return the summary itself, written in first person.
`;


    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    res.json({
      summary: summary.trim().split("\n").filter(Boolean).slice(0, 5).join(" "),
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

// Generate experience description
router.post("/generate-experience", async (req, res) => {
  try {
    const { position, company, industry } = req.body;

    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
You are an expert resume writer. Write a compelling job description for the following position: "${position}" at "${company}" in the ${industry} industry.

Focus on:
- Key responsibilities and achievements
- Technical skills and tools used
- Impact and results
- Leadership and collaboration
- Innovation and problem-solving

The description should:
- Be 3-4 bullet points
- Use strong action verbs
- Include quantifiable achievements
- Be specific and detailed
- Use professional tone
- Not include any options, instructions, or extra text

Format as bullet points, starting each with a strong action verb.
`;

    const result = await model.generateContent(prompt);
    const description = result.response.text();

    res.json({ description: description.trim() });
  } catch (error) {
    console.error("Error generating experience description:", error);
    res
      .status(500)
      .json({ error: "Failed to generate experience description" });
  }
});

// Generate project description
router.post("/generate-project", async (req, res) => {
  try {
    const { projectName, technologies, role } = req.body;

    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
You are an expert resume writer. Write a compelling project description for the following project: "${projectName}" using ${technologies.join(
      ", "
    )} where the role was "${role}".

Focus on:
- Technical implementation details
- Key features and functionality
- Your specific contributions and role
- Technologies and tools used
- Problem-solving and challenges overcome
- Impact and results achieved

The description should:
- Be 3-4 bullet points
- Use strong action verbs
- Include technical details
- Highlight your specific contributions
- Be specific and detailed
- Use professional tone
- Not include any options, instructions, or extra text

Format as bullet points, starting each with a strong action verb.
`;

    const result = await model.generateContent(prompt);
    const description = result.response.text();

    res.json({ description: description.trim() });
  } catch (error) {
    console.error("Error generating project description:", error);
    res.status(500).json({ error: "Failed to generate project description" });
  }
});

// AI Chat for interview feedback
router.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body;

    console.log("=== AI Chat Request ===");
    console.log("Prompt length:", prompt?.length || 0);
    console.log("API Key configured:", apiKey ? "Yes" : "No");

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    if (!apiKey) {
      console.error("GEMINI_API_KEY is not configured");
      return res.status(500).json({
        success: false,
        message: "AI service is not configured. GEMINI_API_KEY is missing.",
      });
    }

    try {
      const model = ai.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,  // Increased to handle thinking tokens + actual response
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE",
          },
        ],
      });

      console.log("Calling Gemini API...");
      const result = await model.generateContent(prompt);

      if (!result || !result.response) {
        throw new Error("No response from Gemini API");
      }

      // Check if response was blocked by safety filters or hit limits
      const candidate = result.response.candidates?.[0];
      
      if (candidate?.finishReason === "MAX_TOKENS") {
        console.error("Response hit token limit:", result.response.usageMetadata);
        throw new Error(
          "Response exceeded token limit. The model used too many tokens. This has been logged and token limits have been increased."
        );
      }
      
      if (candidate?.finishReason === "SAFETY") {
        console.error(
          "Response blocked by safety filters:",
          candidate.safetyRatings
        );
        throw new Error(
          "Response blocked by content safety filters. Try rephrasing your question."
        );
      }

      if (result.response.promptFeedback?.blockReason) {
        console.error("Prompt blocked:", result.response.promptFeedback);
        throw new Error(
          "Prompt was blocked: " + result.response.promptFeedback.blockReason
        );
      }

      const response = result.response.text();
      console.log(
        "Gemini API response received, length:",
        response?.length || 0
      );

      if (!response || response.trim() === "") {
        console.error(
          "Empty response. Full result:",
          JSON.stringify(result.response, null, 2)
        );
        throw new Error(
          "Empty response from Gemini API. The response may have been filtered."
        );
      }

      // Clean up the response
      let cleanedResponse = response.trim();

      // If response looks like JSON, validate and fix it
      if (
        cleanedResponse.startsWith("{") ||
        cleanedResponse.includes('"ratings"')
      ) {
        try {
          // Try to extract JSON
          const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            let jsonStr = jsonMatch[0];

            // Try to parse first
            try {
              JSON.parse(jsonStr);
              cleanedResponse = jsonStr;
              console.log("Valid JSON extracted from response");
            } catch (parseError) {
              // If parse fails, try to fix control characters
              console.log("Attempting to fix JSON control characters...");

              // Fix unescaped control characters in string values
              // Match from "feedback": " to the closing " before next field or }
              jsonStr = jsonStr.replace(
                /"feedback"\s*:\s*"([\s\S]*?)"\s*(?=[,}])/,
                (match, content) => {
                  // Escape all control characters properly
                  const escaped = content
                    .replace(/\\/g, "\\\\")  // Escape backslashes first
                    .replace(/"/g, '\\"')    // Escape quotes
                    .replace(/\n/g, "\\n")   // Escape newlines
                    .replace(/\r/g, "\\r")   // Escape carriage returns
                    .replace(/\t/g, "\\t");  // Escape tabs
                  return `"feedback": "${escaped}"`;
                }
              );

              // Validate the fixed JSON
              JSON.parse(jsonStr);
              cleanedResponse = jsonStr;
              console.log("Fixed and validated JSON");
            }
          }
        } catch (e) {
          console.warn(
            "Response looks like JSON but failed to parse/fix:",
            e.message
          );
          console.warn("Raw response:", cleanedResponse);
        }
      }

      res.json({
        success: true,
        response: cleanedResponse,
      });
    } catch (geminiError) {
      console.error("Gemini API error:", geminiError);
      console.error("Error details:", {
        message: geminiError.message,
        stack: geminiError.stack,
        name: geminiError.name,
      });

      return res.status(500).json({
        success: false,
        message: "Gemini API error: " + geminiError.message,
        error: geminiError.message,
      });
    }
  } catch (error) {
    console.error("Error in AI chat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate AI response",
      error: error.message,
    });
  }
});

// Generate interview questions and answers array
router.post("/generate-questions", async (req, res) => {
  try {
    const { position, description, experience, techStack } = req.body;
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Determine difficulty level based on experience
    const isFresher = experience === 0 || experience === "0";
    const difficultyGuidance = isFresher
      ? `
IMPORTANT: This is for a FRESHER / ENTRY-LEVEL candidate with 0 years of experience.

The questions MUST be:
- Basic and fundamental concepts only
- Simple theoretical questions about core concepts
- Entry-level questions that a fresh graduate would know
- Questions about basic syntax, definitions, and fundamental principles
- NO advanced topics, design patterns, or complex scenarios
- NO questions about production experience or real-world complex implementations
- Focus on foundational knowledge and understanding of basics

Examples of appropriate fresher questions:
- "What is ${techStack.split(",")[0].trim()}?"
- "Explain the basic difference between X and Y"
- "What are the fundamental features of [technology]?"
- "How do you declare/define [basic concept]?"
- "What is the purpose of [basic feature]?"`
      : `
The questions should assess skills in ${techStack} development and best practices, problem-solving, and experience handling complex requirements appropriate for ${experience} years of experience.`;

    const prompt = `
As an experienced prompt engineer, generate a JSON array containing 5 technical interview questions along with detailed answers based on the following job information. Each object in the array should have the fields "question" and "answer", formatted as follows:

[
  { "question": "<Question text>", "answer": "<Answer text>" },
  ...
]

Job Information:
- Job Position: ${position}
- Job Description: ${description}
- Years of Experience Required: ${experience}
- Tech Stacks: ${techStack}

${difficultyGuidance}

Please format the output strictly as an array of JSON objects without any additional labels, code blocks, or explanations. Return only the JSON array with questions and answers.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const match = text.match(/\[[\s\S]*\]/);
    if (!match)
      return res
        .status(400)
        .json({ message: "Failed to extract JSON array from AI response" });
    const arr = JSON.parse(match[0]);
    if (!Array.isArray(arr))
      return res
        .status(400)
        .json({ message: "AI response is not a JSON array" });
    res.json({ questions: arr });
  } catch (error) {
    console.error("Error generating interview questions:", error);
    res.status(500).json({ message: "Failed to generate questions" });
  }
});

module.exports = router;
