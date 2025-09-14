// src/js/app.js
import '../css/style.css';

class DnDBoard {
  constructor() {
    this.columns = document.querySelectorAll('.column');
    this.initialize();
  }

  initialize() {
    this.setupEventListeners();
    this.loadFromLocalStorage();
  }

  setupEventListeners() {
    // Добавление карточек
    document.querySelectorAll('.add-card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.addCard(e.target.closest('.column')));
    });

    // Drag and Drop события
    this.columns.forEach(column => {
      const container = column.querySelector('.cards-container');
      
      container.addEventListener('dragover', (e) => this.onDragOver(e));
      container.addEventListener('dragenter', (e) => this.onDragEnter(e));
      container.addEventListener('dragleave', (e) => this.onDragLeave(e));
      container.addEventListener('drop', (e) => this.onDrop(e));
    });
  }

  addCard(column, content = 'Новая задача') {
    const card = this.createCard(content);
    const container = column.querySelector('.cards-container');
    container.append(card);
    this.saveToLocalStorage();
  }

  createCard(content) {
    const card = document.createElement('div');
    card.className = 'card';
    card.draggable = true;
    card.textContent = content;
    
    card.addEventListener('dragstart', (e) => this.onDragStart(e));
    card.addEventListener('dragend', (e) => this.onDragEnd(e));
    
    return card;
  }

  onDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.textContent);
    e.target.classList.add('dragging');
    setTimeout(() => e.target.classList.add('hidden'), 0);
  }

  onDragEnd(e) {
    e.target.classList.remove('dragging', 'hidden');
  }

  onDragOver(e) {
    e.preventDefault();
    const afterElement = this.getDragAfterElement(e.target.closest('.cards-container'), e.clientY);
    const dragging = document.querySelector('.dragging');
    
    if (afterElement) {
      afterElement.before(this.createPlaceholder());
    } else {
      e.target.closest('.cards-container').append(this.createPlaceholder());
    }
  }

  onDragEnter(e) {
    e.preventDefault();
  }

  onDragLeave(e) {
    const placeholder = e.target.querySelector('.card-placeholder');
    if (placeholder && !e.target.contains(e.relatedTarget)) {
      placeholder.remove();
    }
  }

  onDrop(e) {
    e.preventDefault();
    const container = e.target.closest('.cards-container');
    const placeholder = container.querySelector('.card-placeholder');
    
    if (placeholder) {
      const content = e.dataTransfer.getData('text/plain');
      const newCard = this.createCard(content);
      
      placeholder.replaceWith(newCard);
      this.saveToLocalStorage();
    }
  }

  getDragAfterElement(container, y) {
    const cards = [...container.querySelectorAll('.card:not(.dragging)')];
    
    return cards.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  createPlaceholder() {
    const placeholder = document.createElement('div');
    placeholder.className = 'card-placeholder';
    return placeholder;
  }

  saveToLocalStorage() {
    const data = {};
    this.columns.forEach(column => {
      const status = column.dataset.status;
      const cards = Array.from(column.querySelectorAll('.card')).map(card => card.textContent);
      data[status] = cards;
    });
    localStorage.setItem('dnd-board', JSON.stringify(data));
  }

  loadFromLocalStorage() {
    const data = JSON.parse(localStorage.getItem('dnd-board'));
    if (data) {
      this.columns.forEach(column => {
        const status = column.dataset.status;
        const container = column.querySelector('.cards-container');
        container.innerHTML = '';
        
        if (data[status]) {
          data[status].forEach(content => {
            container.append(this.createCard(content));
          });
        }
      });
    }
  }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  new DnDBoard();
});