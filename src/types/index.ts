export interface Message {
  element: HTMLElement;
  content: HTMLElement | null;
  index: number;
  label: string;
}

export interface ControlButton {
  symbol: string;
  title: string;
  onClick: () => void;
}

export interface IndexPopup {
  element: HTMLElement;
  update: () => void;
  show: () => void;
  hide: () => void;
}
