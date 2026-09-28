const STORAGE_KEY = "studyFlow_v4";

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
        const savedData = localStorage.getItem(STORAGE_KEY);

        if (!savedData) {
            return {
                todos: [],
                questions: []
            };
        }

        const data = JSON.parse(savedData);

        return {
            todos: Array.isArray(data.todos) ? data.todos : [],
            questions: Array.isArray(data.questions) ? data.questions : []
        };
    } catch (error) {
        console.error("خطا در بارگذاری اطلاعات:", error);

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
        showToast("ذخیره اطلاعات انجام نشد", "error");
        return false;
    }
}

function escapeHTML(text) {
    const element = document.createElement("div");
    element.textContent = text ?? "";
    return element.innerHTML;
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
        toast.classList.add("show");
    }, 10);

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function formatDate(date) {
    try {
        const d = new Date(date);

        return d.toLocaleDateString("fa-IR", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    } catch {
        return "";
    }
}

function formatTime(date) {
    try {
        const d = new Date(date);

        return d.toLocaleTimeString("fa-IR", {
            hour: "2-digit",
            minute: "2-digit"
        });
    } catch {
        return "";
    }
}

function getToday() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
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
    return appData.questions.reduce(
        (total, question) => total + Number(question.count || 0),
        0
    );
}

function getTodayQuestions() {
    const today = getToday();

    return appData.questions
        .filter(question => question.date === today)
        .reduce(
            (total, question) => total + Number(question.count || 0),
            0
        );
}

function getCompletedTodos() {
    return appData.todos.filter(todo => todo.completed).length;
}

function getPendingTodos() {
    return appData.todos.filter(todo => !todo.completed).length;
}

function getSubjectTotal(subject) {
    return appData.questions
        .filter(question => question.subject === subject)
        .reduce(
            (total, question) => total + Number(question.count || 0),
            0
        );
}

function updateDashboard() {
    const totalQuestions = document.getElementById("totalQuestions");
    const todayQuestions = document.getElementById("todayQuestions");
    const totalTodos = document.getElementById("totalTodos");
    const completedTodos = document.getElementById("completedTodos");

    if (totalQuestions) {
        totalQuestions.textContent = getTotalQuestions();
    }

    if (todayQuestions) {
        todayQuestions.textContent = getTodayQuestions();
    }

    if (totalTodos) {
        totalTodos.textContent = appData.todos.length;
    }

    if (completedTodos) {
        completedTodos.textContent = getCompletedTodos();
    }

    renderRecentTodos();
}

function renderRecentTodos() {
    const container = document.getElementById("recentTodos");

    if (!container) {
        return;
    }

    const todos = [...appData.todos]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);

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

            <button
                type="button"
                class="todo-check ${todo.completed ? "checked" : ""}"
                onclick="toggleTodo(${todo.id})">
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
                type="button"
                class="delete-btn"
                onclick="deleteTodo(${todo.id})">
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

    todos.sort((a, b) => b.id - a.id);

    if (todos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                موردی برای نمایش وجود ندارد.
            </div>
        `;

        return;
    }

    container.innerHTML = todos.map(todo => `
        <div class="todo-item ${todo.completed ? "completed" : ""}">

            <button
                type="button"
                class="todo-check ${todo.completed ? "checked" : ""}"
                onclick="toggleTodo(${todo.id})">
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
                type="button"
                class="delete-btn"
                onclick="deleteTodo(${todo.id})">
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
        showToast("لطفاً نام کار را وارد کنید", "error");
        return;
    }

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    appData.todos.push(newTodo);

    const saved = saveData();

    if (!saved) {
        return;
    }

    input.value = "";

    renderTodos();
    renderRecentTodos();
    updateDashboard();

    showToast("کار با موفقیت اضافه شد");
}

function toggleTodo(id) {
    const todo = appData.todos.find(
        item => item.id === id
    );

    if (!todo) {
        return;
    }

    todo.completed = !todo.completed;

    if (!saveData()) {
        return;
    }

    renderTodos();
    renderRecentTodos();
    updateDashboard();

    showToast(
        todo.completed
            ? "کار انجام شد"
            : "کار دوباره فعال شد"
    );
}

function deleteTodo(id) {
    const index = appData.todos.findIndex(
        item => item.id === id
    );

    if (index === -1) {
        return;
    }

    appData.todos.splice(index, 1);

    if (!saveData()) {
        return;
    }

    renderTodos();
    renderRecentTodos();
    updateDashboard();

    showToast("کار حذف شد");
}

function setTodoFilter(filter) {
    todoFilter = filter;

    document
        .querySelectorAll("[data-todo-filter]")
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.todoFilter === filter
            );
        });

    renderTodos();
}

