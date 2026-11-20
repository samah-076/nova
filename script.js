
const contactForm = document.querySelector("#contact-form");

contactForm.addEventListener("submit", function(event) {
    event.preventDefault();

    alert("Thanks for contacting NOVA!");

    contactForm.reset();
});
// NOVA QUICK PLANNER

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskPriority = document.querySelector("#task-priority");
const taskList = document.querySelector("#task-list");
const emptyMessage = document.querySelector("#empty-message");
const taskCounter = document.querySelector("#task-counter");
const clearTasksButton = document.querySelector("#clear-tasks");

let tasks = JSON.parse(localStorage.getItem("novaTasks")) || [];

function saveTasks() {
    localStorage.setItem("novaTasks", JSON.stringify(tasks));
}

function updateTaskCounter() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;

    taskCounter.textContent =
        totalTasks + " tasks | " + completedTasks + " completed";
}

function displayTasks() {
    taskList.textContent = "";

    emptyMessage.style.display =
        tasks.length === 0 ? "block" : "none";

    tasks.forEach(function(task, index) {
        const taskItem = document.createElement("li");
        const taskName = document.createElement("span");
        const priorityLabel = document.createElement("small");
        const completeButton = document.createElement("button");
        const deleteButton = document.createElement("button");

        taskName.textContent = task.name;
        priorityLabel.textContent = "Priority: " + task.priority;

        if (task.completed) {
            taskName.style.textDecoration = "line-through";
            taskName.style.opacity = "0.5";
        }

        completeButton.textContent =
            task.completed ? "Completed" : "Complete";

        completeButton.disabled = task.completed;

        deleteButton.textContent = "Delete";

        completeButton.addEventListener("click", function() {
            tasks[index].completed = true;
            saveTasks();
            displayTasks();
        });

        deleteButton.addEventListener("click", function() {
            tasks.splice(index, 1);
            saveTasks();
            displayTasks();
        });

        taskItem.appendChild(taskName);
        taskItem.appendChild(document.createElement("br"));
        taskItem.appendChild(priorityLabel);
        taskItem.appendChild(document.createElement("br"));
        taskItem.appendChild(completeButton);
        taskItem.appendChild(deleteButton);

        taskList.appendChild(taskItem);
    });

    updateTaskCounter();
}

taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const taskText = taskInput.value.trim();

    if (taskText === "") {
        return;
    }

    tasks.push({
        name: taskText,
        priority: taskPriority.value,
        completed: false
    });

    saveTasks();
    displayTasks();
    taskForm.reset();
});
clearTasksButton.addEventListener("click", function() {
    if (tasks.length === 0) {
        return;
    }

    const confirmClear = confirm("Are you sure you want to clear all your tasks?");

    if (confirmClear) {
        tasks = [];
        saveTasks();
        displayTasks();
    }
});
displayTasks();
// NOVA FOCUS TIMER

const timerDisplay = document.querySelector("#timer-display");
const startTimer = document.querySelector("#start-timer");
const pauseTimer = document.querySelector("#pause-timer");
const resetTimer = document.querySelector("#reset-timer");
const timerStatus = document.querySelector("#timer-status");
const timerNotification = document.querySelector("#timer-notification");
const notificationMessage = document.querySelector("#notification-message");

let selectedDuration = 25;
let selectedFocusDuration = 25;
let selectedShortBreakDuration = 5;
let selectedLongBreakDuration = 15;
let currentMode = "focus";
let timeLeft = selectedDuration * 60;
let timerInterval = null;
const focusDuration = document.querySelector("#focus-duration");
const setTimerButton = document.querySelector("#set-timer");
const timerMode = document.querySelector("#timer-mode");
const focusMode = document.querySelector("#focus-mode");
const shortBreakMode = document.querySelector("#short-break-mode");
const longBreakMode = document.querySelector("#long-break-mode");

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
}
// NOVA TIMER ALARM

