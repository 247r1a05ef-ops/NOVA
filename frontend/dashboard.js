// ==========================================
// NOVA DASHBOARD
// ==========================================

const API_URL = "http://localhost:3000/ask";


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    loadDarkMode();
    loadTheme();
    loadPlannerProgress();

});


// ==========================================
// DARK MODE
// ==========================================

function loadDarkMode() {

    const theme = localStorage.getItem("theme");

    if (theme === "dark") {

        document.body.classList.add("dark-mode");

    } else {

        document.body.classList.remove("dark-mode");

    }

}


function toggleDarkMode() {

    document.body.classList.toggle("dark-mode");

    const isDark =
        document.body.classList.contains("dark-mode");

    localStorage.setItem(
        "theme",
        isDark ? "dark" : "light"
    );

}


// ==========================================
// THEME
// ==========================================

function loadTheme() {

    const theme =
        localStorage.getItem("novaTheme");

    document.body.classList.remove(
        "theme-sky",
        "theme-green",
        "theme-purple"
    );

    if (theme === "green") {

        document.body.classList.add("theme-green");

    }

    else if (theme === "purple") {

        document.body.classList.add("theme-purple");

    }

    else {

        document.body.classList.add("theme-sky");

    }

}


// ==========================================
// PLANNER PROGRESS
// ==========================================

function loadPlannerProgress() {

    const savedTasks =
        localStorage.getItem("tasks");

    if (!savedTasks) {

        updateDashboardProgress(0, 0);

        return;

    }

    const tempList =
        document.createElement("ul");

    tempList.innerHTML = savedTasks;

    const tasks =
        tempList.querySelectorAll("li");

    const completedTasks =
        tempList.querySelectorAll(".completed");

    const total =
        tasks.length;

    const completed =
        completedTasks.length;

    let percentage = 0;

    if (total > 0) {

        percentage =
            Math.round(
                (completed / total) * 100
            );

    }

    updateDashboardProgress(
        percentage,
        total,
        completed
    );

}


// ==========================================
// UPDATE DASHBOARD PROGRESS
// ==========================================

function updateDashboardProgress(
    percentage,
    total = 0,
    completed = 0
) {

    const progressText =
        document.getElementById(
            "dashboardProgressText"
        );

    const progressFill =
        document.getElementById(
            "dashboardProgressFill"
        );

    const taskText =
        document.getElementById(
            "dashboardTaskText"
        );

    const taskCount =
        document.getElementById(
            "dashboardTasksCount"
        );

    if (progressText) {

        progressText.innerText =
            percentage + "%";

    }

    if (progressFill) {

        progressFill.style.width =
            percentage + "%";

    }

    if (taskText) {

        if (total === 0) {

            taskText.innerText =
                "No tasks yet";

        } else {

            taskText.innerText =
                completed +
                " / " +
                total +
                " tasks completed";

        }

    }

    if (taskCount) {

        if (total === 0) {

            taskCount.innerText =
                "No tasks yet";

        } else {

            taskCount.innerText =
                total + " tasks";

        }

    }

}


// ==========================================
// GO TO PLANNER
// ==========================================

function goToPlanner() {

    window.location.href =
        "planner.html";

}


// ==========================================
// VOICE ASSISTANT
// ==========================================

function goToAssistant() {

    window.location.href =
        "voice-assistant.html";

}


// ==========================================
// PROFILE
// ==========================================

function goToProfile() {

    alert(
        "👤 Profile page is coming next!"
    );

}


// ==========================================
// SEARCH NOVA
// ==========================================

async function searchNOVA() {

    const query =
        prompt(
            "🔍 What do you want to ask NOVA?"
        );

    if (
        !query ||
        query.trim() === ""
    ) {

        return;

    }

    await askDashboardAI(
        query,
        "🔍 NOVA Search"
    );

}


// ==========================================
// AI SUGGESTION
// ==========================================

async function showAISuggestion() {

    const savedTasks =
        localStorage.getItem("tasks");

    let taskInfo =
        "The student has no saved tasks.";

    if (savedTasks) {

        const tempList =
            document.createElement("ul");

        tempList.innerHTML =
            savedTasks;

        const tasks =
            tempList.querySelectorAll("li");

        const completed =
            tempList.querySelectorAll(
                ".completed"
            );

        taskInfo =
            `The student has ${tasks.length} tasks and ${completed.length} completed tasks.`;

    }

    const prompt = `

You are NOVA, an AI study assistant.

Give the student ONE personalized study suggestion.

Student planner information:
${taskInfo}

Give:
1. What they should study
2. How long they should study
3. A short reason

Keep it beginner-friendly and concise.

`;

    await askDashboardAI(
        prompt,
        "🤖 AI Study Suggestion"
    );

}


