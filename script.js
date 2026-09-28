const STORAGE_KEY = "studyFlow_v3";

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

        const parsed = JSON.parse(saved);

        return {
            todos: Array.isArray(parsed.todos) ? parsed.todos : [],
            questions: Array.isArray(parsed.questions) ? parsed.questions : []
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
        return true;
    } catch (error) {
        console.error("خطا در ذخیره اطلاعات:", error);
        showToast("ذخیره اطلاعات انجام نشد", "error");
        return false;
    }
}

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text ?? "";
    return div.innerHTML;
}

function formatDate(date) {
    const d = new Date(date);

    return d.toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function formatTime(date) {
    const d = new Date(date);

    return d.toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function showToast(message, type = "success") {
    let toast = document.getElementById("toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = `toast ${type}`;

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });
}

function getSubjectName(subject) {
    const subjects = {
        math: "ریاضی",
        persian: "فارسی",
        science: "علوم",
        arabic: "عربی"
    };

    return subjects[subject] || subject;
}

function getTotalQuestions() {
    return appData.questions.reduce((total, item) => {
        return total + Number(item.count || 0);
    }, 0);
}

function getTodayQuestions() {
    const today = new Date().toISOString().split("T")[0];

    return appData.questions
        .filter(item => item.date === today)
        .reduce((total, item) => {
            return total + Number(item.count || 0);
        }, 0);
}

function getCompletedTodos() {
    return appData.todos.filter(todo => todo.completed).length;
}

function getPendingTodos() {
    return appData.todos.filter(todo => !todo.completed).length;
}

function updateDashboard() {
    const totalQuestionsElement = document.getElementById("totalQuestions");
    const todayQuestionsElement = document.getElementById("todayQuestions");
    const totalTodosElement = document.getElementById("totalTodos");
    const completedTodosElement = document.getElementById("completedTodos");

    if (totalQuestionsElement) {
        totalQuestionsElement.textContent = getTotalQuestions();
    }

    if (todayQuestionsElement) {
        todayQuestionsElement.textContent = getTodayQuestions();
    }

    if (totalTodosElement) {
        totalTodosElement.textContent = appData.todos.length;
    }

    if (completedTodosElement) {
        completedTodosElement.textContent = getCompletedTodos();
    }

    renderRecentTodos();
}

function renderRecentTodos() {
    const container = document.getElementById("recentTodos");

    if (!container) {
        return;
    }

    const todos = [...appData.todos]
        .slice(-5)
        .reverse();

    if (todos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                هنوز کاری اضافه نشده است.
            </div>
        `;

        return;
    }

    container.innerHTML = todos.map(todo => `
        <div class="todo-item ${todo.completed ? "completed" : ""}">
            <div class="todo-check ${todo.completed ? "checked" : ""}"
                 onclick="toggleTodo(${todo.id})">
                ${todo.completed ? "✓" : ""}
            </div>

            <div class="todo-content">
                <div class="todo-text">
                    ${escapeHTML(todo.text)}
                </div>

                <div class="todo-time">
                    ${formatDate(todo.createdAt)}
                </div>
            </div>

            <button onclick="deleteTodo(${todo.id})" class="delete-btn">
                ×
            </button>
        </div>
    `).join("");
}

function renderTodos() {
    const container = document.getElementById("todoList");

    if (!container) {
        return;
    }

    let todos = [...appData.todos];

    if (todoFilter === "active") {
        todos = todos.filter(todo => !todo.completed);
    }

    if (todoFilter === "completed") {
        todos = todos.filter(todo => todo.completed);
    }

    todos.reverse();

    if (todos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✓</div>
                <div>موردی برای نمایش وجود ندارد.</div>
            </div>
        `;

        return;
    }

    container.innerHTML = todos.map(todo => `
        <div class="todo-item ${todo.completed ? "completed" : ""}">
            <button
                class="todo-check ${todo.completed ? "checked" : ""}"
                onclick="toggleTodo(${todo.id})"
                type="button">
                ${todo.completed ? "✓" : ""}
            </button>

            <div class="todo-content">
                <div class="todo-text">
                    ${escapeHTML(todo.text)}
                </div>

                <div class="todo-time">
                    ${formatDate(todo.createdAt)}
                    ${formatTime(todo.createdAt)}
                </div>
            </div>

            <button
                class="delete-btn"
                onclick="deleteTodo(${todo.id})"
                type="button">
                ×
            </button>
        </div>
    `).join("");
}

function addTodo() {
    const input = document.getElementById("todoInput");

    if (!input) {
        return;
    }

    const text = input.value.trim();

    if (!text) {
        showToast("لطفاً متن کار را وارد کنید", "error");
        return;
    }

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    appData.todos.push(newTodo);

    if (saveData()) {
        input.value = "";

        renderTodos();
        renderRecentTodos();
        updateDashboard();

        showToast("کار جدید اضافه شد");
    }
}

function toggleTodo(id) {
    const todo = appData.todos.find(item => item.id === id);

    if (!todo) {
        return;
    }

    todo.completed = !todo.completed;

    if (saveData()) {
        renderTodos();
        renderRecentTodos();
        updateDashboard();
    }
}

function deleteTodo(id) {
    const index = appData.todos.findIndex(item => item.id === id);

    if (index === -1) {
        return;
    }

    appData.todos.splice(index, 1);

    if (saveData()) {
        renderTodos();
        renderRecentTodos();
        updateDashboard();

        showToast("کار حذف شد");
    }
}

function setTodoFilter(filter) {
    todoFilter = filter;

    document.querySelectorAll("[data-todo-filter]").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.todoFilter === filter
        );
    });

    renderTodos();
}

