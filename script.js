const STORAGE_KEY = "studyFlow_v2";

let appData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    todos: [],
    questions: []
};

let todoFilter = "all";

const pages = {
    dashboard: "داشبورد",
    todos: "کارهای من",
    questions: "ثبت سؤالات",
    statistics: "آمار و گزارش"
};

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function getTodayKey() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("fa-IR", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });
}

function formatShortDate(dateString) {
    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("fa-IR", {
        month: "short",
        day: "numeric"
    });
}

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}


function getSubjectTotals() {

    const totals = {
        math: 0,
        persian: 0,
        science: 0,
        arabic: 0
    };

    appData.questions.forEach(item => {

        totals.math += Number(item.math) || 0;
        totals.persian += Number(item.persian) || 0;
        totals.science += Number(item.science) || 0;
        totals.arabic += Number(item.arabic) || 0;

    });

    return totals;
}


function getTotalQuestions() {

    const totals = getSubjectTotals();

    return (
        totals.math +
        totals.persian +
        totals.science +
        totals.arabic
    );
}


function getTodayQuestions() {

    const today = getTodayKey();

    const item = appData.questions.find(
        question => question.date === today
    );

    if (!item) return 0;

    return (
        Number(item.math) +
        Number(item.persian) +
        Number(item.science) +
        Number(item.arabic)
    );
}


function updateTopbar() {

    const date = new Date();

    document.getElementById("todayDate").textContent =
        date.toLocaleDateString("fa-IR", {
            day: "numeric",
            month: "short"
        });
}


function updateDashboard() {

    const remaining = appData.todos.filter(
        todo => !todo.completed
    ).length;

    const completed = appData.todos.filter(
        todo => todo.completed
    ).length;

    document.getElementById("remainingTasks").textContent = remaining;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("todayQuestions").textContent = getTodayQuestions();
    document.getElementById("allQuestions").textContent = getTotalQuestions();

    const totals = getSubjectTotals();

    document.getElementById("mathDashboard").textContent = totals.math;
    document.getElementById("persianDashboard").textContent = totals.persian;
    document.getElementById("scienceDashboard").textContent = totals.science;
    document.getElementById("arabicDashboard").textContent = totals.arabic;

    const max = Math.max(
        totals.math,
        totals.persian,
        totals.science,
        totals.arabic,
        1
    );

    document.getElementById("mathBar").style.width =
        `${(totals.math / max) * 100}%`;

    document.getElementById("persianBar").style.width =
        `${(totals.persian / max) * 100}%`;

    document.getElementById("scienceBar").style.width =
        `${(totals.science / max) * 100}%`;

    document.getElementById("arabicBar").style.width =
        `${(totals.arabic / max) * 100}%`;

    renderDashboardTodos();
    renderDashboardChart();
}


