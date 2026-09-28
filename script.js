const STORAGE_KEY = "studyFlow_v2";

const defaultData = {
    todos: [],
    questions: []
};

let appData = loadData();
let todoFilter = "all";

const pages = {
    dashboard: "داشبورد",
    todos: "کارهای من",
    questions: "ثبت سؤالات",
    statistics: "آمار و گزارش"
};

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return {
                todos: [],
                questions: []
            };
        }

        const data = JSON.parse(saved);

        return {
            todos: Array.isArray(data.todos) ? data.todos : [],
            questions: Array.isArray(data.questions) ? data.questions : []
        };

    } catch (error) {
        console.error("خطا در خواندن اطلاعات:", error);

        return {
            todos: [],
            questions: []
        };
    }
}

function saveData() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(appData)
        );

        return true;

    } catch (error) {
        console.error("خطا در ذخیره اطلاعات:", error);
        showToast("ذخیره اطلاعات انجام نشد.");
        return false;
    }
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

    if (!toast) return;

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

    const todayDate = document.getElementById("todayDate");

    if (todayDate) {
        todayDate.textContent =
            date.toLocaleDateString("fa-IR", {
                day: "numeric",
                month: "short"
            });
    }
}

function updateDashboard() {
    const remaining = appData.todos.filter(
        todo => !todo.completed
    ).length;

    const completed = appData.todos.filter(
        todo => todo.completed
    ).length;

    const remainingTasks =
        document.getElementById("remainingTasks");

    const completedTasks =
        document.getElementById("completedTasks");

    const todayQuestions =
        document.getElementById("todayQuestions");

    const allQuestions =
        document.getElementById("allQuestions");

    if (remainingTasks) {
        remainingTasks.textContent = remaining;
    }

    if (completedTasks) {
        completedTasks.textContent = completed;
    }

    if (todayQuestions) {
        todayQuestions.textContent = getTodayQuestions();
    }

    if (allQuestions) {
        allQuestions.textContent = getTotalQuestions();
    }

    const totals = getSubjectTotals();

    const mathDashboard =
        document.getElementById("mathDashboard");

    const persianDashboard =
        document.getElementById("persianDashboard");

    const scienceDashboard =
        document.getElementById("scienceDashboard");

    const arabicDashboard =
        document.getElementById("arabicDashboard");

    if (mathDashboard) {
        mathDashboard.textContent = totals.math;
    }

    if (persianDashboard) {
        persianDashboard.textContent = totals.persian;
    }

    if (scienceDashboard) {
        scienceDashboard.textContent = totals.science;
    }

    if (arabicDashboard) {
        arabicDashboard.textContent = totals.arabic;
    }

    const max = Math.max(
        totals.math,
        totals.persian,
        totals.science,
        totals.arabic,
        1
    );

    const mathBar = document.getElementById("mathBar");
    const persianBar = document.getElementById("persianBar");
    const scienceBar = document.getElementById("scienceBar");
    const arabicBar = document.getElementById("arabicBar");

    if (mathBar) {
        mathBar.style.width =
            `${(totals.math / max) * 100}%`;
    }

    if (persianBar) {
        persianBar.style.width =
            `${(totals.persian / max) * 100}%`;
    }

    if (scienceBar) {
        scienceBar.style.width =
            `${(totals.science / max) * 100}%`;
    }

    if (arabicBar) {
        arabicBar.style.width =
            `${(totals.arabic / max) * 100}%`;
    }

    renderDashboardTodos();
    renderDashboardChart();
}

function renderDashboardTodos() {
    const container =
        document.getElementById("dashboardTodos");

    if (!container) return;

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
    const container =
        document.getElementById("dashboardChart");

    if (!container) return;

    const days = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();

        date.setDate(date.getDate() - i);

        const year = date.getFullYear();
        const month =
            String(date.getMonth() + 1).padStart(2, "0");
        const day =
            String(date.getDate()).padStart(2, "0");

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
    const container =
        document.getElementById("todoList");

    if (!container) return;

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
                            ${todo.completed
                                ? "انجام شده"
                                : "در انتظار انجام"}
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

    const allCount =
        document.getElementById("todoAllCount");

    const completedCount =
        document.getElementById("todoCompletedCount");

    const remainingCount =
        document.getElementById("todoRemainingCount");

    if (allCount) {
        allCount.textContent = all;
    }

    if (completedCount) {
        completedCount.textContent = completed;
    }

    if (remainingCount) {
        remainingCount.textContent = remaining;
    }
}

