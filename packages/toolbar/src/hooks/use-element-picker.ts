import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

import { generateSelector } from '../utils/generate-selector';

const TOOLBAR_HOST_ID = 'algolia-experiences-toolbar';

type UseElementPickerReturn = {
  isPicking: boolean;
  startPicking: (onPick: (selector: string) => void) => void;
  cancelPicking: () => void;
};

export function useElementPicker(): UseElementPickerReturn {
  const [isPicking, setIsPicking] = useState(false);
  const callbackRef = useRef<((selector: string) => void) | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const cleanup = useCallback(() => {
    if (overlayRef.current) {
      overlayRef.current.remove();
      overlayRef.current = null;
    }
    document.documentElement.style.removeProperty('cursor');
    callbackRef.current = null;
    setIsPicking(false);
  }, []);

  const startPicking = useCallback((onPick: (selector: string) => void) => {
    callbackRef.current = onPick;
    setIsPicking(true);
    document.documentElement.style.cursor = 'crosshair';
  }, []);

  const cancelPicking = useCallback(() => {
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    if (!isPicking) {
      return;
    }

    function isToolbarElement(el: Element): boolean {
      const host = document.getElementById(TOOLBAR_HOST_ID);

      if (!host) {
        return false;
      }

      if (el === host || host.contains(el)) {
        return true;
      }

      let current: Node | null = el;

      while (current) {
        if (current === host) {
          return true;
        }

        const root = current.getRootNode();

        if (root instanceof ShadowRoot) {
          current = root.host;
        } else {
          break;
        }
      }

      return false;
    }

    function getOrCreateOverlay(): HTMLDivElement {
      if (!overlayRef.current) {
        const div = document.createElement('div');
        div.style.cssText =
          'position:fixed;pointer-events:none;z-index:2147483646;border:2px solid #003dff;background:rgba(0,61,255,0.08);border-radius:4px;transition:top 0.05s,left 0.05s,width 0.05s,height 0.05s';
        document.body.appendChild(div);
        overlayRef.current = div;
      }

      return overlayRef.current;
    }

    function onMouseMove(event: MouseEvent) {
      const target = event.target as Element;

      if (!target || isToolbarElement(target)) {
        return;
      }

      const rect = target.getBoundingClientRect();
      const overlay = getOrCreateOverlay();
      overlay.style.top = `${rect.top}px`;
      overlay.style.left = `${rect.left}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
    }

    function onClick(event: MouseEvent) {
      event.preventDefault();
      event.stopPropagation();

      const target = event.target as Element;

      if (!target || isToolbarElement(target)) {
        return;
      }

      const selector = generateSelector(target);
      callbackRef.current?.(selector);
      cleanup();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        cleanup();
      }
    }

    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      document.removeEventListener('mousemove', onMouseMove, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKeyDown, true);

      cleanup();
    };
  }, [isPicking, cleanup]);

  return { isPicking, startPicking, cancelPicking };
}
