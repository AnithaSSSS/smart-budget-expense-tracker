/* =====================================================
   SMART BUDGET TRACKER
===================================================== */


/* =========================
   ELEMENTS
========================= */

const budgetSetup =
    document.getElementById("budgetSetup");

const dashboard =
    document.getElementById("dashboard");

const budgetInput =
    document.getElementById("budgetInput");

const setBudgetBtn =
    document.getElementById("setBudgetBtn");

const remainingBudget =
    document.getElementById("remainingBudget");

const startingBudget =
    document.getElementById("startingBudget");

const spentAmount =
    document.getElementById("spentAmount");

const summaryBudget =
    document.getElementById("summaryBudget");

const summarySpent =
    document.getElementById("summarySpent");

const summaryRemaining =
    document.getElementById("summaryRemaining");

const todaySpent =
    document.getElementById("todaySpent");

const remainingPercent =
    document.getElementById("remainingPercent");

const budgetProgress =
    document.getElementById("budgetProgress");

const budgetWarning =
    document.getElementById("budgetWarning");

const warningText =
    document.getElementById("warningText");

const expenseForm =
    document.getElementById("expenseForm");

const amount =
    document.getElementById("amount");

const category =
    document.getElementById("category");

const description =
    document.getElementById("description");

const expenseDate =
    document.getElementById("expenseDate");

const expenseList =
    document.getElementById("expenseList");

const emptyMessage =
    document.getElementById("emptyMessage");

const searchInput =
    document.getElementById("searchInput");

const filterCategory =
    document.getElementById("filterCategory");

const themeBtn =
    document.getElementById("themeBtn");

const resetBtn =
    document.getElementById("resetBtn");

const exportBtn =
    document.getElementById("exportBtn");

const editModal =
    document.getElementById("editModal");

const closeModal =
    document.getElementById("closeModal");

const editForm =
    document.getElementById("editForm");


/* =========================
   DATA
========================= */

let budget =
    Number(localStorage.getItem("budget")) || 0;

let expenses =
    JSON.parse(
        localStorage.getItem("expenses")
    ) || [];


/* =========================
   INITIALIZATION
========================= */

const today =
    new Date().toISOString().split("T")[0];

expenseDate.value = today;


loadApplication();


/* =========================
   LOAD APPLICATION
========================= */

function loadApplication() {

    if (budget > 0) {

        budgetSetup.classList.add("hidden");

        dashboard.classList.remove("hidden");

        updateDashboard();

    } else {

        budgetSetup.classList.remove("hidden");

        dashboard.classList.add("hidden");

    }

}


/* =========================
   SET BUDGET
========================= */

setBudgetBtn.addEventListener(
    "click",
    function () {

        const newBudget =
            Number(budgetInput.value);


        if (!newBudget || newBudget <= 0) {

            alert(
                "Please enter a valid budget."
            );

            return;
        }


        budget = newBudget;


        localStorage.setItem(
            "budget",
            budget
        );


        budgetInput.value = "";


        loadApplication();

    }
);


/* =========================
   ADD EXPENSE
========================= */

expenseForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const expenseAmount =
            Number(amount.value);


        const expenseCategory =
            category.value;


        const expenseDescription =
            description.value.trim();


        const date =
            expenseDate.value;


        /* =========================
           VALIDATION
        ========================= */

        if (
            !expenseAmount ||
            expenseAmount <= 0
        ) {

            alert(
                "Enter a valid amount."
            );

            return;
        }


        if (!expenseCategory) {

            alert(
                "Please select a category."
            );

            return;
        }


        if (!expenseDescription) {

            alert(
                "Please enter description."
            );

            return;
        }


        if (!date) {

            alert(
                "Please select a date."
            );

            return;
        }


        /* =========================
           CURRENT TOTAL
        ========================= */

        const totalSpent =
            calculateTotalSpent();


        const remaining =
            budget - totalSpent;


        /* =========================
           PREVENT OVERSPENDING
        ========================= */

        if (expenseAmount > remaining) {

            alert(
                `Insufficient budget!\n\n` +
                `Remaining budget: ₹${remaining.toFixed(2)}\n` +
                `You tried to spend: ₹${expenseAmount.toFixed(2)}`
            );

            return;
        }


        /* =========================
           CREATE EXPENSE
        ========================= */

        const expense = {

            id: Date.now(),

            amount: expenseAmount,

            category: expenseCategory,

            description: expenseDescription,

            date: date

        };


        expenses.push(expense);


        saveExpenses();


        expenseForm.reset();


        expenseDate.value = today;


        updateDashboard();

    }
);


