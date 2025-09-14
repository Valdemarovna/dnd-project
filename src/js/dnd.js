import { updateTaskCounts } from './app.js';

let draggedItem = null;

export function onDragStart(event) {
    draggedItem = event.target;
    event.target.classList.add('dragging');
    setTimeout(() => {
        event.target.style.display = 'none';
    }, 0);
}

export function onDragOver(event) {
    event.preventDefault();
    const tasksContainer = event.target.closest('.tasks');
    if (tasksContainer) {
        tasksContainer.style.background = 'rgba(255, 255, 255, 0.8)';
    }
}

export function onDrop(event, columnId) {
    event.preventDefault();
    
    const tasksContainer = event.target.closest('.tasks');
    if (tasksContainer && draggedItem) {
        tasksContainer.appendChild(draggedItem);
        tasksContainer.style.background = 'rgba(255, 255, 255, 0.5)';
    }
    
    if (draggedItem) {
        draggedItem.style.display = 'block';
        draggedItem.classList.remove('dragging');
        draggedItem = null;
        updateTaskCounts();
    }
}