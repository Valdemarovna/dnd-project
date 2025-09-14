export default class Dom {
  static renderSavedCards() {
    const lists = document.getElementsByClassName('column__list');
    for (const list of [...lists]) {
      const columnName = list.closest('.column').classList[1];
      const savedData = JSON.parse(localStorage.getItem(columnName));
      if (savedData) {
        for (const el of savedData) {
          Dom.createCard(list, el);
        }
      }
    }
  }

  static createCard(list, text) {
    const newCard = document.createElement('li');
    newCard.classList.add('column__card');
    newCard.setAttribute('draggable', 'true');
    
    const textOfCard = document.createElement('span');
    textOfCard.textContent = text;
    
    const cross = document.createElement('button');
    cross.classList.add('button', 'card__delete');
    cross.textContent = '✖';
    
    list.appendChild(newCard);
    newCard.appendChild(textOfCard);
    newCard.appendChild(cross);
    
    return newCard;
  }

  static saver() {
    localStorage.clear();
    const lists = document.getElementsByClassName('column__list');
    for (const list of [...lists]) {
      const columnName = list.closest('.column').classList[1];
      const cards = list.getElementsByClassName('column__card');
      const savedData = [];
      for (const card of cards) {
        const data = card.firstChild.textContent;
        savedData.push(data);
      }
      localStorage.setItem(`${columnName}`, JSON.stringify(savedData));
    }
  }

  static renderAddCardMenu(e) {
    const column = e.target.closest('.column');
    const formBox = column.querySelector('.form__box');
    const formfield = formBox.querySelector('.form__field');
    formfield.value = '';
    formBox.classList.toggle('active');
    
    // Фокусируемся на текстовом поле
    if (formBox.classList.contains('active')) {
      setTimeout(() => formfield.focus(), 100);
    }
  }

  static renderNewCard(e) {
    e.preventDefault();
    const column = e.target.closest('.column');
    const text = column.querySelector('.form__field').value.trim();
    
    if (!text) return;
    
    const list = column.querySelector('.column__list');
    Dom.createCard(list, text);
    Dom.renderAddCardMenu(e);
    Dom.saver();
  }

  static renderCross(e) {
    const card = e.target.closest('.column__card');
    if (card) {
      const cross = card.querySelector('.card__delete');
      if (cross) {
        cross.classList.add('active');
      }
    }
  }

  static hideCross(e) {
    const card = e.target.closest('.column__card');
    if (card) {
      const cross = card.querySelector('.card__delete');
      if (cross && !e.relatedTarget?.closest('.column__card')) {
        cross.classList.remove('active');
      }
    }
  }

  static deleteCard(e) {
    const card = e.target.closest('.column__card');
    if (card) {
      card.remove();
      Dom.saver();
    }
  }
}