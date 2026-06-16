const input = document.getElementById("todo-input");
const form = document.getElementById("todo-form");
const activeList = document.getElementById("active-list");
const doneList = document.getElementById("done-list");
const emptyMessage = document.getElementById("empty-message");
const activeCount = document.getElementById("active-count");
const doneCount = document.getElementById("done-count");
const activeSection = document.getElementById("active-section");
const doneSection = document.getElementById("done-section");
const startInput = document.getElementById("start-input");
const endInput = document.getElementById("end-input");

//タスク数を更新
function updateCounts() {
  activeCount.textContent = activeList.children.length;
  doneCount.textContent = doneList.children.length;

  const total = activeList.children.length + doneList.children.length;
  if (total === 0) {
    emptyMessage.classList.remove("hidden");
    activeSection.classList.add("hidden");
    doneSection.classList.add("hidden");
  } else {
    emptyMessage.classList.add("hidden");
    activeSection.classList.remove("hidden");
    doneSection.classList.remove("hidden");
  }
}

function saveTasks() {
  const tasks = [];
  Array.from(activeList.children).forEach((li) => {
    tasks.push({
      text: li.querySelector(".task-text")?.textContent ?? "",
      start: li.querySelector(".task-date")?.dataset.date ?? "",
      end: li.querySelector(".task-end")?.dataset.end ?? "",
      done: false,
    });
  });
  Array.from(doneList.children).forEach((li) => {
    tasks.push({
      text: li.querySelector(".task-text")?.textContent ?? "",
      start: li.querySelector(".task-date")?.dataset.date ?? "",
      end: li.querySelector(".task-end")?.dataset.end ?? "",
      done: true,
    });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem("tasks");
  if (!saved) return;
  JSON.parse(saved).forEach((task) => {
    addTask(task.text, task.done, task.start ?? "", task.end ?? "");
  });
}

function addTask(text, done = false, start = "", end = "") {
  const li = document.createElement("li");

  const span = document.createElement("span");
  span.classList.add("task-text");
  span.textContent = text;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = done;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "X";
  deleteBtn.classList.add("delete-btn");

  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  cardBody.appendChild(span);

  const timeSpan = document.createElement("span");
  timeSpan.classList.add("task-time");

  const startSpan = document.createElement("span");
  startSpan.classList.add("task-date");
  startSpan.dataset.date = start;

  const endSpan = document.createElement("span");
  endSpan.classList.add("task-end");
  endSpan.dataset.end = end;

  if (start || end) {
    timeSpan.textContent = start && end ? `${start} → ${end}` : start || end;
    cardBody.appendChild(timeSpan);
  }
  cardBody.appendChild(startSpan);
  cardBody.appendChild(endSpan);

  const cardActions = document.createElement("div");
  cardActions.classList.add("card-actions");
  cardActions.appendChild(checkbox);
  cardActions.appendChild(deleteBtn);

  li.appendChild(cardBody);
  li.appendChild(cardActions);

  if (done) {
    li.classList.add("done");
    doneList.appendChild(li);
  } else {
    activeList.appendChild(li);
  }

  updateCounts();

  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      li.classList.add("done");
      doneList.appendChild(li);
    } else {
      li.classList.remove("done");
      activeList.appendChild(li);
    }
    saveTasks();
    updateCounts();
  });

  deleteBtn.addEventListener("click", () => {
    li.remove();
    saveTasks();
    updateCounts();
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (text === "") return;
  addTask(text, false, startInput.value, endInput.value); // ← date を渡す
  saveTasks();
  input.value = "";
  startInput.value = "";
  endInput.value = "";
});

const todayYear = document.getElementById("today-year");
const todayMain = document.getElementById("today-main");
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;
const day = now.getDate();
const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
const weekday = weekdays[now.getDay()];
todayYear.textContent = `${year}年`;
todayMain.textContent = `${month}月${day}日（${weekday}）`;

document.getElementById("start-input").addEventListener("click", function () {
  this.showPicker();
});
document.getElementById("end-input").addEventListener("click", function () {
  this.showPicker();
});

loadTasks();
