export let lowPowerMode = false;

export function setLowPowerMode(value) {
  lowPowerMode = value;

  if (value) {
    document.body.classList.add('low-powered-mode');
  } else {
    document.body.classList.remove('low-powered-mode');
  }
}