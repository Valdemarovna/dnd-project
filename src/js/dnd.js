import { updateTaskCounts } from './app.js';

let draggedItem = null;
let dragGhost = null;

export function onDragStart(event) {
    draggedItem = event.target;
    draggedItem.classList.add('dragging');
    
    // Создаем полноразмерный силует
    createDragGhost(event);
    
    // Устанавливаем данные для переноса
    event.dataTransfer.setData('text/plain', 'drag');
    event.dataTransfer.effectAllowed = 'move';
    
    // Используем кастомное изображение для drag
    event.dataTransfer.setDragImage(dragGhost, 0, 0);
}

export function onDragOver(event) {
    event.preventDefault();
    
    const tasksContainer = event.target.closest('.tasks');
    if (tasksContainer) {
        // Подсвечиваем контейнер
        tasksContainer.classList.add('drag-over');
        
        // Показываем индикатор позиции
        showDropIndicator(tasksContainer, event.clientY);
        
        // Обновляем позицию силуета
        updateGhostPosition(tasksContainer, event.clientY);
    }
}

export function onDrop(event) {
    event.preventDefault();
    
    const tasksContainer = event.target.closest('.tasks');
    if (tasksContainer && draggedItem) {
        // Определяем позицию для вставки
        const afterElement = getDragAfterElement(tasksContainer, event.clientY);
        
        // Вставляем элемент
        if (afterElement) {
            tasksContainer.insertBefore(draggedItem, afterElement);
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

function createDragGhost(event) {
    // Создаем копию элемента для силуета
    dragGhost = draggedItem.cloneNode(true);
    dragGhost.classList.add('drag-ghost');
    dragGhost.style.position = 'fixed';
    dragGhost.style.left = '-9999px'; // Прячем за экраном
    dragGhost.style.top = '-9999px';
    dragGhost.style.width = `${draggedItem.offsetWidth}px`;
    dragGhost.style.opacity = '0.8';
    dragGhost.style.zIndex = '10000';
    dragGhost.style.pointerEvents = 'none';
    dragGhost.style.transform = 'rotate(5deg)';
    dragGhost.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
    
    document.body.appendChild(dragGhost);
}

function updateGhostPosition(container, y) {
    if (!dragGhost) return;
    
    // Показываем силует на предполагаемой позиции
    const afterElement = getDragAfterElement(container, y);
    const containerRect = container.getBoundingClientRect();
    
    if (afterElement) {
        const elementRect = afterElement.getBoundingClientRect();
        dragGhost.style.top = `${elementRect.top - containerRect.top}px`;
        dragGhost.style.left = '0';
    } else {
        // Если в конец, позиционируем внизу
        dragGhost.style.top = `${container.scrollHeight - 60}px`;
        dragGhost.style.left = '0';
    }
    
    // Показываем силует
    dragGhost.style.display = 'block';
}

function showDropIndicator(container, y) {
    removeDropIndicator();
    
    const afterElement = getDragAfterElement(container, y);
    const indicator = document.createElement('div');
    indicator.className = 'drop-indicator';
    
    if (afterElement) {
        container.insertBefore(indicator, afterElement);
    } else {
        container.appendChild(indicator);
    }
}

function removeDropIndicator() {
    const indicators = document.querySelectorAll('.drop-indicator');
    indicators.forEach(indicator => indicator.remove());
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];
    
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
    // Убираем подсветку со всех контейнеров
    document.querySelectorAll('.tasks').forEach(container => {
        container.classList.remove('drag-over');
    });
    
    // Удаляем индикаторы
    removeDropIndicator();
    
    // Удаляем силует
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
}

// Глобальные функции
window.onDragStart = onDragStart;
window.onDragOver = onDragOver;
window.onDrop = onDrop;
window.onDragLeave = onDragLeave;
window.onDragEnd = onDragEnd;