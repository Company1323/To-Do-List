const STORAGE_KEY = "studyFlow_data";

let appData = loadData();
let todoFilter = "all";

const subjects = {
    math: "ریاضی",
    persian: "فارسی",
    science: "علوم",
    arabic: "عربی"
};

function createDefaultData() {
    return {
        todos: [],
        questions: []
    };
}

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return createDefaultData();
        }

        const data = JSON.parse(saved);

        return {
            todos: Array.isArray(data.todos) ? data.todos : [],
            questions: Array.isArray(data.questions) ? data.questions : []
        };
    } catch (error) {
        console.error("Load error:", error);
        return createDefaultData();
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
        console.error("Save error:", error);
        showToast("ذخیره اطلاعات انجام نشد", "error");
        return false;
    }
}

function getToday() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
    if (!dateString) {
        return "";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.textContent = message;

    toast.classList.remove("show");
    toast.classList.remove("error");

    if (type === "error") {
        toast.classList.add("error");
    }

    setTimeout(() => {
        toast.classList.add("show");
    }, 10);

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}


function updateTodayDate() {
    const element = document.getElementById("todayDate");

    if (!element) {
        return;
    }

    const now = new Date();

    element.textContent = now.toLocaleDateString("fa-IR", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });
}


function getTotalQuestions() {
    return appData.questions.reduce((total, item) => {
        return total +
            Number(item.math || 0) +
            Number(item.persian || 0) +
            Number(item.science || 0) +
            Number(item.arabic || 0);
    }, 0);
}


function getTodayQuestionData() {
    const today = getToday();

    const todayItems = appData.questions.filter(
        item => item.date === today
    );

    return {
        math: todayItems.reduce(
            (total, item) => total + Number(item.math || 0),
            0
        ),

        persian: todayItems.reduce(
            (total, item) => total + Number(item.persian || 0),
            0
        ),

        science: todayItems.reduce(
            (total, item) => total + Number(item.science || 0),
            0
        ),

        arabic: todayItems.reduce(
            (total, item) => total + Number(item.arabic || 0),
            0
        )
    };
}


function getTodayTotal() {
    const data = getTodayQuestionData();

    return (
        data.math +
        data.persian +
        data.science +
        data.arabic
    );
}


function getSubjectTotal(subject) {
    return appData.questions.reduce((total, item) => {
        return total + Number(item[subject] || 0);
    }, 0);
}


function getCompletedTodos() {
    return appData.todos.filter(
        todo => todo.completed
    ).length;
}


function getRemainingTodos() {
    return appData.todos.filter(
        todo => !todo.completed
    ).length;
}


function updateDashboard() {
    const remainingTasks =
        document.getElementById("remainingTasks");

    const completedTasks =
        document.getElementById("completedTasks");

    const todayQuestions =
        document.getElementById("todayQuestions");

    const allQuestions =
        document.getElementById("allQuestions");

    if (remainingTasks) {
        remainingTasks.textContent =
            getRemainingTodos();
    }

    if (completedTasks) {
        completedTasks.textContent =
            getCompletedTodos();
    }

    if (todayQuestions) {
        todayQuestions.textContent =
            getTodayTotal();
    }

    if (allQuestions) {
        allQuestions.textContent =
            getTotalQuestions();
    }

    updateDashboardSubjects();
    renderDashboardTodos();
}


function updateDashboardSubjects() {
    const math =
        getSubjectTotal("math");

    const persian =
        getSubjectTotal("persian");

    const science =
        getSubjectTotal("science");

    const arabic =
        getSubjectTotal("arabic");

    const mathElement =
        document.getElementById("mathDashboard");

    const persianElement =
        document.getElementById("persianDashboard");

    const scienceElement =
        document.getElementById("scienceDashboard");

    const arabicElement =
        document.getElementById("arabicDashboard");

    if (mathElement) {
        mathElement.textContent = math;
    }

    if (persianElement) {
        persianElement.textContent = persian;
    }

    if (scienceElement) {
        scienceElement.textContent = science;
    }

    if (arabicElement) {
        arabicElement.textContent = arabic;
    }

    const max =
        Math.max(
            math,
            persian,
            science,
            arabic,
            1
        );

    const mathBar =
        document.getElementById("mathBar");

    const persianBar =
        document.getElementById("persianBar");

    const scienceBar =
        document.getElementById("scienceBar");

    const arabicBar =
        document.getElementById("arabicBar");

    if (mathBar) {
        mathBar.style.width =
            `${(math / max) * 100}%`;
    }

    if (persianBar) {
        persianBar.style.width =
            `${(persian / max) * 100}%`;
    }

    if (scienceBar) {
        scienceBar.style.width =
            `${(science / max) * 100}%`;
    }

    if (arabicBar) {
        arabicBar.style.width =
            `${(arabic / max) * 100}%`;
    }
}


