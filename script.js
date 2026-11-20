
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