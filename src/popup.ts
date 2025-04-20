/// <reference types="chrome"/>
import { DOMUtils } from './utils/dom';

class PopupManager {
  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.setupExpandAllButton();
    this.setupCollapseAllButton();
  }

  private setupExpandAllButton(): void {
    document.getElementById('expandAllBtn')?.addEventListener('click', () => {
      this.executeInActiveTab(() => {
        document.querySelectorAll('[data-message-author-role]').forEach(msg => {
          const content = DOMUtils.getMessageContent(msg as HTMLElement);
          if (content) content.style.display = '';
        });
      });
    });
  }

  private setupCollapseAllButton(): void {
    document.getElementById('collapseAllBtn')?.addEventListener('click', () => {
      this.executeInActiveTab(() => {
        document.querySelectorAll('[data-message-author-role]').forEach(msg => {
          const content = DOMUtils.getMessageContent(msg as HTMLElement);
          if (content) content.style.display = 'none';
        });
      });
    });
  }

  private executeInActiveTab(func: () => void): void {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
      if (tabs[0]?.id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func,
        });
      }
    });
  }
}

// Initialize the popup
new PopupManager();
