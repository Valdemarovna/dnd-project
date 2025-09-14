import { updateTaskCounts } from './app.js';

let draggedItem = null;
let dragPreview = null;
let currentDropTarget = null;

export function onDragStart(event) {
    draggedItem = event.target;
    draggedItem.classList.add('dragging');
    
    // Создаем preview элемент
    dragPreview = draggedItem.cloneNode(true);
    dragPreview.classList.add('drag-preview');
    dragPreview.style.position = 'absolute';
    dragPreview.style.width = `${draggedItem.offsetWidth}px`;
    dragPreview.style.opacity = '0.8';
    dragPreview.style.zIndex = '1000';
    dragPreview.style.pointerEvents = 'none';
    document.body.appendChild(dragPreview);
    
    // Устанавливаем данные для переноса
    event.dataTransfer.setData('text/plain', '');
    event.dataTransfer.effectAllowed = 'move';
    
    // Скрываем оригинальный элемент
    setTimeout(() => {
        draggedItem.style.opacity = '0';
    }, 0);
}

export function onDragOver(event) {
    event.preventDefault();
    
    if (!draggedItem) return;
    
    // Обновляем позицию preview
    updateDragPreview(event);
    
    const tasksContainer = event.target.closest('.tasks');
    if (!tasksContainer) return;
    
    // Добавляем класс для подсветки контейнера
    tasksContainer.classList.add('drag-over');
    currentDropTarget = tasksContainer;
    
    // Удаляем старые индикаторы
    removeAllIndicators();
    
    // Определяем позицию для вставки
    const { position, element } = getDropPosition(tasksContainer, event.clientY);
    
    // Создаем визуальный индикатор
    createDropIndicator(tasksContainer, position, element);
}

export function onDrop(event, columnId) {
    event.preventDefault();
    
    if (!draggedItem) return;
    
    const tasksContainer = event.target.closest('.tasks');
    if (!tasksContainer) return;
    
    // Определяем позицию для вставки
    const { position, element } = getDropPosition(tasksContainer, event.clientY);
    
    // Вставляем элемент в нужную позицию
    if (position === 'before' && element) {
        tasksContainer.insertBefore(draggedItem, element);
    } else if (position === 'after' && element) {
        tasksContainer.insertBefore(draggedItem, element.nextSibling);
    } else {
        tasksContainer.appendChild(draggedItem);
    }
    
    // Очищаем состояние
    cleanupDragState();
    updateTaskCounts();
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

function updateDragPreview(event) {
    if (!dragPreview) return;
    
    dragPreview.style.left = `${event.clientX + 10}px`;
    dragPreview.style.top = `${event.clientY + 10}px`;
}

function getDropPosition(container, y) {
    const tasks = [...container.querySelectorAll('.task:not(.dragging)')];
    
    if (tasks.length === 0) {
        return { position: 'append', element: null };
    }
    
    let closestElement = null;
    let closestPosition = 'append';
    let closestDistance = Infinity;
    
    tasks.forEach(task => {
        const rect = task.getBoundingClientRect();
        const topDistance = Math.abs(y - rect.top);
        const bottomDistance = Math.abs(y - rect.bottom);
        const middle = rect.top + rect.height / 2;
        
        if (y < middle && topDistance < closestDistance) {
            closestDistance = topDistance;
            closestElement = task;
            closestPosition = 'before';
        } else if (y >= middle && bottomDistance < closestDistance) {
            closestDistance = bottomDistance;
            closestElement = task;
            closestPosition = 'after';
        }
    });
    
    return { position: closestPosition, element: closestElement };
}

function createDropIndicator(container, position, element) {
    removeAllIndicators();
    
    const indicator = document.createElement('div');
    indicator.className = `drop-indicator ${position}`;
    
    if (position === 'before' && element) {
        container.insertBefore(indicator, element);
    } else if (position === 'after' && element) {
        if (element.nextSibling) {
            container.insertBefore(indicator, element.nextSibling);
        } else {
            container.appendChild(indicator);
        }
    } else {
        container.appendChild(indicator);
    }
}

function removeAllIndicators() {
    const indicators = document.querySelectorAll('.drop-indicator');
    indicators.forEach(indicator => indicator.remove());
}

function cleanupDragState() {
    // Восстанавливаем оригинальный элемент
    if (draggedItem) {
        draggedItem.style.opacity = '1';
        draggedItem.classList.remove('dragging');
    }
    
    // Удаляем preview
    if (dragPreview) {
        dragPreview.remove();
        dragPreview = null;
    }
    
    // Убираем подсветку контейнеров
    const containers = document.querySelectorAll('.tasks');
    containers.forEach(container => container.classList.remove('drag-over'));
    
    // Удаляем индикаторы
    removeAllIndicators();
    
    // Сбрасываем состояние
    draggedItem = null;
    currentDropTarget = null;
}

// Глобальные функции
window.onDragStart = onDragStart;
window.onDragOver = onDragOver;
window.onDrop = onDrop;
window.onDragLeave = onDragLeave;
window.onDragEnd = onDragEnd;