/* =========================
   CALCULATE TOTAL
========================= */

function calculateTotalSpent() {

    return expenses.reduce(
        function (total, expense) {

            return total +
                Number(expense.amount);

        },
        0
    );

}


/* =========================
   CALCULATE TODAY
========================= */

function calculateTodaySpent() {

    return expenses
        .filter(
            expense =>
                expense.date === today
        )
        .reduce(
            (total, expense) =>
                total +
                Number(expense.amount),
            0
        );

}


/* =========================
   UPDATE DASHBOARD
========================= */

function updateDashboard() {

    const totalSpent =
        calculateTotalSpent();


    let remaining =
        budget - totalSpent;


    if (remaining < 0) {

        remaining = 0;

    }


    /* =========================
       PERCENTAGE
    ========================= */

    let percentRemaining =
        budget > 0
            ? (remaining / budget) * 100
            : 0;


    percentRemaining =
        Math.max(
            0,
            Math.min(
                100,
                percentRemaining
            )
        );


    const percentSpent =
        100 - percentRemaining;


    /* =========================
       TEXT
    ========================= */

    remainingBudget.textContent =
        formatCurrency(remaining);


    startingBudget.textContent =
        formatCurrency(budget);


    spentAmount.textContent =
        formatCurrency(totalSpent);


    summaryBudget.textContent =
        formatCurrency(budget);


    summarySpent.textContent =
        formatCurrency(totalSpent);


    summaryRemaining.textContent =
        formatCurrency(remaining);


    todaySpent.textContent =
        formatCurrency(
            calculateTodaySpent()
        );


    remainingPercent.textContent =
        Math.round(percentRemaining) + "%";


    /* =========================
       PROGRESS
    ========================= */

    budgetProgress.style.width =
        percentSpent + "%";


    /* =========================
       CIRCLE
    ========================= */

    const degree =
        percentRemaining * 3.6;


    document
        .querySelector(".budget-circle")
        .style.background =
        `conic-gradient(
            white ${degree}deg,
            rgba(255,255,255,0.2) ${degree}deg
        )`;


    /* =========================
       WARNING
    ========================= */

    updateWarning(
        percentRemaining
    );


    /* =========================
       LIST
    ========================= */

    renderExpenses();


    /* =========================
       CHARTS
    ========================= */

    drawCategoryChart();

    drawDailyChart();


    calculateSpendingScore();

}


/* =========================
   BUDGET WARNING
========================= */

function updateWarning(percent) {

    if (percent <= 10) {

        budgetWarning.classList.remove(
            "hidden"
        );

        warningText.textContent =
            "Your budget is almost finished! Be very careful with your spending.";

    }

    else if (percent <= 25) {

        budgetWarning.classList.remove(
            "hidden"
        );

        warningText.textContent =
            "Only 25% or less of your budget is remaining.";

    }

    else {

        budgetWarning.classList.add(
            "hidden"
        );

    }

}


/* =========================
   RENDER EXPENSES
========================= */

