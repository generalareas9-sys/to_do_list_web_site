const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const taskCount = document.getElementById('taskCount');
const filterButtons = document.querySelectorAll('.filter-button');
const clearCompletedButton = document.getElementById('clearCompleted');
const clearAllButton = document.getElementById('clearAll');
const themeToggle = document.getElementById('themeToggle');
const taskTemplate = document.getElementById('taskTemplate');

let tasks = [];
let activeFilter = 'all';
let currentTheme = 'light';

function loadTasks() {
  const stored = window.localStorage.getItem('todoTasks');
  if (stored) {
    tasks = JSON.parse(stored);
  }
}

function saveTasks() {
  window.localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

function updateTaskCount() {
  const total = tasks.length;
  const remaining = tasks.filter(task => !task.completed).length;
  taskCount.textContent = total === 0 ? 'No tasks yet' : `${remaining} task${remaining === 1 ? '' : 's'} left`;
}

function createTaskElement(task) {
  const item = taskTemplate.content.firstElementChild.cloneNode(true);
  const checkbox = item.querySelector('.task-checkbox');
  const textSpan = item.querySelector('.task-text');
  const editButton = item.querySelector('.edit-button');
  const deleteButton = item.querySelector('.delete-button');

  item.dataset.id = task.id;
  textSpan.textContent = task.text;
  checkbox.checked = task.completed;
  if (task.completed) {
    item.classList.add('completed');
  }

  checkbox.addEventListener('change', () => {
    task.completed = checkbox.checked;
    item.classList.toggle('completed', task.completed);
    saveTasks();
    updateTaskCount();
  });

  const editTask = () => {
    const updatedText = prompt('Edit your task', task.text);
    if (updatedText !== null) {
      const trimmed = updatedText.trim();
      if (!trimmed) {
        alert('Task text cannot be empty.');
        return;
      }

      const isDuplicate = tasks.some(current => current.id !== task.id && current.text.toLowerCase() === trimmed.toLowerCase());
      if (isDuplicate) {
        alert('This task already exists.');
        return;
      }

      task.text = trimmed;
      textSpan.textContent = trimmed;
      saveTasks();
    }
  };

  editButton.addEventListener('click', editTask);
  textSpan.addEventListener('dblclick', editTask);

  deleteButton.addEventListener('click', () => {
    tasks = tasks.filter(current => current.id !== task.id);
    renderTasks();
  });

  return item;
}

function applyFilter(task) {
  if (activeFilter === 'active') return !task.completed;
  if (activeFilter === 'completed') return task.completed;
  return true;
}

function renderTasks() {
  taskList.innerHTML = '';
  const visibleTasks = tasks.filter(applyFilter);
  visibleTasks.forEach(task => taskList.appendChild(createTaskElement(task)));
  updateTaskCount();
  saveTasks();

  if (tasks.length === 0) {
    emptyState.textContent = 'No tasks yet. Add one to get started.';
    emptyState.style.display = 'block';
  } else if (visibleTasks.length === 0) {
    emptyState.textContent = 'No tasks match this filter.';
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
  }
}

function setFilter(filter) {
  activeFilter = filter;
  filterButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.filter === filter);
  });
  renderTasks();
}

function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    alert('Please enter a task.');
    return;
  }

  const isDuplicate = tasks.some(task => task.text.toLowerCase() === trimmed.toLowerCase());
  if (isDuplicate) {
    alert('This task already exists.');
    return;
  }

  tasks.unshift({
    id: Date.now().toString(),
    text: trimmed,
    completed: false,
  });
  taskInput.value = '';
  renderTasks();
}

// Theme helpers for light/dark mode.
function loadTheme() {
  const savedTheme = window.localStorage.getItem('todoTheme');
  currentTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = currentTheme;
}

function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = currentTheme;
  window.localStorage.setItem('todoTheme', currentTheme);
}

function clearCompletedTasks() {
  const completedCount = tasks.filter(task => task.completed).length;
  if (!completedCount) {
    alert('There are no completed tasks to clear.');
    return;
  }

  const confirmed = confirm(`Clear ${completedCount} completed task${completedCount === 1 ? '' : 's'}?`);
  if (confirmed) {
    tasks = tasks.filter(task => !task.completed);
    renderTasks();
  }
}

function clearAllTasks() {
  if (!tasks.length) return;
  const confirmed = confirm('Delete all tasks? This cannot be undone.');
  if (confirmed) {
    tasks = [];
    renderTasks();
  }
}

taskForm.addEventListener('submit', event => {
  event.preventDefault();
  addTask(taskInput.value);
});

filterButtons.forEach(button => {
  button.addEventListener('click', () => setFilter(button.dataset.filter));
});

clearCompletedButton.addEventListener('click', clearCompletedTasks);
clearAllButton.addEventListener('click', clearAllTasks);
themeToggle.addEventListener('click', toggleTheme);

loadTheme();
loadTasks();
renderTasks();