function saveQuestion() {
    const subjectElement =
        document.getElementById("questionSubject");

    const countElement =
        document.getElementById("questionCount");

    const dateElement =
        document.getElementById("questionDate");

    if (!subjectElement || !countElement) {
        return;
    }

    const subject = subjectElement.value;
    const count = Number(countElement.value);

    const date =
        dateElement && dateElement.value
            ? dateElement.value
            : getToday();

    if (!subject) {
        showToast("لطفاً درس را انتخاب کنید", "error");
        return;
    }

    if (!count || count <= 0) {
        showToast("تعداد سؤال را درست وارد کنید", "error");
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

    if (!saveData()) {
        return;
    }

    countElement.value = "";

    renderQuestionHistory();
    renderStatistics();
    updateDashboard();

    showToast("سؤال‌ها با موفقیت ثبت شدند");
}

function renderQuestionHistory() {
    const container =
        document.getElementById("questionHistory");

    if (!container) {
        return;
    }

    const questions = [...appData.questions]
        .sort((a, b) => b.id - a.id);

    if (questions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                هنوز سؤالی ثبت نشده است.
            </div>
        `;

        return;
    }

    container.innerHTML = questions.map(question => `
        <div class="question-history-item">

            <div class="question-history-info">

                <strong>
                    ${escapeHTML(
                        getSubjectName(question.subject)
                    )}
                </strong>

                <div class="question-history-date">
                    ${formatDate(question.date)}
                </div>

            </div>

            <div class="question-count">
                ${question.count} سؤال
            </div>

            <button
                type="button"
                class="delete-btn"
                onclick="deleteQuestion(${question.id})">
                ×
            </button>

        </div>
    `).join("");
}

function deleteQuestion(id) {
    const index = appData.questions.findIndex(
        question => question.id === id
    );

    if (index === -1) {
        return;
    }

    appData.questions.splice(index, 1);

    if (!saveData()) {
        return;
    }

    renderQuestionHistory();
    renderStatistics();
    updateDashboard();

    showToast("ثبت سؤال حذف شد");
}

function renderStatistics() {
    const total =
        document.getElementById("statisticsTotal");

    const today =
        document.getElementById("statisticsToday");

    const todos =
        document.getElementById("statisticsTodos");

    if (total) {
        total.textContent = getTotalQuestions();
    }

    if (today) {
        today.textContent = getTodayQuestions();
    }

    if (todos) {
        todos.textContent = appData.todos.length;
    }

    const math =
        document.getElementById("mathTotal");

    const persian =
        document.getElementById("persianTotal");

    const science =
        document.getElementById("scienceTotal");

    const arabic =
        document.getElementById("arabicTotal");

    if (math) {
        math.textContent = getSubjectTotal("math");
    }

    if (persian) {
        persian.textContent = getSubjectTotal("persian");
    }

    if (science) {
        science.textContent = getSubjectTotal("science");
    }

    if (arabic) {
        arabic.textContent = getSubjectTotal("arabic");
    }
}

function showPage(pageName) {
    document
        .querySelectorAll("[data-page]")
        .forEach(page => {
            page.classList.remove("active");
        });

    const selectedPage =
        document.querySelector(
            `[data-page="${pageName}"]`
        );

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    document
        .querySelectorAll("[data-nav]")
        .forEach(item => {
            item.classList.toggle(
                "active",
                item.dataset.nav === pageName
            );
        });

    const title =
        document.getElementById("pageTitle");

    if (title) {
        title.textContent =
            pages[pageName] || "";
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

    closeMobileMenu();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function openModal(id) {
    const modal =
        document.getElementById(id);

    if (modal) {
        modal.classList.add("active");
    }
}

function closeModal(id) {
    const modal =
        document.getElementById(id);

    if (modal) {
        modal.classList.remove("active");
    }
}

function toggleMobileMenu() {
    const sidebar =
        document.querySelector(".sidebar");

    const overlay =
        document.querySelector(".mobile-overlay");

    if (sidebar) {
        sidebar.classList.toggle("open");
    }

    if (overlay) {
        overlay.classList.toggle("active");
    }
}

function closeMobileMenu() {
    const sidebar =
        document.querySelector(".sidebar");

    const overlay =
        document.querySelector(".mobile-overlay");

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

    if (!saveData()) {
        return;
    }

    renderTodos();
    renderQuestionHistory();
    renderStatistics();
    renderRecentTodos();
    updateDashboard();

    showToast("تمام اطلاعات حذف شدند");
}

function initialize() {
    const todoInput =
        document.getElementById("todoInput");

    if (todoInput) {
        todoInput.addEventListener(
            "keydown",
            event => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    addTodo();
                }
            }
        );
    }

    document
        .querySelectorAll("[data-nav]")
        .forEach(item => {
            item.addEventListener(
                "click",
                event => {
                    event.preventDefault();

                    const page =
                        item.dataset.nav;

                    if (page) {
                        showPage(page);
                    }
                }
            );
        });

    document
        .querySelectorAll("[data-todo-filter]")
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    setTodoFilter(
                        button.dataset.todoFilter
                    );
                }
            );
        });

    document
        .querySelectorAll("[data-mobile-menu]")
        .forEach(button => {
            button.addEventListener(
                "click",
                toggleMobileMenu
            );
        });

    document
        .querySelectorAll(".mobile-overlay")
        .forEach(overlay => {
            overlay.addEventListener(
                "click",
                closeMobileMenu
            );
        });

    document
        .querySelectorAll(".modal")
        .forEach(modal => {
            modal.addEventListener(
                "click",
                event => {
                    if (event.target === modal) {
                        modal.classList.remove("active");
                    }
                }
            );
        });

    renderTodos();
    renderQuestionHistory();
    renderStatistics();
    updateDashboard();

    showPage("dashboard");
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initialize
    );
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