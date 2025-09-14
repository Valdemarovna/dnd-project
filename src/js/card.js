import { updateTaskCounts, saveToLocalStorage } from './app.js';
import { onDragStart, onDragEnd } from './dnd.js';

// Глобальные переменные (убрали дубликаты из app.js)
let currentColumn = null;
let currentCard = null;

export function createTask(text) {
    const task = document.createElement('div');
    task.className = 'task';
    task.draggable = true;
    
    // Добавляем обработчики
    task.addEventListener('dragstart', onDragStart);
    task.addEventListener('dragend', onDragEnd);
    task.addEventListener('click', handleTaskClick);
    
    task.innerHTML = `
        <div class="task-text">${text}</div>
        <div class="task-actions">
            <button class="delete-btn" onclick="event.stopPropagation(); handleDeleteCard(this.parentElement.parentElement)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return task;
}

function handleTaskClick(event) {
    if (!event.target.classList.contains('delete-btn')) {
        const task = event.currentTarget;
        const text = task.querySelector('.task-text').textContent;
        showEditCardModal(task, text);
    }
}

export function showAddCardModal(columnId) {
    setCurrentColumn(columnId);
    const modal = document.getElementById('add-card-modal');
    const textarea = document.getElementById('card-text');
    textarea.value = '';
    modal.style.display = 'flex';
    textarea.focus();
}

export function hideAddCardModal() {
    document.getElementById('add-card-modal').style.display = 'none';
}

export function addCard() {
    const textarea = document.getElementById('card-text');
    const text = textarea.value.trim();
    
    if (text) {
        const columnId = getCurrentColumn();
        const task = createTask(text);
        document.querySelector(`#${columnId} .tasks`).appendChild(task);
        updateTaskCounts();
        saveToLocalStorage();
        hideAddCardModal();
    }
}

export function showEditCardModal(card, text) {
    setCurrentCard(card);
    const modal = document.getElementById('edit-card-modal');
    const textarea = document.getElementById('edit-card-text');
    textarea.value = text;
    modal.style.display = 'flex';
    textarea.focus();
}

export function hideEditCardModal() {
    document.getElementById('edit-card-modal').style.display = 'none';
}

export function saveCardEdit() {
    const textarea = document.getElementById('edit-card-text');
    const text = textarea.value.trim();
    
    if (text && getCurrentCard()) {
        getCurrentCard().querySelector('.task-text').textContent = text;
        saveToLocalStorage();
        hideEditCardModal();
    }
}

export function deleteCard() {
    const card = getCurrentCard();
    if (card && card.parentElement) {
        card.parentElement.removeChild(card);
        updateTaskCounts();
        saveToLocalStorage();
        hideEditCardModal();
    }
}

function handleDeleteCard(card) {
    setCurrentCard(card);
    deleteCard();
}

export function saveToLocalStorage() {
    const columns = ['todo', 'in-progress', 'done'];
    const data = {};
    
    columns.forEach(columnId => {
        const tasks = document.querySelectorAll(`#${columnId} .task`);
        data[columnId] = Array.from(tasks).map(task => 
            task.querySelector('.task-text').textContent
        );
    });
    
    localStorage.setItem('trelloBoard', JSON.stringify(data));
}

export function loadFromLocalStorage() {
    const savedData = localStorage.getItem('trelloBoard');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        Object.keys(data).forEach(columnId => {
            const tasksContainer = document.querySelector(`#${columnId} .tasks`);
            if (tasksContainer) {
                data[columnId].forEach(text => {
                    const task = createTask(text);
                    tasksContainer.appendChild(task);
                });
            }
        });
        
        updateTaskCounts();
    }
}

// Функции для работы с текущими элементами
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

// Глобальные функции
window.showAddCardModal = showAddCardModal;
window.hideAddCardModal = hideAddCardModal;
window.addCard = addCard;
window.showEditCardModal = showEditCardModal;
window.hideEditCardModal = hideEditCardModal;
window.saveCardEdit = saveCardEdit;
window.deleteCard = deleteCard;
window.handleDeleteCard = handleDeleteCard;