function renderDashboardTodos() {
    const container =
        document.getElementById("dashboardTodos");

    if (!container) {
        return;
    }

    const todos = [...appData.todos]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);

    if (todos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                هنوز کاری ثبت نشده است.
            </div>
        `;

        return;
    }

    container.innerHTML = todos.map(todo => `
        <div class="todo-item ${todo.completed ? "completed" : ""}">

            <button
                class="todo-check ${todo.completed ? "checked" : ""}"
                type="button"
                data-toggle-todo="${todo.id}">
                ${todo.completed ? "✓" : ""}
            </button>

            <div class="todo-content">

                <div class="todo-text">
                    ${escapeHTML(todo.text)}
                </div>

            </div>

            <button
                class="delete-btn"
                type="button"
                data-delete-todo="${todo.id}">
                ×
            </button>

        </div>
    `).join("");
}


function renderTodos() {
    const container =
        document.getElementById("todoList");

    if (!container) {
        return;
    }

    let todos = [...appData.todos];

    if (todoFilter === "active") {
        todos =
            todos.filter(todo => !todo.completed);
    }

    if (todoFilter === "completed") {
        todos =
            todos.filter(todo => todo.completed);
    }

    todos.sort((a, b) => b.id - a.id);

    if (todos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                هیچ کاری برای نمایش وجود ندارد.
            </div>
        `;

        return;
    }

    container.innerHTML = todos.map(todo => `
        <div class="todo-item ${todo.completed ? "completed" : ""}">

            <button
                class="todo-check ${todo.completed ? "checked" : ""}"
                type="button"
                data-toggle-todo="${todo.id}">
                ${todo.completed ? "✓" : ""}
            </button>

            <div class="todo-content">

                <div class="todo-text">
                    ${escapeHTML(todo.text)}
                </div>

                <div class="todo-time">
                    ${formatDate(todo.createdAt)}
                </div>

            </div>

            <button
                class="delete-btn"
                type="button"
                data-delete-todo="${todo.id}">
                ×
            </button>

        </div>
    `).join("");
}


function updateTodoCounters() {
    const all =
        document.getElementById("todoAllCount");

    const completed =
        document.getElementById("todoCompletedCount");

    const remaining =
        document.getElementById("todoRemainingCount");

    if (all) {
        all.textContent =
            appData.todos.length;
    }

    if (completed) {
        completed.textContent =
            getCompletedTodos();
    }

    if (remaining) {
        remaining.textContent =
            getRemainingTodos();
    }
}


function addTodo() {
    const input =
        document.getElementById("todoInput");

    if (!input) {
        return;
    }

    const text =
        input.value.trim();

    if (!text) {
        showToast(
            "لطفاً عنوان کار را وارد کنید",
            "error"
        );

        return;
    }

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    appData.todos.push(newTodo);

    if (!saveData()) {
        return;
    }

    input.value = "";

    closeTodoModal();

    renderTodos();
    renderDashboardTodos();
    updateTodoCounters();
    updateDashboard();

    showToast("کار جدید اضافه شد");
}


function toggleTodo(id) {
    const todo =
        appData.todos.find(
            item => item.id === Number(id)
        );

    if (!todo) {
        return;
    }

    todo.completed =
        !todo.completed;

    if (!saveData()) {
        return;
    }

    renderTodos();
    renderDashboardTodos();
    updateTodoCounters();
    updateDashboard();
}


function deleteTodo(id) {
    const index =
        appData.todos.findIndex(
            item => item.id === Number(id)
        );

    if (index === -1) {
        return;
    }

    appData.todos.splice(index, 1);

    if (!saveData()) {
        return;
    }

    renderTodos();
    renderDashboardTodos();
    updateTodoCounters();
    updateDashboard();

    showToast("کار حذف شد");
}


function updateQuestionInputTotal() {
    const math =
        Number(
            document.getElementById("mathInput")?.value || 0
        );

    const persian =
        Number(
            document.getElementById("persianInput")?.value || 0
        );

    const science =
        Number(
            document.getElementById("scienceInput")?.value || 0
        );

    const arabic =
        Number(
            document.getElementById("arabicInput")?.value || 0
        );

    const total =
        math +
        persian +
        science +
        arabic;

    const element =
        document.getElementById("questionTodayTotal");

    if (element) {
        element.textContent = total;
    }
}