function renderExpenses() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const selectedCategory =
        filterCategory.value;


    let filteredExpenses =
        expenses.filter(
            function (expense) {

                const matchesSearch =
                    expense.description
                        .toLowerCase()
                        .includes(search);


                const matchesCategory =
                    selectedCategory === "All" ||
                    expense.category ===
                    selectedCategory;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    /* newest first */

    filteredExpenses.sort(
        (a, b) =>
            b.id - a.id
    );


    expenseList.innerHTML = "";


    if (filteredExpenses.length === 0) {

        emptyMessage.classList.remove(
            "hidden"
        );

        return;

    }


    emptyMessage.classList.add(
        "hidden"
    );


    filteredExpenses.forEach(
        function (expense) {

            const item =
                document.createElement("div");


            item.className =
                "expense-item";


            item.innerHTML = `

                <div class="expense-left">

                    <div class="category-icon">
                        ${getCategoryIcon(
                            expense.category
                        )}
                    </div>

                    <div class="expense-details">

                        <h4>
                            ${escapeHTML(
                                expense.description
                            )}
                        </h4>

                        <p>
                            ${expense.category}
                            •
                            ${formatDate(
                                expense.date
                            )}
                        </p>

                    </div>

                </div>


                <div class="expense-right">

                    <div class="expense-amount">

                        -${formatCurrency(
                            expense.amount
                        )}

                    </div>


                    <button
                        class="edit-btn"
                        onclick="openEdit(${expense.id})">

                        ✏️

                    </button>


                    <button
                        class="delete-btn"
                        onclick="deleteExpense(${expense.id})">

                        🗑️

                    </button>

                </div>

            `;


            expenseList.appendChild(item);

        }
    );

}


/* =========================
   CATEGORY ICON
========================= */

function getCategoryIcon(category) {

    const icons = {

        Food: "🍔",

        Travel: "🚗",

        Shopping: "🛍️",

        Bills: "🧾",

        Education: "📚",

        Health: "❤️",

        Entertainment: "🎬",

        Other: "📦"

    };


    return icons[category] || "📦";

}


/* =========================
   FORMAT CURRENCY
========================= */

function formatCurrency(value) {

    return "₹" +
        Number(value).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


/* =========================
   FORMAT DATE
========================= */

function formatDate(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================
   DELETE EXPENSE
========================= */

function deleteExpense(id) {

    const expense =
        expenses.find(
            e => e.id === id
        );


    if (!expense) return;


    const confirmDelete =
        confirm(
            `Delete "${expense.description}" expense?`
        );


    if (!confirmDelete) return;


    expenses =
        expenses.filter(
            e => e.id !== id
        );


    saveExpenses();

    updateDashboard();

}


/* =========================
   SAVE EXPENSES
========================= */

function saveExpenses() {

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

}


/* =========================
   SEARCH
========================= */

searchInput.addEventListener(
    "input",
    renderExpenses
);


/* =========================
   FILTER
========================= */

filterCategory.addEventListener(
    "change",
    renderExpenses
);


/* =========================
   EDIT EXPENSE
========================= */

function openEdit(id) {

    const expense =
        expenses.find(
            e => e.id === id
        );


    if (!expense) return;


    document.getElementById(
        "editId"
    ).value = expense.id;


    document.getElementById(
        "editAmount"
    ).value = expense.amount;


    document.getElementById(
        "editCategory"
    ).value = expense.category;


    document.getElementById(
        "editDescription"
    ).value = expense.description;


    document.getElementById(
        "editDate"
    ).value = expense.date;


    editModal.classList.remove(
        "hidden"
    );

}


/* =========================
   CLOSE MODAL
========================= */

closeModal.addEventListener(
    "click",
    function () {

        editModal.classList.add(
            "hidden"
        );

    }
);


/* =========================
   EDIT FORM
========================= */

editForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const id =
            Number(
                document.getElementById(
                    "editId"
                ).value
            );


        const newAmount =
            Number(
                document.getElementById(
                    "editAmount"
                ).value
            );


        const newCategory =
            document.getElementById(
                "editCategory"
            ).value;


        const newDescription =
            document.getElementById(
                "editDescription"
            ).value.trim();


        const newDate =
            document.getElementById(
                "editDate"
            ).value;


        const oldExpense =
            expenses.find(
                e => e.id === id
            );


        if (!oldExpense) return;


        /* =========================
           CALCULATE WITHOUT OLD
        ========================= */

        const spentWithoutOld =
            calculateTotalSpent()
            - Number(oldExpense.amount);


        const newTotal =
            spentWithoutOld +
            newAmount;


        /* =========================
           CHECK BUDGET
        ========================= */

        if (newTotal > budget) {

            alert(
                "This change would exceed your budget."
            );

            return;
        }


        /* =========================
           UPDATE
        ========================= */

        oldExpense.amount =
            newAmount;

        oldExpense.category =
            newCategory;

        oldExpense.description =
            newDescription;

        oldExpense.date =
            newDate;


        saveExpenses();


        editModal.classList.add(
            "hidden"
        );


        updateDashboard();

    }
);


/* =========================
   RESET EVERYTHING
========================= */

resetBtn.addEventListener(
    "click",
    function () {

        const confirmReset =
            confirm(
                "This will delete your budget and all expenses. Continue?"
            );


        if (!confirmReset) return;


        localStorage.removeItem(
            "budget"
        );

        localStorage.removeItem(
            "expenses"
        );


        budget = 0;

        expenses = [];


        loadApplication();

    }
);


/* =========================
   DARK MODE
========================= */

themeBtn.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "dark"
        );


        const dark =
            document.body.classList.contains(
                "dark"
            );


        localStorage.setItem(
            "darkMode",
            dark
        );


        themeBtn.textContent =
            dark ? "☀️" : "🌙";

    }
);


