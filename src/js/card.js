export function createTask(text) {
    const task = document.createElement('div');
    task.className = 'task';
    task.textContent = text;
    task.draggable = true;
    task.addEventListener('dragstart', onDragStart);
    return task;
}

export function addTask(columnId) {
    const text = prompt('Введите текст задачи:');
    if (text) {
        const task = createTask(text);
        document.querySelector(`#${columnId} .tasks`).appendChild(task);
    }
}