function saveQuestions() {
    const math =
        Number(
            document.getElementById("mathInput")?.value || 0
        );

    const persian =
        Number(
            document.getElementById("persianInput")?.value || 0
        );

    const science =
        Number(
            document.getElementById("scienceInput")?.value || 0
        );

    const arabic =
        Number(
            document.getElementById("arabicInput")?.value || 0
        );

    if (
        math < 0 ||
        persian < 0 ||
        science < 0 ||
        arabic < 0
    ) {
        showToast(
            "تعداد سؤال نمی‌تواند منفی باشد",
            "error"
        );

        return;
    }

    const total =
        math +
        persian +
        science +
        arabic;

    if (total === 0) {
        showToast(
            "حداقل یک سؤال وارد کن",
            "error"
        );

        return;
    }

    const today =
        getToday();

    const existing =
        appData.questions.find(
            item => item.date === today
        );

    if (existing) {
        existing.math =
            Number(existing.math || 0) + math;

        existing.persian =
            Number(existing.persian || 0) + persian;

        existing.science =
            Number(existing.science || 0) + science;

        existing.arabic =
            Number(existing.arabic || 0) + arabic;

        existing.updatedAt =
            new Date().toISOString();

    } else {
        appData.questions.push({
            id: Date.now(),
            date: today,
            math: math,
            persian: persian,
            science: science,
            arabic: arabic,
            createdAt: new Date().toISOString()
        });
    }

    if (!saveData()) {
        return;
    }

    document.getElementById("mathInput").value = "";
    document.getElementById("persianInput").value = "";
    document.getElementById("scienceInput").value = "";
    document.getElementById("arabicInput").value = "";

    updateQuestionInputTotal();

    renderQuestionHistory();
    updateDashboard();
    renderStatistics();

    showToast("عملکرد ثبت شد");
}


function renderQuestionHistory() {
    const container =
        document.getElementById("questionHistory");

    if (!container) {
        return;
    }

    const questions =
        [...appData.questions]
            .sort((a, b) => {
                return b.id - a.id;
            });

    const historyCount =
        document.getElementById("historyCount");

    if (historyCount) {
        historyCount.textContent =
            `${questions.length} روز`;
    }

    if (questions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                هنوز هیچ عملکردی ثبت نشده است.
            </div>
        `;

        return;
    }

    container.innerHTML =
        questions.map(item => {

            const total =
                Number(item.math || 0) +
                Number(item.persian || 0) +
                Number(item.science || 0) +
                Number(item.arabic || 0);

            return `
                <div class="history-item">

                    <div class="history-date">
                        ${formatDate(item.date)}
                    </div>

                    <div class="history-subjects">

                        <span>
                            ریاضی:
                            <strong>${item.math || 0}</strong>
                        </span>

                        <span>
                            فارسی:
                            <strong>${item.persian || 0}</strong>
                        </span>

                        <span>
                            علوم:
                            <strong>${item.science || 0}</strong>
                        </span>

                        <span>
                            عربی:
                            <strong>${item.arabic || 0}</strong>
                        </span>

                    </div>

                    <div class="history-total">
                        ${total} سؤال
                    </div>

                </div>
            `;
        }).join("");
}


function renderStatistics() {
    const total =
        document.getElementById("reportQuestions");

    const math =
        document.getElementById("reportMath");

    const persian =
        document.getElementById("reportPersian");

    const science =
        document.getElementById("reportScience");

    const arabic =
        document.getElementById("reportArabic");

    const todos =
        document.getElementById("reportTodos");

    if (total) {
        total.textContent =
            getTotalQuestions();
    }

    if (math) {
        math.textContent =
            getSubjectTotal("math");
    }

    if (persian) {
        persian.textContent =
            getSubjectTotal("persian");
    }

    if (science) {
        science.textContent =
            getSubjectTotal("science");
    }

    if (arabic) {
        arabic.textContent =
            getSubjectTotal("arabic");
    }

    if (todos) {
        todos.textContent =
            getCompletedTodos();
    }

    renderSubjectReport();
    renderRecentDays();
}


function renderSubjectReport() {
    const container =
        document.getElementById("subjectReport");

    if (!container) {
        return;
    }

    const values = {
        math: getSubjectTotal("math"),
        persian: getSubjectTotal("persian"),
        science: getSubjectTotal("science"),
        arabic: getSubjectTotal("arabic")
    };

    const max =
        Math.max(
            values.math,
            values.persian,
            values.science,
            values.arabic,
            1
        );

    container.innerHTML =
        Object.keys(values).map(subject => `
            <div class="subject-report-item">

                <div class="subject-report-header">
                    <span>
                        ${subjects[subject]}
                    </span>

                    <strong>
                        ${values[subject]}
                    </strong>
                </div>

                <div class="bar">
                    <span
                        style="width:${(values[subject] / max) * 100}%">
                    </span>
                </div>

            </div>
        `).join("");
}


function renderRecentDays() {
    const container =
        document.getElementById("recentDays");

    if (!container) {
        return;
    }

    const items =
        [...appData.questions]
            .sort((a, b) => b.id - a.id)
            .slice(0, 7);

    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                هنوز فعالیتی ثبت نشده است.
            </div>
        `;

        return;
    }

    container.innerHTML =
        items.map(item => {

            const total =
                Number(item.math || 0) +
                Number(item.persian || 0) +
                Number(item.science || 0) +
                Number(item.arabic || 0);

            return `
                <div class="recent-day-item">

                    <span>
                        ${formatDate(item.date)}
                    </span>

                    <strong>
                        ${total} سؤال
                    </strong>

                </div>
            `;
        }).join("");
}


