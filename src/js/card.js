import { updateTaskCounts, setCurrentColumn, getCurrentColumn, setCurrentCard, getCurrentCard } from './app.js';

export function createTask(text) {
    const task = document.createElement('div');
    task.className = 'task';
    task.draggable = true;
    task.addEventListener('dragstart', onDragStart);
    
    task.innerHTML = `
        <div class="task-text">${text}</div>
        <div class="task-actions">
            <button class="delete-btn" onclick="event.stopPropagation(); deleteCard(this.parentElement.parentElement)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return task;
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
    const text