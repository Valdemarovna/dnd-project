export class Animations {
  static slideIn(element, duration = 300) {
    return new Promise((resolve) => {
      element.style.animation = `slideIn ${duration}ms ease-out`;
      setTimeout(() => {
        element.style.animation = '';
        resolve();
      }, duration);
    });
  }

  static slideOut(element, duration = 300) {
    return new Promise((resolve) => {
      element.style.animation = `slideIn ${duration}ms ease-out reverse`;
      setTimeout(() => {
        element.style.animation = '';
        resolve();
      }, duration);
    });
  }

  static pulse(element, duration = 500) {
    return new Promise((resolve) => {
      element.style.animation = `pulse ${duration}ms ease-in-out`;
      setTimeout(() => {
        element.style.animation = '';
        resolve();
      }, duration);
    });
  }

  static shake(element, duration = 600) {
    return new Promise((resolve) => {
      element.style.animation = `shake ${duration}ms ease-in-out`;
      setTimeout(() => {
        element.style.animation = '';
        resolve();
      }, duration);
    });
  }

  static ghostPulse(element, duration = 1000) {
    return new Promise((resolve) => {
      element.style.animation = `pulse ${duration}ms ease-in-out infinite`;
      setTimeout(() => {
        element.style.animation = '';
        resolve();
      }, duration);
    });
  }
// Добавляем в конец файла
static ghostAppear(element, duration = 300) {
  return new Promise((resolve) => {
    element.style.animation = `ghostAppear ${duration}ms ease-out`;
    setTimeout(() => {
      element.style.animation = '';
      resolve();
    }, duration);
  });
}
}

