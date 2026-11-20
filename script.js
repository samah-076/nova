
/* =========================
   NOVA CONTACT FORM
========================= */

const contactForm = document.querySelector("#contact-form");

if (contactForm) {
    contactForm.addEventListener("submit", function(event) {
        event.preventDefault();
        alert("Thanks for contacting NOVA!");
        contactForm.reset();
    });
}


/* =========================
   NOVA DATE HELPERS
========================= */

function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

function getTodayKey() {
    return getDateKey(new Date());
}


/* =========================
   NOVA QUICK PLANNER
========================= */

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskPriority = document.querySelector("#task-priority");
const taskList = document.querySelector("#task-list");
const emptyMessage = document.querySelector("#empty-message");
const taskCounter = document.querySelector("#task-counter");
const clearTasks = document.querySelector("#clear-tasks");

let tasks = JSON.parse(localStorage.getItem("novaTasks")) || [];

function saveTasks() {
    localStorage.setItem("novaTasks", JSON.stringify(tasks));
}

function renderTasks() {
    if (!taskList) return;

    taskList.innerHTML = "";

    if (emptyMessage) {
        emptyMessage.style.display = tasks.length === 0 ? "block" : "none";
    }

    tasks.forEach(function(task) {
        const li = document.createElement("li");

        if (task.completed) {
            li.classList.add("completed");
        }

        const taskName = document.createElement("span");
        taskName.textContent = task.name;

        const priority = document.createElement("small");
        priority.textContent = task.priority;

        const actions = document.createElement("div");

        const completeButton = document.createElement("button");
        completeButton.type = "button";
        completeButton.textContent = task.completed ? "Undo" : "Complete";

        completeButton.addEventListener("click", function() {
            task.completed = !task.completed;

            if (task.completed) {
                task.completedAt = getTodayKey();
            } else {
                delete task.completedAt;
            }

            saveTasks();
            renderTasks();
            updateInsights();
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {
            tasks = tasks.filter(function(item) {
                return item.id !== task.id;
            });

            saveTasks();
            renderTasks();
            updateInsights();
        });

        actions.appendChild(completeButton);
        actions.appendChild(deleteButton);

        li.appendChild(taskName);
        li.appendChild(priority);
        li.appendChild(actions);

        taskList.appendChild(li);
    });

    if (taskCounter) {
        const completedTasks = tasks.filter(function(task) {
            return task.completed;
        }).length;

        taskCounter.textContent =
            completedTasks + " of " + tasks.length + " completed";
    }
}

if (taskForm) {
    taskForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = taskInput.value.trim();
        const priority = taskPriority.value;

        if (!name) return;

        tasks.push({
            id: Date.now() + Math.random(),
            name: name,
            priority: priority,
            completed: false
        });

        saveTasks();
        renderTasks();
        updateInsights();

        taskForm.reset();
    });
}

if (clearTasks) {
    clearTasks.addEventListener("click", function() {
        if (tasks.length === 0) return;

        const confirmed = confirm("Are you sure you want to clear all tasks?");

        if (confirmed) {
            tasks = [];
            saveTasks();
            renderTasks();
            updateInsights();
        }
    });
}

renderTasks();


/* =========================
   NOVA FOCUS TIMER
========================= */

const timerMode = document.querySelector("#timer-mode");
const timerDisplay = document.querySelector("#timer-display");
const focusDuration = document.querySelector("#focus-duration");

const focusMode = document.querySelector("#focus-mode");
const shortBreakMode = document.querySelector("#short-break-mode");
const longBreakMode = document.querySelector("#long-break-mode");

const setTimer = document.querySelector("#set-timer");
const startTimer = document.querySelector("#start-timer");
const pauseTimer = document.querySelector("#pause-timer");
const resetTimer = document.querySelector("#reset-timer");

const timerStatus = document.querySelector("#timer-status");
const timerNotification = document.querySelector("#timer-notification");
const notificationMessage = document.querySelector("#notification-message");

let timerInterval = null;
let currentMode = "focus";
let selectedDuration = 25;
let timeLeft = selectedDuration * 60;
let isRunning = false;


/* Focus session history */

let focusSessions =
    JSON.parse(localStorage.getItem("novaFocusSessions")) || [];

