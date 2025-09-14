import Dom from './Dom';
import Movement from './Movement';

export default class Logic {
  constructor(element) {
    this.element = element;
    this.moveControl = new Movement(this.element);

    Logic.start();
    this.addEventListeners();
  }

  static start() {
    if (localStorage.length) {
      Dom.renderSavedCards();
    }
  }

  addEventListeners() {
    this.element.addEventListener('click', this.handleClick.bind(this));
    this.element.addEventListener('mouseover', this.handleMouseOver.bind(this));
    this.element.addEventListener('mouseout', this.handleMouseOut.bind(this));
    
    // Обработка отправки формы по Enter
    this.element.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  handleClick(e) {
    // Меню добавления карточки
    if (e.target.classList.contains('column__add-element') || 
        e.target.classList.contains('form__remove')) {
      e.preventDefault();
      Dom.renderAddCardMenu(e);
      return;
    }
    
    // Добавление карточки
    if (e.target.classList.contains('form__submit')) {
      Dom.renderNewCard(e);
      return;
    }
    
    // Удаление карточки
    if (e.target.classList.contains('card__delete')) {
      e.preventDefault();
      Dom.deleteCard(e);
    }
  }

  handleMouseOver(e) {
    if (e.target.closest('.column__card')) {
      Dom.renderCross(e);
    }
  }

  handleMouseOut(e) {
    if (e.target.closest('.column__card')) {
      Dom.hideCross(e);
    }
  }

  handleKeyDown(e) {
    // Отправка формы по Enter (но не Shift+Enter)
    if (e.target.classList.contains('form__field') && 
        e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.target.closest('.form');
      const submitBtn = form.querySelector('.form__submit');
      submitBtn.click();
    }
    
    // Закрытие формы по Escape
    if (e.key === 'Escape' && e.target.classList.contains('form__field')) {
      const formBox = e.target.closest('.form__box');
      formBox.classList.remove('active');
    }
  }
}