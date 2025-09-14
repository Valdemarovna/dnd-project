let draggedItem = null;

export function onDragStart(event) {
    draggedItem = event.target;
    event.target.classList.add('dragging');
    event.dataTransfer.setData('text/plain', event.target.textContent);
}

export function onDragOver(event) {
    event.preventDefault();
}

export function onDrop(event) {
    event.preventDefault();
    if (draggedItem) {
        event.target.appendChild(draggedItem);
        draggedItem.classList.remove('dragging');
        draggedItem = null;
    }
}