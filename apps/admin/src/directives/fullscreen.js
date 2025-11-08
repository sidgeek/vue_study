const fullscreenDirective = {
  mounted(el) {
    const button = document.createElement('button');
    button.innerText = 'Fullscreen';
    button.style.position = 'absolute';
    button.style.top = '10px';
    button.style.right = '10px';
    el.style.position = 'relative';
    el.appendChild(button);

    button.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        el.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  },
};

export default fullscreenDirective;