function saveFocusSessions() {
    localStorage.setItem(
        "novaFocusSessions",
        JSON.stringify(focusSessions)
    );
}

function recordFocusSession() {
    focusSessions.push({
        id: Date.now() + Math.random(),
        date: getTodayKey(),
        minutes: selectedDuration
    });

    saveFocusSessions();
    updateInsights();
}

function updateTimerDisplay() {
    if (!timerDisplay) return;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
}

function playTimerSound() {
    const AudioContext =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) return;

    const audioContext = new AudioContext();

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    for (let i = 0; i < 3; i++) {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = "sine";

        const startTime = audioContext.currentTime + i * 0.5;

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            startTime + 0.25
        );

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.25);
    }

    setTimeout(function() {
        audioContext.close();
    }, 2000);
}

function showTimerNotification(message) {
    if (!timerNotification || !notificationMessage) return;

    notificationMessage.textContent = message;
    timerNotification.classList.add("show");
}

function switchTimerMode(mode, duration, title) {
    if (timerNotification) {
        timerNotification.classList.remove("show");
    }

    if (notificationMessage) {
        notificationMessage.textContent = "";
    }

    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;

    currentMode = mode;
    selectedDuration = duration;
    timeLeft = duration * 60;

    if (timerMode) {
        timerMode.textContent = title;
    }

    if (focusDuration) {
        focusDuration.value = duration;
    }

    if (timerStatus) {
        timerStatus.textContent = "Ready when you are.";
    }

    document.querySelectorAll(".timer-modes button").forEach(function(button) {
        button.classList.remove("active");
    });

    const activeButton = {
        focus: focusMode,
        short: shortBreakMode,
        long: longBreakMode
    }[mode];

    if (activeButton) {
        activeButton.classList.add("active");
    }

    updateTimerDisplay();
}

if (focusMode) {
    focusMode.addEventListener("click", function() {
        switchTimerMode("focus", 25, "Focus Session");
    });
}

if (shortBreakMode) {
    shortBreakMode.addEventListener("click", function() {
        switchTimerMode("short", 5, "Short Break");
    });
}

if (longBreakMode) {
    longBreakMode.addEventListener("click", function() {
        switchTimerMode("long", 15, "Long Break");
    });
}

if (setTimer) {
    setTimer.addEventListener("click", function() {
        const duration = Number(focusDuration.value);

        if (!Number.isInteger(duration) || duration < 1 || duration > 120) {
            alert("Please enter a duration between 1 and 120 minutes.");
            return;
        }

        switchTimerMode(currentMode, duration, timerMode.textContent);
    });
}

if (startTimer) {
    startTimer.addEventListener("click", function() {
        if (isRunning || timeLeft <= 0) return;

        if (timerNotification) {
            timerNotification.classList.remove("show");
        }

        if (notificationMessage) {
            notificationMessage.textContent = "";
        }

        isRunning = true;

        if (timerStatus) {
            timerStatus.textContent = "Your session is in progress.";
        }

        timerInterval = setInterval(function() {
            timeLeft--;

            updateTimerDisplay();

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                isRunning = false;

                if (timerStatus) {
                    timerStatus.textContent = "Session completed!";
                }

                const messages = {
                    focus: "Great work! Your focus session is complete.",
                    short: "Your short break is over. Ready to focus again?",
                    long: "Your long break is over. Let's get back to it!"
                };

                if (currentMode === "focus") {
                    recordFocusSession();
                }

                playTimerSound();
                showTimerNotification(messages[currentMode]);
            }
        }, 1000);
    });
}

if (pauseTimer) {
    pauseTimer.addEventListener("click", function() {
        if (!isRunning) return;

        clearInterval(timerInterval);
        timerInterval = null;
        isRunning = false;

        if (timerStatus) {
            timerStatus.textContent = "Session paused.";
        }
    });
}

if (resetTimer) {
    resetTimer.addEventListener("click", function() {
        if (timerNotification) {
            timerNotification.classList.remove("show");
        }

        if (notificationMessage) {
            notificationMessage.textContent = "";
        }

        clearInterval(timerInterval);
        timerInterval = null;
        isRunning = false;

        timeLeft = selectedDuration * 60;

        updateTimerDisplay();

        if (timerStatus) {
            timerStatus.textContent = "Ready when you are.";
        }
    });
}

