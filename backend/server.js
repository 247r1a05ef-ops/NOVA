require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const OpenAI = require("openai");

const app = express();

// Render provides PORT automatically
const PORT = process.env.PORT || 3000;


// =====================================================
// TRUST RENDER PROXY
// =====================================================

app.set("trust proxy", 1);


// =====================================================
// SECURITY / MIDDLEWARE
// =====================================================

app.use(helmet());


// =====================================================
// CORS
// =====================================================

// During development your HTML may be opened using
// file://, which gives the browser an origin of "null".
//
// origin: true reflects the requesting origin.
// This allows both local development and the deployed
// frontend while we are testing.

app.use(
    cors({
        origin: true,

        methods: [
            "GET",
            "POST",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type"
        ]
    })
);


// Explicitly handle CORS preflight requests



// =====================================================
// BODY PARSER
// =====================================================

app.use(express.json({
    limit: "100kb"
}));


// =====================================================
// RATE LIMITING
// =====================================================

// Protect AI endpoints from excessive requests.

const aiLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 30,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        error: "Too many AI requests. Please try again later."
    }

});


// =====================================================
// CHECK API KEY
// =====================================================

console.log(
    "🔑 OpenRouter API Key:",
    process.env.OPENROUTER_API_KEY
        ? "LOADED ✅"
        : "NOT FOUND ❌"
);


// =====================================================
// OPENROUTER CLIENT
// =====================================================

if (!process.env.OPENROUTER_API_KEY) {

    console.error(
        "❌ OPENROUTER_API_KEY is missing."
    );

}

const client = new OpenAI({

    apiKey: process.env.OPENROUTER_API_KEY,

    baseURL: "https://openrouter.ai/api/v1"

});


// =====================================================
// TEST ROUTE
// =====================================================

app.get("/", (req, res) => {

    res.json({

        status: "online",

        message:
            "🚀 NOVA OpenRouter AI Backend is running!"

    });

});


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/health", (req, res) => {

    res.json({

        status: "ok",

        service: "NOVA backend"

    });

});


// =====================================================
// ASK AI
// =====================================================

app.post(
    "/ask",
    aiLimiter,
    async (req, res) => {

        try {

            // =================================================
            // CHECK API KEY
            // =================================================

            if (!process.env.OPENROUTER_API_KEY) {

                return res.status(500).json({

                    error:
                        "OpenRouter API key is not configured."

                });

            }


            // =================================================
            // GET DATA
            // =================================================

            const question =
                typeof req.body.question === "string"
                    ? req.body.question.trim()
                    : "";

            const history =
                Array.isArray(req.body.history)
                    ? req.body.history
                    : [];


            // =================================================
            // CHECK QUESTION
            // =================================================

            if (!question) {

                return res.status(400).json({

                    error:
                        "Question is required."

                });

            }


            // =================================================
            // LIMIT HISTORY
            // =================================================

            const safeHistory =
                history
                    .filter(message =>
                        message &&
                        (message.role === "user" ||
                         message.role === "assistant") &&
                        typeof message.content === "string"
                    )
                    .slice(-20);


            console.log(
                "\n👤 User asked:",
                question
            );


            console.log(
                "🧠 Previous messages:",
                safeHistory.length
            );


            // =================================================
            // NOVA SYSTEM INSTRUCTIONS
            // =================================================

            const systemMessage = {

                role: "system",

                content: `
You are NOVA, an AI study assistant.

Your job is to help the user learn and solve problems.

Be friendly, clear and beginner-friendly.

For coding questions:

- Explain the logic step by step.
- Give correct code.
- Explain important parts.
- Mention common mistakes when useful.

For mathematical questions:

- Solve step by step.
- Show important calculations.

For general questions:

- Give a simple and useful explanation.

IMPORTANT:

Use the conversation history to understand follow-up questions.

Example:

User:
Explain binary search.

NOVA:
Binary search is...

User:
Give me an example.

NOVA should understand that "example" means an example of binary search.

Do not unnecessarily repeat previous answers.

Always provide a useful answer to the user's question.
`

            };


            // =================================================
            // BUILD CONVERSATION
            // =================================================

            const messages = [

                systemMessage,

                ...safeHistory,

                {
                    role: "user",
                    content: question
                }

            ];


            console.log(
                "📨 Sending request to OpenRouter..."
            );


            // =================================================
            // SEND REQUEST
            // =================================================

            const response =
                await client.chat.completions.create({

                    model: "openrouter/free",

                    messages: messages

                });


            // =================================================
            // GET ANSWER
            // =================================================

            const answer =
                response?.choices?.[0]?.message?.content;


            // =================================================
            // CHECK ANSWER
            // =================================================

            if (
                !answer ||
                typeof answer !== "string" ||
                answer.trim() === ""
            ) {

                console.error(
                    "❌ OpenRouter returned no usable answer."
                );


                return res.status(500).json({

                    error:
                        "OpenRouter did not return a usable AI answer."

                });

            }


            // =================================================
            // LOG ANSWER
            // =================================================

            console.log(
                "\n🤖 NOVA:",
                answer
            );


            // =================================================
            // SEND ANSWER
            // =================================================

            return res.json({

                answer: answer

            });

        }

        catch (error) {

            console.error(
                "\n❌ OPENROUTER ERROR:"
            );

            console.error(error);


            return res.status(500).json({

                error:
                    "NOVA could not answer the question."

            });

        }

    }
);