function addTodo() {
    const input =
        document.getElementById("todoInput");

    if (!input) return;

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

    if (!saveData()) return;

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

    if (!saveData()) return;

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

    if (!saveData()) return;

    renderAll();

    showToast("کار حذف شد.");
}

function updateQuestionTotalPreview() {
    const mathInput =
        document.getElementById("mathInput");

    const persianInput =
        document.getElementById("persianInput");

    const scienceInput =
        document.getElementById("scienceInput");

    const arabicInput =
        document.getElementById("arabicInput");

    if (!mathInput ||
        !persianInput ||
        !scienceInput ||
        !arabicInput) {
        return;
    }

    const math =
        Number(mathInput.value) || 0;

    const persian =
        Number(persianInput.value) || 0;

    const science =
        Number(scienceInput.value) || 0;

    const arabic =
        Number(arabicInput.value) || 0;

    const total =
        math +
        persian +
        science +
        arabic;

    const preview =
        document.getElementById("questionTodayTotal");

    if (preview) {
        preview.textContent = total;
    }
}

function loadTodayQuestions() {
    const today = getTodayKey();

    const item = appData.questions.find(
        question => question.date === today
    );

    const mathInput =
        document.getElementById("mathInput");

    const persianInput =
        document.getElementById("persianInput");

    const scienceInput =
        document.getElementById("scienceInput");

    const arabicInput =
        document.getElementById("arabicInput");

    if (!mathInput ||
        !persianInput ||
        !scienceInput ||
        !arabicInput) {
        return;
    }

    mathInput.value =
        item ? item.math : "";

    persianInput.value =
        item ? item.persian : "";

    scienceInput.value =
        item ? item.science : "";

    arabicInput.value =
        item ? item.arabic : "";

    updateQuestionTotalPreview();
}

function saveQuestions() {
    const today = getTodayKey();

    const mathInput =
        document.getElementById("mathInput");

    const persianInput =
        document.getElementById("persianInput");

    const scienceInput =
        document.getElementById("scienceInput");

    const arabicInput =
        document.getElementById("arabicInput");

    if (!mathInput ||
        !persianInput ||
        !scienceInput ||
        !arabicInput) {
        return;
    }

    const values = {
        math: Number(mathInput.value) || 0,
        persian: Number(persianInput.value) || 0,
        science: Number(scienceInput.value) || 0,
        arabic: Number(arabicInput.value) || 0
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

    if (!saveData()) return;

    renderAll();

    showToast(`امروز ${total} سؤال ثبت شد ✓`);
}

function renderQuestionHistory() {
    const container =
        document.getElementById("questionHistory");

    const historyCount =
        document.getElementById("historyCount");

    if (!container) return;

    const questions = [...appData.questions]
        .sort((a, b) =>
            b.date.localeCompare(a.date)
        );

    if (historyCount) {
        historyCount.textContent =
            `${questions.length} روز`;
    }

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
    appData.questions =
        appData.questions.filter(
            item => item.date !== date
        );

    if (!saveData()) return;

    renderAll();

    loadTodayQuestions();

    showToast("آمار این روز حذف شد.");
}

function renderStatistics() {
    const totals = getSubjectTotals();

    const reportQuestions =
        document.getElementById("reportQuestions");

    const reportMath =
        document.getElementById("reportMath");

    const reportPersian =
        document.getElementById("reportPersian");

    const reportScience =
        document.getElementById("reportScience");

    const reportArabic =
        document.getElementById("reportArabic");

    const reportTodos =
        document.getElementById("reportTodos");

    if (reportQuestions) {
        reportQuestions.textContent =
            getTotalQuestions();
    }

    if (reportMath) {
        reportMath.textContent = totals.math;
    }

    if (reportPersian) {
        reportPersian.textContent =
            totals.persian;
    }

    if (reportScience) {
        reportScience.textContent =
            totals.science;
    }

    if (reportArabic) {
        reportArabic.textContent =
            totals.arabic;
    }

    if (reportTodos) {
        reportTodos.textContent =
            appData.todos.filter(
                todo => todo.completed
            ).length;
    }

    renderSubjectReport();
    renderRecentDays();
}

function renderSubjectReport() {
    const container =
        document.getElementById("subjectReport");

    if (!container) return;

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
    const container =
        document.getElementById("recentDays");

    if (!container) return;

    const days = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();

        date.setDate(date.getDate() - i);

        const year = date.getFullYear();
        const month =
            String(date.getMonth() + 1).padStart(2, "0");
        const day =
            String(date.getDate()).padStart(2, "0");

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
    const modal =
        document.getElementById("todoModal");

    const input =
        document.getElementById("todoInput");

    if (!modal) return;

    modal.classList.add("show");

    if (input) {
        input.focus();
    }
}

function closeTodoModal() {
    const modal =
        document.getElementById("todoModal");

    if (modal) {
        modal.classList.remove("show");
    }
}

function navigate(pageName) {
    document.querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("active");
        });

    document.querySelectorAll(".nav-item")
        .forEach(item => {
            item.classList.remove("active");
        });

    const page =
        document.getElementById(pageName);

    if (!page) return;

    page.classList.add("active");

    const nav =
        document.querySelector(
            `.nav-item[data-page="${pageName}"]`
        );

    if (nav) {
        nav.classList.add("active");
    }

    const pageTitle =
        document.getElementById("pageTitle");

    if (pageTitle) {
        pageTitle.textContent =
            pages[pageName];
    }

    const sidebar =
        document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.remove("open");
    }

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