// ==========================================
// AI INSIGHTS
// ==========================================

async function showAIInsights() {

    const savedTasks =
        localStorage.getItem("tasks");

    let taskInfo =
        "No planner data is available.";

    if (savedTasks) {

        const tempList =
            document.createElement("ul");

        tempList.innerHTML =
            savedTasks;

        const tasks =
            tempList.querySelectorAll("li");

        const completed =
            tempList.querySelectorAll(
                ".completed"
            );

        taskInfo =
            `Total tasks: ${tasks.length}
Completed tasks: ${completed.length}`;

    }

    const prompt = `

You are NOVA, an AI learning assistant.

Analyze this student's planner information:

${taskInfo}

Give a short learning insight.

Mention:
- What the student is doing well
- What they should improve
- One practical suggestion

Keep it simple.

`;

    await askDashboardAI(
        prompt,
        "🧠 NOVA AI Insights"
    );

}


// ==========================================
// DEADLINES
// ==========================================

function showDeadlines() {

    alert(
        "⏰ Deadline tracking will be connected to the planner soon."
    );

}


// ==========================================
// STATISTICS
// ==========================================

function showStatistics() {

    const savedTasks =
        localStorage.getItem("tasks");

    if (!savedTasks) {

        alert(
            "📊 No study statistics available yet."
        );

        return;

    }

    const tempList =
        document.createElement("ul");

    tempList.innerHTML =
        savedTasks;

    const total =
        tempList.querySelectorAll("li").length;

    const completed =
        tempList.querySelectorAll(
            ".completed"
        ).length;

    const percentage =
        total > 0
            ? Math.round(
                (completed / total) * 100
            )
            : 0;

    alert(
        "📊 NOVA Statistics\n\n" +
        "Total Tasks: " +
        total +
        "\nCompleted: " +
        completed +
        "\nProgress: " +
        percentage +
        "%"
    );

}


// ==========================================
// NOTIFICATIONS
// ==========================================

function showNotifications() {

    alert(
        "🔔 No new notifications."
    );

}


// ==========================================
// ASK NOVA THROUGH BACKEND
// ==========================================

async function askDashboardAI(
    question,
    title = "🤖 NOVA"
) {

    const popup =
        document.createElement("div");

    popup.style.position =
        "fixed";

    popup.style.top =
        "50%";

    popup.style.left =
        "50%";

    popup.style.transform =
        "translate(-50%, -50%)";

    popup.style.width =
        "min(600px, 90%)";

    popup.style.maxHeight =
        "80vh";

    popup.style.overflowY =
        "auto";

    popup.style.padding =
        "30px";

    popup.style.borderRadius =
        "20px";

    popup.style.background =
        document.body.classList.contains(
            "dark-mode"
        )
            ? "#2a2a2a"
            : "white";

    popup.style.color =
        document.body.classList.contains(
            "dark-mode"
        )
            ? "white"
            : "black";

    popup.style.boxShadow =
        "0 20px 60px rgba(0,0,0,0.3)";

    popup.style.zIndex =
        "9999";

    popup.innerHTML = `

        <h2>${title}</h2>

        <p style="margin-top:20px;">
            🤔 NOVA is thinking...
        </p>

    `;

    document.body.appendChild(
        popup
    );


    try {

        const response =
            await fetch(
                API_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            question:
                                question,

                            history: []

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "NOVA request failed"
            );

        }


        popup.innerHTML = `

            <h2>${title}</h2>

            <div style="
                margin-top:20px;
                line-height:1.7;
                white-space:pre-wrap;
            ">
                ${escapeHTML(data.answer)}
            </div>

            <button
                onclick="this.parentElement.remove()"
                style="
                    margin-top:25px;
                    padding:10px 20px;
                    border:none;
                    border-radius:10px;
                    cursor:pointer;
                "
            >
                Close
            </button>

        `;

    }

    catch (error) {

        console.error(
            "NOVA ERROR:",
            error
        );

        popup.innerHTML = `

            <h2>❌ NOVA Error</h2>

            <p style="margin-top:20px;">
                Could not connect to NOVA.
            </p>

            <p>
                Make sure your backend is running:
            </p>

            <code>
                http://localhost:3000
            </code>

            <br><br>

            <button
                onclick="this.parentElement.remove()"
            >
                Close
            </button>

        `;

    }

}


// ==========================================
// SECURITY
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}