updateTimerDisplay();


/* =========================
   NOVA NOTES
========================= */

const noteForm = document.querySelector("#note-form");
const noteTitle = document.querySelector("#note-title");
const noteContent = document.querySelector("#note-content");
const saveNote = document.querySelector("#save-note");
const notesCounter = document.querySelector("#notes-counter");
const notesEmpty = document.querySelector("#notes-empty");
const notesList = document.querySelector("#notes-list");

let notes = JSON.parse(localStorage.getItem("novaNotes")) || [];
let editingNoteId = null;

function saveNotes() {
    localStorage.setItem("novaNotes", JSON.stringify(notes));
}

function renderNotes() {
    if (!notesList) return;

    notesList.innerHTML = "";

    if (notesEmpty) {
        notesEmpty.style.display = notes.length === 0 ? "block" : "none";
    }

    if (notesCounter) {
        notesCounter.textContent =
            notes.length + (notes.length === 1 ? " note" : " notes");
    }

    notes.forEach(function(note) {
        const card = document.createElement("div");
        card.classList.add("note-card");

        const heading = document.createElement("h4");
        heading.textContent = note.title;

        const content = document.createElement("p");
        content.textContent = note.content;

        const actions = document.createElement("div");
        actions.classList.add("note-actions");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", function() {
            noteTitle.value = note.title;
            noteContent.value = note.content;

            editingNoteId = note.id;
            saveNote.textContent = "Update Note";

            noteForm.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            noteTitle.focus();
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {
            notes = notes.filter(function(item) {
                return item.id !== note.id;
            });

            saveNotes();
            renderNotes();

            if (editingNoteId === note.id) {
                editingNoteId = null;
                noteForm.reset();
                saveNote.textContent = "Save Note";
            }
        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        card.appendChild(heading);
        card.appendChild(content);
        card.appendChild(actions);

        notesList.appendChild(card);
    });
}

if (noteForm) {
    noteForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const title = noteTitle.value.trim();
        const content = noteContent.value.trim();

        if (!title || !content) return;

        if (editingNoteId !== null) {
            const note = notes.find(function(item) {
                return item.id === editingNoteId;
            });

            if (note) {
                note.title = title;
                note.content = content;
            }

            editingNoteId = null;
            saveNote.textContent = "Save Note";
        } else {
            notes.push({
                id: Date.now() + Math.random(),
                title: title,
                content: content
            });
        }

        saveNotes();
        renderNotes();
        noteForm.reset();
    });
}

renderNotes();


/* =========================
   NOVA GOALS
========================= */

const goalForm = document.querySelector("#goal-form");
const goalTitle = document.querySelector("#goal-title");
const goalDescription = document.querySelector("#goal-description");
const goalDeadline = document.querySelector("#goal-deadline");
const saveGoal = document.querySelector("#save-goal");
const goalsCounter = document.querySelector("#goals-counter");
const goalsEmpty = document.querySelector("#goals-empty");
const goalsList = document.querySelector("#goals-list");

let goals = JSON.parse(localStorage.getItem("novaGoals")) || [];

function saveGoals() {
    localStorage.setItem("novaGoals", JSON.stringify(goals));
}

