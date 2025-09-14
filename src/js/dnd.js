import { updateTaskCounts } from './app.js';

let draggedItem = null;
let dragGhost = null;
let currentContainer = null;
let placeholder = null;

export function onDragStart(event) {
    draggedItem = event.target;
    draggedItem.classList.add('dragging');
    
    // Создаем плейсхолдер для оригинальной позиции
    createPlaceholder();
    
    // Создаем силует
    createDragGhost();
    
    // Устанавливаем данные для переноса
    event.dataTransfer.setData('text/plain', 'drag');
    event.dataTransfer.effectAllowed = 'move';
    
    // Используем прозрачное изображение для drag
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
        
        // Показываем силует на предполагаемой позиции
        showGhostAtPosition(tasksContainer, event.clientY);
        
        // Обновляем плейсхолдер
        updatePlaceholder(tasksContainer, event.clientY);
    }
}

export function onDrop(event) {
    event.preventDefault();
    
    const tasksContainer = event.target.closest('.tasks');
    if (tasksContainer && draggedItem) {
        // Вставляем элемент на место плейсхолдера
        if (placeholder && placeholder.parentNode) {
            tasksContainer.insertBefore(draggedItem, placeholder);
            placeholder.remove();
        } else {
            tasksContainer.appendChild(draggedItem);
        }
        
        // Сбрасываем стили
        cleanupDragState();
        
        updateTaskCounts();
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

function createPlaceholder() {
    placeholder = document.createElement('div');
    placeholder.className = 'drop-placeholder';
    placeholder.style.height = `${draggedItem.offsetHeight}px`;
    placeholder.style.margin = '8px 0';
    placeholder.style.borderRadius = '8px';
    placeholder.style.background = 'rgba(0, 121, 191, 0.1)';
    placeholder.style.border = '2px dashed #0079bf';
}

function createDragGhost() {
    // Создаем точную копию перетаскиваемого элемента
    dragGhost = draggedItem.cloneNode(true);
    dragGhost.classList.add('drag-ghost');
    dragGhost.style.position = 'fixed';
    dragGhost.style.opacity = '0';
    dragGhost.style.pointerEvents = 'none';
    dragGhost.style.zIndex = '10000';
    dragGhost.style.width = `${draggedItem.offsetWidth}px`;
    dragGhost.style.cursor = 'grabbing';
    
    // Прячем оригинальные действия
    const actions = dragGhost.querySelector('.task-actions');
    if (actions) {
        actions.style.display = 'none';
    }
    
    // Стилизуем силует
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
    
    let ghostTop = 0;
    let ghostLeft = containerRect.left;
    
    if (afterElement) {
        const elementRect = afterElement.getBoundingClientRect();
        ghostTop = elementRect.top - 4; // Немного выше элемента
    } else {
        // Позиция в конце контейнера
        const lastElement = container.lastElementChild;
        if (lastElement && lastElement.classList.contains('task')) {
            const lastRect = lastElement.getBoundingClientRect();
            ghostTop = lastRect.bottom + 8;
        } else {
            ghostTop = containerRect.top + 20;
        }
    }
    
    // Позиционируем силует
    dragGhost.style.position = 'fixed';
    dragGhost.style.top = `${ghostTop}px`;
    dragGhost.style.left = `${ghostLeft}px`;
    dragGhost.style.opacity = '0.9';
}

function updatePlaceholder(container, y) {
    if (!placeholder) return;
    
    const afterElement = getDragAfterElement(container, y);
    
    // Удаляем старый плейсхолдер
    const oldPlaceholder = container.querySelector('.drop-placeholder');
    if (oldPlaceholder) {
        oldPlaceholder.remove();
    }
    
    // Вставляем новый плейсхолдер
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
    
    // Удаляем силует
    if (dragGhost) {
        dragGhost.remove();
        dragGhost = null;
    }
    
    // Удаляем плейсхолдер
    if (placeholder) {
        placeholder.remove();
        placeholder = null;
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