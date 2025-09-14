import Dom from './Dom';

export default class Movement {
  constructor(element) {
    this.element = element;
    this.draggedItem = null;
    this.selectedItem = null;
    this.shiftX = null;
    this.shiftY = null;
    this.changingItem = null;
    this.ghostElement = null;

    this.moveDownListener();
  }

  moveDownListener() {
    this.element.addEventListener('mousedown', this.moveDown.bind(this));
  }

  moveListener() {
    document.addEventListener('mousemove', this.move.bind(this));
  }

  moveUpListener() {
    document.addEventListener('mouseup', this.moveUp.bind(this));
  }

  moveDown(e) {
    if (e.target.closest('.column__card')) {
      e.preventDefault();
      const target = e.target.closest('.column__card');
      this.selectedItem = target;

      // Создаем ghost элемент
      this.createGhostElement(target);

      this.shiftX = e.clientX - target.getBoundingClientRect().left;
      this.shiftY = e.clientY - target.getBoundingClientRect().top;

      this.positionGhostElement(e);
      this.selectedItem.classList.add('column__card_selected');

      this.moveListener();
      this.moveUpListener();
    }
  }

  createGhostElement(target) {
    this.ghostElement = target.cloneNode(true);
    this.ghostElement.classList.add('column__card_dragged');
    this.ghostElement.style.width = `${target.offsetWidth}px`;
    this.ghostElement.style.height = `${target.offsetHeight}px`;
    
    // Убираем кнопку удаления из ghost
    const deleteBtn = this.ghostElement.querySelector('.card__delete');
    if (deleteBtn) {
      deleteBtn.remove();
    }
    
    document.body.appendChild(this.ghostElement);
  }

  positionGhostElement(e) {
    this.ghostElement.style.top = `${e.pageY - this.shiftY}px`;
    this.ghostElement.style.left = `${e.pageX - this.shiftX}px`;
  }

  move(e) {
    if (!this.selectedItem) return;

    this.positionGhostElement(e);

    // Убираем предыдущую зону для вставки
    if (this.changingItem && this.changingItem.classList.contains('column__card')) {
      this.changingItem.style.marginTop = '';
    }

    const x = e.clientX;
    const y = e.clientY;

    // Ищем элемент под курсором
    this.ghostElement.style.visibility = 'hidden';
    this.changingItem = document.elementFromPoint(x, y);
    this.ghostElement.style.visibility = 'visible';

    if (!this.changingItem || this.changingItem === this.ghostElement) return;

    // Создаем зону для вставки
    if (this.changingItem.classList.contains('column__card')) {
      this.changingItem.style.marginTop = `${this.ghostElement.offsetHeight + 10}px`;
    }
  }

  moveUp(e) {
    if (!this.selectedItem) return;

    // Убираем зону для вставки
    if (this.changingItem && this.changingItem.classList.contains('column__card')) {
      this.changingItem.style.marginTop = '';
    }

    // Находим колонку для вставки
    const dropTarget = this.findDropTarget(e);
    if (dropTarget && dropTarget.list) {
      dropTarget.list.appendChild(this.selectedItem);
    }

    this.cleanup();
    Dom.saver();
  }

  findDropTarget(e) {
    const x = e.clientX;
    const y = e.clientY;
    
    this.ghostElement.style.visibility = 'hidden';
    const element = document.elementFromPoint(x, y);
    this.ghostElement.style.visibility = 'visible';

    if (!element) return null;

    // Ищем ближайшую колонку или карточку
    const column = element.closest('.column');
    if (!column) return null;

    const list = column.querySelector('.column__list');
    return { column, list };
  }

  cleanup() {
    this.selectedItem.classList.remove('column__card_selected');
    this.ghostElement.remove();
    
    this.selectedItem = null;
    this.ghostElement = null;
    this.changingItem = null;

    // Убираем обработчики
    document.removeEventListener('mousemove', this.move.bind(this));
    document.removeEventListener('mouseup', this.moveUp.bind(this));
  }
}