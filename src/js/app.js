import { createTask, addCard, showAddCardModal, hideAddCardModal, showEditCardModal, hideEditCardModal, saveCardEdit, deleteCard, loadFromLocalStorage, saveToLocalStorage } from './card.js';
import { onDragStart, onDragOver, onDrop, onDragLeave, onDragEnd } from './dnd.js';

// Глобальные переменные
let currentColumn = null;
let currentCard = null;

export function initApp() {
    // Инициализация глобальных функций
    window.onDragStart = onDragStart;
    window.onDragOver = onDragOver;
    window.onDrop = onDrop;
    window.onDragLeave = onDragLeave;
    window.onDragEnd = onDragEnd;
    window.showAddCardModal = showAddCardModal;
    window.hideAddCardModal = hideAddCardModal;
    window.addCard = addCard;
    window.showEditCardModal = showEditCardModal;
    window.hideEditCardModal = hideEditCardModal;
    window.saveCardEdit = saveCardEdit;
    window.deleteCard = deleteCard;
    window.handleDeleteCard = handleDeleteCard;

    // Загрузка из localStorage
    loadFromLocalStorage();

    // Добавляем обработчики событий
    setupEventListeners();

    // Добавляем несколько начальных задач если пусто
    addInitialTasks();
    
    console.log('Приложение инициализировано!');
}

function setupEventListeners() {
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
    
    // Сохранение по Enter
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

function addInitialTasks() {
    const todoTasks = document.querySelectorAll('#todo .task');
    const progressTasks = document.querySelectorAll('#in-progress .task');
    const doneTasks = document.querySelectorAll('#done .task');
    
    if (todoTasks.length === 0 && progressTasks.length === 0 && doneTasks.length === 0) {
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
        
        saveToLocalStorage();
    }
    
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

// Инициализация приложения
document.addEventListener('DOMContentLoaded', initApp);