function renderDashboardTodos() {

    const container = document.getElementById("dashboardTodos");

    const todos = appData.todos
        .slice()
        .reverse()
        .slice(0, 5);

    if (todos.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                هنوز کاری ثبت نکرده‌ای.
            </div>
        `;

        return;
    }

    container.innerHTML = todos.map(todo => {

        return `
            <div class="todo-mini ${todo.completed ? "done" : ""}">

                <button
                    class="check ${todo.completed ? "checked" : ""}"
                    onclick="toggleTodo('${todo.id}')"
                >
                    ${todo.completed ? "✓" : ""}
                </button>

                <span class="todo-mini-text">
                    ${escapeHTML(todo.title)}
                </span>

            </div>
        `;

    }).join("");
}


function renderDashboardChart() {

    const container = document.getElementById("dashboardChart");

    const days = [];

    for (let i = 6; i >= 0; i--) {

        const date = new Date();

        date.setDate(date.getDate() - i);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        const key = `${year}-${month}-${day}`;

        const question = appData.questions.find(
            item => item.date === key
        );

        const total = question
            ? Number(question.math) +
              Number(question.persian) +
              Number(question.science) +
              Number(question.arabic)
            : 0;

        days.push({
            date: key,
            total,
            name: date.toLocaleDateString("fa-IR", {
                weekday: "short"
            })
        });
    }

    const max = Math.max(
        ...days.map(day => day.total),
        1
    );

    container.innerHTML = days.map(day => {

        const height = Math.max(
            4,
            (day.total / max) * 120
        );

        return `
            <div class="chart-column">

                <span class="chart-value">
                    ${day.total}
                </span>

                <div
                    class="chart-bar"
                    style="height:${height}px"
                ></div>

                <span class="chart-day">
                    ${day.name}
                </span>

            </div>
        `;

    }).join("");
}


function renderTodoList() {

    const container = document.getElementById("todoList");

    let todos = [...appData.todos];

    if (todoFilter === "active") {
        todos = todos.filter(todo => !todo.completed);
    }

    if (todoFilter === "completed") {
        todos = todos.filter(todo => todo.completed);
    }

    if (todos.length === 0) {

        container.innerHTML = `
            <div class="panel empty-state">
                چیزی برای نمایش وجود ندارد.
            </div>
        `;

        return;
    }

    container.innerHTML = todos
        .slice()
        .reverse()
        .map(todo => {

            return `
                <div class="todo-item ${todo.completed ? "done" : ""}">

                    <button
                        class="check ${todo.completed ? "checked" : ""}"
                        onclick="toggleTodo('${todo.id}')"
                    >
                        ${todo.completed ? "✓" : ""}
                    </button>

                    <div class="todo-content">

                        <div class="todo-title">
                            ${escapeHTML(todo.title)}
                        </div>

                        <span class="todo-status">
                            ${todo.completed ? "انجام شده" : "در انتظار انجام"}
                        </span>

                    </div>

                    <button
                        class="delete-todo"
                        onclick="deleteTodo('${todo.id}')"
                    >
                        ×
                    </button>

                </div>
            `;

        })
        .join("");
}


function updateTodoCounters() {

    const all = appData.todos.length;

    const completed = appData.todos.filter(
        todo => todo.completed
    ).length;

    const remaining = all - completed;

    document.getElementById("todoAllCount").textContent = all;
    document.getElementById("todoCompletedCount").textContent = completed;
    document.getElementById("todoRemainingCount").textContent = remaining;
}


function addTodo() {

    const input = document.getElementById("todoInput");

    const title = input.value.trim();

    if (!title) {
        showToast("عنوان کار را وارد کن.");
        input.focus();
        return;
    }

    appData.todos.push({
        id: Date.now().toString(),
        title,
        completed: false,
        createdAt: new Date().toISOString()
    });

    saveData();

    input.value = "";

    closeTodoModal();

    renderAll();

    showToast("کار جدید اضافه شد ✓");
}


function toggleTodo(id) {

    const todo = appData.todos.find(
        item => item.id === id
    );

    if (!todo) return;

    todo.completed = !todo.completed;

    saveData();

    renderAll();

    showToast(
        todo.completed
            ? "کار انجام شد ✓"
            : "کار به حالت انجام‌نشده برگشت"
    );
}


function deleteTodo(id) {

    appData.todos = appData.todos.filter(
        todo => todo.id !== id
    );

    saveData();

    renderAll();

    showToast("کار حذف شد.");
}


function updateQuestionTotalPreview() {

    const math =
        Number(document.getElementById("mathInput").value) || 0;

    const persian =
        Number(document.getElementById("persianInput").value) || 0;

    const science =
        Number(document.getElementById("scienceInput").value) || 0;

    const arabic =
        Number(document.getElementById("arabicInput").value) || 0;

    const total =
        math +
        persian +
        science +
        arabic;

    document.getElementById("questionTodayTotal").textContent =
        total;
}


function loadTodayQuestions() {

    const today = getTodayKey();

    const item = appData.questions.find(
        question => question.date === today
    );

    document.getElementById("mathInput").value =
        item ? item.math : "";

    document.getElementById("persianInput").value =
        item ? item.persian : "";

    document.getElementById("scienceInput").value =
        item ? item.science : "";

    document.getElementById("arabicInput").value =
        item ? item.arabic : "";

    updateQuestionTotalPreview();
}


function saveQuestions() {

    const today = getTodayKey();

    const values = {
        math: Number(document.getElementById("mathInput").value) || 0,
        persian: Number(document.getElementById("persianInput").value) || 0,
        science: Number(document.getElementById("scienceInput").value) || 0,
        arabic: Number(document.getElementById("arabicInput").value) || 0
    };

    const total =
        values.math +
        values.persian +
        values.science +
        values.arabic;

    const existing = appData.questions.find(
        item => item.date === today
    );

    if (existing) {

        existing.math = values.math;
        existing.persian = values.persian;
        existing.science = values.science;
        existing.arabic = values.arabic;

    } else {

        appData.questions.push({
            date: today,
            ...values
        });

    }

    saveData();

    renderAll();

    showToast(`امروز ${total} سؤال ثبت شد ✓`);
}


function renderQuestionHistory() {

    const container = document.getElementById("questionHistory");

    const questions = [...appData.questions]
        .sort((a, b) => b.date.localeCompare(a.date));

    document.getElementById("historyCount").textContent =
        `${questions.length} روز`;

    if (questions.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                هنوز هیچ آماری ثبت نشده است.
            </div>
        `;

        return;
    }

    container.innerHTML = questions.map(item => {

        const total =
            Number(item.math) +
            Number(item.persian) +
            Number(item.science) +
            Number(item.arabic);

        return `
            <div class="history-row">

                <div class="history-date">
                    ${formatShortDate(item.date)}
                </div>

                <div class="history-number">
                    ریاضی: ${item.math}
                </div>

                <div class="history-number">
                    فارسی: ${item.persian}
                </div>

                <div class="history-number">
                    علوم: ${item.science}
                </div>

                <div class="history-number">
                    عربی: ${item.arabic}
                </div>

                <div class="history-total">
                    ${total} سؤال
                </div>

                <button
                    class="history-delete"
                    onclick="deleteQuestionRecord('${item.date}')"
                >
                    حذف
                </button>

            </div>
        `;

    }).join("");
}


