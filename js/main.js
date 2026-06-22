// 紙吹雪アニメーションを実行する関数
function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");

  // キャンバスサイズを画面に合わせる
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // 紙吹雪の1粒を表すオブジェクト配列を生成
  const pieces = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width, // 横位置（ランダム）
    y: Math.random() * -canvas.height, // 縦位置（画面上部より上からスタート）
    w: Math.random() * 10 + 5, // 幅
    h: Math.random() * 6 + 4, // 高さ
    color: `hsl(${Math.random() * 360}, 80%, 60%)`, // ランダムな色
    speedY: Math.random() * 3 + 2, // 落下速度
    speedX: (Math.random() - 0.5) * 2, // 横ドリフト
    angle: Math.random() * Math.PI * 2, // 回転角度
    spin: (Math.random() - 0.5) * 0.2, // 回転速度
  }));

  let frame;
  const startTime = Date.now();

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach((p) => {
      // 位置と角度を更新
      p.y += p.speedY;
      p.x += p.speedX;
      p.angle += p.spin;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);

      // 経過時間に応じて透明度を下げる（1.5秒後にフェードアウト）
      const elapsed = (Date.now() - startTime) / 1000;
      ctx.globalAlpha = Math.max(0, 1 - (elapsed - 1.5) / 0.8);

      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    // 2.3秒後にアニメーションを止めてキャンバスをクリア
    if (Date.now() - startTime < 2300) {
      frame = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(frame);
    }
  }

  draw();
}

/* =====================
   要素の取得
   ===================== */

const input = document.getElementById("todo-input");
const memoInput = document.getElementById("memo-input");
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
const optionsToggle = document.getElementById("options-toggle");
const optionsArea = document.getElementById("options-area");
const toggleArrow = document.getElementById("toggle-arrow");
const priorityInput = document.getElementById("priority-input");
const overdueList = document.getElementById("overdue-list");
const overdueSection = document.getElementById("overdue-section");
const overdueCount = document.getElementById("overdue-count");
const searchInput = document.getElementById("search-input");
const dateInput = document.getElementById("date-input");
const prevDateBtn = document.getElementById("prev-date");
const nextDateBtn = document.getElementById("next-date");
const fabBtn = document.getElementById("fab-btn");
const addSheetOverlay = document.getElementById("add-sheet-overlay");
const recurringInput = document.getElementById("recurring-input");
const modalRecurringDeleteBtn = document.getElementById(
  "modal-recurring-delete-btn",
);
const modalRecurringField = document.getElementById("modal-recurring-field");
const categoryInput = document.getElementById("category-input");
const categoryAddBtn = document.getElementById("category-add-btn");
const categoryList = document.getElementById("category-list");
const categorySelect = document.getElementById("category-select");
const modalCategory = document.getElementById("modal-category");
// 現在選択中のアイコンと色を保持する変数
let selectedIcon = "ti-tag";
let selectedColor = "#4a90e2";

/* =====================
   日付管理
   ===================== */

// 現在表示中の日付（YYYY-MM-DD形式）
let currentDate = toDateString(new Date());

// DateオブジェクトをYYYY-MM-DD形式の文字列に変換する
function toDateString(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// YYYY-MM-DD形式の文字列をDateオブジェクトに変換する
function toDateObject(str) {
  return new Date(str + "T00:00:00");
}

// 日付表示（ヘッダーの年・月日・曜日）を更新する
function updateDateDisplay() {
  const d = toDateObject(currentDate);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  document.getElementById("today-year").textContent = `${d.getFullYear()}年`;
  document.getElementById("today-main").textContent =
    `${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`;
}

// 未完了タスクを優先度でグループ分けし、時間順に並べて描画する
function renderActiveSection() {
  const priorityOrder = ["high", "medium", "low", ""];
  const priorityLabel = {
    high: { label: "高", icon: "ti-flame", color: "#E24B4A" },
    medium: { label: "中", icon: "ti-minus", color: "#EF9F27" },
    low: { label: "低", icon: "ti-leaf", color: "#639922" },
    "": { label: "なし", icon: "ti-minus", color: "#aaa" },
  };

  const allItems = Array.from(activeList.querySelectorAll("li"));
  const visible = allItems.filter((li) => li.dataset.taskDate === currentDate);
  // 他の日付のタスクはDOMから消さずに非表示で保持する
  const hidden = allItems.filter((li) => li.dataset.taskDate !== currentDate);

  // 優先度ごとにグループ化する
  const groups = { high: [], medium: [], low: [], "": [] };
  visible.forEach((li) => {
    const p = li.dataset.priority ?? "";
    if (groups[p] !== undefined) groups[p].push(li);
  });

  // 開始時間でソートする（時間なしは末尾）
  Object.keys(groups).forEach((p) => {
    groups[p].sort((a, b) => {
      const aTime = a.querySelector(".task-date")?.dataset.date ?? "";
      const bTime = b.querySelector(".task-date")?.dataset.date ?? "";
      if (!aTime && !bTime) return 0;
      if (!aTime) return 1; // 時間なしは末尾
      if (!bTime) return -1;
      return aTime.localeCompare(bTime);
    });
  });

  // active-listをリセットして描画し直す
  activeList.innerHTML = "";

  priorityOrder.forEach((p) => {
    if (groups[p].length === 0) return; // タスクがなければスキップ

    // サブセクションのヘッダー
    const header = document.createElement("div");
    header.classList.add("priority-group-header");
    const { label, icon, color } = priorityLabel[p];
    header.innerHTML = `<i class="ti ${icon}" style="color:${color};"></i> ${label}`;
    header.style.color = color;
    activeList.appendChild(header);

    // タスクを追加
    const ul = document.createElement("ul");
    groups[p].forEach((li) => ul.appendChild(li));
    activeList.appendChild(ul);
  });

  // 他の日付のタスクを非表示で再追加する（消えないようにするため）
  hidden.forEach((li) => {
    li.style.display = "none";
    activeList.appendChild(li);
  });
}

// 現在の日付のタスクだけ表示し、それ以外を非表示にする
function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();

  // doneList・overdueListは従来通りフィルタリング
  [doneList, overdueList].forEach((list) => {
    Array.from(list.querySelectorAll("li")).forEach((li) => {
      const taskDate = li.dataset.taskDate ?? "";
      const text =
        li.querySelector(".task-text")?.textContent.toLowerCase() ?? "";
      const memo =
        li.querySelector(".task-memo")?.textContent.toLowerCase() ?? "";
      const matchesDate = taskDate === currentDate;
      const matchesSearch =
        !query || text.includes(query) || memo.includes(query);
      li.style.display = matchesDate && matchesSearch ? "" : "none";
    });
  });

  // activeListはグループ描画し直す
  renderActiveSection();
  updateDateDisplay();
  updateCounts();
}

