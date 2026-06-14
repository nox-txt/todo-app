const input = document.getElementById("todo-input");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");
const form = document.getElementById("todo-form");

// フォームが送信された時の処理（ボタンクリック or Enterキー）
form.addEventListener("submit", function (e) {
  e.preventDefault();
  // フォームのデフォルト動作（ページリロード）をキャンセル
  const text = input.value.trim();
  // input.valueで入力欄の文字を取得。trim()で前後の空白を除去
  if (text === "") return;
  // 空なら処理を止める

  // liタグを新しく作る
  const li = document.createElement("li");

  // チェックボックスを作る
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  // type="checkbox"でチェックボックスの見た目にする

  // タスクのテキストを作る
  const span = document.createElement("span");
  span.textContent = text;

  // 削除ボタンを作る
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "✕";
  // ボタンの文字を✕にする
  deleteBtn.classList.add("delete-btn");
  // CSSの.delete-btnスタイルを適用する

  // liの中にチェックボックス・テキスト・削除ボタンを入れる
  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(deleteBtn);
  // appendChildで親要素の中に子要素を追加する

  // ulの中にliを追加する→画面にタスクが表示される
  todoList.appendChild(li);

  // 入力欄を空にする（次のタスクを入力しやすくする）
  input.value = "";

  checkbox.addEventListener("change", function () {
    if (checkbox.checked) {
      li.classList.add("done");
      // チェックされたらdoneクラスをつける→打ち消し線が出る
    } else {
      li.classList.remove("done");
      // チェックを外したらdoneクラスを消す
    }
  });

  deleteBtn.addEventListener("click", function () {
    todoList.removeChild(li);
    // ulからliを削除する→画面からタスクが消える
  });
});
