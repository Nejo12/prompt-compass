import { ControlButton } from '../types';

export class DOMUtils {
  static getCurrentThreadId(): string {
    const navTitle = document.querySelector('nav a[aria-current="page"] div[title]');
    return navTitle?.getAttribute('title')?.trim() || ' | Add topics then click to jump';
  }

  static createButton({ symbol, title, onClick }: ControlButton): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.textContent = symbol;
    btn.title = title;
    btn.style.cssText = this.getBaseButtonStyle();
    btn.onclick = onClick;
    return btn;
  }

  static getBaseButtonStyle(): string {
    return 'cursor:pointer; background:#222; color:#fff; border:1px solid #555; border-radius:4px; padding:2px 6px; font-size:12px';
  }

  static createTopicInput(index: number, onInput: (value: string) => void): HTMLInputElement {
    const input = document.createElement('input');
    input.placeholder = 'Add topic...';
    Object.assign(input.style, {
      flexGrow: '1',
      fontSize: '12px',
      padding: '2px 4px',
      border: '1px solid #555',
      borderRadius: '4px',
      color: '#fff',
      background: 'rgba(32, 33, 35, 0.5)',
    });
    input.value = localStorage.getItem(`chatgpt-msg-label-${index}`) || '';
    input.oninput = (): void => onInput(input.value);
    return input;
  }

  static getMessageContent(message: HTMLElement): HTMLElement | null {
    return message.querySelector('.markdown, .whitespace-pre-wrap, .text-message');
  }

  static scrollToElement(element: HTMLElement, block: ScrollLogicalPosition = 'center'): void {
    element.scrollIntoView({ behavior: 'smooth', block });
  }
}
