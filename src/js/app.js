import { createTask, addCard, showAddCardModal, hideAddCardModal, showEditCardModal, hideEditCardModal, saveCardEdit, deleteCard } from './card.js';
import { onDragStart, onDragOver, onDrop, onDragLeave } from './dnd.js';

// Глобальные переменные
let currentColumn = null;
let currentCard = null;

export function initApp() {
    // Инициализация глобальных функций
    window.onDragStart = onDragStart;
    window.onDragOver = onDragOver;
    window.onDrop = onDrop;
    window.onDragLeave = onDragLeave;
    window.showAddCardModal = showAddCardModal;
    window.hideAddCardModal = hideAddCardModal;
    window.addCard = addCard;
    window.showEditCardModal = showEditCardModal;
    window.hideEditCardModal = hideEditCardModal;
    window.saveCardEdit = saveCardEdit;
    window.deleteCard = deleteCard;

    // Добавляем обработчики событий для карточек
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('task') || e.target.closest('.task')) {
            const task = e.target.classList.contains('task') ? e.target : e.target.closest('.task');
            const text = task.querySelector('.task-text').textContent;
            showEditCardModal(task, text);
        }
    });

    // Добавляем обработчики dragleave для всех контейнеров
    const tasksContainers = document.querySelectorAll('.tasks');
    tasksContainers.forEach(container => {
        container.addEventListener('dragleave', onDragLeave);
    });

    // Добавляем несколько начальных задач
    addInitialTasks();
}

function addInitialTasks() {
    const initialTasks = [
        { text: 'Изучить JavaScript', column: 'todo' },
        { text: 'Сделать ДЗ по Webpack', column: 'todo' },
        { text: 'Настроить GitHub Actions', column: 'todo' },
        { text: 'Разработать интерфейс', column: 'in-progress' },
        { text: 'Протестировать функционал', column: 'in-progress' },
        { text: 'Завершить проект', column: 'done' }
    ];

    initialTasks.forEach(task => {
        const taskElement = createTask(task.text);
        document.querySelector(`#${task.column} .tasks`).appendChild(taskElement);
    });
}

export function updateTaskCounts() {
    const columns = ['todo', 'in-progress', 'done'];
    columns.forEach(columnId => {
        const taskCount = document.querySelector(`#${columnId} .tasks`).children.length;
        document.querySelector(`#${columnId} .task-count`).textContent = `${taskCount} tasks`;
    });
}

export function setCurrentColumn(columnId) {
    currentColumn = columnId;
}

export function getCurrentColumn() {
    return currentColumn;
}

export function setCurrentCard(card) {
    currentCard = card;
}

export function getCurrentCard() {
    return currentCard;
}