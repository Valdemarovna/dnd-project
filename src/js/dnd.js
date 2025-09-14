import { updateTaskCounts } from './app.js';

let draggedItem = null;

export function onDragStart(event) {
    draggedItem = event.target;
    event.target.classList.add('dragging');
    
    // Устанавливаем данные для переноса
    event.dataTransfer.setData('text/plain', event.target.textContent);
    event.dataTransfer.effectAllowed = 'move';
    
    // Создаем визуальную копию для drag image
    const dragImage = event.target.cloneNode(true);
    dragImage.style.width = `${event.target.offsetWidth}px`;
    dragImage.style.opacity = '0.8';
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, 20, 20);
    setTimeout(() => document.body.removeChild(dragImage), 0);
}

export function onDragOver(event) {
    event.preventDefault();
    
    const tasksContainer = event.target.closest('.tasks');
    if (tasksContainer) {
        // Подсвечиваем контейнер
        tasksContainer.style.background = 'rgba(0, 121, 191, 0.1)';
        tasksContainer.style.border = '2px dashed #0079bf';
        
        // Показываем индикатор позиции
        showDropIndicator(tasksContainer, event.clientY);
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
        resetContainerStyles(tasksContainer);
        removeDropIndicator();
        
        draggedItem.classList.remove('dragging');
        draggedItem = null;
        
        updateTaskCounts();
    }
}

export function onDragLeave(event) {
    const tasksContainer = event.target.closest('.tasks');
    if (tasksContainer && !tasksContainer.contains(event.relatedTarget)) {
        resetContainerStyles(tasksContainer);
        removeDropIndicator();
    }
}

export function onDragEnd() {
    // Сбрасываем все стили при завершении drag
    document.querySelectorAll('.tasks').forEach(container => {
        resetContainerStyles(container);
    });
    removeDropIndicator();
    
    if (draggedItem) {
        draggedItem.classList.remove('dragging');
        draggedItem = null;
    }
}

function showDropIndicator(container, y) {
    removeDropIndicator();
    
    const afterElement = getDragAfterElement(container, y);
    const indicator = document.createElement('div');
    indicator.className = 'drop-indicator';
    indicator.style.height = '4px';
    indicator.style.background = '#0079bf';
    indicator.style.borderRadius = '2px';
    indicator.style.margin = '2px 0';
    
    if (afterElement) {
        container.insertBefore(indicator, afterElement);
    } else {
        container.appendChild(indicator);
    }
}

function removeDropIndicator() {
    const indicator = document.querySelector('.drop-indicator');
    if (indicator) {
        indicator.remove();
    }
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

function resetContainerStyles(container) {
    container.style.background = 'rgba(255, 255, 255, 0.5)';
    container.style.border = 'none';
}

// Глобальные функции
window.onDragStart = onDragStart;
window.onDragOver = onDragOver;
window.onDrop = onDrop;
window.onDragLeave = onDragLeave;
window.onDragEnd = onDragEnd;