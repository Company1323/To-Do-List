const STORAGE_KEY = "studyflow_v1";

let data = {
    todos: [],
    questions: []
};

let currentFilter = "all";

document.addEventListener("DOMContentLoaded", init);

function init() {
    loadData();
    setupNavigation();
    setupTodos();
    setupQuestions();
    setupMobileMenu();
    setupDeleteAll();
    setupModal();
    updateDate();
    render();
}

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            data = {
                todos: [],
                questions: []
            };
            return;
        }

        const parsed = JSON.parse(saved);

        data = {
            todos: Array.isArray(parsed.todos) ? parsed.todos : [],
            questions: Array.isArray(parsed.questions) ? parsed.questions : []
        };

    } catch {
        data = {
            todos: [],
            questions: []
        };
    }
}

function saveData() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
}

function updateDate() {
    const element = document.getElementById("todayDate");

    if (!element) {
        return;
    }

    element.textContent = new Date().toLocaleDateString(
        "fa-IR",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}

function todayKey() {
    const date = new Date();

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}

function formatDate(value) {
    if (!value) {
        return "";
    }

    const parts = value.split("-");

    if (parts.length !== 3) {
        return value;
    }

    const date = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );

    return date.toLocaleDateString("fa-IR");
}

function setupNavigation() {
    document.querySelectorAll(".nav-item").forEach(button => {

        button.addEventListener("click", () => {
            openPage(button.dataset.page);
        });

    });

    document.querySelectorAll("[data-open-page]").forEach(button => {

        button.addEventListener("click", () => {
            openPage(button.dataset.openPage);
        });

    });
}

function openPage(page) {
    document.querySelectorAll(".page").forEach(item => {
        item.classList.remove("active");
    });

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    const target = document.getElementById(page);

    if (target) {
        target.classList.add("active");
    }

    const nav = document.querySelector(
        `.nav-item[data-page="${page}"]`
    );

    if (nav) {
        nav.classList.add("active");
    }

    const titles = {
        dashboard: "داشبورد",
        todos: "کارها",
        questions: "ثبت سوالات",
        statistics: "آمار"
    };

    const title = document.getElementById("pageTitle");

    if (title) {
        title.textContent = titles[page] || "StudyFlow";
    }

    const sidebar = document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.remove("open");
    }
}

function setupTodos() {
    const open = document.getElementById("openTodoModal");

    if (open) {
        open.addEventListener("click", openModal);
    }

    const close = document.getElementById("closeTodoModal");

    if (close) {
        close.addEventListener("click", closeModal);
    }

    const add = document.getElementById("addTodo");

    if (add) {
        add.addEventListener("click", addTodo);
    }

    const input = document.getElementById("todoInput");

    if (input) {
        input.addEventListener("keydown", event => {

            if (event.key === "Enter") {
                event.preventDefault();
                addTodo();
            }

        });
    }

    document.querySelectorAll(".todo-tab").forEach(tab => {

        tab.addEventListener("click", () => {

            document.querySelectorAll(".todo-tab").forEach(item => {
                item.classList.remove("active");
            });

            tab.classList.add("active");

            currentFilter = tab.dataset.todoFilter;

            renderTodos();
        });

    });

    document.addEventListener("click", event => {

        const check = event.target.closest("[data-toggle]");

        if (check) {
            toggleTodo(check.dataset.toggle);
            return;
        }

        const remove = event.target.closest("[data-delete]");

        if (remove) {
            deleteTodo(remove.dataset.delete);
        }

    });
}

function addTodo() {
    const input = document.getElementById("todoInput");

    if (!input) {
        return;
    }

    const text = input.value.trim();

    if (!text) {
        showToast("عنوان کار را وارد کنید", true);
        input.focus();
        return;
    }

    data.todos.push({
        id: crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now() + Math.random(),
        text: text,
        completed: false,
        date: todayKey()
    });

    saveData();

    input.value = "";

    closeModal();

    render();

    showToast("کار اضافه شد");
}

function toggleTodo(id) {
    const todo = data.todos.find(
        item => String(item.id) === String(id)
    );

    if (!todo) {
        return;
    }

    todo.completed = !todo.completed;

    saveData();

    render();
}

function deleteTodo(id) {
    const index = data.todos.findIndex(
        item => String(item.id) === String(id)
    );

    if (index === -1) {
        return;
    }

    data.todos.splice(index, 1);

    saveData();

    render();

    showToast("کار حذف شد");
}