function showPage(pageId) {
    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("active");
        });

    const page =
        document.getElementById(pageId);

    if (page) {
        page.classList.add("active");
    }

    document
        .querySelectorAll(".nav-item")
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.page === pageId
            );
        });

    const titles = {
        dashboard: "داشبورد",
        todos: "کارهای من",
        questions: "ثبت سؤالات",
        statistics: "آمار و گزارش"
    };

    const title =
        document.getElementById("pageTitle");

    if (title) {
        title.textContent =
            titles[pageId] || "";
    }

    if (pageId === "dashboard") {
        updateDashboard();
    }

    if (pageId === "todos") {
        renderTodos();
        updateTodoCounters();
    }

    if (pageId === "questions") {
        renderQuestionHistory();
    }

    if (pageId === "statistics") {
        renderStatistics();
    }

    closeMobileMenu();
}


function openTodoModal() {
    const modal =
        document.getElementById("todoModal");

    if (!modal) {
        return;
    }

    modal.classList.add("active");

    const input =
        document.getElementById("todoInput");

    if (input) {
        setTimeout(() => {
            input.focus();
        }, 100);
    }
}


function closeTodoModal() {
    const modal =
        document.getElementById("todoModal");

    if (modal) {
        modal.classList.remove("active");
    }
}


function toggleMobileMenu() {
    const sidebar =
        document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.toggle("open");
    }
}


function closeMobileMenu() {
    const sidebar =
        document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.remove("open");
    }
}


function deleteAllData() {
    const confirmed =
        confirm(
            "آیا مطمئن هستی که می‌خواهی همه اطلاعات حذف شود؟"
        );

    if (!confirmed) {
        return;
    }

    appData = createDefaultData();

    if (!saveData()) {
        return;
    }

    renderTodos();
    renderDashboardTodos();
    renderQuestionHistory();
    renderStatistics();
    updateTodoCounters();
    updateDashboard();

    showToast("همه اطلاعات پاک شد");
}


function setupEvents() {

    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {
                    showPage(
                        button.dataset.page
                    );
                }
            );

        });


    document
        .querySelectorAll("[data-open-page]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {
                    showPage(
                        button.dataset.openPage
                    );
                }
            );

        });


    document
        .querySelectorAll("[data-todo-filter]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    todoFilter =
                        button.dataset.todoFilter;

                    document
                        .querySelectorAll(
                            "[data-todo-filter]"
                        )
                        .forEach(item => {
                            item.classList.toggle(
                                "active",
                                item === button
                            );
                        });

                    renderTodos();
                }
            );

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


    const saveQuestionsButton =
        document.getElementById("saveQuestions");

    if (saveQuestionsButton) {
        saveQuestionsButton.addEventListener(
            "click",
            saveQuestions
        );
    }


    [
        "mathInput",
        "persianInput",
        "scienceInput",
        "arabicInput"
    ].forEach(id => {

        const input =
            document.getElementById(id);

        if (input) {
            input.addEventListener(
                "input",
                updateQuestionInputTotal
            );
        }

    });


    const mobileMenu =
        document.getElementById("mobileMenu");

    if (mobileMenu) {
        mobileMenu.addEventListener(
            "click",
            toggleMobileMenu
        );
    }


    const deleteAll =
        document.getElementById("deleteAllData");

    if (deleteAll) {
        deleteAll.addEventListener(
            "click",
            deleteAllData
        );
    }


    document.addEventListener(
        "click",
        event => {

            const toggleButton =
                event.target.closest(
                    "[data-toggle-todo]"
                );

            if (toggleButton) {

                toggleTodo(
                    toggleButton.dataset.toggleTodo
                );

                return;
            }


            const deleteButton =
                event.target.closest(
                    "[data-delete-todo]"
                );

            if (deleteButton) {

                deleteTodo(
                    deleteButton.dataset.deleteTodo
                );

            }

        }
    );


    const modal =
        document.getElementById("todoModal");

    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (event.target === modal) {
                    closeTodoModal();
                }

            }
        );

    }

}


function initialize() {
    updateTodayDate();

    setupEvents();

    renderTodos();
    renderDashboardTodos();
    renderQuestionHistory();
    renderStatistics();
    updateTodoCounters();
    updateQuestionInputTotal();
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