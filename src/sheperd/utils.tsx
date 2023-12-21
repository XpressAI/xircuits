export function findElementByText(selector: string, textToMatch: string): Element | undefined {
    const elements = Array.from(document.querySelectorAll(selector));
    return elements.find(el => el.textContent.trim() === textToMatch);
}
  
export function waitForElement(selector, onFound, onNotFound) {
    const observer = new MutationObserver(mutations => {
        const element = document.querySelector(selector);
        if (element) {
        onFound();
        observer.disconnect();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    if (!document.querySelector(selector) && typeof onNotFound === 'function') {
        onNotFound();
    }
}
  
  
export function waitForNextElement(tour, selector) {
    waitForElement(selector, 
      function() { // onFound
        tour.next();
      }, 
      function() { // onNotFound
        // Handle the case where the element never appears
        // For example, skip the step or show a message
        tour.hide(); // or tour.next() to skip
      }
    );
  }