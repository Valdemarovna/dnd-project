import { updateTaskCounts } from './app.js';

let draggedItem = null;
let placeholder = null;

export function onDragStart(event) {
    draggedItem = event.target;
    event.target.classList.add('dragging');
    
    // Создаем placeholder
    placeholder = document.createElement('div');
    placeholder.className = 'drop-placeholder';
    placeholder.style.height = `${draggedItem.offsetHeight}px`;
    
    // Устанавливаем данные для переноса
    event.dataTransfer.setData('text/plain', event.target.id);
    event.dataTransfer.effectAllowed = 'move';
}

export function onDragOver(event) {
    event.preventDefault();
    
    const tasksContainer = event.target.closest('.tasks');
    if (!tasksContainer || !draggedItem) return;
    
    // Определяем позицию для вставки
    const afterElement = getDragAfterElement(tasksContainer, event.clientY);
    
    // Удаляем старый placeholder
    const oldPlaceholder = tasksContainer.querySelector('.drop-placeholder');
    if (oldPlaceholder) {
        oldPlaceholder.remove();
    }
    
    // Вставляем placeholder в нужную позицию
    if (afterElement == null) {
        tasksContainer.appendChild(placeholder);
        placeholder.className = 'drop-placeholder after';
    } else {
        tasksContainer.insertBefore(placeholder, afterElement);
        placeholder.className = 'drop-placeholder before';
    }
    
    // Подсвечиваем контейнер
    tasksContainer.style.background = 'rgba(255, 255, 255, 0.8)';
}

export function onDrop(event, columnId) {
    event.preventDefault();
    
    const tasksContainer = event.target.closest('.tasks');
    if (!tasksContainer || !draggedItem) return;
    
    // Определяем позицию для вставки
    const afterElement = getDragAfterElement(tasksContainer, event.clientY);
    
    // Удаляем placeholder
    const placeholder = tasksContainer.querySelector('.drop-placeholder');
    if (placeholder) {
        placeholder.remove();
    }
    
    // Вставляем элемент в нужную позицию
    if (afterElement == null) {
        tasksContainer.appendChild(draggedItem);
    } else {
        tasksContainer.insertBefore(draggedItem, afterElement);
    }
    
    // Сбрасываем стили
    tasksContainer.style.background = 'rgba(255, 255, 255, 0.5)';
    draggedItem.classList.remove('dragging');
    draggedItem = null;
    
    updateTaskCounts();
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

// Функция для сброса стилей при выходе из контейнера
export function onDragLeave(event) {
    const tasksContainer = event.target.closest('.tasks');
    if (tasksContainer) {
        const placeholder = tasksContainer.querySelector('.drop-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        tasksContainer.style.background = 'rgba(255, 255, 255, 0.5)';
    }
}

// Глобальные функции
window.onDragStart = onDragStart;
window.onDragOver = onDragOver;
window.onDrop = onDrop;
window.onDragLeave = onDragLeave;