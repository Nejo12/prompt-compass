export class StorageManager {
  private static readonly LABEL_PREFIX = 'chatgpt-msg-label-';

  static getLabel(index: number): string {
    return localStorage.getItem(`${this.LABEL_PREFIX}${index}`) || '';
  }

  static setLabel(index: number, label: string): void {
    if (label.trim()) {
      localStorage.setItem(`${this.LABEL_PREFIX}${index}`, label);
    } else {
      localStorage.removeItem(`${this.LABEL_PREFIX}${index}`);
    }
  }

  static getAllLabels(): Array<{ index: number; text: string; key: string }> {
    const labels: Array<{ index: number; text: string; key: string }> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.LABEL_PREFIX)) {
        const index = parseInt(key.replace(this.LABEL_PREFIX, ''), 10);
        labels.push({
          index,
          text: localStorage.getItem(key) || '',
          key,
        });
      }
    }
    return labels.sort((a, b) => a.index - b.index);
  }

  static clearLabels(): void {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.LABEL_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  }
}