/* =====================
   カウント・表示切り替え
   ===================== */

// タスクの件数を更新し、0件なら空メッセージを表示する
function updateCounts() {
  // active-listはdivになったのでquerySelectorAllでliを取得する
  const activeVisible = Array.from(activeList.querySelectorAll("li")).filter(
    (li) => li.style.display !== "none",
  ).length;
  const doneVisible = Array.from(doneList.children).filter(
    (li) => li.style.display !== "none",
  ).length;
  const overdueVisible = Array.from(overdueList.children).filter(
    (li) => li.style.display !== "none",
  ).length;

  activeCount.textContent = activeVisible;
  doneCount.textContent = doneVisible;
  overdueCount.textContent = overdueVisible;

  // 進捗バーを更新する（完了数/全体数）
  const progressBar = document.getElementById("progress-bar");
  const progressLabel = document.getElementById("progress-label");
  const totalTasks = activeVisible + doneVisible + overdueVisible;
  const percent =
    totalTasks === 0 ? 0 : Math.round((doneVisible / totalTasks) * 100);
  progressBar.style.width = percent + "%";
  progressLabel.textContent = `${doneVisible}/${totalTasks}`;

  if (totalTasks === 0) {
    emptyMessage.classList.remove("hidden");
    activeSection.classList.add("hidden");
    doneSection.classList.add("hidden");
    overdueSection.classList.add("hidden");
  } else {
    emptyMessage.classList.add("hidden");
    activeSection.classList.remove("hidden");
    doneSection.classList.remove("hidden");
    if (overdueVisible > 0) {
      overdueSection.classList.remove("hidden");
    } else {
      overdueSection.classList.add("hidden");
    }
  }
}

/* =====================
   カテゴリ管理
   ===================== */

// LocalStorageからカテゴリ一覧を取得する
function loadCategories() {
  return JSON.parse(localStorage.getItem("categories") || "[]");
}

// カテゴリ一覧をLocalStorageに保存する
function saveCategories(categories) {
  localStorage.setItem("categories", JSON.stringify(categories));
}

// タスク追加・編集フォームのselectにカテゴリの選択肢を反映する
function renderCategoryOptions() {
  const categories = loadCategories();

  // 追加フォームとモーダル両方のselectを更新する
  [categorySelect, modalCategory].forEach((select) => {
    const current = select.value; // 現在選択中の値を保持
    select.innerHTML = '<option value="">なし</option>';
    categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.name; // オブジェクトではなく名前（文字列）を値にする
      opt.textContent = cat.name;
      select.appendChild(opt);
    });
    select.value = current; // 選択状態を復元
  });
}

// カテゴリページの一覧を描画する
function renderCategoryList() {
  const categories = loadCategories();
  categoryList.innerHTML = "";

  categories.forEach((cat) => {
    const li = document.createElement("li");
    li.classList.add("category-item");
    // 左端のボーダーをカテゴリの色にする
    li.style.borderLeftColor = cat.color;

    // アイコン列
    const iconEl = document.createElement("span");
    iconEl.classList.add("category-item-icon");
    iconEl.innerHTML = `<i class="ti ${cat.icon}" style="color:${cat.color};"></i>`;

    // カラー列（丸いドット）
    const colorEl = document.createElement("span");
    colorEl.classList.add("category-item-color");
    colorEl.style.background = cat.color;

    // カテゴリ名列
    const nameEl = document.createElement("span");
    nameEl.classList.add("category-item-name");
    nameEl.textContent = cat.name;

    // 編集ボタン列
    const editBtn = document.createElement("button");
    editBtn.classList.add("category-edit-btn");
    editBtn.innerHTML = '<i class="ti ti-pencil"></i>';
    editBtn.addEventListener("click", () => {
      // モーダルに現在のカテゴリ情報をセットする
      document.getElementById("modal-category-input").value = cat.name;

      // アイコン選択の見た目を更新する
      document
        .querySelectorAll("#modal-icon-picker .icon-option")
        .forEach((e) => {
          e.classList.toggle("selected", e.dataset.icon === cat.icon);
        });
      // カラー選択の見た目を更新する
      document
        .querySelectorAll("#modal-color-picker .color-option")
        .forEach((e) => {
          e.classList.toggle("selected", e.dataset.color === cat.color);
        });

      // 編集中のカテゴリ名をモーダルに記憶させる
      document.getElementById("category-edit-modal").dataset.editName =
        cat.name;

      // 編集中のカテゴリ名をモーダルに記憶させる
      document.getElementById("category-edit-modal").dataset.editName =
        cat.name;

      // モーダルの選択状態を現在のカテゴリに合わせる
      modalSelectedIcon = cat.icon;
      modalSelectedColor = cat.color;

      // モーダルを表示する
      document.getElementById("category-edit-modal").classList.remove("hidden");
    });

    // 削除ボタン列
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("category-delete-btn");
    deleteBtn.innerHTML = '<i class="ti ti-trash"></i>';
    deleteBtn.addEventListener("click", () => {
      if (!confirm(`「${cat.name}」を削除しますか？`)) return;
      const updated = loadCategories().filter((c) => c.name !== cat.name);
      saveCategories(updated);
      renderCategoryList();
      renderCategoryOptions();
    });

    li.appendChild(iconEl);
    li.appendChild(colorEl);
    li.appendChild(nameEl);
    li.appendChild(editBtn);

    li.appendChild(deleteBtn);
    categoryList.appendChild(li);
  });
}

// アイコンをクリックしたら選択状態を切り替える
document.querySelectorAll(".icon-option").forEach((el) => {
  el.addEventListener("click", () => {
    document
      .querySelectorAll(".icon-option")
      .forEach((e) => e.classList.remove("selected"));
    el.classList.add("selected");
    selectedIcon = el.dataset.icon;
  });
});