function initializeApp() {
    document.querySelectorAll(".nav-item")
        .forEach(button => {
            button.addEventListener("click", () => {
                navigate(button.dataset.page);
            });
        });

    document.querySelectorAll("[data-open-page]")
        .forEach(button => {
            button.addEventListener("click", () => {
                navigate(button.dataset.openPage);
            });
        });

    document.querySelectorAll(".todo-tab")
        .forEach(button => {
            button.addEventListener("click", () => {

                document.querySelectorAll(".todo-tab")
                    .forEach(tab => {
                        tab.classList.remove("active");
                    });

                button.classList.add("active");

                todoFilter =
                    button.dataset.todoFilter;

                renderTodoList();
            });
        });

    const openTodo =
        document.getElementById("openTodoModal");

    if (openTodo) {
        openTodo.addEventListener(
            "click",
            openTodoModal
        );
    }

    const closeTodo =
        document.getElementById("closeTodoModal");

    if (closeTodo) {
        closeTodo.addEventListener(
            "click",
            closeTodoModal
        );
    }

    const addTodoButton =
        document.getElementById("addTodo");

    if (addTodoButton) {
        addTodoButton.addEventListener(
            "click",
            addTodo
        );
    }

    const saveQuestionsButton =
        document.getElementById("saveQuestions");

    if (saveQuestionsButton) {
        saveQuestionsButton.addEventListener(
            "click",
            saveQuestions
        );
    }

    document.querySelectorAll("#questions input")
        .forEach(input => {
            input.addEventListener(
                "input",
                updateQuestionTotalPreview
            );
        });

    const mobileMenu =
        document.getElementById("mobileMenu");

    if (mobileMenu) {
        mobileMenu.addEventListener("click", () => {

            const sidebar =
                document.getElementById("sidebar");

            if (sidebar) {
                sidebar.classList.toggle("open");
            }
        });
    }

    const todoInput =
        document.getElementById("todoInput");

    if (todoInput) {
        todoInput.addEventListener(
            "keydown",
            event => {
                if (event.key === "Enter") {
                    addTodo();
                }
            }
        );
    }

    const todoModal =
        document.getElementById("todoModal");

    if (todoModal) {
        todoModal.addEventListener(
            "click",
            event => {
                if (event.target.id === "todoModal") {
                    closeTodoModal();
                }
            }
        );
    }

    document.addEventListener(
        "keydown",
        event => {
            if (event.key === "Escape") {
                closeTodoModal();
            }
        }
    );

    const deleteAllData =
        document.getElementById("deleteAllData");

    if (deleteAllData) {
        deleteAllData.addEventListener(
            "click",
            () => {

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
            }
        );
    }

    updateTopbar();
    loadTodayQuestions();
    renderAll();
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeApp
    );
} else {
    initializeApp();
}