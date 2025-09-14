class DnD {
    constructor() {
        this.draggedItem = null;
        this.placeholder = null;
        this.currentColumn = null;
        this.nextId = 5;
        this.editingCard = null;
        
        this.init();
    }
    
    init() {
        this.createPlaceholder();
        this.bindEvents();
        this.loadState();
    }
    
    createPlaceholder() {
        this.placeholder = document.createElement('div');
        this.placeholder.className = 'card-placeholder';
        this.placeholder.style.display = 'none';
        document.body.appendChild(this.placeholder);
    }
    
    bindEvents() {
        // События для карточек
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('card')) {
                this.handleDragStart(e);
            }
        });
        
        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('card')) {
                this.handleDragEnd(e);
            }
        });
        
        // События для колонок
        document.addEventListener('dragover', (e) => {
            if (e.target.closest('.column') || e.target.closest('.card')) {
                this.handleDragOver(e);
            }
        });
        
        document.addEventListener('dragenter', (e) => {
            if (e.target.closest('.column')) {
                this.handleDragEnter(e);
            }
        });
        
        document.addEventListener('dragleave', (e) => {
            if (e.target.closest('.column')) {
                this.handleDragLeave(e);
            }
        });
        
        document.addEventListener('drop', (e) => {
            if (e.target.closest('.column') || e.target.closest('.card')) {
                this.handleDrop(e);
            }
        });
        
        // Кнопки добавления карточек
        document.querySelectorAll('.add-card-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const column = e.target.dataset.column;
                this.showModal(null, column);
            });
        });
        
        // Кнопки редактирования
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-card-btn')) {
                const card = e.target.closest('.card');
                this.showModal(card);
            }
            
            // Кнопки удаления
            if (e.target.classList.contains('delete-card-btn')) {
                const card = e.target.closest('.card');
                this.deleteCard(card);
            }
        });
        
        // Модальное окно
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideModal();
        });
        
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveCard();
        });
        
        // Закрытие модального окна по клику вне его
        document.getElementById('cardModal').addEventListener('click', (e) => {
            if (e.target.id === 'cardModal') {
                this.hideModal();
            }
        });
    }
    
    // Добавляем метод для удаления карточки
    deleteCard(card) {
        if (card && confirm('Вы уверены, что хотите удалить эту задачу?')) {
            card.remove();
            this.saveState();
        }
    }
    
    handleDragStart(e) {
        this.draggedItem = e.target;
        this.currentColumn = this.draggedItem.closest('.column');
        
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.draggedItem.dataset.id);
        
        this.draggedItem.classList.add('dragging');
        
        setTimeout(() => {
            this.draggedItem.style.display = 'none';
        }, 0);
    }
    
    handleDragEnd(e) {
        this.draggedItem.classList.remove('dragging');
        this.draggedItem.style.display = 'flex';
        
        // Убираем стили с колонок
        document.querySelectorAll('.column').forEach(col => {
            col.classList.remove('drag-over');
            col.style.backgroundColor = '';
        });
        
        this.hidePlaceholder();
        this.draggedItem = null;
        this.currentColumn = null;
        this.saveState();
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const column = e.target.closest('.column');
        if (!column) return;
        
        const afterElement = this.getDragAfterElement(column, e.clientY);
        this.showPlaceholderAtPosition(column, afterElement);
    }
    
    handleDragEnter(e) {
        const column = e.target.closest('.column');
        if (column && column !== this.currentColumn) {
            column.classList.add('drag-over');
        }
    }
    
    handleDragLeave(e) {
        const column = e.target.closest('.column');
        if (column && column !== this.currentColumn && 
            !e.relatedTarget?.closest('.column')) {
            column.classList.remove('drag-over');
        }
    }
    
    handleDrop(e) {
        e.preventDefault();
        
        const column = e.target.closest('.column');
        if (!column || !this.draggedItem) return;
        
        column.classList.remove('drag-over');
        
        const afterElement = this.getDragAfterElement(column, e.clientY);
        const container = column.querySelector('.cards-container');
        
        if (afterElement) {
            container.insertBefore(this.draggedItem, afterElement);
        } else {
            container.appendChild(this.draggedItem);
        }
        
        this.hidePlaceholder();
        this.saveState();
    }
    
    getDragAfterElement(column, y) {
        const cards = column.querySelectorAll('.card:not(.dragging)');
        return Array.from(cards).reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    showPlaceholderAtPosition(column, afterElement) {
        const container = column.querySelector('.cards-container');
        this.placeholder.style.display = 'block';
        this.placeholder.style.width = '100%';
        this.placeholder.style.height = '60px';
        
        if (afterElement) {
            container.insertBefore(this.placeholder, afterElement);
        } else {
            container.appendChild(this.placeholder);
        }
    }
    
    hidePlaceholder() {
        this.placeholder.style.display = 'none';
        if (this.placeholder.parentNode) {
            this.placeholder.parentNode.removeChild(this.placeholder);
        }
    }
    
    showModal(card, column = null) {
        this.editingCard = card;
        const modal = document.getElementById('cardModal');
        const title = document.getElementById('modalTitle');
        const textarea = document.getElementById('cardText');
        
        if (card) {
            title.textContent = 'Редактировать задачу';
            textarea.value = card.querySelector('.card-content').textContent;
        } else {
            title.textContent = 'Добавить задачу';
            textarea.value = '';
            this.currentColumnForNew = column;
        }
        
        modal.style.display = 'block';
        textarea.focus();
    }
    
    hideModal() {
        document.getElementById('cardModal').style.display = 'none';
        this.editingCard = null;
        this.currentColumnForNew = null;
    }
    
    saveCard() {
        const text = document.getElementById('cardText').value.trim();
        if (!text) return;
        
        if (this.editingCard) {
            // Редактирование существующей карточки
            this.editingCard.querySelector('.card-content').textContent = text;
        } else {
            // Добавление новой карточки
            this.addCard(this.currentColumnForNew, text);
        }
        
        this.hideModal();
        this.saveState();
    }
    
    addCard(columnName, text) {
        const column = document.querySelector(`[data-column="${columnName}"] .cards-container`);
        if (!column) return;
        
        const card = document.createElement('div');
        card.className = 'card';
        card.draggable = true;
        card.dataset.id = this.nextId++;
        
        const content = document.createElement('div');
        content.className = 'card-content';
        content.textContent = text;
        
        const actions = document.createElement('div');
        actions.className = 'card-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-card-btn';
        editBtn.textContent = '✏️';
        editBtn.title = 'Редактировать';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-card-btn';
        deleteBtn.title = 'Удалить';
        
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        
        card.appendChild(content);
        card.appendChild(actions);
        column.appendChild(card);
    }
    
    saveState() {
        const state = {
            columns: {},
            nextId: this.nextId
        };
        
        document.querySelectorAll('.column').forEach(column => {
            const columnName = column.dataset.column;
            state.columns[columnName] = Array.from(column.querySelectorAll('.card')).map(card => ({
                id: card.dataset.id,
                content: card.querySelector('.card-content').textContent
            }));
        });
        
        localStorage.setItem('dnd-state', JSON.stringify(state));
    }
    
    loadState() {
        const saved = localStorage.getItem('dnd-state');
        if (!saved) return;
        
        try {
            const state = JSON.parse(saved);
            this.nextId = state.nextId || 5;
            
            Object.entries(state.columns).forEach(([columnName, cards]) => {
                const column = document.querySelector(`[data-column="${columnName}"] .cards-container`);
                if (column) {
                    column.innerHTML = '';
                    
                    cards.forEach(cardData => {
                        const card = document.createElement('div');
                        card.className = 'card';
                        card.draggable = true;
                        card.dataset.id = cardData.id;
                        
                        const content = document.createElement('div');
                        content.className = 'card-content';
                        content.textContent = cardData.content;
                        
                        const actions = document.createElement('div');
                        actions.className = 'card-actions';
                        
                        const editBtn = document.createElement('button');
                        editBtn.className = 'edit-card-btn';
                        editBtn.textContent = '✏️';
                        editBtn.title = 'Редактировать';
                        
                        const deleteBtn = document.createElement('button');
                        deleteBtn.className = 'delete-card-btn';
                        deleteBtn.title = 'Удалить';
                        
                        actions.appendChild(editBtn);
                        actions.appendChild(deleteBtn);
                        
                        card.appendChild(content);
                        card.appendChild(actions);
                        column.appendChild(card);
                    });
                }
            });
        } catch (error) {
            console.error('Error loading state:', error);
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new DnD();
});