let promise = null;

// Loads the same three.js build the original scene was designed with.
export function loadThree() {
  if (window.THREE) return Promise.resolve();
  if (!promise) {
    promise = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      s.onload = () => resolve();
      s.onerror = () => resolve();
      document.head.appendChild(s);
    });
  }
  return promise;
}