// =====================================================
// AI PERSONALIZED SUGGESTION
// =====================================================

app.post(
    "/ai-suggestion",
    aiLimiter,
    async (req, res) => {

        try {

            // =================================================
            // CHECK API KEY
            // =================================================

            if (!process.env.OPENROUTER_API_KEY) {

                return res.status(500).json({

                    error:
                        "OpenRouter API key is not configured."

                });

            }


            // =================================================
            // GET STUDENT DATA
            // =================================================

            const totalTasks =
                Number(req.body.totalTasks) || 0;

            const completedTasks =
                Number(req.body.completedTasks) || 0;

            const questionsAsked =
                Number(req.body.questionsAsked) || 0;

            const progress =
                Number(req.body.progress) || 0;


            console.log(
                "\n📊 STUDENT PROGRESS"
            );

            console.log(
                "Total tasks:",
                totalTasks
            );

            console.log(
                "Completed tasks:",
                completedTasks
            );

            console.log(
                "Questions asked:",
                questionsAsked
            );

            console.log(
                "Progress:",
                progress + "%"
            );


            // =================================================
            // AI PROMPT
            // =================================================

            const prompt = `

You are NOVA, a friendly AI study assistant.

Create ONE personalized study suggestion for the student.

Student statistics:

Total tasks: ${totalTasks}
Completed tasks: ${completedTasks}
Questions asked: ${questionsAsked}
Current progress: ${progress}%

Rules:

- Give one practical suggestion.
- Keep it short.
- Be encouraging.
- Do not make up information.
- Use the statistics provided.
- If progress is low, encourage the student to complete a small task.
- If progress is high, encourage continued practice or a slightly harder challenge.
- Mention the student's progress when useful.
- Do not use complicated language.

Return ONLY the suggestion.
`;


            // =================================================
            // CALL OPENROUTER
            // =================================================

            console.log(
                "🤖 Generating personalized AI suggestion..."
            );


            const response =
                await client.chat.completions.create({

                    model: "openrouter/free",

                    messages: [

                        {
                            role: "system",

                            content:
                                "You are NOVA, a personalized AI study coach."

                        },

                        {
                            role: "user",

                            content: prompt

                        }

                    ]

                });


            // =================================================
            // GET SUGGESTION
            // =================================================

            const suggestion =
                response?.choices?.[0]?.message?.content;


            // =================================================
            // CHECK SUGGESTION
            // =================================================

            if (
                !suggestion ||
                typeof suggestion !== "string" ||
                suggestion.trim() === ""
            ) {

                return res.status(500).json({

                    error:
                        "NOVA could not generate a suggestion."

                });

            }


            console.log(
                "💡 NOVA Suggestion:",
                suggestion
            );


            // =================================================
            // SEND TO FRONTEND
            // =================================================

            return res.json({

                suggestion: suggestion

            });

        }

        catch (error) {

            console.error(
                "\n❌ AI SUGGESTION ERROR:"
            );

            console.error(error);


            return res.status(500).json({

                error:
                    "NOVA could not generate a study suggestion."

            });

        }

    }
);


// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {

    res.status(404).json({

        error: "NOVA API route not found."

    });

});


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((error, req, res, next) => {

    console.error(
        "❌ SERVER ERROR:",
        error
    );

    res.status(500).json({

        error:
            "Internal NOVA server error."

    });

});


// =====================================================
// START SERVER
// =====================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            "\n🚀 NOVA OpenRouter backend running at"
        );

        console.log(
            `http://localhost:${PORT}`
        );

    }
);