// カラーをクリックしたら選択状態を切り替える
document.querySelectorAll(".color-option").forEach((el) => {
  el.addEventListener("click", () => {
    document
      .querySelectorAll(".color-option")
      .forEach((e) => e.classList.remove("selected"));
    el.classList.add("selected");
    selectedColor = el.dataset.color;
  });
});
// カテゴリ編集モーダルのアイコン・カラー選択
let modalSelectedIcon = "ti-tag";
let modalSelectedColor = "#4a90e2";

document.querySelectorAll("#modal-icon-picker .icon-option").forEach((el) => {
  el.addEventListener("click", () => {
    document
      .querySelectorAll("#modal-icon-picker .icon-option")
      .forEach((e) => e.classList.remove("selected"));
    el.classList.add("selected");
    modalSelectedIcon = el.dataset.icon;
  });
});

document.querySelectorAll("#modal-color-picker .color-option").forEach((el) => {
  el.addEventListener("click", () => {
    document
      .querySelectorAll("#modal-color-picker .color-option")
      .forEach((e) => e.classList.remove("selected"));
    el.classList.add("selected");
    modalSelectedColor = el.dataset.color;
  });
});

// キャンセルボタン
document
  .getElementById("category-modal-cancel-btn")
  .addEventListener("click", () => {
    document.getElementById("category-edit-modal").classList.add("hidden");
  });

// 保存ボタン
document
  .getElementById("category-modal-save-btn")
  .addEventListener("click", () => {
    const modal = document.getElementById("category-edit-modal");
    const editName = modal.dataset.editName;
    const newName = document
      .getElementById("modal-category-input")
      .value.trim();
    if (newName === "") return;

    const categories = loadCategories();
    const idx = categories.findIndex((c) => c.name === editName);
    if (idx !== -1) {
      categories[idx] = {
        name: newName,
        icon: modalSelectedIcon,
        color: modalSelectedColor,
      };
    }
    saveCategories(categories);
    renderCategoryList();
    renderCategoryOptions();
    modal.classList.add("hidden");
  });
// カテゴリ追加ボタンの処理
categoryAddBtn.addEventListener("click", () => {
  const name = categoryInput.value.trim();
  if (name === "") return;

  const categories = loadCategories();
  const editName = categoryAddBtn.dataset.editName;

  if (editName) {
    // 更新モード：既存のカテゴリを上書きする
    const idx = categories.findIndex((c) => c.name === editName);
    if (idx !== -1) {
      categories[idx] = { name, icon: selectedIcon, color: selectedColor };
    }
    saveCategories(categories);
    categoryAddBtn.textContent = "＋ 追加";
    delete categoryAddBtn.dataset.editName;
  } else {
    // 追加モード：同じ名前のカテゴリが既にある場合は追加しない
    if (categories.find((c) => c.name === name)) {
      alert("同じ名前のカテゴリが既にあります");
      return;
    }
    categories.push({ name, icon: selectedIcon, color: selectedColor });
    saveCategories(categories);
  }

  // フォームをリセットする
  categoryInput.value = "";
  selectedIcon = "ti-tag";
  selectedColor = "#4a90e2";
  document
    .querySelectorAll(".icon-option")
    .forEach((e) => e.classList.remove("selected"));
  document
    .querySelector('.icon-option[data-icon="ti-tag"]')
    .classList.add("selected");
  document
    .querySelectorAll(".color-option")
    .forEach((e) => e.classList.remove("selected"));
  document
    .querySelector('.color-option[data-color="#4a90e2"]')
    .classList.add("selected");

  renderCategoryList();
  renderCategoryOptions();
});

/* =====================
   LocalStorage への保存
   ===================== */

