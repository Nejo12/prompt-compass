import { Message, IndexPopup } from './types';
import { DOMUtils } from './utils/dom';
import { StorageManager } from './utils/storage';

class PromptCompass {
  private indexPopup: IndexPopup;
  private messages: Message[] = [];

  constructor() {
    this.indexPopup = this.createIndexPopup();
    this.initialize();
  }

  private createIndexPopup(): IndexPopup {
    const popup = document.createElement('div');
    Object.assign(popup.style, {
      position: 'fixed',
      top: '50px',
      right: '20px',
      background: 'rgba(32, 33, 35, 0.95)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      zIndex: '9999',
      maxHeight: '70vh',
      overflowY: 'auto',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      border: '1px solid #555',
      display: 'none',
      width: '300px',
    });
    document.body.appendChild(popup);

    return {
      element: popup,
      update: (): void => this.updateIndexOverview(),
      show: (): void => {
        popup.style.display = 'block';
        this.updateIndexOverview();
      },
      hide: (): void => {
        popup.style.display = 'none';
      },
    };
  }

  private initialize(): void {
    this.setupMessageObserver();
    this.addControlsToMessages();
  }

  private setupMessageObserver(): void {
    const observer = new MutationObserver(() => {
      this.addControlsToMessages();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private addControlsToMessages(): void {
    const messages = document.querySelectorAll('[data-message-author-role]');
    messages.forEach((msg, index) => {
      if (msg.classList.contains('toggle-processed')) return;

      const content = DOMUtils.getMessageContent(msg as HTMLElement);
      if (!content) return;

      const controlRow = this.createControlRow(msg as HTMLElement, index, content);
      msg.appendChild(controlRow);
      msg.classList.add('toggle-processed');
    });
  }

  private createControlRow(message: HTMLElement, index: number, content: HTMLElement): HTMLElement {
    const controlRow = document.createElement('div');
    controlRow.className = 'chatgpt-control-row';
    Object.assign(controlRow.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      marginTop: '6px',
    });

    const buttons = [
      {
        symbol: '▼',
        title: 'Collapse this message',
        onClick: (): void => this.toggleMessage(content),
      },
      {
        symbol: '☰',
        title: 'Show message index',
        onClick: (): void => this.toggleIndexPopup(),
      },
      {
        symbol: '🡅',
        title: 'Scroll to top',
        onClick: (): void => DOMUtils.scrollToElement(message, 'start'),
      },
      {
        symbol: '🡄',
        title: 'Previous message',
        onClick: (): void => this.navigateMessage(index, 'prev'),
      },
      {
        symbol: '🡆',
        title: 'Next message',
        onClick: (): void => this.navigateMessage(index, 'next'),
      },
    ];

    buttons.forEach(button => {
      controlRow.appendChild(DOMUtils.createButton(button));
    });

    const topicInput = DOMUtils.createTopicInput(index, (value: string): void => {
      StorageManager.setLabel(index, value);
      this.indexPopup.update();
    });

    controlRow.appendChild(topicInput);
    return controlRow;
  }

  private toggleMessage(content: HTMLElement): void {
    const isHidden = content.style.display === 'none';
    content.style.display = isHidden ? '' : 'none';
  }

  private toggleIndexPopup(): void {
    if (this.indexPopup.element.style.display === 'none') {
      this.indexPopup.show();
    } else {
      this.indexPopup.hide();
    }
  }

  private navigateMessage(currentIndex: number, direction: 'prev' | 'next'): void {
    const controls = Array.from(document.querySelectorAll('.chatgpt-control-row'));
    const targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex >= 0 && targetIndex < controls.length) {
      DOMUtils.scrollToElement(controls[targetIndex].parentElement as HTMLElement);
    }
  }

  private updateIndexOverview(): void {
    const popup = this.indexPopup.element;
    popup.textContent = '';

    const title = document.createElement('h3');
    title.textContent = '🧭 Prompt Compass 🎴';
    title.style.marginTop = '0';
    popup.appendChild(title);

    const btnRow = this.createIndexButtons();
    popup.appendChild(btnRow);

    const folderTitle = document.createElement('h4');
    folderTitle.textContent = `🗂️ ${DOMUtils.getCurrentThreadId()}`;
    Object.assign(folderTitle.style, {
      margin: '8px 0',
      fontWeight: 'bold',
      fontSize: '14px',
    });
    popup.appendChild(folderTitle);

    const list = this.createLabelsList();
    popup.appendChild(list);
  }

  private createIndexButtons(): HTMLElement {
    const btnRow = document.createElement('div');
    Object.assign(btnRow.style, {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px',
    });

    const expandBtn = DOMUtils.createButton({
      symbol: 'Expand All',
      title: 'Expand all messages',
      onClick: (): void => this.expandAllMessages(),
    });

    const collapseBtn = DOMUtils.createButton({
      symbol: 'Collapse All',
      title: 'Collapse all messages',
      onClick: (): void => this.collapseAllMessages(),
    });

    btnRow.appendChild(expandBtn);
    btnRow.appendChild(collapseBtn);
    return btnRow;
  }

  private createLabelsList(): HTMLElement {
    const list = document.createElement('div');
    list.style.borderTop = '1px solid #444';

    const labels = StorageManager.getAllLabels();
    if (labels.length === 0) {
      const noLabel = document.createElement('p');
      noLabel.textContent = 'No labels added yet';
      noLabel.style.color = '#999';
      noLabel.style.fontStyle = 'italic';
      list.appendChild(noLabel);
    } else {
      labels.forEach(label => {
        const item = this.createLabelItem(label);
        list.appendChild(item);
      });
    }

    return list;
  }

  private createLabelItem(label: { index: number; text: string; key: string }): HTMLElement {
    const item = document.createElement('div');
    Object.assign(item.style, {
      padding: '5px',
      margin: '4px 0',
      borderBottom: '1px solid #444',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    });

    const labelText = document.createElement('span');
    labelText.textContent = label.text || `Message ${label.index + 1}`;
    labelText.style.cursor = 'pointer';
    labelText.onclick = (): void => {
      const messages = document.querySelectorAll('[data-message-author-role]');
      if (messages[label.index]) {
        DOMUtils.scrollToElement(messages[label.index] as HTMLElement);
      }
    };

    const removeBtn = DOMUtils.createButton({
      symbol: '×',
      title: 'Remove label',
      onClick: (): void => {
        StorageManager.setLabel(label.index, '');
        this.indexPopup.update();
      },
    });

    item.appendChild(labelText);
    item.appendChild(removeBtn);
    return item;
  }

  private expandAllMessages(): void {
    document.querySelectorAll('[data-message-author-role]').forEach(msg => {
      const content = DOMUtils.getMessageContent(msg as HTMLElement);
      if (content) content.style.display = '';
    });
  }

  private collapseAllMessages(): void {
    document.querySelectorAll('[data-message-author-role]').forEach(msg => {
      const content = DOMUtils.getMessageContent(msg as HTMLElement);
      if (content) content.style.display = 'none';
    });
  }
}

// Initialize the extension
new PromptCompass();
