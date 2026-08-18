// ==========================================
// NOVA - FRONTEND JAVASCRIPT
// ==========================================


// ==========================================
// SECTION NAVIGATION
// ==========================================

function showSection(sectionId) {

    const sections = document.querySelectorAll(".section");

    sections.forEach(function (section) {
        section.classList.remove("active");
    });


    const selectedSection =
        document.getElementById(sectionId);


    if (selectedSection) {
        selectedSection.classList.add("active");
    }

}



// ==========================================
// ASK NOVA
// ==========================================

async function askNOVA() {

    const input =
        document.getElementById("questionInput");

    const chatMessages =
        document.getElementById("chatMessages");


    if (!input || !chatMessages) {
        return;
    }


    const question =
        input.value.trim();


    // ------------------------------------------
    // CHECK EMPTY QUESTION
    // ------------------------------------------

    if (question === "") {

        alert("Please enter a question.");

        return;

    }


    // ------------------------------------------
    // SHOW USER MESSAGE
    // ------------------------------------------

    const userMessage =
        document.createElement("div");

    userMessage.className =
        "user-message";


    userMessage.innerHTML =
        `
        👤 <strong>You:</strong>
        <p>${escapeHTML(question)}</p>
        `;


    chatMessages.appendChild(userMessage);


    // ------------------------------------------
    // CLEAR INPUT
    // ------------------------------------------

    input.value = "";


    // ------------------------------------------
    // SHOW THINKING MESSAGE
    // ------------------------------------------

    const thinkingMessage =
        document.createElement("div");

    thinkingMessage.className =
        "nova-message";

    thinkingMessage.id =
        "novaThinking";


    thinkingMessage.innerHTML =
        `
        🤖 <strong>NOVA:</strong>
        <p>🤔 NOVA is thinking...</p>
        `;


    chatMessages.appendChild(thinkingMessage);


    // Scroll to bottom

    chatMessages.scrollTop =
        chatMessages.scrollHeight;


    try {

        // --------------------------------------
        // SEND QUESTION TO BACKEND
        // --------------------------------------

        const response =
            await fetch(
                "http://localhost:3000/ask",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            question: question,

                            history: []

                        })

                }
            );


        // --------------------------------------
        // GET RESPONSE
        // --------------------------------------

        const data =
            await response.json();


        // --------------------------------------
        // REMOVE THINKING MESSAGE
        // --------------------------------------

        const thinking =
            document.getElementById(
                "novaThinking"
            );


        if (thinking) {
            thinking.remove();
        }


        // --------------------------------------
        // CHECK ERROR
        // --------------------------------------

        if (!response.ok) {

            throw new Error(
                data.error ||
                "AI request failed."
            );

        }


        // --------------------------------------
        // SHOW NOVA ANSWER
        // --------------------------------------

        const novaMessage =
            document.createElement("div");

        novaMessage.className =
            "nova-message";


        novaMessage.innerHTML =
            `
            🤖 <strong>NOVA:</strong>
            <p>${escapeHTML(data.answer)}</p>
            `;


        chatMessages.appendChild(
            novaMessage
        );


        // --------------------------------------
        // UPDATE QUESTION COUNT
        // --------------------------------------

        let questionCount =
            Number(
                localStorage.getItem(
                    "novaQuestionCount"
                )
            ) || 0;


        questionCount++;


        localStorage.setItem(
            "novaQuestionCount",
            questionCount
        );


        // --------------------------------------
        // SCROLL TO BOTTOM
        // --------------------------------------

        chatMessages.scrollTop =
            chatMessages.scrollHeight;

    }


    catch (error) {

        console.error(
            "NOVA AI Error:",
            error
        );


        const thinking =
            document.getElementById(
                "novaThinking"
            );


        if (thinking) {
            thinking.remove();
        }


        const errorMessage =
            document.createElement("div");

        errorMessage.className =
            "nova-message";


        errorMessage.innerHTML =
            `
            🤖 <strong>NOVA:</strong>
            <p>
                ❌ Sorry, I couldn't connect to the AI.
                Please make sure the NOVA backend is running.
            </p>
            `;


        chatMessages.appendChild(
            errorMessage
        );


        chatMessages.scrollTop =
            chatMessages.scrollHeight;

    }

}



// ==========================================
// SECURITY HELPER
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}



// ==========================================
// ENTER KEY SUPPORT
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const input =
            document.getElementById(
                "questionInput"
            );


        if (input) {

            input.addEventListener(
                "keydown",
                function (event) {

                    if (event.key === "Enter") {

                        askNOVA();

                    }

                }
            );

        }

    }
);