function saveTasks() {
  const tasks = [];

  // active-listはdivになったのでquerySelectorAllでliを取得する
  Array.from(activeList.querySelectorAll("li")).forEach((li) => {
    tasks.push({
      // querySelector: その li の中だけから要素を探す
      // ?: オプショナルチェーン。要素が null でもエラーにならず undefined を返す
      // ?? "": 左が null/undefined のとき右の値（空文字）を使う
      text: li.querySelector(".task-text")?.textContent ?? "",
      start: li.querySelector(".task-date")?.dataset.date ?? "",
      end: li.querySelector(".task-end")?.dataset.end ?? "",
      memo: li.querySelector(".task-memo")?.textContent ?? "",
      priority: li.dataset.priority ?? "",
      done: false,
      date: li.dataset.taskDate ?? "",
      recurring: li.dataset.recurring ?? "",
      recurringId: li.dataset.recurringId ?? "",
      category: li.dataset.category ?? "",
    });
  });

  Array.from(doneList.children).forEach((li) => {
    tasks.push({
      text: li.querySelector(".task-text")?.textContent ?? "",
      start: li.querySelector(".task-date")?.dataset.date ?? "",
      end: li.querySelector(".task-end")?.dataset.end ?? "",
      memo: li.querySelector(".task-memo")?.textContent ?? "",
      priority: li.dataset.priority ?? "",
      done: true,
      date: li.dataset.taskDate ?? "",
      recurring: li.dataset.recurring ?? "",
      recurringId: li.dataset.recurringId ?? "",
      category: li.dataset.category ?? "",
    });
  });

  //期限切れリストを追加
  Array.from(overdueList.children).forEach((li) => {
    tasks.push({
      text: li.querySelector(".task-text")?.textContent ?? "",
      start: li.querySelector(".task-date")?.dataset.date ?? "",
      end: li.querySelector(".task-end")?.dataset.end ?? "",
      memo: li.querySelector(".task-memo")?.textContent ?? "",
      priority: li.dataset.priority ?? "",
      done: false,
      date: li.dataset.taskDate ?? "",
      recurring: li.dataset.recurring ?? "",
      recurringId: li.dataset.recurringId ?? "",
      category: li.dataset.category ?? "",
    });
  });

  // LocalStorageは文字列しか保存できないので JSON.stringify で変換する
  // 例: [{text:"買い物", done:false}] → '[{"text":"買い物","done":false}]'
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* =====================
   LocalStorage からの読み込み
   ===================== */

function loadTasks() {
  const saved = localStorage.getItem("tasks");

  // 保存データがなければ（初回アクセスなど）何もせず終了
  if (!saved) return;

  // JSON.parse: JSON.stringifyの逆。文字列をもとの配列・オブジェクトに戻す
  JSON.parse(saved).forEach((task) => {
    addTask(
      task.text,
      task.done,
      task.start ?? "",
      task.end ?? "",
      task.memo ?? "",
      task.priority ?? "",
      task.date ?? toDateString(new Date()),
      task.recurring ?? "",
      task.recurringId ?? "",
      task.category ?? "",
    );
  });
}

// start を追加。end < start なら終了は翌日と判断する
function isOverdue(end, date = toDateString(new Date()), start = "") {
  const today = toDateString(new Date());

  // 終了時間が開始時間より早い（日をまたぐ）場合は終了日を翌日にする
  const isOvernight = start && end && end < start;
  const d = toDateObject(date);
  if (isOvernight) d.setDate(d.getDate() + 1);
  const endDate = toDateString(d);

  if (endDate < today) return true;
  if (endDate > today) return false;
  if (!end) return false;

  const now = new Date();
  const [h, m] = end.split(":").map(Number);
  const endTime = new Date();
  // 日またぎのとき endTime も翌日として扱う
  if (isOvernight) endTime.setDate(endTime.getDate() + 1);
  endTime.setHours(h, m, 0, 0);
  return endTime < now;
}

// 時間を縦並びで表示するヘルパー関数
function setTimeDisplay(spanEl, startVal, endVal) {
  spanEl.innerHTML = "";

  if (startVal && endVal) {
    // 両方ある場合は | で区切る
    const s = document.createElement("span");
    s.textContent = startVal;
    spanEl.appendChild(s);

    const sep = document.createElement("span");
    sep.classList.add("time-separator");
    sep.textContent = "|";
    spanEl.appendChild(sep);

    const e = document.createElement("span");
    e.textContent = endVal;
    spanEl.appendChild(e);
  } else if (startVal) {
    // 開始のみの場合は「09:00〜」と表示する
    const s = document.createElement("span");
    s.textContent = `${startVal}〜`;
    spanEl.appendChild(s);
  } else if (endVal) {
    // 終了のみの場合は「〜18:00」と表示する
    const e = document.createElement("span");
    e.textContent = `〜${endVal}`;
    spanEl.appendChild(e);
  }
}

/* =====================
   タスクの追加
   ===================== */

// 引数にデフォルト値を設定。省略して呼び出したときに自動で入る
// 例: addTask("買い物") → done=false, start="", end="" が自動で入る
function addTask(
  text,
  done = false,
  start = "",
  end = "",
  memo = "",
  priority = "",
  date = toDateString(new Date()),
  recurring = "",
  recurringId = "",
  category = "",
) {
  // createElement: JSでHTML要素を新しく作る（この時点ではまだ画面に出ない）
  const li = document.createElement("li");

  li.dataset.priority = priority;
  li.dataset.taskDate = date;
  li.dataset.recurring = recurring;
  li.dataset.recurringId = recurringId;
  // カテゴリをdatasetに保存する（フィルタリングや保存復元に使う）
  li.dataset.category = category;

  // タスク名（カードの主役）
  const span = document.createElement("span");
  span.classList.add("task-text");
  span.textContent = text;

  const memoSpan = document.createElement("span");
  memoSpan.classList.add("task-memo");
  memoSpan.textContent = memo;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = done;

  // カード左側：タスク名と時間を縦に並べるエリア
  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  // タスク名とメモをまとめる入れ物
  const taskBody = document.createElement("div");
  taskBody.classList.add("task-body");
  taskBody.appendChild(span);
  taskBody.appendChild(memoSpan);

  cardBody.appendChild(taskBody);

  // 時間の表示テキスト（例: "09:00 → 10:00"）
  const timeSpan = document.createElement("span");
  timeSpan.classList.add("task-time");

  // データ保持用のspan（saveTasks()がdatasetから値を読み出す）
  const startSpan = document.createElement("span");
  startSpan.classList.add("task-date");
  startSpan.dataset.date = start;

  const endSpan = document.createElement("span");
  endSpan.classList.add("task-end");
  endSpan.dataset.end = end;

  if (start || end) {
    setTimeDisplay(timeSpan, start, end);
    cardBody.insertBefore(timeSpan, taskBody);
  }

  // データ保持用のspanはCSSで非表示にしてよいが、saveTasks()に必要なので追加しておく
  cardBody.appendChild(startSpan);
  cardBody.appendChild(endSpan);

  // 優先度アイコン列
  const priorityCol = document.createElement("div");
  priorityCol.classList.add("priority-col");

  // カテゴリがあればアイコンと色をカードに反映する
  if (category) {
    const categories = loadCategories();
    const catData = categories.find((c) => c.name === category);
    if (catData) {
      // 左端ボーダーをカテゴリの色にする
      li.style.borderLeft = `4px solid ${catData.color}`;

      // カテゴリアイコンを表示する
      const iconEl = document.createElement("i");
      iconEl.className = `ti ${catData.icon}`;
      iconEl.setAttribute("aria-hidden", "true");
      iconEl.style.color = catData.color;
      iconEl.style.fontSize = "18px";
      priorityCol.appendChild(iconEl);
    }
  }

  cardBody.insertBefore(priorityCol, cardBody.firstChild);

  // カード右側：チェックボックスと削除ボタンのエリア
  const cardActions = document.createElement("div");
  cardActions.classList.add("card-actions");
  cardActions.appendChild(checkbox);

  // appendChild: 要素を別の要素の中に追加する
  li.appendChild(cardBody);

  // ドラッグ可能にする
  li.draggable = true;

  // ドラッグ開始したとき
  li.addEventListener("dragstart", () => {
    li.classList.add("dragging");
  });

  // ドラッグ終了したとき
  li.addEventListener("dragend", () => {
    li.classList.remove("dragging");
    saveTasks();
  });

  // カードをクリックしたらモーダルを開く
  li.addEventListener("click", (e) => {
    // チェックボックスと削除ボタンのクリックは除外
    if (e.target === checkbox) return; //チェックボックスや削除ボタンをクリックしたときはモーダルが開かないように除外
    openModal({
      span,
      startSpan,
      endSpan,
      timeSpan,
      memoSpan,
      cardBody,
      taskBody,
    });
  });

  li.appendChild(cardActions);

  // 完了済みタスクは最初から打ち消し線をつけて完了リストへ
  if (done) {
    li.classList.add("done");
    doneList.appendChild(li);
  } else if (isOverdue(end, date, start)) {
    li.classList.add("overdue");
    overdueList.appendChild(li);
  } else {
    activeList.appendChild(li);
  }
  // チェック状態が変わったあとに優先度順で並び直す
  renderActiveSection();
  updateCounts();

  // チェックボックスの状態が変わったときの処理
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      launchConfetti(); // タスク完了時に紙吹雪を発射
      li.classList.add("done");
      // すでに画面にある li を別のリストに appendChild すると「移動」になる（コピーではない）
      doneList.appendChild(li);
    } else {
      li.classList.remove("done");
      if (
        isOverdue(
          endSpan.dataset.end,
          li.dataset.taskDate,
          startSpan.dataset.date,
        )
      ) {
        li.classList.add("overdue");
        overdueList.appendChild(li);
      } else {
        activeList.appendChild(li);
      }
    }
    saveTasks();
    updateCounts();
    // チェック状態が変わったあとに優先度順で並び直す
    renderActiveSection();
  });
}

