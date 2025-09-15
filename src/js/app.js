import '../css/style.css';

class DnDManager {
  constructor() {
    this.draggedItem = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    const cards = document.querySelectorAll('.card');
    const columns = document.querySelectorAll('.column');

    // Добавляем обработчики для карточек
    cards.forEach((card) => {
      card.addEventListener('dragstart', this.handleDragStart.bind(this));
      card.addEventListener('dragend', this.handleDragEnd.bind(this));
    });

    // Добавляем обработчики для колонок
    columns.forEach((column) => {
      column.addEventListener('dragover', this.handleDragOver.bind(this));
      column.addEventListener('dragenter', this.handleDragEnter.bind(this));
      column.addEventListener('dragleave', this.handleDragLeave.bind(this));
      column.addEventListener('drop', this.handleDrop.bind(this));
    });
  }

  handleDragStart(e) {
    this.draggedItem = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.id);
  }

  handleDragEnd(e) {
    e.target.classList.remove('dragging');
    this.draggedItem = null;
    
    // Убираем класс drag-over со всех колонок
    document.querySelectorAll('.column').forEach((column) => {
      column.classList.remove('drag-over');
    });
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  handleDragEnter(e) {
    e.preventDefault();
    if (e.target.classList.contains('column')) {
      e.target.classList.add('drag-over');
    }
  }

  handleDragLeave(e) {
    if (e.target.classList.contains('column')) {
      e.target.classList.remove('drag-over');
    }
  }

  handleDrop(e) {
    e.preventDefault();
    
    if (e.target.classList.contains('column')) {
      e.target.classList.remove('drag-over');
      
      if (this.draggedItem) {
        e.target.appendChild(this.draggedItem);
        
        // Можно добавить логику для сохранения состояния
        this.saveState();
      }
    }
  }

  saveState() {
    // Сохранение состояния в localStorage
    const columns = document.querySelectorAll('.column');
    const state = {};
    
    columns.forEach((column) => {
      state[column.id] = Array.from(column.querySelectorAll('.card')).map(card => card.outerHTML);
    });
    
    localStorage.setItem('dnd-board-state', JSON.stringify(state));
  }

  loadState() {
    // Загрузка состояния из localStorage
    const savedState = localStorage.getItem('dnd-board-state');
    
    if (savedState) {
      const state = JSON.parse(savedState);
      const columns = document.querySelectorAll('.column');
      
      columns.forEach((column) => {
        if (state[column.id]) {
          column.innerHTML = `<h2>${column.querySelector('h2').textContent}</h2>`;
          state[column.id].forEach((cardHTML) => {
            column.innerHTML += cardHTML;
          });
        }
      });
      
      // Переинициализируем обработчики событий для новых элементов
      this.setupEventListeners();
    }
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  const dndManager = new DnDManager();
  dndManager.loadState();
});