import { createTask, addCard, showAddCardModal, hideAddCardModal, showEditCardModal, hideEditCardModal, saveCardEdit, deleteCard } from './card.js';
import { onDragStart, onDragOver, onDrop, onDragLeave, onDragEnd } from './dnd.js';

// Глобальные переменные
let currentColumn = null;
let currentCard = null;

export function initApp() {
    // Инициализация глобальных функций Drag&Drop
    window.onDragStart = onDragStart;
    window.onDragOver = onDragOver;
    window.onDrop = onDrop;
    window.onDragLeave = onDragLeave;
    window.onDragEnd = onDragEnd;
    
    // Инициализация глобальных функций для карточек
    window.showAddCardModal = showAddCardModal;
    window.hideAddCardModal = hideAddCardModal;
    window.addCard = addCard;
    window.showEditCardModal = showEditCardModal;
    window.hideEditCardModal = hideEditCardModal;
    window.saveCardEdit = saveCardEdit;
    window.deleteCard = deleteCard;
    window.handleDeleteCard = handleDeleteCard;

    // Добавляем обработчики событий для модальных окон
    setupModalEventListeners();
    
    // Добавляем обработчики dragleave для всех контейнеров
    setupDragContainers();
    
    // Добавляем несколько начальных задач
    addInitialTasks();
    document.body.addEventListener('dragover', function(e) {
        // Предотвращаем стандартное поведение
        e.preventDefault();
    console.log('Приложение инициализировано успешно!');
	});
}

function setupModalEventListeners() {
    // Закрытие модальных окон по клику на overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                if (this.id === 'add-card-modal') {
                    hideAddCardModal();
                } else if (this.id === 'edit-card-modal') {
                    hideEditCardModal();
                }
            }
        });
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (document.getElementById('add-card-modal').style.display === 'flex') {
                hideAddCardModal();
            } else if (document.getElementById('edit-card-modal').style.display === 'flex') {
                hideEditCardModal();
            }
        }
    });
    
    // Сохранение по Enter в текстовых полях
    document.getElementById('card-text')?.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addCard();
        }
    });
    
    document.getElementById('edit-card-text')?.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveCardEdit();
        }
    });
}

function setupDragContainers() {
    const tasksContainers = document.querySelectorAll('.tasks');
    tasksContainers.forEach(container => {
        container.addEventListener('dragleave', onDragLeave);
    });
    
    // Добавляем обработчики для самих колонок
    const columns = document.querySelectorAll('.column');
    columns.forEach(column => {
        column.addEventListener('dragover', onDragOver);
        column.addEventListener('dragleave', onDragLeave);
    });
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
    
    updateTaskCounts();
}

export function updateTaskCounts() {
    const columns = ['todo', 'in-progress', 'done'];
    columns.forEach(columnId => {
        const taskCount = document.querySelector(`#${columnId} .tasks`).children.length;
        const countElement = document.querySelector(`#${columnId} .task-count`);
        if (countElement) {
            countElement.textContent = `${taskCount} tasks`;
        }
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

// Инициализация приложения при загрузке DOM
document.addEventListener('DOMContentLoaded', initApp);