function renderGoals() {
    if (!goalsList) return;

    goalsList.innerHTML = "";

    if (goalsEmpty) {
        goalsEmpty.style.display = goals.length === 0 ? "block" : "none";
    }

    if (goalsCounter) {
        goalsCounter.textContent =
            goals.length + (goals.length === 1 ? " goal" : " goals");
    }

    goals.forEach(function(goal) {
        const card = document.createElement("div");
        card.classList.add("goal-card");

        if (goal.progress >= 100) {
            card.classList.add("completed");
        }

        const heading = document.createElement("h4");
        heading.textContent = goal.title;

        const description = document.createElement("p");
        description.textContent = goal.description || "No description added.";

        const deadline = document.createElement("span");
        deadline.classList.add("goal-deadline");

        const formattedDate = new Date(
            goal.deadline + "T00:00:00"
        ).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
        });

        deadline.textContent = "Target date: " + formattedDate;

        const progressInfo = document.createElement("div");
        progressInfo.classList.add("goal-progress-info");

        const progressLabel = document.createElement("span");
        progressLabel.textContent = "Progress";

        const progressValue = document.createElement("span");
        progressValue.textContent = goal.progress + "%";

        progressInfo.appendChild(progressLabel);
        progressInfo.appendChild(progressValue);

        const progressTrack = document.createElement("div");
        progressTrack.classList.add("goal-progress-track");

        const progressFill = document.createElement("div");
        progressFill.classList.add("goal-progress-fill");
        progressFill.style.width = goal.progress + "%";

        progressTrack.appendChild(progressFill);

        const progressControls = document.createElement("div");
        progressControls.classList.add("goal-progress-controls");

        const progressSlider = document.createElement("input");
        progressSlider.type = "range";
        progressSlider.min = "0";
        progressSlider.max = "100";
        progressSlider.step = "5";
        progressSlider.value = goal.progress;
        progressSlider.setAttribute(
            "aria-label",
            "Update progress for " + goal.title
        );

        const sliderValue = document.createElement("span");
        sliderValue.textContent = goal.progress + "%";

        progressSlider.addEventListener("input", function() {
            const value = Number(progressSlider.value);

            progressValue.textContent = value + "%";
            sliderValue.textContent = value + "%";
            progressFill.style.width = value + "%";
        });

        progressSlider.addEventListener("change", function() {
            goal.progress = Number(progressSlider.value);

            saveGoals();
            renderGoals();
            updateInsights();
        });

        progressControls.appendChild(progressSlider);
        progressControls.appendChild(sliderValue);

        const actions = document.createElement("div");
        actions.classList.add("goal-actions");

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {
            goals = goals.filter(function(item) {
                return item.id !== goal.id;
            });

            saveGoals();
            renderGoals();
            updateInsights();
        });

        actions.appendChild(deleteButton);

        card.appendChild(heading);
        card.appendChild(description);
        card.appendChild(deadline);
        card.appendChild(progressInfo);
        card.appendChild(progressTrack);
        card.appendChild(progressControls);
        card.appendChild(actions);

        goalsList.appendChild(card);
    });
}

if (goalForm) {
    goalForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const title = goalTitle.value.trim();
        const description = goalDescription.value.trim();
        const deadline = goalDeadline.value;

        if (!title || !deadline) return;

        goals.push({
            id: Date.now() + Math.random(),
            title: title,
            description: description,
            deadline: deadline,
            progress: 0
        });

        saveGoals();
        renderGoals();
        updateInsights();

        goalForm.reset();
    });
}

renderGoals();


/* =========================
   NOVA HABITS
========================= */

const habitForm = document.querySelector("#habit-form");
const habitTitle = document.querySelector("#habit-title");
const habitFrequency = document.querySelector("#habit-frequency");
const habitsCompleted = document.querySelector("#habits-completed");
const habitsTotal = document.querySelector("#habits-total");
const habitsRate = document.querySelector("#habits-rate");
const habitsDate = document.querySelector("#habits-date");
const habitsEmpty = document.querySelector("#habits-empty");
const habitsList = document.querySelector("#habits-list");

let habits = JSON.parse(localStorage.getItem("novaHabits")) || [];

function saveHabits() {
    localStorage.setItem("novaHabits", JSON.stringify(habits));
}

function getDateFromKey(dateKey) {
    const parts = dateKey.split("-").map(Number);

    return new Date(parts[0], parts[1] - 1, parts[2]);
}

function isHabitScheduled(habit, date) {
    const day = date.getDay();

    if (habit.frequency === "weekdays") {
        return day >= 1 && day <= 5;
    }

    if (habit.frequency === "weekends") {
        return day === 0 || day === 6;
    }

    return true;
}

