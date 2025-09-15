import { Animations } from './utils/animations.js';

export class CardManager {
  constructor() {
    this.cards = new Map();
    this.nextId = 1;
    this.init();
  }

  init() {
    this.loadFromStorage();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Кнопки добавления карточек
    document.querySelectorAll('.btn-add').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const columnId = e.target.dataset.column;
        this.showModal(null, columnId);
      });
    });

    // Модальное окно
    document.getElementById('card-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveCard();
    });

    document.querySelector('.close').addEventListener('click', () => {
      this.hideModal();
    });

    document.getElementById('cancel-btn').addEventListener('click', () => {
      this.hideModal();
    });

    // Клик вне модального окна
    window.addEventListener('click', (e) => {
      const modal = document.getElementById('card-modal');
      if (e.target === modal) {
        this.hideModal();
      }
    });

    // Контекстное меню
    document.addEventListener('click', () => {
      this.hideContextMenu();
    });

    document.addEventListener('contextmenu', (e) => {
      const card = e.target.closest('.card');
      if (card) {
        e.preventDefault();
        this.showContextMenu(e, card);
      }
    });

    // Обработчик для кнопок разворачивания текста
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('card-expand-btn')) {
        this.toggleCardText(e.target);
      }
    });
  }

	createCardElement(cardData) {
	  const card = document.createElement('div');
	  card.className = 'card moving';
	  card.draggable = true;
	  card.dataset.id = cardData.id;
	  
	  if (cardData.color && cardData.color !== '#f9f9f9') {
		card.style.background = cardData.color;
		card.style.borderColor = this.adjustColor(cardData.color, -20);
	  }

	  // Форматируем текст с сохранением переносов строк
	  const formattedDescription = this.formatTextWithLineBreaks(cardData.description || '');
	  const shouldTruncate = this.shouldTruncateText(formattedDescription);

	  card.innerHTML = `
		<div class="card-actions">
		  <button class="card-action-btn" data-action="edit" data-id="${cardData.id}">✏️</button>
		  <button class="card-action-btn" data-action="delete" data-id="${cardData.id}">🗑️</button>
		</div>
		<h3>${this.escapeHtml(cardData.title || '')}</h3>
		<div class="card-content ${shouldTruncate ? 'text-clamp' : ''}">
		  <p>${formattedDescription}</p>
		</div>
		${shouldTruncate ? '<button class="card-expand-btn">Развернуть ▼</button>' : ''}
	  `;

	  // Добавляем обработчики для кнопок действий
	  const actionButtons = card.querySelectorAll('.card-action-btn');
	  if (actionButtons) {
		actionButtons.forEach(btn => {
		  if (btn) {
			btn.addEventListener('click', (e) => {
			  e.stopPropagation();
			  const action = btn.dataset.action;
			  const id = btn.dataset.id;
			  
			  switch (action) {
				case 'edit':
				  this.editCard(id);
				  break;
				case 'delete':
				  this.deleteCard(id);
				  break;
			  }
			});
		  }
		});
	  }

	  return card;
	}

  formatTextWithLineBreaks(text) {
    if (!text) return '';
    
    // Сохраняем переносы строк и добавляем HTML разметку
    return this.escapeHtml(text)
      .replace(/\n/g, '<br>')
      .replace(/<br><br>/g, '<br><br>');
  }

  shouldTruncateText(text) {
    // Проверяем, нужно ли обрезать текст (больше 3 строк или длинный текст)
    const lineCount = (text.match(/<br>/g) || []).length + 1;
    return lineCount > 3 || text.length > 150;
  }

  toggleCardText(button) {
    const cardContent = button.previousElementSibling;
    const isExpanded = cardContent.classList.contains('text-expanded');
    
    if (isExpanded) {
      cardContent.classList.remove('text-expanded');
      cardContent.classList.add('text-clamp');
      button.textContent = 'Развернуть ▼';
    } else {
      cardContent.classList.remove('text-clamp');
      cardContent.classList.add('text-expanded');
      button.textContent = 'Свернуть ▲';
    }
  }

  async addCard(cardData) {
    const card = this.createCardElement(cardData);
    const column = document.getElementById(cardData.column);
    const container = column.querySelector('.cards-container');
    
    container.append(card);
    card.classList.add('new-card');
    
    this.cards.set(cardData.id, cardData);
    await Animations.pulse(card);
    card.classList.remove('new-card');
    
    this.saveToStorage();
    return card;
  }

  editCard(cardId) {
    const cardData = this.cards.get(cardId);
    if (cardData) {
      this.showModal(cardData);
    }
  }

  async deleteCard(cardId) {
    const cardElement = document.querySelector(`.card[data-id="${cardId}"]`);
    if (cardElement) {
      cardElement.classList.add('deleting');
      await Animations.slideOut(cardElement);
      cardElement.remove();
      this.cards.delete(cardId);
      this.saveToStorage();
    }
  }

  async duplicateCard(cardId) {
    const original = this.cards.get(cardId);
    if (original) {
      const duplicate = {
        ...original,
        id: this.generateId(),
        title: `${original.title} (копия)`
      };
      await this.addCard(duplicate);
    }
  }

  showModal(cardData = null, columnId = 'todo') {
    const modal = document.getElementById('card-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('card-form');
    
    if (cardData) {
      title.textContent = 'Редактировать карточку';
      document.getElementById('card-id').value = cardData.id;
      document.getElementById('card-column').value = cardData.column;
      document.getElementById('card-title').value = cardData.title;
      document.getElementById('card-description').value = cardData.description;
      document.getElementById('card-color').value = cardData.color || '#f9f9f9';
    } else {
      title.textContent = 'Новая карточка';
      form.reset();
      document.getElementById('card-column').value = columnId;
      document.getElementById('card-color').value = '#f9f9f9';
    }
    
    modal.style.display = 'block';
  }

  hideModal() {
    const modal = document.getElementById('card-modal');
    modal.style.display = 'none';
  }

  saveCard() {
    const form = document.getElementById('card-form');
    const cardData = {
      id: document.getElementById('card-id').value || this.generateId(),
      column: document.getElementById('card-column').value,
      title: document.getElementById('card-title').value,
      description: document.getElementById('card-description').value,
      color: document.getElementById('card-color').value
    };

    if (document.getElementById('card-id').value) {
      // Редактирование существующей карточки
      this.cards.set(cardData.id, cardData);
      this.updateCardElement(cardData);
    } else {
      // Создание новой карточки
      this.addCard(cardData);
    }

    this.hideModal();
  }

  updateCardElement(cardData) {
    const oldCard = document.querySelector(`.card[data-id="${cardData.id}"]`);
    if (oldCard) {
      const newCard = this.createCardElement(cardData);
      oldCard.replaceWith(newCard);
      this.saveToStorage();
    }
  }

  showContextMenu(e, cardElement) {
    const contextMenu = document.getElementById('context-menu');
    const cardId = cardElement.dataset.id;
    
    contextMenu.innerHTML = `
      <ul>
        <li data-action="edit" data-id="${cardId}">✏️ Редактировать</li>
        <li data-action="delete" data-id="${cardId}">🗑️ Удалить</li>
        <li data-action="duplicate" data-id="${cardId}">📋 Дублировать</li>
      </ul>
    `;
    
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.style.top = `${e.pageY}px`;
    
    contextMenu.querySelectorAll('li').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = item.dataset.action;
        const id = item.dataset.id;
        
        switch (action) {
          case 'edit':
            this.editCard(id);
            break;
          case 'delete':
            this.deleteCard(id);
            break;
          case 'duplicate':
            this.duplicateCard(id);
            break;
        }
        
        this.hideContextMenu();
      });
    });
  }

  hideContextMenu() {
    const contextMenu = document.getElementById('context-menu');
    contextMenu.style.display = 'none';
  }

  generateId() {
    return `card-${Date.now()}-${this.nextId++}`;
  }

  saveToStorage() {
    const data = Array.from(this.cards.values());
    localStorage.setItem('dnd-cards', JSON.stringify(data));
  }

  loadFromStorage() {
    const saved = localStorage.getItem('dnd-cards');
    if (saved) {
      const cards = JSON.parse(saved);
      cards.forEach(cardData => {
        this.cards.set(cardData.id, cardData);
        this.addCard(cardData);
      });
    }

    // Инициализируем пустые колонки
    ['todo', 'in-progress', 'done'].forEach(columnId => {
      const column = document.getElementById(columnId);
      if (column && !column.querySelector('.card')) {
        column.querySelector('.cards-container').innerHTML = '';
      }
    });
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => 
      ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2)
    );
  }
}