function deleteQuestionRecord(date) {

    appData.questions = appData.questions.filter(
        item => item.date !== date
    );

    saveData();

    renderAll();

    loadTodayQuestions();

    showToast("آمار این روز حذف شد.");
}


function renderStatistics() {

    const totals = getSubjectTotals();

    document.getElementById("reportQuestions").textContent =
        getTotalQuestions();

    document.getElementById("reportMath").textContent =
        totals.math;

    document.getElementById("reportPersian").textContent =
        totals.persian;

    document.getElementById("reportScience").textContent =
        totals.science;

    document.getElementById("reportArabic").textContent =
        totals.arabic;

    document.getElementById("reportTodos").textContent =
        appData.todos.filter(todo => todo.completed).length;

    renderSubjectReport();
    renderRecentDays();
}


function renderSubjectReport() {

    const container = document.getElementById("subjectReport");

    const totals = getSubjectTotals();

    const subjects = [
        ["ریاضی", totals.math, "math"],
        ["فارسی", totals.persian, "persian"],
        ["علوم", totals.science, "science"],
        ["عربی", totals.arabic, "arabic"]
    ];

    const max = Math.max(
        ...subjects.map(item => item[1]),
        1
    );

    container.innerHTML = subjects.map(subject => {

        const percentage =
            (subject[1] / max) * 100;

        return `
            <div class="report-subject">

                <div class="report-subject-title">

                    <span>
                        <i class="dot ${subject[2]}"></i>
                        ${subject[0]}
                    </span>

                    <span>
                        ${subject[1]} سؤال
                    </span>

                </div>

                <div class="bar">

                    <span
                        style="
                            width:${percentage}%;
                            background:
                            ${
                                subject[2] === "math"
                                    ? "#3563f5"
                                    : subject[2] === "persian"
                                    ? "#20b486"
                                    : subject[2] === "science"
                                    ? "#8065e9"
                                    : "#ed9a3d"
                            }
                        "
                    ></span>

                </div>

            </div>
        `;

    }).join("");
}