function getHabitStreaks(habit) {
    const history = habit.history || {};
    const today = new Date();
    const todayKey = getDateKey(today);

    const startDate = habit.createdAt
        ? getDateFromKey(habit.createdAt)
        : today;

    let currentStreak = 0;
    let bestStreak = 0;
    let runningStreak = 0;

    const totalDays = Math.floor(
        (today - startDate) / 86400000
    ) + 1;

    for (let i = 0; i < totalDays; i++) {
        const date = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate() + i
        );

        if (!isHabitScheduled(habit, date)) {
            continue;
        }

        const completed = history[getDateKey(date)] === true;

        if (completed) {
            runningStreak++;
            bestStreak = Math.max(bestStreak, runningStreak);
        } else {
            runningStreak = 0;
        }
    }

    let checkDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    if (
        isHabitScheduled(habit, checkDate) &&
        history[todayKey] !== true
    ) {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    while (checkDate >= startDate) {
        if (isHabitScheduled(habit, checkDate)) {
            if (history[getDateKey(checkDate)] === true) {
                currentStreak++;
            } else {
                break;
            }
        }

        checkDate.setDate(checkDate.getDate() - 1);
    }

    return {
        current: currentStreak,
        best: bestStreak
    };
}

function getTodayHabitStats() {
    const today = new Date();
    const todayKey = getTodayKey();

    let completed = 0;
    let scheduled = 0;

    habits.forEach(function(habit) {
        if (isHabitScheduled(habit, today)) {
            scheduled++;

            if (
                habit.history &&
                habit.history[todayKey] === true
            ) {
                completed++;
            }
        }
    });

    return {
        completed: completed,
        scheduled: scheduled
    };
}

function renderHabits() {
    if (!habitsList) return;

    habitsList.innerHTML = "";

    const today = new Date();
    const todayKey = getTodayKey();

    if (habitsDate) {
        habitsDate.textContent = today.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    if (habitsEmpty) {
        habitsEmpty.style.display =
            habits.length === 0 ? "block" : "none";
    }

    let completedToday = 0;
    let scheduledToday = 0;

    habits.forEach(function(habit) {
        const scheduled = isHabitScheduled(habit, today);
        const completed = habit.history &&
            habit.history[todayKey] === true;

        if (scheduled) {
            scheduledToday++;

            if (completed) {
                completedToday++;
            }
        }

        const card = document.createElement("div");
        card.classList.add("habit-card");

        if (completed) {
            card.classList.add("completed");
        }

        const info = document.createElement("div");
        info.classList.add("habit-info");

        const heading = document.createElement("h4");
        heading.textContent = habit.title;

        const frequency = document.createElement("p");

        const frequencyNames = {
            daily: "Every day",
            weekdays: "Weekdays",
            weekends: "Weekends"
        };

        frequency.textContent =
            frequencyNames[habit.frequency] || "Every day";

        const streaks = getHabitStreaks(habit);

        const streak = document.createElement("span");
        streak.classList.add("habit-streak");
        streak.textContent =
            "Current streak: " + streaks.current +
            " days · Best streak: " + streaks.best + " days";

        info.appendChild(heading);
        info.appendChild(frequency);
        info.appendChild(streak);

        const actions = document.createElement("div");
        actions.classList.add("habit-actions");

        const completeButton = document.createElement("button");
        completeButton.type = "button";
        completeButton.classList.add("habit-complete");

        if (!scheduled) {
            completeButton.textContent = "Not scheduled today";
            completeButton.disabled = true;
        } else {
            completeButton.textContent =
                completed ? "Undo" : "Mark Complete";

            completeButton.addEventListener("click", function() {
                if (!habit.history) {
                    habit.history = {};
                }

                if (habit.history[todayKey]) {
                    delete habit.history[todayKey];
                } else {
                    habit.history[todayKey] = true;
                }

                saveHabits();
                renderHabits();
                updateInsights();
            });
        }

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.classList.add("habit-delete");
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {
            habits = habits.filter(function(item) {
                return item.id !== habit.id;
            });

            saveHabits();
            renderHabits();
            updateInsights();
        });

        actions.appendChild(completeButton);
        actions.appendChild(deleteButton);

        card.appendChild(info);
        card.appendChild(actions);

        habitsList.appendChild(card);
    });

    if (habitsCompleted) {
        habitsCompleted.textContent = completedToday;
    }

    if (habitsTotal) {
        habitsTotal.textContent = habits.length;
    }

    if (habitsRate) {
        const rate = scheduledToday === 0
            ? 0
            : Math.round((completedToday / scheduledToday) * 100);

        habitsRate.textContent = rate + "%";
    }
}

