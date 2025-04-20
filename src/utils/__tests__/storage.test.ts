/// <reference types="jest" />
import { StorageManager } from '../storage';

describe('StorageManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getLabel', () => {
    it('should return empty string when label does not exist', () => {
      expect(StorageManager.getLabel(0)).toBe('');
    });

    it('should return the stored label', () => {
      localStorage.setItem('chatgpt-msg-label-0', 'test label');
      expect(StorageManager.getLabel(0)).toBe('test label');
    });
  });

  describe('setLabel', () => {
    it('should store a label', () => {
      StorageManager.setLabel(0, 'test label');
      expect(localStorage.getItem('chatgpt-msg-label-0')).toBe('test label');
    });

    it('should remove label when empty string is provided', () => {
      localStorage.setItem('chatgpt-msg-label-0', 'test label');
      StorageManager.setLabel(0, '');
      expect(localStorage.getItem('chatgpt-msg-label-0')).toBeNull();
    });

    it('should remove label when whitespace string is provided', () => {
      localStorage.setItem('chatgpt-msg-label-0', 'test label');
      StorageManager.setLabel(0, '   ');
      expect(localStorage.getItem('chatgpt-msg-label-0')).toBeNull();
    });
  });

  describe('getAllLabels', () => {
    it('should return empty array when no labels exist', () => {
      expect(StorageManager.getAllLabels()).toEqual([]);
    });

    it('should return all labels in sorted order', () => {
      localStorage.setItem('chatgpt-msg-label-1', 'label 1');
      localStorage.setItem('chatgpt-msg-label-0', 'label 0');
      localStorage.setItem('chatgpt-msg-label-2', 'label 2');

      const labels = StorageManager.getAllLabels();
      expect(labels).toHaveLength(3);
      expect(labels[0].index).toBe(0);
      expect(labels[1].index).toBe(1);
      expect(labels[2].index).toBe(2);
    });

    it('should ignore non-label items in localStorage', () => {
      localStorage.setItem('other-key', 'value');
      localStorage.setItem('chatgpt-msg-label-0', 'label 0');
      expect(StorageManager.getAllLabels()).toHaveLength(1);
    });
  });

  describe('clearLabels', () => {
    it('should remove all labels', () => {
      localStorage.setItem('chatgpt-msg-label-0', 'label 0');
      localStorage.setItem('chatgpt-msg-label-1', 'label 1');
      localStorage.setItem('other-key', 'value');

      StorageManager.clearLabels();

      expect(localStorage.getItem('chatgpt-msg-label-0')).toBeNull();
      expect(localStorage.getItem('chatgpt-msg-label-1')).toBeNull();
      expect(localStorage.getItem('other-key')).toBe('value');
    });
  });
});
