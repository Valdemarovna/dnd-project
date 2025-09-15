import { Animations } from './utils/animations.js';

export class DnDManager {
  constructor(cardManager) {
    this.cardManager = cardManager;
    this.draggedItem = null;
    this.dragSource = null;
    this.ghostElement = null;
    this.currentColumn = null;
    this.currentPosition = null;
    this.draggedItemRect = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.makeColumnsScrollable();
  }

  makeColumnsScrollable() {
    const columns = document.querySelectorAll('.column');
    if (columns) {
      columns.forEach(column => {
        column.classList.add('scrollable');
      });
    }
  }

  setupEventListeners() {
    document.addEventListener('dragstart', this.handleDragStart.bind(this));
    document.addEventListener('dragend', this.handleDragEnd.bind(this));
    document.addEventListener('dragover', this.handleDragOver.bind(this));
    document.addEventListener('dragenter', this.handleDragEnter.bind(this));
    document.addEventListener('dragleave', this.handleDragLeave.bind(this));
    document.addEventListener('drop', this.handleDrop.bind(this));

    // Touch events для мобильных устройств
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  handleDragStart(e) {
    const card = e.target.closest('.card');
    if (card) {
      this.draggedItem = card;
      this.dragSource = card.parentNode;
      this.currentColumn = this.dragSource?.parentNode;
      
      // Сохраняем размеры оригинальной карточки
      this.draggedItemRect = card.getBoundingClientRect();
      
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', card.dataset.id);
      
      // Делаем оригинал полупрозрачным
      card.style.opacity = '0.6';
    }
  }

  handleDragEnd(e) {
    if (this.draggedItem) {
      this.cleanupDrag();
    }
  }

  cleanupDrag() {
    if (this.draggedItem) {
      this.draggedItem.classList.remove('dragging');
      this.draggedItem.style.opacity = '1';
    }
    
    // Удаляем ghost элемент
    if (this.ghostElement) {
      this.ghostElement.remove();
      this.ghostElement = null;
    }
    
    // Убираем подсветку
    const columns = document.querySelectorAll('.column');
    if (columns) {
      columns.forEach(col => {
        col.classList.remove('drag-over');
      });
    }
    
    this.draggedItem = null;
    this.dragSource = null;
    this.currentColumn = null;
    this.currentPosition = null;
    this.draggedItemRect = null;
  }

  handleDragOver(e) {
    e.preventDefault();
    if (this.draggedItem) {
      e.dataTransfer.dropEffect = 'move';
      
      // Определяем позицию для вставки
      this.updateDropPosition(e);
    }
  }

  updateDropPosition(e) {
    const cardsContainer = e.target.closest('.cards-container');
    if (!cardsContainer) return;

    const afterElement = this.getDragAfterElement(cardsContainer, e.clientY);
    
    // Удаляем старый ghost элемент
    if (this.ghostElement) {
      this.ghostElement.remove();
      this.ghostElement = null;
    }
    
    // Создаем ghost элемент в размер оригинальной карточки
    this.ghostElement = document.createElement('div');
    this.ghostElement.className = 'ghost-card';
    this.ghostElement.style.width = `${this.draggedItemRect.width}px`;
    this.ghostElement.style.height = `${this.draggedItemRect.height}px`;
    
    // Вставляем ghost элемент с помощью before/after
    if (afterElement) {
      afterElement.before(this.ghostElement);
    } else {
      cardsContainer.append(this.ghostElement);
    }
    
    this.currentPosition = afterElement;
  }

  getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.card:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
      if (!child) return closest;
      
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  handleDragEnter(e) {
    e.preventDefault();
    const column = e.target.closest('.column');
    if (column && this.draggedItem) {
      column.classList.add('drag-over');
      this.currentColumn = column;
    }
  }

  handleDragLeave(e) {
    const column = e.target.closest('.column');
    if (column && this.draggedItem) {
      if (!column.contains(e.relatedTarget)) {
        column.classList.remove('drag-over');
        
        // Удаляем ghost элемент при выходе из колонки
        if (this.ghostElement) {
          this.ghostElement.remove();
          this.ghostElement = null;
        }
      }
    }
  }

  async handleDrop(e) {
    e.preventDefault();
    
    const cardsContainer = e.target.closest('.cards-container');
    if (cardsContainer && this.draggedItem) {
      // Убираем подсветку
      const columns = document.querySelectorAll('.column');
      if (columns) {
        columns.forEach(col => {
          col.classList.remove('drag-over');
        });
      }
      
      // Определяем финальную позицию
      const afterElement = this.currentPosition;
      const cardId = this.draggedItem.dataset.id;
      const cardData = this.cardManager.cards.get(cardId);
      
      // Обновляем данные если колонка изменилась
      const newColumn = cardsContainer.parentNode;
      if (cardData && cardData.column !== newColumn.id) {
        cardData.column = newColumn.id;
        this.cardManager.cards.set(cardId, cardData);
        this.cardManager.saveToStorage();
      }
      
      // Восстанавливаем оригинальный вид перед вставкой
      this.draggedItem.style.opacity = '1';
      this.draggedItem.classList.remove('dragging');
      
      // Вставляем карточку на новое место с помощью before/after
      if (afterElement) {
        afterElement.before(this.draggedItem);
      } else {
        cardsContainer.append(this.draggedItem);
      }
      
      // Анимация появления
      await Animations.slideIn(this.draggedItem);
      
      this.cleanupDrag();
    }
  }

}