import { describe, it, expect } from 'vitest';
import { isEditableTarget, shortcutFromKey } from '../roulette-shortcuts';

const base = { repeat: false, metaKey: false, ctrlKey: false, altKey: false };

describe('roulette shortcuts', () => {
  it('maps R and P without caring about case', () => {
    expect(shortcutFromKey({ ...base, key: 'r' })).toBe('roll');
    expect(shortcutFromKey({ ...base, key: 'R' })).toBe('roll');
    expect(shortcutFromKey({ ...base, key: 'p' })).toBe('pick');
    expect(shortcutFromKey({ ...base, key: 'P' })).toBe('pick');
  });

  it('ignores other keys, repeats, and modifier chords', () => {
    expect(shortcutFromKey({ ...base, key: 'Enter' })).toBeNull();
    expect(shortcutFromKey({ ...base, key: 'r', repeat: true })).toBeNull();
    expect(shortcutFromKey({ ...base, key: 'r', metaKey: true })).toBeNull();
    expect(shortcutFromKey({ ...base, key: 'p', ctrlKey: true })).toBeNull();
    expect(shortcutFromKey({ ...base, key: 'p', altKey: true })).toBeNull();
  });

  it('treats form fields as editable and buttons as not', () => {
    expect(isEditableTarget(null)).toBe(false);
    const input = document.createElement('input');
    const textarea = document.createElement('textarea');
    const select = document.createElement('select');
    const button = document.createElement('button');
    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    expect(isEditableTarget(input)).toBe(true);
    expect(isEditableTarget(textarea)).toBe(true);
    expect(isEditableTarget(select)).toBe(true);
    expect(isEditableTarget(editable)).toBe(true);
    expect(isEditableTarget(button)).toBe(false);
  });
});
