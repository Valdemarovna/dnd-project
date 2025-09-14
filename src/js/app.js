import { createTask, addTask } from './card';
import { onDragStart, onDragOver, onDrop } from './dnd';

export function initApp() {
    // Инициализация приложения
    window.addTask = addTask;
    window.onDragStart = onDragStart;
    window.onDragOver = onDragOver;
    window.onDrop = onDrop;

    // Добавляем несколько начальных задач
    const initialTasks = [
        { text: 'Изучить JavaScript', column: 'backlog' },
        { text: 'Сделать ДЗ по Webpack', column: 'backlog' },
        { text: 'Настроить GitHub Actions', column: 'backlog' }
    ];

    initialTasks.forEach(task => {
        const taskElement = createTask(task.text);
        document.querySelector(`#${task.column} .tasks`).appendChild(taskElement);
    });
}