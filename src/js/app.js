import '../css/style.css';
import { CardManager } from './CardManager.js';
import { DnDManager } from './DnDManager.js';

class App {
  constructor() {
    this.cardManager = null;
    this.dndManager = null;
    this.init();
  }

  init() {
    // Ждем полной загрузки DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initializeApp();
      });
    } else {
      this.initializeApp();
    }
  }

  initializeApp() {
    try {
      this.cardManager = new CardManager();
      this.dndManager = new DnDManager(this.cardManager);
      
      // Делаем менеджеры доступными глобально
      window.cardManager = this.cardManager;
      window.dndManager = this.dndManager;
      
      console.log('Advanced DnD Board initialized successfully!');
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }
}

// Инициализация приложения
new App();