function renderTodos() {
    const list = document.getElementById("todoList");

    if (!list) {
        return;
    }

    let todos = [...data.todos];

    if (currentFilter === "active") {
        todos = todos.filter(item => !item.completed);
    }

    if (currentFilter === "completed") {
        todos = todos.filter(item => item.completed);
    }

    if (todos.length === 0) {

        list.innerHTML = `
            <div class="empty-state">
                <div>📝</div>
                <p>کاری برای نمایش وجود ندارد.</p>
            </div>
        `;

        return;
    }

    list.innerHTML = todos.map(todo => `

        <div class="todo-item ${todo.completed ? "completed" : ""}">

            <button
                class="todo-check"
                data-toggle="${todo.id}"
                type="button"
            >
                ${todo.completed ? "✓" : ""}
            </button>

            <div class="todo-content">

                <div class="todo-text">
                    ${escapeHtml(todo.text)}
                </div>

                <div class="todo-date">
                    ${formatDate(todo.date)}
                </div>

            </div>

            <button
                class="todo-delete"
                data-delete="${todo.id}"
                type="button"
            >
                ×
            </button>

        </div>

    `).join("");
}

function renderDashboardTodos() {
    const container = document.getElementById("dashboardTodos");

    if (!container) {
        return;
    }

    const todos = [...data.todos].reverse().slice(0, 5);

    if (todos.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <div>📝</div>
                <p>هنوز کاری ثبت نشده است.</p>
            </div>
        `;

        return;
    }

    container.innerHTML = todos.map(todo => `

        <div class="todo-item ${todo.completed ? "completed" : ""}">

            <button
                class="todo-check"
                data-toggle="${todo.id}"
                type="button"
            >
                ${todo.completed ? "✓" : ""}
            </button>

            <div class="todo-content">

                <div class="todo-text">
                    ${escapeHtml(todo.text)}
                </div>

            </div>

            <button
                class="todo-delete"
                data-delete="${todo.id}"
                type="button"
            >
                ×
            </button>

        </div>

    `).join("");
}

function renderTodoStats() {
    const all = data.todos.length;

    const completed = data.todos.filter(
        item => item.completed
    ).length;

    const remaining = all - completed;

    setText("todoAllCount", all);
    setText("todoCompletedCount", completed);
    setText("todoRemainingCount", remaining);

    setText("remainingTasks", remaining);
    setText("completedTasks", completed);

    setText("chartTodos", all);
    setText("chartCompleted", completed);
}

function setupQuestions() {
    const button = document.getElementById("saveQuestions");

    if (button) {
        button.addEventListener("click", saveQuestions);
    }

    [
        "mathInput",
        "persianInput",
        "scienceInput",
        "arabicInput"
    ].forEach(id => {

        const input = document.getElementById(id);

        if (input) {

            input.addEventListener("keydown", event => {

                if (event.key === "Enter") {
                    event.preventDefault();
                    saveQuestions();
                }

            });

        }

    });
}

function saveQuestions() {
    const math = getNumber("mathInput");
    const persian = getNumber("persianInput");
    const science = getNumber("scienceInput");
    const arabic = getNumber("arabicInput");

    const total =
        math +
        persian +
        science +
        arabic;

    if (total <= 0) {
        showToast("حداقل یک سوال وارد کنید", true);
        return;
    }

    const date = todayKey();

    let record = data.questions.find(
        item => item.date === date
    );

    if (!record) {

        record = {
            id: Date.now() + Math.random(),
            date: date,
            math: 0,
            persian: 0,
            science: 0,
            arabic: 0
        };

        data.questions.push(record);
    }

    record.math += math;
    record.persian += persian;
    record.science += science;
    record.arabic += arabic;

    saveData();

    clearQuestionInputs();

    render();

    showToast(`${total} سوال ثبت شد`);
}

function getNumber(id) {
    const input = document.getElementById(id);

    if (!input) {
        return 0;
    }

    const value = Number(input.value);

    if (!Number.isFinite(value) || value < 0) {
        return 0;
    }

    return Math.floor(value);
}

function clearQuestionInputs() {
    [
        "mathInput",
        "persianInput",
        "scienceInput",
        "arabicInput"
    ].forEach(id => {

        const input = document.getElementById(id);

        if (input) {
            input.value = "";
        }

    });
}

function questionTotal(record) {
    return (
        Number(record.math || 0) +
        Number(record.persian || 0) +
        Number(record.science || 0) +
        Number(record.arabic || 0)
    );
}

function allQuestions() {
    return data.questions.reduce(
        (sum, item) => sum + questionTotal(item),
        0
    );
}

function todayQuestions() {
    const record = data.questions.find(
        item => item.date === todayKey()
    );

    return record ? questionTotal(record) : 0;
}

function renderQuestionStats() {
    const today = todayQuestions();
    const all = allQuestions();

    setText("questionTodayTotal", today);
    setText("todayQuestions", today);
    setText("allQuestions", all);
    setText("chartQuestions", all);
    setText("historyCount", data.questions.length);
}

function renderQuestionHistory() {
    const container = document.getElementById("questionHistory");

    if (!container) {
        return;
    }

    const questions = [...data.questions].reverse();

    if (questions.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <div>📚</div>
                <p>هنوز سوالی ثبت نشده است.</p>
            </div>
        `;

        return;
    }

    container.innerHTML = questions.map(item => `

        <div class="history-item">

            <div class="history-date">
                ${formatDate(item.date)}
            </div>

            <div class="history-total">
                مجموع: ${questionTotal(item)} سوال
            </div>

            <div class="history-subjects">

                <span>
                    ریاضی: ${item.math}
                </span>

                <span>
                    فارسی: ${item.persian}
                </span>

                <span>
                    علوم: ${item.science}
                </span>

                <span>
                    عربی: ${item.arabic}
                </span>

            </div>

        </div>

    `).join("");
}