if (habitForm) {
    habitForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const title = habitTitle.value.trim();
        const frequency = habitFrequency.value;

        if (!title) return;

        habits.push({
            id: Date.now() + Math.random(),
            title: title,
            frequency: frequency,
            createdAt: getTodayKey(),
            history: {}
        });

        saveHabits();
        renderHabits();
        updateInsights();

        habitForm.reset();
    });
}

renderHabits();


/* =========================
   NOVA INSIGHTS
========================= */

const insightsDate = document.querySelector("#insights-date");

const insightTasksCompleted =
    document.querySelector("#insight-tasks-completed");

const insightTasksDetail =
    document.querySelector("#insight-tasks-detail");

const insightFocusSessions =
    document.querySelector("#insight-focus-sessions");

const insightFocusDetail =
    document.querySelector("#insight-focus-detail");

const insightHabitsCompleted =
    document.querySelector("#insight-habits-completed");

const insightHabitsDetail =
    document.querySelector("#insight-habits-detail");

const insightGoalsCompleted =
    document.querySelector("#insight-goals-completed");

const insightGoalsDetail =
    document.querySelector("#insight-goals-detail");

const insightTaskProgress =
    document.querySelector("#insight-task-progress");

const insightTaskProgressLabel =
    document.querySelector("#insight-task-progress-label");

const insightTaskCount =
    document.querySelector("#insight-task-count");

const insightHabitProgress =
    document.querySelector("#insight-habit-progress");

const insightHabitProgressLabel =
    document.querySelector("#insight-habit-progress-label");

const insightHabitCount =
    document.querySelector("#insight-habit-count");

const insightWeeklyChart =
    document.querySelector("#insight-weekly-chart");

const insightReflection =
    document.querySelector("#insight-reflection");


function updateProgressBar(element, percentage) {
    if (!element) return;

    element.style.width = percentage + "%";
}


function renderWeeklyChart() {
    if (!insightWeeklyChart) return;

    insightWeeklyChart.innerHTML = "";

    const week = [];

    // Get the last seven calendar days, including today.
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setHours(12, 0, 0, 0);
        date.setDate(date.getDate() - i);

        const dateKey = getDateKey(date);

        const count = tasks.filter(function(task) {
            return task.completedAt === dateKey;
        }).length;

        week.push({
            date: date,
            key: dateKey,
            count: count
        });
    }

    const maximum = Math.max(
        1,
        ...week.map(function(day) {
            return day.count;
        })
    );

    week.forEach(function(day) {
        const dayContainer = document.createElement("div");
        dayContainer.classList.add("weekly-chart-day");

        const value = document.createElement("span");
        value.classList.add("weekly-chart-value");
        value.textContent = day.count;

        const barArea = document.createElement("div");
        barArea.classList.add("weekly-chart-bar-area");

        const bar = document.createElement("div");
        bar.classList.add("weekly-chart-bar");

        const height = day.count === 0
            ? 3
            : Math.max(8, (day.count / maximum) * 100);

        bar.style.height = height + "%";

        barArea.appendChild(bar);

        const label = document.createElement("small");
        label.textContent = day.date.toLocaleDateString(undefined, {
            weekday: "short"
        });

        const fullDate = day.date.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        dayContainer.title =
            fullDate + ": " + day.count +
            (day.count === 1 ? " task completed" : " tasks completed");

        dayContainer.setAttribute(
            "aria-label",
            dayContainer.title
        );

        dayContainer.appendChild(value);
        dayContainer.appendChild(barArea);
        dayContainer.appendChild(label);

        insightWeeklyChart.appendChild(dayContainer);
    });
}


