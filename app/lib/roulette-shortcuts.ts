export type RouletteShortcut = 'roll' | 'pick';

type ShortcutEvent = {
  key: string;
  repeat: boolean;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
};

export function shortcutFromKey(event: ShortcutEvent): RouletteShortcut | null {
  if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return null;
  const key = event.key.toLowerCase();
  if (key === 'r') return 'roll';
  if (key === 'p') return 'pick';
  return null;
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return target.isContentEditable === true || target.getAttribute('contenteditable') === 'true';
}