function renderRecentDays() {

    const container = document.getElementById("recentDays");

    const days = [];

    for (let i = 6; i >= 0; i--) {

        const date = new Date();

        date.setDate(date.getDate() - i);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        const key =
            `${year}-${month}-${day}`;

        const question = appData.questions.find(
            item => item.date === key
        );

        const total = question
            ? Number(question.math) +
              Number(question.persian) +
              Number(question.science) +
              Number(question.arabic)
            : 0;

        days.push({
            key,
            total
        });
    }

    const max = Math.max(
        ...days.map(day => day.total),
        1
    );

    container.innerHTML = days.map(day => {

        const percentage =
            (day.total / max) * 100;

        return `
            <div class="recent-day">

                <div class="recent-date">
                    ${formatShortDate(day.key)}
                </div>

                <div class="recent-bar">
                    <span style="width:${percentage}%"></span>
                </div>

                <div class="recent-number">
                    ${day.total}
                </div>

            </div>
        `;

    }).join("");
}


function openTodoModal() {

    document.getElementById("todoModal")
        .classList.add("show");

    document.getElementById("todoInput").focus();
}


function closeTodoModal() {

    document.getElementById("todoModal")
        .classList.remove("show");
}


function navigate(pageName) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    const page = document.getElementById(pageName);

    if (!page) return;

    page.classList.add("active");

    const nav = document.querySelector(
        `.nav-item[data-page="${pageName}"]`
    );

    if (nav) {
        nav.classList.add("active");
    }

    document.getElementById("pageTitle").textContent =
        pages[pageName];

    document.getElementById("sidebar")
        .classList.remove("open");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function renderAll() {

    updateDashboard();

    updateTodoCounters();

    renderTodoList();

    renderQuestionHistory();

    renderStatistics();
}


document.querySelectorAll(".nav-item").forEach(button => {

    button.addEventListener("click", () => {
        navigate(button.dataset.page);
    });

});


document.querySelectorAll("[data-open-page]").forEach(button => {

    button.addEventListener("click", () => {
        navigate(button.dataset.openPage);
    });

});


document.querySelectorAll(".todo-tab").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".todo-tab").forEach(tab => {
            tab.classList.remove("active");
        });

        button.classList.add("active");

        todoFilter =
            button.dataset.todoFilter;

        renderTodoList();

    });

});


document.getElementById("openTodoModal")
    .addEventListener("click", openTodoModal);


document.getElementById("closeTodoModal")
    .addEventListener("click", closeTodoModal);


document.getElementById("addTodo")
    .addEventListener("click", addTodo);


document.getElementById("saveQuestions")
    .addEventListener("click", saveQuestions);


document.querySelectorAll("#questions input").forEach(input => {

    input.addEventListener(
        "input",
        updateQuestionTotalPreview
    );

});


document.getElementById("mobileMenu")
    .addEventListener("click", () => {

        document.getElementById("sidebar")
            .classList.toggle("open");

    });


document.getElementById("todoInput")
    .addEventListener("keydown", event => {

        if (event.key === "Enter") {
            addTodo();
        }

    });


document.getElementById("todoModal")
    .addEventListener("click", event => {

        if (event.target.id === "todoModal") {
            closeTodoModal();
        }

    });


document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closeTodoModal();
    }

});


document.getElementById("deleteAllData")
    .addEventListener("click", () => {

        const confirmation = confirm(
            "آیا مطمئنی می‌خواهی تمام کارها و آمار سؤالات پاک شود؟"
        );

        if (!confirmation) return;

        appData = {
            todos: [],
            questions: []
        };

        saveData();

        renderAll();

        loadTodayQuestions();

        showToast("تمام اطلاعات پاک شد.");
    });


updateTopbar();

loadTodayQuestions();

renderAll();