export function findElementByText(selector: string, textToMatch: string): Element | undefined {
    const elements = Array.from(document.querySelectorAll(selector));
    return elements.find(el => el.textContent.trim() === textToMatch);
}
