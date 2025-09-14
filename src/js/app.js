import Logic from './js/Logic';
import './styles/style.css';

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  new Logic(document.querySelector('.content'));
  console.log('Trello-like board initialized!');
});