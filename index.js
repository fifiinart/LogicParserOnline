const logicForm = getElementById('logicForm');
const logicText = getElementById('logic-text-input');
const logicResult = getElementById('logic-result')
import LogicTree from "./tree.js";
logicForm.addEventListener('submit', e => {
  e.preventDefault();
  const value = logicText.value;
  try {
    tree = new LogicTree(value);
    logicResult.innerHTML = `<code>${tree.makeTable().join("\n")}</code>`;
  } catch (e) {
    logicResult.innerHTML = `<code>Invalid expression. Try again.</code>`;
    console.log(e);
  }
})