/* =========================
   LOAD DARK MODE
========================= */

if (
    localStorage.getItem(
        "darkMode"
    ) === "true"
) {

    document.body.classList.add(
        "dark"
    );

    themeBtn.textContent =
        "☀️";

}


/* =========================
   CATEGORY CHART
========================= */

function drawCategoryChart() {

    const canvas =
        document.getElementById(
            "categoryChart"
        );


    const ctx =
        canvas.getContext("2d");


    const categories = {

        Food: 0,

        Travel: 0,

        Shopping: 0,

        Bills: 0,

        Education: 0,

        Health: 0,

        Entertainment: 0,

        Other: 0

    };


    expenses.forEach(
        expense => {

            categories[
                expense.category
            ] += Number(
                expense.amount
            );

        }
    );


    const values =
        Object.values(categories);


    const labels =
        Object.keys(categories);


    const total =
        values.reduce(
            (a, b) => a + b,
            0
        );


    canvas.width =
        canvas.offsetWidth * 2;

    canvas.height =
        300 * 2;


    ctx.scale(2, 2);


    const width =
        canvas.offsetWidth;

    const height = 300;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    if (total === 0) {

        ctx.font =
            "16px Arial";

        ctx.textAlign =
            "center";

        ctx.fillStyle =
            "#888";

        ctx.fillText(
            "No spending data yet",
            width / 2,
            height / 2
        );

        return;
    }


    let startAngle =
        -Math.PI / 2;


    const centerX =
        width / 2;

    const centerY =
        130;

    const radius =
        90;


    values.forEach(
        function (value, index) {

            if (value === 0) return;


            const slice =
                (value / total)
                * Math.PI * 2;


            ctx.beginPath();

            ctx.moveTo(
                centerX,
                centerY
            );

            ctx.arc(
                centerX,
                centerY,
                radius,
                startAngle,
                startAngle + slice
            );

            ctx.closePath();


            ctx.fillStyle =
                getChartColor(index);


            ctx.fill();


            startAngle += slice;

        }
    );


    /* center */

    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        50,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        getComputedStyle(
            document.body
        ).getPropertyValue(
            "--card"
        );

    ctx.fill();


    ctx.fillStyle =
        getComputedStyle(
            document.body
        ).getPropertyValue(
            "--text"
        );

    ctx.font =
        "bold 16px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        formatCurrency(total),
        centerX,
        centerY + 5
    );


    /* legend */

    let legendY =
        250;


    labels.forEach(
        function (label, index) {

            if (categories[label] === 0)
                return;


            ctx.fillStyle =
                getChartColor(index);


            ctx.fillRect(
                20,
                legendY - 10,
                10,
                10
            );


            ctx.fillStyle =
                getComputedStyle(
                    document.body
                ).getPropertyValue(
                    "--text"
                );


            ctx.font =
                "12px Arial";


            ctx.textAlign =
                "left";


            ctx.fillText(
                label,
                38,
                legendY
            );


            legendY += 18;

        }
    );

}


/* =========================
   CHART COLORS
========================= */

function getChartColor(index) {

    const colors = [

        "#6c63ff",

        "#ff5c77",

        "#20b486",

        "#ff9f43",

        "#3498db",

        "#9b59b6",

        "#e67e22",

        "#34495e"

    ];


    return colors[index];
}


