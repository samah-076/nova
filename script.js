
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
            saveTasks();
            renderTasks();
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

        goalForm.reset();
    });
}

renderGoals();


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
