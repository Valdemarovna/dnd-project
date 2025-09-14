import { updateTaskCounts } from './app.js';

let draggedItem = null;
let dragPreview = null;
let currentDropTarget = null;
let currentIndicator = null;

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
    
    // Ищем ближайший контейнер для drop (внутри колонки или сама колонка)
    let dropContainer = event.target.closest('.tasks');
    let dropColumn = event.target.closest('.column');
    
    // Если не нашли контейнер задач, но нашли колонку - создаем временный контейнер
    if (!dropContainer && dropColumn) {
        dropContainer = dropColumn.querySelector('.tasks');
    }
    
    if (!dropContainer) return;
    
    // Добавляем класс для подсветки контейнера
    highlightDropZone(dropContainer);
    currentDropTarget = dropContainer;
    
    // Удаляем старые индикаторы
    removeAllIndicators();
    
    // Определяем позицию для вставки
    const { position, element } = getDropPosition(dropContainer, event.clientY);
    
    // Создаем визуальный индикатор
    createDropIndicator(dropContainer, position, element);
}

export function onDrop(event) {
    event.preventDefault();
    
    if (!draggedItem) return;
    
    // Ищем контейнер для drop
    let dropContainer = event.target.closest('.tasks');
    let dropColumn = event.target.closest('.column');
    
    if (!dropContainer && dropColumn) {
        dropContainer = dropColumn.querySelector('.tasks');
    }
    
    if (!dropContainer) return;
    
    // Определяем позицию для вставки
    const { position, element } = getDropPosition(dropContainer, event.clientY);
    
    // Вставляем элемент в нужную позицию
    if (position === 'before' && element) {
        dropContainer.insertBefore(draggedItem, element);
    } else if (position === 'after' && element) {
        if (element.nextSibling) {
            dropContainer.insertBefore(draggedItem, element.nextSibling);
        } else {
            dropContainer.appendChild(draggedItem);
        }
    } else {
        dropContainer.appendChild(draggedItem);
    }
    
    // Очищаем состояние
    cleanupDragState();
    updateTaskCounts();
}

export function onDragLeave(event) {
    // Проверяем, что мы действительно вышли из контейнера, а не просто переместились внутри него
    const relatedTarget = event.relatedTarget;
    const currentTarget = event.currentTarget;
    
    if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
        cleanupDragState();
    }
}

export function onDragEnd() {
    cleanupDragState();
}

function updateDragPreview(event) {
    if (!dragPreview) return;
    
    dragPreview.style.left = `${event.clientX + 20}px`;
    dragPreview.style.top = `${event.clientY + 20}px`;
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
        const middle = rect.top + rect.height / 2;
        const distance = Math.abs(y - middle);
        
        if (distance < closestDistance) {
            closestDistance = distance;
            closestElement = task;
            closestPosition = y < middle ? 'before' : 'after';
        }
    });
    
    // Если расстояние слишком большое, считаем что вставляем в конец
    if (closestDistance > 100) {
        return { position: 'append', element: null };
    }
    
    return { position: closestPosition, element: closestElement };
}

function createDropIndicator(container, position, element) {
    removeAllIndicators();
    
    const indicator = document.createElement('div');
    indicator.className = `drop-indicator ${position}`;
    currentIndicator = indicator;
    
    if (position === 'before' && element) {
        container.insertBefore(indicator, element);
    } else if (position === 'after' && element) {
        if (element.nextSibling) {
            container.insertBefore(indicator, element.nextSibling);
        } else {
            container.appendChild(indicator);
        }
    } else {
        // Для пустого контейнера
        indicator.style.height = '80px';
        indicator.style.margin = '20px 0';
        container.appendChild(indicator);
    }
}

function highlightDropZone(container) {
    // Убираем подсветку со всех контейнеров
    const allContainers = document.querySelectorAll('.tasks, .column');
    allContainers.forEach(cont => cont.classList.remove('drag-over', 'column-drag-over'));
    
    // Подсвечиваем текущий контейнер
    container.classList.add('drag-over');
    
    // Также подсвечиваем родительскую колонку
    const column = container.closest('.column');
    if (column) {
        column.classList.add('column-drag-over');
    }
}

function removeAllIndicators() {
    if (currentIndicator) {
        currentIndicator.remove();
        currentIndicator = null;
    }
    
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
    
    // Убираем подсветку со всех контейнеров
    const allContainers = document.querySelectorAll('.tasks, .column');
    allContainers.forEach(container => {
        container.classList.remove('drag-over', 'column-drag-over');
    });
    
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