/* =========================
   DAILY CHART
========================= */

function drawDailyChart() {

    const canvas =
        document.getElementById(
            "dailyChart"
        );


    const ctx =
        canvas.getContext("2d");


    canvas.width =
        canvas.offsetWidth * 2;

    canvas.height =
        300 * 2;


    ctx.scale(2, 2);


    const width =
        canvas.offsetWidth;

    const height =
        300;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    const days = [];


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            new Date();


        date.setDate(
            date.getDate() - i
        );


        const dateString =
            date.toISOString()
                .split("T")[0];


        const total =
            expenses
                .filter(
                    e =>
                        e.date ===
                        dateString
                )
                .reduce(
                    (sum, e) =>
                        sum +
                        Number(e.amount),
                    0
                );


        days.push({

            date:
                dateString,

            amount:
                total

        });

    }


    const max =
        Math.max(
            ...days.map(
                d => d.amount
            ),
            100
        );


    const chartHeight =
        210;

    const bottom =
        245;


    const barWidth =
        35;


    days.forEach(
        function (day, index) {

            const x =
                25 + index * 60;


            const barHeight =
                (day.amount / max)
                * chartHeight;


            const y =
                bottom - barHeight;


            ctx.fillStyle =
                "#6c63ff";


            ctx.fillRect(
                x,
                y,
                barWidth,
                barHeight
            );


            ctx.fillStyle =
                getComputedStyle(
                    document.body
                ).getPropertyValue(
                    "--muted"
                );


            ctx.font =
                "11px Arial";


            ctx.textAlign =
                "center";


            const date =
                new Date(
                    day.date +
                    "T00:00:00"
                );


            ctx.fillText(
                date.toLocaleDateString(
                    "en-IN",
                    {
                        weekday: "short"
                    }
                ),
                x + barWidth / 2,
                270
            );


            if (day.amount > 0) {

                ctx.fillStyle =
                    getComputedStyle(
                        document.body
                    ).getPropertyValue(
                        "--text"
                    );


                ctx.fillText(
                    "₹" +
                    Math.round(
                        day.amount
                    ),
                    x + barWidth / 2,
                    y - 7
                );

            }

        }
    );

}


/* =========================
   EXPORT CSV
========================= */

exportBtn.addEventListener(
    "click",
    function () {

        if (expenses.length === 0) {

            alert(
                "There are no expenses to export."
            );

            return;
        }


        let csv =
            "Date,Category,Description,Amount\n";


        expenses.forEach(
            expense => {

                csv +=
                    `"${expense.date}",` +
                    `"${expense.category}",` +
                    `"${expense.description}",` +
                    `"${expense.amount}"\n`;

            }
        );


        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href = url;

        link.download =
            "my-expenses.csv";


        link.click();


        URL.revokeObjectURL(
            url
        );

    }
);


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


/* =========================
   SERVICE WORKER
========================= */

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        function () {

            navigator.serviceWorker
                .register(
                    "service-worker.js"
                )
                .then(
                    () =>
                        console.log(
                            "Service Worker registered"
                        )
                )
                .catch(
                    error =>
                        console.log(
                            "Service Worker error:",
                            error
                        )
                );

        }
    );

}



function calculateSpendingScore() {

    if (budget <= 0) {
        return;
    }

    const totalSpent = expenses.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
    );

    const spendingPercentage = (totalSpent / budget) * 100;

    let score;
    let message;

    if (spendingPercentage <= 20) {
        score = 100;
        message = "Excellent";
    }
    else if (spendingPercentage <= 35) {
        score = 90;
        message = "Very Good";
    }
    else if (spendingPercentage <= 50) {
        score = 75;
        message = "Good";
    }
    else if (spendingPercentage <= 70) {
        score = 60;
        message = "Moderate";
    }
    else if (spendingPercentage <= 85) {
        score = 40;
        message = "Be Careful";
    }
    else if (spendingPercentage <= 100) {
        score = 20;
        message = "Warning";
    }
    else {
        score = 0;
        message = "Budget Exceeded";
    }

    document.getElementById("spendingScore").textContent = score;
    document.getElementById("scoreMessage").textContent = message;
}