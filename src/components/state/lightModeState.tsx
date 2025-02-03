export let lightMode = localStorage.getItem('xircuits-light-mode') === 'true';
if (lightMode) {
  document.body.classList.add('light-mode');
}

export function setLightMode(value) {
  lightMode = value;
  localStorage.setItem('xircuits-light-mode', value);

  if (value) {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }
}