require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const OpenAI = require("openai");

const app = express();
const PORT = 3000;


// ==========================================
// MIDDLEWARE / SECURITY
// ==========================================

// Security headers
app.use(helmet());


// Allow only local NOVA frontend
app.use(cors({
    origin: [
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ]
}));


// Limit request body size
app.use(
    express.json({
        limit: "10kb"
    })
);


// ==========================================
// RATE LIMITING
// ==========================================

// Limit AI requests to 20 per minute per IP

const aiLimiter = rateLimit({

    windowMs: 60 * 1000,

    limit: 20,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    message: {
        error:
            "Too many AI requests. Please wait a minute and try again."
    }

});


// Apply rate limit to both AI endpoints

app.use("/ask", aiLimiter);

app.use("/ai-suggestion", aiLimiter);


// ==========================================
// CHECK API KEY
// ==========================================

console.log(

    "🔑 OpenRouter API Key:",

    process.env.OPENROUTER_API_KEY
        ? "LOADED ✅"
        : "NOT FOUND ❌"

);


// ==========================================
// OPENROUTER CLIENT
// ==========================================

const client = new OpenAI({

    apiKey:
        process.env.OPENROUTER_API_KEY,

    baseURL:
        "https://openrouter.ai/api/v1"

});


// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {

    res.send(
        "🚀 NOVA OpenRouter AI Backend is running!"
    );

});


// ==========================================
// ASK AI
// ==========================================

app.post("/ask", async (req, res) => {

    try {

        // ======================================
        // GET + VALIDATE QUESTION
        // ======================================

        const question =
            typeof req.body.question === "string"
                ? req.body.question.trim()
                : "";


        // ======================================
        // CHECK QUESTION
        // ======================================

        if (!question) {

            return res.status(400).json({

                error:
                    "Question is required"

            });

        }


        // ======================================
        // QUESTION LENGTH LIMIT
        // ======================================

        if (question.length > 2000) {

            return res.status(400).json({

                error:
                    "Question is too long. Please keep it under 2000 characters."

            });

        }


        // ======================================
        // VALIDATE HISTORY
        // ======================================

        let history = [];


        if (Array.isArray(req.body.history)) {

            history =
                req.body.history

                    // Only allow valid messages
                    .filter(function (message) {

                        return (

                            message &&

                            typeof message === "object" &&

                            (
                                message.role === "user" ||
                                message.role === "assistant"
                            ) &&

                            typeof message.content === "string"

                        );

                    })

                    // Keep only latest 20 messages
                    .slice(-20);

        }


        // ======================================
        // LIMIT HISTORY MESSAGE SIZE
        // ======================================

        history =
            history.map(function (message) {

                return {

                    role:
                        message.role,

                    content:
                        message.content
                            .trim()
                            .slice(0, 2000)

                };

            });


        // ======================================
        // LOG REQUEST
        // ======================================

        console.log(
            "\n👤 User asked:",
            question
        );


        console.log(
            "🧠 Previous messages:",
            history.length
        );


        // ======================================
        // NOVA SYSTEM INSTRUCTIONS
        // ======================================

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


        // ======================================
        // BUILD CONVERSATION
        // ======================================

        const messages = [

            systemMessage,

            ...history,

            {
                role: "user",

                content: question

            }

        ];


        console.log(
            "📨 Sending request to OpenRouter..."
        );


        // ======================================
        // SEND REQUEST
        // ======================================

        const response =
            await client.chat.completions.create({

                model:
                    "openrouter/free",

                messages:
                    messages

            });


        // ======================================
        // GET ANSWER
        // ======================================

        const answer =
            response
                ?.choices
                ?.[0]
                ?.message
                ?.content;


        // ======================================
        // CHECK ANSWER
        // ======================================

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


        // ======================================
        // LOG ANSWER
        // ======================================

        console.log(
            "\n🤖 NOVA:",
            answer
        );


        // ======================================
        // SEND ANSWER
        // ======================================

        res.json({

            answer:
                answer

        });

    }


    catch (error) {

        console.error(
            "\n❌ OPENROUTER ERROR:"
        );

        console.error(error);


        res.status(500).json({

            error:
                "NOVA could not answer the question."

        });

    }

});


// ==========================================
// AI PERSONALIZED SUGGESTION
// ==========================================

app.post(
    "/ai-suggestion",
    async (req, res) => {

        try {

            // ======================================
            // GET STUDENT DATA
            // ======================================

            const totalTasks =
                Number(req.body.totalTasks);


            const completedTasks =
                Number(req.body.completedTasks);


            const questionsAsked =
                Number(req.body.questionsAsked);


            const progress =
                Number(req.body.progress);


            // ======================================
            // VALIDATE NUMBERS
            // ======================================

            if (

                !Number.isFinite(totalTasks) ||

                !Number.isFinite(completedTasks) ||

                !Number.isFinite(questionsAsked) ||

                !Number.isFinite(progress)

            ) {

                return res.status(400).json({

                    error:
                        "Invalid student statistics."

                });

            }


            // ======================================
            // RANGE VALIDATION
            // ======================================

            if (

                totalTasks < 0 ||

                completedTasks < 0 ||

                questionsAsked < 0 ||

                progress < 0 ||

                progress > 100

            ) {

                return res.status(400).json({

                    error:
                        "Invalid student statistics values."

                });

            }


            // Completed tasks cannot exceed total tasks

            if (
                completedTasks >
                totalTasks
            ) {

                return res.status(400).json({

                    error:
                        "Completed tasks cannot exceed total tasks."

                });

            }


            // ======================================
            // LOG STUDENT DATA
            // ======================================

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


            // ======================================
            // AI PROMPT
            // ======================================

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


            // ======================================
            // CALL OPENROUTER
            // ======================================

            console.log(
                "🤖 Generating personalized AI suggestion..."
            );


            const response =
                await client.chat.completions.create({

                    model:
                        "openrouter/free",

                    messages: [

                        {

                            role:
                                "system",

                            content:
                                "You are NOVA, a personalized AI study coach."

                        },

                        {

                            role:
                                "user",

                            content:
                                prompt

                        }

                    ]

                });


            // ======================================
            // GET SUGGESTION
            // ======================================

            const suggestion =
                response
                    ?.choices
                    ?.[0]
                    ?.message
                    ?.content;


            // ======================================
            // CHECK SUGGESTION
            // ======================================

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


            // ======================================
            // LOG SUGGESTION
            // ======================================

            console.log(
                "💡 NOVA Suggestion:",
                suggestion
            );


            // ======================================
            // SEND TO FRONTEND
            // ======================================

            res.json({

                suggestion:
                    suggestion

            });

        }


        catch (error) {

            console.error(
                "\n❌ AI SUGGESTION ERROR:"
            );

            console.error(error);


            res.status(500).json({

                error:
                    "NOVA could not generate a study suggestion."

            });

        }

    }
);


// ==========================================
// START SERVER
// ==========================================

app.listen(
    PORT,
    () => {

        console.log(
            "\n🚀 NOVA OpenRouter backend running at"
        );

        console.log(
            `http://localhost:${PORT}`
        );

    }
);