/* =====================
   フォームの送信
   ===================== */

form.addEventListener("submit", (e) => {
  // preventDefault: フォームのデフォルト動作（ページリロード）をキャンセル
  // これがないとタスク追加のたびにページが再読み込みされてしまう
  e.preventDefault();

  // trim(): 文字列の前後のスペースを除去する
  const text = input.value.trim();

  // 空文字のときは何もせず終了
  if (text === "") return;

  const recurringVal = recurringInput.value;
  const dateVal = dateInput.value || toDateString(new Date());
  const startVal = startInput.value;
  const endVal = endInput.value;
  const priorityVal = priorityInput.value;
  const categoryVal = categorySelect.value;
  const memoVal = memoInput.value.trim();

  addTask(
    text,
    false,
    startVal,
    endVal,
    "",
    priorityVal,
    dateVal,
    recurringVal,
    memoVal,
    categoryVal,
  );
  saveTasks();

  input.value = "";
  memoInput.value = "";
  startInput.value = "";
  endInput.value = "";
  priorityInput.value = "";
  dateInput.value = currentDate;
  recurringInput.value = "";
  addSheetOverlay.classList.add("hidden");
  categorySelect.value = "";

  if (recurringVal) {
    generateRecurringTasks(
      text,
      startVal,
      endVal,
      "",
      priorityVal,
      dateVal,
      recurringVal,
    );
  }
});

/* =====================
   時刻ピッカーの表示
   ===================== */

// クリックしたとき明示的に時刻ピッカーを開く（ブラウザによってはクリックだけでは開かないため）
document.getElementById("start-input").addEventListener("click", function () {
  this.showPicker();
});
document.getElementById("end-input").addEventListener("click", function () {
  this.showPicker();
});

document
  .getElementById("modal-start-input")
  .addEventListener("click", function () {
    this.showPicker();
  });
document
  .getElementById("modal-end-input")
  .addEventListener("click", function () {
    this.showPicker();
  });

/* =====================
   モーダル関連
   ===================== */

const editModal = document.getElementById("edit-modal");
const modalTaskInput = document.getElementById("modal-task-input");
const modalStartInput = document.getElementById("modal-start-input");
const modalEndInput = document.getElementById("modal-end-input");
const modalCancelBtn = document.getElementById("modal-cancel-btn");
const modalSaveBtn = document.getElementById("modal-save-btn");
const modalDeleteBtn = document.getElementById("modal-delete-btn");
const modalMemoInput = document.getElementById("modal-memo-input");
const modalPriority = document.getElementById("modal-priority");

// 現在編集中のカード情報を一時保存する変数
let editingCard = null;

// モーダルを開く関数
function openModal(card) {
  //カードの情報（span・startSpan・endSpan・timeSpan）を受け取ってモーダルに流し込む。
  editingCard = card;
  modalTaskInput.value = card.span.textContent;
  modalStartInput.value = card.startSpan.dataset.date;
  modalEndInput.value = card.endSpan.dataset.end;
  modalMemoInput.value = card.memoSpan.textContent;

  const li = card.span.closest("li");
  modalPriority.value = li.dataset.priority ?? "";
  // モーダルを開いたときにそのタスクのカテゴリを選択状態にする
  modalCategory.value = li.dataset.category ?? "";

  const recurringId = li.dataset.recurringId ?? "";
  if (recurringId) {
    modalRecurringField.classList.remove("hidden");
  } else {
    modalRecurringField.classList.add("hidden");
  }
  editModal.classList.remove("hidden");
}

// モーダルを閉じる関数
function closeModal() {
  editModal.classList.add("hidden");
  editingCard = null;
}

// キャンセルボタン
modalCancelBtn.addEventListener("click", closeModal);

// 背景クリックで閉じる
editModal.addEventListener("click", (e) => {
  if (e.target === editModal) closeModal(); //モーダル本体のクリックでは閉じないようにする。
});

// 保存ボタン
modalSaveBtn.addEventListener("click", () => {
  const newText = modalTaskInput.value.trim();
  if (newText === "") return;

  editingCard.span.textContent = newText;
  editingCard.startSpan.dataset.date = modalStartInput.value;
  editingCard.endSpan.dataset.end = modalEndInput.value;
  editingCard.memoSpan.textContent = modalMemoInput.value;

  // 時間表示を更新
  if (modalStartInput.value || modalEndInput.value) {
    setTimeDisplay(
      editingCard.timeSpan,
      modalStartInput.value,
      modalEndInput.value,
    );
    // timeSpanがDOMにない場合（元々時間がなかったタスク）は追加する
    if (!editingCard.timeSpan.parentElement) {
      editingCard.cardBody.insertBefore(
        editingCard.timeSpan,
        editingCard.taskBody,
      );
    }
  } else {
    // 時間を両方消したらtimeSpanをDOMから外す
    if (editingCard.timeSpan.parentElement) {
      editingCard.timeSpan.remove();
    }
  }

  // 優先度の更新
  const li = editingCard.span.closest("li");
  li.dataset.priority = modalPriority.value;

  // priority-colの中身をカテゴリアイコンで更新する
  const priorityCol = li.querySelector(".priority-col");
  priorityCol.innerHTML = "";
  li.style.borderLeft = "";
  const catData = loadCategories().find((c) => c.name === modalCategory.value);
  if (catData) {
    li.style.borderLeft = `4px solid ${catData.color}`;
    priorityCol.innerHTML = `
    <i class="ti ${catData.icon}" style="color:${catData.color}; font-size:18px;" aria-hidden="true"></i>
  `;
  }
  // 保存時にカテゴリをdatasetに反映する
  li.dataset.category = modalCategory.value;
  // 終了時間の変更に応じてリストを移動
  if (!li.classList.contains("done")) {
    li.classList.remove("overdue");
    if (
      isOverdue(modalEndInput.value, li.dataset.taskDate, modalStartInput.value)
    ) {
      li.classList.add("overdue");
      overdueList.appendChild(li);
    } else {
      activeList.appendChild(li);
    }
  }

  updateCounts();
  saveTasks();

  // 保存後に優先度順で並び直す
  renderActiveSection();
  closeModal();
});