function updateInsights() {
    const completedTasks = tasks.filter(function(task) {
        return task.completed;
    }).length;

    const totalTasks = tasks.length;

    const taskPercentage = totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);

    const totalFocusSessions = focusSessions.length;

    const totalFocusMinutes = focusSessions.reduce(function(total, session) {
        return total + Number(session.minutes || 0);
    }, 0);

    const habitStats = getTodayHabitStats();

    const completedGoals = goals.filter(function(goal) {
        return Number(goal.progress) >= 100;
    }).length;

    const activeGoals = goals.filter(function(goal) {
        return Number(goal.progress) < 100;
    }).length;

    const habitPercentage = habitStats.scheduled === 0
        ? 0
        : Math.round(
            (habitStats.completed / habitStats.scheduled) * 100
        );

    if (insightsDate) {
        insightsDate.textContent = new Date().toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    if (insightTasksCompleted) {
        insightTasksCompleted.textContent = completedTasks;
    }

    if (insightTasksDetail) {
        insightTasksDetail.textContent =
            totalTasks + (totalTasks === 1 ? " task in total" : " tasks in total");
    }

    if (insightFocusSessions) {
        insightFocusSessions.textContent = totalFocusSessions;
    }

    if (insightFocusDetail) {
        insightFocusDetail.textContent =
            totalFocusMinutes + " focus minutes recorded";
    }

    if (insightHabitsCompleted) {
        insightHabitsCompleted.textContent = habitStats.completed;
    }

    if (insightHabitsDetail) {
        insightHabitsDetail.textContent =
            habitStats.scheduled + " habits scheduled today";
    }

    if (insightGoalsCompleted) {
        insightGoalsCompleted.textContent = completedGoals;
    }

    if (insightGoalsDetail) {
        insightGoalsDetail.textContent =
            activeGoals + (activeGoals === 1 ? " active goal" : " active goals");
    }

    if (insightTaskProgressLabel) {
        insightTaskProgressLabel.textContent = taskPercentage + "%";
    }

    if (insightTaskCount) {
        insightTaskCount.textContent =
            completedTasks + " of " + totalTasks + " tasks completed";
    }

    updateProgressBar(insightTaskProgress, taskPercentage);

    if (insightHabitProgressLabel) {
        insightHabitProgressLabel.textContent = habitPercentage + "%";
    }

    if (insightHabitCount) {
        insightHabitCount.textContent =
            habitStats.completed + " of " +
            habitStats.scheduled + " scheduled habits completed";
    }

    updateProgressBar(insightHabitProgress, habitPercentage);

    renderWeeklyChart();

    /* Activity-based reflection */

    if (insightReflection) {
        if (
            totalTasks === 0 &&
            totalFocusSessions === 0 &&
            habits.length === 0 &&
            goals.length === 0
        ) {
            insightReflection.textContent =
                "Your NOVA activity will appear here as you start planning, focusing, building habits and working towards your goals.";
        } else {
            const observations = [];

            if (totalTasks > 0) {
                observations.push(
                    "You've completed " + completedTasks +
                    " of " + totalTasks + " tasks"
                );
            }

            if (totalFocusSessions > 0) {
                observations.push(
                    "you've completed " + totalFocusSessions +
                    " focus sessions, totalling " +
                    totalFocusMinutes + " minutes"
                );
            }

            if (habitStats.scheduled > 0) {
                observations.push(
                    "you've completed " + habitStats.completed +
                    " of " + habitStats.scheduled +
                    " scheduled habits today"
                );
            }

            if (goals.length > 0) {
                observations.push(
                    "you've completed " + completedGoals +
                    " of " + goals.length + " goals"
                );
            }

            if (observations.length > 0) {
                insightReflection.textContent =
                    observations.join(". ") +
                    ". Keep building a routine that works for you.";
            } else {
                insightReflection.textContent =
                    "Your activity is getting started. Keep using NOVA to track your progress.";
            }
        }
    }
}

updateInsights();


/* =========================
   NOVA MOBILE NAVIGATION
========================= */

const menuToggle = document.querySelector("#menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function() {
        navLinks.classList.toggle("show");

        const isOpen = navLinks.classList.contains("show");

        menuToggle.textContent = isOpen ? "✕" : "☰";
        menuToggle.setAttribute("aria-expanded", isOpen);
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation" : "Open navigation"
        );
    });

    navLinks.querySelectorAll("a").forEach(function(link) {
        link.addEventListener("click", function() {
            navLinks.classList.remove("show");

            menuToggle.textContent = "☰";
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation");
        });
    });
}