let audioContext;
function playTimerSound() {
    if (!audioContext) return;

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    for (let i = 0; i < 3; i++) {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.frequency.value = 880;
        oscillator.type = "sine";

        const startAt = audioContext.currentTime + (i * 0.6);

        gain.gain.setValueAtTime(0.25, startAt);
        gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.4);

        oscillator.start(startAt);
        oscillator.stop(startAt + 0.4);
    }
}
startTimer.addEventListener("click", function() {

    timerNotification.classList.remove("show");
    notificationMessage.textContent = ""
    if (timerInterval !== null) return;
    const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

if (!audioContext && AudioContextClass) {
    audioContext = new AudioContextClass();
}

if (audioContext && audioContext.state === "suspended") {
    audioContext.resume();
}
    timerStatus.textContent = "Focus session in progress.";

    timerInterval = setInterval(function() {
        timeLeft--;

        updateTimerDisplay();

        if (timeLeft <= 0) {
    clearInterval(timerInterval);
    timerInterval = null;

    if (currentMode === "focus") {
        timerStatus.textContent = "Focus session complete! Time for a break.";
        notificationMessage.textContent = "Focus session complete! Great work. Time for a break.";
    } else {
        timerStatus.textContent = "Break complete! Ready to focus again?";
        notificationMessage.textContent = "Break complete! You're ready to focus again.";
    }

    timerNotification.classList.add("show");
    console.log("NOVA notification triggered");
    playTimerSound();
}
    }, 1000);
});

pauseTimer.addEventListener("click", function() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerStatus.textContent = "Session paused.";
});
resetTimer.addEventListener("click", function() {

    timerNotification.classList.remove("show");
    notificationMessage.textContent = "";

    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = selectedDuration * 60;

    updateTimerDisplay();
    timerStatus.textContent = "Ready when you are.";
});
setTimerButton.addEventListener("click", function() {
    const chosenTime = Number(focusDuration.value);

    if (chosenTime < 1 || chosenTime > 120 || !Number.isInteger(chosenTime)) {
        alert("Choose a whole number between 1 and 120.");
        return;
    }

    clearInterval(timerInterval);
    timerInterval = null;

    if (currentMode === "focus") {
    selectedFocusDuration = chosenTime;
} else if (currentMode === "short-break") {
    selectedShortBreakDuration = chosenTime;
} else if (currentMode === "long-break") {
    selectedLongBreakDuration = chosenTime;
}

switchTimerMode(currentMode, chosenTime, timerMode.textContent);

    updateTimerDisplay();
    timerStatus.textContent = "Your focus time has been set.";
});
function switchTimerMode(mode, duration, title) {
    timerNotification.classList.remove("show");
    notificationMessage.textContent ="";
    clearInterval(timerInterval);
    timerInterval = null;

    currentMode = mode;
    selectedDuration = duration;
    timeLeft = duration * 60;

    timerMode.textContent = title;
    focusDuration.value = duration;

    timerStatus.textContent = "Ready when you are.";

    document.querySelectorAll(".timer-modes button").forEach(button => {
        button.classList.remove("active");
    });

    document.querySelector("#" + mode + "-mode").classList.add("active");

    updateTimerDisplay();
}

focusMode.addEventListener("click", function() {
    switchTimerMode("focus", selectedFocusDuration, "Focus Session");
});

shortBreakMode.addEventListener("click", function() {
    switchTimerMode("short-break", selectedShortBreakDuration, "Short Break");
});

longBreakMode.addEventListener("click", function() {
    switchTimerMode("long-break", selectedLongBreakDuration, "Long Break");
});

focusMode.classList.add("active");
updateTimerDisplay();
const menuToggle = document.querySelector("#menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuToggle.addEventListener("click", function() {
    navLinks.classList.toggle("show");

    const isOpen = navLinks.classList.contains("show");

    menuToggle.setAttribute("aria-expanded", isOpen);
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    menuToggle.textContent = isOpen ? "✕" : "☰";
});

navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", function() {
        navLinks.classList.remove("show");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        menuToggle.textContent = "☰";
    });
});