function saveQuestion() {
    const subjectElement = document.getElementById("questionSubject");
    const countElement = document.getElementById("questionCount");
    const dateElement = document.getElementById("questionDate");

    if (!subjectElement || !countElement) {
        return;
    }

    const subject = subjectElement.value;
    const count = Number(countElement.value);

    const date = dateElement && dateElement.value
        ? dateElement.value
        : new Date().toISOString().split("T")[0];

    if (!subject) {
        showToast("لطفاً درس را انتخاب کنید", "error");
        return;
    }

    if (!count || count <= 0) {
        showToast("تعداد سؤال را وارد کنید", "error");
        return;
    }

    const newQuestion = {
        id: Date.now(),
        subject: subject,
        count: count,
        date: date,
        createdAt: new Date().toISOString()
    };

    appData.questions.push(newQuestion);

    if (saveData()) {
        countElement.value = "";

        renderQuestionHistory();
        renderStatistics();
        updateDashboard();

        showToast("تعداد سؤال ثبت شد");
    }
}

function renderQuestionHistory() {
    const container = document.getElementById("questionHistory");

    if (!container) {
        return;
    }

    const questions = [...appData.questions].reverse();

    if (questions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                هنوز سؤالی ثبت نشده است.
            </div>
        `;

        return;
    }

    container.innerHTML = questions.map(item => `
        <div class="question-history-item">
            <div>
                <strong>${escapeHTML(getSubjectName(item.subject))}</strong>

                <div class="question-history-date">
                    ${formatDate(item.date)}
                </div>
            </div>

            <div class="question-count">
                ${item.count} سؤال
            </div>

            <button
                class="delete-btn"
                onclick="deleteQuestion(${item.id})"
                type="button">
                ×
            </button>
        </div>
    `).join("");
}

function deleteQuestion(id) {
    const index = appData.questions.findIndex(item => item.id === id);

    if (index === -1) {
        return;
    }

    appData.questions.splice(index, 1);

    if (saveData()) {
        renderQuestionHistory();
        renderStatistics();
        updateDashboard();

        showToast("ثبت سؤال حذف شد");
    }
}

function getSubjectTotal(subject) {
    return appData.questions
        .filter(item => item.subject === subject)
        .reduce((total, item) => {
            return total + Number(item.count || 0);
        }, 0);
}

function renderStatistics() {
    const totalElement = document.getElementById("statisticsTotal");
    const todayElement = document.getElementById("statisticsToday");
    const todoElement = document.getElementById("statisticsTodos");

    if (totalElement) {
        totalElement.textContent = getTotalQuestions();
    }

    if (todayElement) {
        todayElement.textContent = getTodayQuestions();
    }

    if (todoElement) {
        todoElement.textContent = appData.todos.length;
    }

    const subjects = {
        math: document.getElementById("mathTotal"),
        persian: document.getElementById("persianTotal"),
        science: document.getElementById("scienceTotal"),
        arabic: document.getElementById("arabicTotal")
    };

    Object.keys(subjects).forEach(subject => {
        if (subjects[subject]) {
            subjects[subject].textContent = getSubjectTotal(subject);
        }
    });
}

function showPage(pageName) {
    document.querySelectorAll("[data-page]").forEach(page => {
        page.classList.remove("active");
    });

    const page = document.querySelector(`[data-page="${pageName}"]`);

    if (page) {
        page.classList.add("active");
    }

    document.querySelectorAll("[data-nav]").forEach(item => {
        item.classList.toggle(
            "active",
            item.dataset.nav === pageName
        );
    });

    const title = document.getElementById("pageTitle");

    if (title) {
        title.textContent = pages[pageName] || "";
    }

    if (pageName === "dashboard") {
        updateDashboard();
    }

    if (pageName === "todos") {
        renderTodos();
    }

    if (pageName === "questions") {
        renderQuestionHistory();
    }

    if (pageName === "statistics") {
        renderStatistics();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    closeMobileMenu();
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);

    if (modal) {
        modal.classList.add("active");
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);

    if (modal) {
        modal.classList.remove("active");
    }
}

function toggleMobileMenu() {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".mobile-overlay");

    if (sidebar) {
        sidebar.classList.toggle("open");
    }

    if (overlay) {
        overlay.classList.toggle("active");
    }
}

function closeMobileMenu() {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".mobile-overlay");

    if (sidebar) {
        sidebar.classList.remove("open");
    }

    if (overlay) {
        overlay.classList.remove("active");
    }
}

function deleteAllData() {
    const confirmed = confirm(
        "آیا مطمئن هستید که می‌خواهید تمام اطلاعات حذف شود؟"
    );

    if (!confirmed) {
        return;
    }

    appData = {
        todos: [],
        questions: []
    };

    if (saveData()) {
        renderTodos();
        renderRecentTodos();
        renderQuestionHistory();
        renderStatistics();
        updateDashboard();

        showToast("تمام اطلاعات حذف شدند");
    }
}

function initialize() {
    const todoInput = document.getElementById("todoInput");

    if (todoInput) {
        todoInput.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                addTodo();
            }
        });
    }

    document.querySelectorAll("[data-nav]").forEach(item => {
        item.addEventListener("click", event => {
            event.preventDefault();

            const page = item.dataset.nav;

            if (page) {
                showPage(page);
            }
        });
    });

    document.querySelectorAll("[data-todo-filter]").forEach(button => {
        button.addEventListener("click", () => {
            setTodoFilter(button.dataset.todoFilter);
        });
    });

    document.querySelectorAll("[data-close-modal]").forEach(button => {
        button.addEventListener("click", () => {
            const modalId = button.dataset.closeModal;

            if (modalId) {
                closeModal(modalId);
            }
        });
    });

    document.querySelectorAll(".modal").forEach(modal => {
        modal.addEventListener("click", event => {
            if (event.target === modal) {
                modal.classList.remove("active");
            }
        });
    });

    document.querySelectorAll("[data-mobile-menu]").forEach(button => {
        button.addEventListener("click", toggleMobileMenu);
    });

    document.querySelectorAll(".mobile-overlay").forEach(overlay => {
        overlay.addEventListener("click", closeMobileMenu);
    });

    renderTodos();
    renderQuestionHistory();
    renderStatistics();
    updateDashboard();

    showPage("dashboard");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
} else {
    initialize();
}

window.addTodo = addTodo;
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
window.setTodoFilter = setTodoFilter;
window.saveQuestion = saveQuestion;
window.deleteQuestion = deleteQuestion;
window.showPage = showPage;
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.deleteAllData = deleteAllData;