// モーダルの削除ボタン
modalDeleteBtn.addEventListener("click", () => {
  // editingCard.span が属する li を探して削除する
  editingCard.span.closest("li").remove();
  saveTasks();
  updateCounts();
  closeModal();
});

modalRecurringDeleteBtn.addEventListener("click", () => {
  const li = editingCard.span.closest("li");
  const recurringId = li.dataset.recurringId;
  if (!recurringId) return;

  // DOMから同じrecurringIdを持つタスクを全て削除
  [activeList, doneList, overdueList].forEach((list) => {
    Array.from(list.children).forEach((item) => {
      if (item.dataset.recurringId === recurringId) {
        item.remove();
      }
    });
  });

  // LocalStorageからも削除
  const saved = JSON.parse(localStorage.getItem("tasks") || "[]");
  const filtered = saved.filter((t) => t.recurringId !== recurringId);
  localStorage.setItem("tasks", JSON.stringify(filtered));

  saveTasks();
  updateCounts();
  closeModal();
});

// ドラッグ中に他のカードの上を通過したとき
function getDragAfterElement(list, y) {
  // ドラッグ中のカード以外の要素を取得
  const elements = [...list.querySelectorAll("li:not(.dragging)")];

  return elements.reduce(
    (closest, el) => {
      const box = el.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: el };
      } else {
        return closest;
      }
    },
    { offset: -Infinity },
  ).element;
}

// リストにdragoverイベントを設定
[activeList, doneList].forEach((list) => {
  list.addEventListener("dragover", (e) => {
    e.preventDefault(); // デフォルト動作をキャンセルしないとdropが発火しない
    const dragging = document.querySelector(".dragging");
    const after = getDragAfterElement(list, e.clientY);
    if (after) {
      list.insertBefore(dragging, after);
    } else {
      list.appendChild(dragging);
    }
  });
});

// オプション欄の開閉
optionsToggle.addEventListener("click", () => {
  const isHidden = optionsArea.classList.contains("hidden");
  optionsArea.classList.toggle("hidden");
  toggleArrow.textContent = isHidden ? "▲" : "▼";
});

/* =====================
   検索・フィルター
   ===================== */

searchInput.addEventListener("input", () => {
  renderSearchResults();
});

/* =====================
   日付ナビゲーション
   ===================== */

prevDateBtn.addEventListener("click", () => {
  saveTasks();
  const d = toDateObject(currentDate);
  d.setDate(d.getDate() - 1);
  currentDate = toDateString(d);
  dateInput.value = currentDate;
  activeList.innerHTML = "";
  doneList.innerHTML = "";
  overdueList.innerHTML = "";
  loadTasks();
  applyFilters();
});

nextDateBtn.addEventListener("click", () => {
  saveTasks();
  const d = toDateObject(currentDate);
  d.setDate(d.getDate() + 1);
  currentDate = toDateString(d);
  dateInput.value = currentDate;
  activeList.innerHTML = "";
  doneList.innerHTML = "";
  overdueList.innerHTML = "";
  loadTasks();
  applyFilters();
});

/* =====================
   タスク追加シート
   ===================== */

fabBtn.addEventListener("click", () => {
  addSheetOverlay.classList.remove("hidden");
});

// ✕ボタンをクリックしたらシートを閉じる
document.getElementById("add-sheet-close").addEventListener("click", () => {
  addSheetOverlay.classList.add("hidden");
});

// 開始・終了時間のクリアボタン（追加フォーム）
document.getElementById("start-clear").addEventListener("click", () => {
  startInput.value = "";
});

document.getElementById("end-clear").addEventListener("click", () => {
  endInput.value = "";
});

// 開始・終了時間のクリアボタン（編集モーダル）
document.getElementById("modal-start-clear").addEventListener("click", () => {
  modalStartInput.value = "";
});

document.getElementById("modal-end-clear").addEventListener("click", () => {
  modalEndInput.value = "";
});

addSheetOverlay.addEventListener("click", (e) => {
  if (e.target === addSheetOverlay) {
    addSheetOverlay.classList.add("hidden");
  }
});

/* =====================
   サイドメニュー
   ===================== */

const navItems = document.querySelectorAll(".nav-item");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((n) => n.classList.remove("active"));
    item.classList.add("active");

    const page = item.dataset.page;

    const homePage = document.getElementById("home-page");
    const calendarPage = document.getElementById("calendar-page");
    const searchPage = document.getElementById("search-page");

    homePage.classList.add("hidden");
    calendarPage.classList.add("hidden");
    searchPage.classList.add("hidden");
    document.getElementById("category-page").classList.add("hidden");

    if (page === "home") {
      homePage.classList.remove("hidden");
    } else if (page === "calendar") {
      calendarPage.classList.remove("hidden");
      renderCalendar();
    } else if (page === "search") {
      searchPage.classList.remove("hidden");
      renderCategoryFilters();
      searchInput.focus();
    } else if (page === "category") {
      // カテゴリページを表示するときに一覧を最新状態で描画する
      document.getElementById("category-page").classList.remove("hidden");
      renderCategoryList();
    }
  });
});
/* =====================
   カレンダー
   ===================== */

let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth();

