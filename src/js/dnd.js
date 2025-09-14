import { updateTaskCounts, saveToLocalStorage } from './app.js';

let draggedItem = null;
let dragGhost = null;
let currentContainer = null;

export function onDragStart(event) {
    draggedItem = event.target;
    draggedItem.classList.add('dragging');
    
    // Создаем ghost элемент
    createDragGhost();
    
    // Устанавливаем данные для переноса
    event.dataTransfer.setData('text/plain', 'drag');
    event.dataTransfer.effectAllowed = 'move';
    
    // Используем прозрачное изображение
    const transparentPixel = new Image();
    transparentPixel.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    event.dataTransfer.setDragImage(transparentPixel, 0, 0);
}

export function onDragOver(event) {
    event.preventDefault();
    
    const tasksContainer = event.target.closest('.tasks');
    if (tasksContainer) {
        currentContainer = tasksContainer;
        
        // Подсвечиваем контейнер
        highlightContainer(tasksContainer);
        
        // Показываем ghost на позиции
        showGhostAtPosition(tasksContainer, event.clientY);
        
        // Обновляем placeholder
        updatePlaceholder(tasksContainer, event.clientY);
    }
}

export function onDrop(event) {
    event.preventDefault();
    
    const tasksContainer = event.target.closest('.tasks');
    if (tasksContainer && draggedItem) {
        // Вставляем элемент
        const afterElement = getDragAfterElement(tasksContainer, event.clientY);
        
        if (afterElement) {
            tasksContainer.insertBefore(draggedItem, afterElement);
        } else {
            tasksContainer.appendChild(draggedItem);
        }
        
        // Сбрасываем стили
        cleanupDragState();
        
        updateTaskCounts();
        saveToLocalStorage();
    }
}

export function onDragLeave(event) {
    const tasksContainer = event.target.closest('.tasks');
    if (tasksContainer && !tasksContainer.contains(event.relatedTarget)) {
        cleanupDragState();
    }
}

export function onDragEnd() {
    cleanupDragState();
}

function createDragGhost() {
    dragGhost = draggedItem.cloneNode(true);
    dragGhost.classList.add('drag-ghost');
    dragGhost.style.position = 'fixed';
    dragGhost.style.opacity = '0';
    dragGhost.style.pointerEvents = 'none';
    dragGhost.style.zIndex = '10000';
    dragGhost.style.width = `${draggedItem.offsetWidth}px`;
    
    // Убираем кнопку удаления
    const actions = dragGhost.querySelector('.task-actions');
    if (actions) {
        actions.style.display = 'none';
    }
    
    // Стилизуем ghost
    dragGhost.style.background = 'rgba(255, 255, 255, 0.95)';
    dragGhost.style.border = '2px solid #0079bf';
    dragGhost.style.borderRadius = '8px';
    dragGhost.style.boxShadow = '0 12px 40px rgba(0, 121, 191, 0.4)';
    dragGhost.style.transform = 'rotate(3deg) scale(1.05)';
    
    document.body.appendChild(dragGhost);
}

function showGhostAtPosition(container, y) {
    if (!dragGhost) return;
    
    const afterElement = getDragAfterElement(container, y);
    const containerRect = container.getBoundingClientRect();
    
    let ghostTop = containerRect.top;
    let ghostLeft = containerRect.left;
    
    if (afterElement) {
        const elementRect = afterElement.getBoundingClientRect();
        ghostTop = elementRect.top - 5;
    }
    
    // Позиционируем ghost
    dragGhost.style.top = `${ghostTop}px`;
    dragGhost.style.left = `${ghostLeft}px`;
    dragGhost.style.opacity = '0.9';
}

function updatePlaceholder(container, y) {
    const afterElement = getDragAfterElement(container, y);
    const placeholder = document.createElement('div');
    placeholder.className = 'drop-placeholder';
    placeholder.style.height = '60px';
    placeholder.style.margin = '8px 0';
    placeholder.style.background = 'rgba(0, 121, 191, 0.1)';
    placeholder.style.border = '2px dashed #0079bf';
    placeholder.style.borderRadius = '8px';
    
    // Удаляем старый placeholder
    const oldPlaceholder = container.querySelector('.drop-placeholder');
    if (oldPlaceholder) {
        oldPlaceholder.remove();
    }
    
    // Вставляем новый placeholder
    if (afterElement) {
        container.insertBefore(placeholder, afterElement);
    } else {
        container.appendChild(placeholder);
    }
}

function highlightContainer(container) {
    // Убираем подсветку со всех контейнеров
    document.querySelectorAll('.tasks').forEach(cont => {
        cont.classList.remove('drag-over');
    });
    
    // Подсвечиваем текущий контейнер
    container.classList.add('drag-over');
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];
    
    if (draggableElements.length === 0) return null;
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function cleanupDragState() {
    // Убираем подсветку
    document.querySelectorAll('.tasks').forEach(container => {
        container.classList.remove('drag-over');
    });
    
    // Удаляем placeholder
    const placeholders = document.querySelectorAll('.drop-placeholder');
    placeholders.forEach(placeholder => placeholder.remove());
    
    // Удаляем ghost
    if (dragGhost) {
        dragGhost.remove();
        dragGhost = null;
    }
    
    // Восстанавливаем оригинальный элемент
    if (draggedItem) {
        draggedItem.classList.remove('dragging');
        draggedItem.style.opacity = '1';
        draggedItem = null;
    }
    
    currentContainer = null;
}

// Глобальные функции
window.onDragStart = onDragStart;
window.onDragOver = onDragOver;
window.onDrop = onDrop;
window.onDragLeave = onDragLeave;
window.onDragEnd = onDragEnd;