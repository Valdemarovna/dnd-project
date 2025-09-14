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

  addCard(column, content = '') {
    const card = this.createCard(content || 'Новая задача');
    const container = column.querySelector('.cards-container');
    container.append(card);
    
    // Автоматически переходим в режим редактирования для новой карточки
    if (!content) {
      this.editCard(card);
    }
    
    this.saveToLocalStorage();
  }

  createCard(content) {
    const card = document.createElement('div');
    card.className = 'card';
    card.draggable = true;
    
    const contentDiv = document.createElement('div');
    contentDiv.textContent = content;
    contentDiv.className = 'card-content';
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'card-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = '✏️';
    editBtn.title = 'Редактировать';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.editCard(card);
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = 'Удалить';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteCard(card);
    });
    
    actionsDiv.append(editBtn, deleteBtn);
    card.append(contentDiv, actionsDiv);
    
    card.addEventListener('dragstart', (e) => this.onDragStart(e));
    card.addEventListener('dragend', (e) => this.onDragEnd(e));
    
    return card;
  }

  editCard(card) {
    const contentDiv = card.querySelector('.card-content');
    const originalContent = contentDiv.textContent;
    
    const textarea = document.createElement('textarea');
    textarea.className = 'card-edit-textarea';
    textarea.value = originalContent;
    textarea.placeholder = 'Введите текст задачи...';
    
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'card-edit-buttons';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.textContent = 'Сохранить';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-btn';
    cancelBtn.textContent = 'Отмена';
    
    buttonsDiv.append(saveBtn, cancelBtn);
    
    // Заменяем содержимое карточки
    card.innerHTML = '';
    card.append(textarea, buttonsDiv);
    textarea.focus();
    
    // Сохранение
    saveBtn.addEventListener('click', () => {
      const newContent = textarea.value.trim();
      if (newContent) {
        this.updateCardContent(card, newContent);
      } else {
        this.updateCardContent(card, originalContent);
      }
    });
    
    // Отмена
    cancelBtn.addEventListener('click', () => {
      this.updateCardContent(card, originalContent);
    });
    
    // Сохранение по Enter, отмена по Escape
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        saveBtn.click();
      } else if (e.key === 'Escape') {
        cancelBtn.click();
      }
    });
  }

  updateCardContent(card, content) {
    const contentDiv = document.createElement('div');
    contentDiv.textContent = content;
    contentDiv.className = 'card-content';
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'card-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = '✏️';
    editBtn.title = 'Редактировать';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.editCard(card);
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = 'Удалить';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteCard(card);
    });
    
    actionsDiv.append(editBtn, deleteBtn);
    card.innerHTML = '';
    card.append(contentDiv, actionsDiv);
    
    // Восстанавливаем события drag and drop
    card.draggable = true;
    card.addEventListener('dragstart', (e) => this.onDragStart(e));
    card.addEventListener('dragend', (e) => this.onDragEnd(e));
    
    this.saveToLocalStorage();
  }

  deleteCard(card) {
    if (confirm('Удалить эту задачу?')) {
      card.remove();
      this.saveToLocalStorage();
    }
  }

  onDragStart(e) {
    if (e.target.classList.contains('edit-btn') || e.target.classList.contains('delete-btn')) {
      e.preventDefault();
      return;
    }
    
    const card = e.target.closest('.card');
    if (!card) return;
    
    e.dataTransfer.setData('text/plain', card.querySelector('.card-content').textContent);
    e.dataTransfer.setData('card-id', Date.now().toString());
    card.classList.add('dragging');
    
    // Сохраняем размер карточки для плейсхолдера
    const rect = card.getBoundingClientRect();
    e.dataTransfer.setData('card-height', rect.height.toString());
    
    setTimeout(() => card.classList.add('hidden'), 0);
  }

  onDragEnd(e) {
    const card = e.target.closest('.card');
    if (card) {
      card.classList.remove('dragging', 'hidden');
    }
    
    // Удаляем все плейсхолдеры
    document.querySelectorAll('.card-placeholder').forEach(placeholder => {
      placeholder.remove();
    });
  }

  onDragOver(e) {
    e.preventDefault();
    const container = e.target.closest('.cards-container');
    if (!container) return;
    
    const afterElement = this.getDragAfterElement(container, e.clientY);
    const dragging = document.querySelector('.dragging');
    const cardHeight = parseInt(e.dataTransfer.getData('card-height')) || 60;
    
    // Удаляем старый плейсхолдер
    const oldPlaceholder = container.querySelector('.card-placeholder');
    if (oldPlaceholder) {
      oldPlaceholder.remove();
    }
    
    // Создаем новый плейсхолдер с правильной высотой
    const placeholder = this.createPlaceholder(cardHeight);
    
    if (afterElement) {
      afterElement.before(placeholder);
    } else {
      container.append(placeholder);
    }
  }

  onDragEnter(e) {
    e.preventDefault();
  }

  onDragLeave(e) {
    const container = e.target.closest('.cards-container');
    if (container && !container.contains(e.relatedTarget)) {
      const placeholder = container.querySelector('.card-placeholder');
      if (placeholder) {
        placeholder.remove();
      }
    }
  }

  onDrop(e) {
    e.preventDefault();
    const container = e.target.closest('.cards-container');
    if (!container) return;
    
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

  createPlaceholder(height = 60) {
    const placeholder = document.createElement('div');
    placeholder.className = 'card-placeholder';
    placeholder.style.minHeight = `${height}px`;
    return placeholder;
  }

  saveToLocalStorage() {
    const data = {};
    this.columns.forEach(column => {
      const status = column.dataset.status;
      const cards = Array.from(column.querySelectorAll('.card')).map(card => 
        card.querySelector('.card-content').textContent
      );
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