function renderCalendar() {
  const grid = document.getElementById("cal-grid");
  const label = document.getElementById("cal-month-label");
  grid.innerHTML = "";
  label.textContent = `${calYear}年${calMonth + 1}月`;

  const today = toDateString(new Date());
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

  // 月の最初の日の曜日（0=日）と最後の日
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const lastDate = new Date(calYear, calMonth + 1, 0).getDate();
  const prevLastDate = new Date(calYear, calMonth, 0).getDate();

  // 先月の埋め
  for (let i = firstDay - 1; i >= 0; i--) {
    const cell = createCalCell(
      prevLastDate - i,
      calYear,
      calMonth - 1,
      true,
      today,
      tasks,
    );
    grid.appendChild(cell);
  }

  // 今月
  for (let d = 1; d <= lastDate; d++) {
    const cell = createCalCell(d, calYear, calMonth, false, today, tasks);
    grid.appendChild(cell);
  }

  // 来月の埋め（6行になるよう調整）
  const total = firstDay + lastDate;
  const remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let d = 1; d <= remaining; d++) {
    const cell = createCalCell(d, calYear, calMonth + 1, true, today, tasks);
    grid.appendChild(cell);
  }

  // カテゴリ凡例を描画する
  const legend = document.getElementById("cal-legend");
  legend.innerHTML = "";
  const categories = loadCategories();
  categories.forEach((cat) => {
    const item = document.createElement("span");
    item.innerHTML = `<span class="cal-dot" style="background:${cat.color};"></span>${cat.name}`;
    legend.appendChild(item);
  });
}

function createCalCell(day, year, month, isOtherMonth, today, tasks) {
  const d = new Date(year, month, day);
  const dateStr = toDateString(d);
  const dow = d.getDay();

  const cell = document.createElement("div");
  cell.classList.add("cal-cell");

  const num = document.createElement("div");
  num.classList.add("cal-day-num");
  num.textContent = day;

  if (isOtherMonth) num.classList.add("is-other-month");
  else if (dow === 0) num.classList.add("is-sun");
  else if (dow === 6) num.classList.add("is-sat");

  if (dateStr === today) num.classList.add("is-today");
  if (dateStr === currentDate) num.classList.add("is-selected");

  cell.appendChild(num);

  const dayTasks = tasks.filter((t) => t.date === dateStr);
  if (dayTasks.length > 0) {
    const dots = document.createElement("div");
    dots.classList.add("cal-dots");

    const categories = loadCategories();

    // その日にあるカテゴリの種類を重複なしで取得する
    const dayCategories = [
      ...new Set(dayTasks.map((t) => t.category).filter(Boolean)),
    ];

    dayCategories.forEach((catName) => {
      const catData = categories.find((c) => c.name === catName);
      if (!catData) return;

      // カテゴリの色でドットを作る
      const dot = document.createElement("div");
      dot.classList.add("cal-dot");
      dot.style.background = catData.color;
      dots.appendChild(dot);
    });

    if (dots.children.length > 0) cell.appendChild(dots);
    // タスク名を最大2件表示する
    const taskList = document.createElement("div");
    taskList.classList.add("cal-task-list");

    dayTasks.slice(0, 2).forEach((t) => {
      const item = document.createElement("div");
      item.classList.add("cal-task-item");

      // カテゴリの色があればテキストに反映する
      const catData = categories.find((c) => c.name === t.category);
      if (catData) {
        item.style.background = catData.color + "22"; // 色を薄くする（透明度22）
        item.style.color = catData.color;
      }

      item.textContent = t.text;
      taskList.appendChild(item);
    });

    // 3件以上あれば「他n件」を表示する
    if (dayTasks.length > 2) {
      const more = document.createElement("div");
      more.classList.add("cal-task-item");
      more.style.color = "#aaa";
      more.style.background = "none";
      more.textContent = `他${dayTasks.length - 2}件`;
      taskList.appendChild(more);
    }

    cell.appendChild(taskList);
  }

  // 日付クリックでホームに移動
  cell.addEventListener("click", () => {
    saveTasks();
    currentDate = dateStr;
    dateInput.value = currentDate;
    activeList.innerHTML = "";
    doneList.innerHTML = "";
    overdueList.innerHTML = "";
    loadTasks();
    applyFilters();

    // ホームページに切り替え
    document.getElementById("calendar-page").classList.add("hidden");
    document.getElementById("home-page").classList.remove("hidden");
    navItems.forEach((n) => n.classList.remove("active"));
    document.querySelector("[data-page='home']").classList.add("active");
  });

  return cell;
}

document.getElementById("cal-prev").addEventListener("click", () => {
  calMonth--;
  if (calMonth < 0) {
    calMonth = 11;
    calYear--;
  }
  renderCalendar();
});

document.getElementById("cal-next").addEventListener("click", () => {
  calMonth++;
  if (calMonth > 11) {
    calMonth = 0;
    calYear++;
  }
  renderCalendar();
});

/* =====================
   検索ページ
 ===================== */
// カテゴリフィルターボタンを描画する関数
function renderCategoryFilters() {
  const area = document.getElementById("category-filter-area");
  area.innerHTML = "";

  const categories = loadCategories();

  // カテゴリが1つもなければフィルターエリアを非表示にする
  if (categories.length === 0) {
    area.classList.add("hidden");
    return;
  }
  area.classList.remove("hidden");

  // 「すべて」ボタンを先頭に追加
  const allBtn = document.createElement("button");
  allBtn.classList.add("category-filter-btn", "active");
  allBtn.dataset.category = "";
  allBtn.textContent = "すべて";
  allBtn.addEventListener("click", () => {
    // すべてのボタンの active を外して自分だけ active にする
    area
      .querySelectorAll(".category-filter-btn")
      .forEach((b) => b.classList.remove("active"));
    allBtn.classList.add("active");
    renderSearchResults();
  });
  area.appendChild(allBtn);

  // カテゴリごとにボタンを生成
  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.classList.add("category-filter-btn");
    btn.dataset.category = cat.name;
    btn.innerHTML = `<i class="ti ${cat.icon}"></i> ${cat.name}`;
    btn.style.borderColor = cat.color;
    btn.style.color = cat.color;

    btn.addEventListener("click", () => {
      // すべてのボタンのインラインスタイルをリセット
      area.querySelectorAll(".category-filter-btn").forEach((b) => {
        b.classList.remove("active");
        b.style.background = "";
        b.style.color = b.dataset.category
          ? (loadCategories().find((c) => c.name === b.dataset.category)
              ?.color ?? "")
          : "";
      });
      btn.classList.add("active");
      btn.style.background = cat.color;
      btn.style.color = "white";
      btn.style.borderColor = cat.color;
      renderSearchResults();
    });

    area.appendChild(btn);
  });
}