function renderSubjects() {
    const totals = {
        math: 0,
        persian: 0,
        science: 0,
        arabic: 0
    };

    data.questions.forEach(item => {

        totals.math += Number(item.math || 0);
        totals.persian += Number(item.persian || 0);
        totals.science += Number(item.science || 0);
        totals.arabic += Number(item.arabic || 0);

    });

    setText("mathDashboard", totals.math);
    setText("persianDashboard", totals.persian);
    setText("scienceDashboard", totals.science);
    setText("arabicDashboard", totals.arabic);

    const max = Math.max(
        totals.math,
        totals.persian,
        totals.science,
        totals.arabic,
        1
    );

    setWidth("mathBar", totals.math / max);
    setWidth("persianBar", totals.persian / max);
    setWidth("scienceBar", totals.science / max);
    setWidth("arabicBar", totals.arabic / max);

    setText("reportMath", totals.math);
    setText("reportPersian", totals.persian);
    setText("reportScience", totals.science);
    setText("reportArabic", totals.arabic);

    return totals;
}

function renderStatistics() {
    const totals = renderSubjects();

    setText("reportQuestions", allQuestions());
    setText("reportTodos", data.todos.length);

    const container = document.getElementById("subjectReport");

    if (container) {

        const subjects = [
            ["ریاضی", totals.math],
            ["فارسی", totals.persian],
            ["علوم", totals.science],
            ["عربی", totals.arabic]
        ];

        const max = Math.max(
            ...subjects.map(item => item[1]),
            1
        );

        container.innerHTML = subjects.map(item => `

            <div class="subject-report-item">

                <div class="subject-report-header">
                    <span>${item[0]}</span>
                    <strong>${item[1]}</strong>
                </div>

                <div class="subject-report-bar">
                    <div
                        class="subject-report-fill"
                        style="width:${(item[1] / max) * 100}%"
                    ></div>
                </div>

            </div>

        `).join("");
    }

    renderRecentDays();
}

function renderRecentDays() {
    const container = document.getElementById("recentDays");

    if (!container) {
        return;
    }

    const items = [...data.questions].reverse().slice(0, 7);

    if (items.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <p>هنوز فعالیتی ثبت نشده است.</p>
            </div>
        `;

        return;
    }

    container.innerHTML = items.map(item => `

        <div class="recent-day">

            <span>
                ${formatDate(item.date)}
            </span>

            <strong>
                ${questionTotal(item)} سوال
            </strong>

        </div>

    `).join("");
}

function setupMobileMenu() {
    const button = document.getElementById("mobileMenu");
    const sidebar = document.getElementById("sidebar");

    if (!button || !sidebar) {
        return;
    }

    button.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });
}

function setupDeleteAll() {
    const button = document.getElementById("deleteAllData");

    if (!button) {
        return;
    }

    button.addEventListener("click", () => {

        if (!confirm("تمام اطلاعات حذف شود؟")) {
            return;
        }

        data = {
            todos: [],
            questions: []
        };

        saveData();

        render();

        showToast("تمام اطلاعات حذف شد");
    });
}

function setupModal() {
    const modal = document.getElementById("todoModal");

    if (!modal) {
        return;
    }

    modal.addEventListener("click", event => {

        if (event.target === modal) {
            closeModal();
        }

    });
}

function openModal() {
    const modal = document.getElementById("todoModal");

    if (!modal) {
        return;
    }

    modal.classList.add("active");

    const input = document.getElementById("todoInput");

    if (input) {
        setTimeout(() => {
            input.focus();
        }, 100);
    }
}

function closeModal() {
    const modal = document.getElementById("todoModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("active");
}

function render() {
    renderTodos();
    renderDashboardTodos();
    renderTodoStats();

    renderQuestionStats();
    renderQuestionHistory();

    renderSubjects();
    renderStatistics();
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function setWidth(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.style.width =
            `${Math.max(0, Math.min(1, value)) * 100}%`;
    }
}

function showToast(message, error = false) {
    const toast = document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.textContent = message;

    toast.classList.remove("error");
    toast.classList.add("show");

    if (error) {
        toast.classList.add("error");
    }

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}