function renderSearchResults() {
  const query = searchInput.value.trim().toLowerCase();
  const results = document.getElementById("search-results");
  const empty = document.getElementById("search-empty");
  results.innerHTML = "";

  if (!query) {
    empty.classList.add("hidden");
    return;
  }

  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

  // 選択中のカテゴリフィルターを取得する
  const activeBtn = document.querySelector(".category-filter-btn.active");
  const selectedCategory = activeBtn ? activeBtn.dataset.category : "";

  // クエリに一致するタスクを抽出
  const matched = tasks.filter((t) => {
    const textMatch =
      t.text.toLowerCase().includes(query) ||
      (t.memo ?? "").toLowerCase().includes(query);
    // カテゴリフィルターが選択されている場合はカテゴリも一致する必要がある
    const categoryMatch =
      selectedCategory === "" || t.category === selectedCategory;
    return textMatch && categoryMatch;
  });

  if (matched.length === 0) {
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");

  // 日付ごとにグループ化
  const groups = {};
  matched.forEach((t) => {
    const date = t.date || "日付なし";
    if (!groups[date]) groups[date] = [];
    groups[date].push(t);
  });

  // 日付順に表示
  Object.keys(groups)
    .sort()
    .forEach((date) => {
      const group = document.createElement("div");
      group.classList.add("search-date-group");

      const d = toDateObject(date);
      const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
      const label = document.createElement("div");
      label.classList.add("search-date-label");
      label.textContent = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`;
      group.appendChild(label);

      groups[date].forEach((t) => {
        const li = document.createElement("div");
        li.classList.add("search-result-item");

        // カテゴリの色を左端ボーダーに反映する
        const catData = loadCategories().find((c) => c.name === t.category);
        if (catData) {
          li.style.borderLeft = `4px solid ${catData.color}`;
        }

        li.innerHTML = `
        <div class="card-body">
          <div class="priority-col">
            ${catData ? `<i class="ti ${catData.icon}" style="color:${catData.color};font-size:18px;" aria-hidden="true"></i>` : ""}
          </div>
          <div class="task-body">
            <span class="task-text">${t.text}</span>
            ${t.memo ? `<span class="task-memo">${t.memo}</span>` : ""}
          </div>
        </div>
      `;

        // クリックでその日付のホームに移動
        li.addEventListener("click", () => {
          currentDate = date;
          dateInput.value = currentDate;
          applyFilters();
          document.getElementById("search-page").classList.add("hidden");
          document.getElementById("home-page").classList.remove("hidden");
          navItems.forEach((n) => n.classList.remove("active"));
          document.querySelector("[data-page='home']").classList.add("active");
        });

        group.appendChild(li);
      });

      results.appendChild(group);
    });
}

/* =====================
   通知・トースト
   ===================== */

// 通知済みタスクのIDを記録（同じタスクを何度も通知しないため）
const notifiedTasks = new Set();

// トーストを表示する
function showToast(message, type = "warning") {
  const container = document.getElementById("toast-container");

  const toast = document.createElement("div");
  toast.classList.add("toast", `toast-${type}`);

  toast.innerHTML = `
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="閉じる">✕</button>
  `;

  toast.querySelector(".toast-close").addEventListener("click", () => {
    toast.remove();
  });

  container.appendChild(toast);

  // 5秒後に自動で消える
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

// ブラウザ通知を送る
function sendBrowserNotification(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

// 期限が近いタスクをチェックする（1分ごとに実行）
function checkUpcomingTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const today = toDateString(new Date());
  const now = new Date();

  tasks.forEach((task, index) => {
    if (task.done) return;
    if (task.date !== today) return;
    if (!task.end) return;

    const [h, m] = task.end.split(":").map(Number);
    const endTime = new Date();
    endTime.setHours(h, m, 0, 0);

    const diffMin = Math.floor((endTime - now) / 60000);
    const key = `${index}-${task.end}`;

    // 10分前に通知
    if (diffMin <= 10 && diffMin > 0 && !notifiedTasks.has(`warn-${key}`)) {
      notifiedTasks.add(`warn-${key}`);
      const msg = `「${task.text}」の終了まであと${diffMin}分です`;
      showToast(msg, "warning");
      sendBrowserNotification("もうすぐ期限です", msg);
    }

    // 期限切れになった瞬間に通知
    if (diffMin <= 0 && diffMin > -2 && !notifiedTasks.has(`over-${key}`)) {
      notifiedTasks.add(`over-${key}`);
      const msg = `「${task.text}」の期限が切れました`;
      showToast(msg, "overdue");
      sendBrowserNotification("期限切れ", msg);
    }
  });
}

// ブラウザ通知の許可を求める
if ("Notification" in window) {
  Notification.requestPermission();
}

// 1分ごとにチェック
setInterval(checkUpcomingTasks, 10000);

// ページ読み込み時にも即チェック
checkUpcomingTasks();

/* =====================
   繰り返しタスク生成
   ===================== */
function generateRecurringTasks(
  text,
  start,
  end,
  memo,
  priority,
  date,
  recurring,
) {
  const baseDate = toDateObject(date);
  const count = recurring === "monthly" ? 12 : 30;
  const saved = JSON.parse(localStorage.getItem("tasks") || "[]");
  const recurringId = `rec-${Date.now()}`;

  // 元のタスクにもrecurringIdを付与
  const original = saved[saved.length - 1];
  if (original) original.recurringId = recurringId;

  for (let i = 1; i <= count; i++) {
    const next = new Date(baseDate);
    if (recurring === "daily") next.setDate(next.getDate() + i);
    else if (recurring === "weekly") next.setDate(next.getDate() + i * 7);
    else if (recurring === "monthly") next.setMonth(next.getMonth() + i);

    saved.push({
      text,
      start,
      end,
      memo,
      priority,
      done: false,
      date: toDateString(next),
      recurring: "",
      recurringId,
    });
  }

  localStorage.setItem("tasks", JSON.stringify(saved));
  sessionStorage.setItem("restoreDate", currentDate);
  location.reload();
}

const restoreDate = sessionStorage.getItem("restoreDate");
if (restoreDate) {
  currentDate = restoreDate;
  sessionStorage.removeItem("restoreDate");
}
// ページ読み込み時にカテゴリの選択肢をフォームに反映する
renderCategoryOptions();
dateInput.value = currentDate;
loadTasks();
applyFilters();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}

if (window.navigator.standalone) {
  document.body.classList.add("standalone");
}
