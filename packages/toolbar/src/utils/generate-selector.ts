const TOOLBAR_HOST_ID = 'algolia-experiences-toolbar';

export function generateSelector(element: Element): string {
  if (element.id && element.id !== TOOLBAR_HOST_ID) {
    return `#${escapeId(element.id)}`;
  }

  const parts: string[] = [];
  let current: Element | null = element;

  while (current && current !== document.documentElement) {
    if (current !== element && current.id && current.id !== TOOLBAR_HOST_ID) {
      parts.unshift(`#${escapeId(current.id)}`);
      break;
    }

    const part = buildPart(current);
    parts.unshift(part);

    if (parts.length > 1) {
      const candidate = parts.join(' > ');
      if (isUnique(candidate)) {
        return candidate;
      }
    }

    current = current.parentElement;
  }

  const selector = parts.join(' > ');
  if (!isUnique(selector)) {
    parts[parts.length - 1] = buildNthPart(element);
    return parts.join(' > ');
  }

  return selector;
}

function buildPart(element: Element): string {
  const tag = element.tagName.toLowerCase();

  const classSelector = buildClassSelector(element);
  if (classSelector) {
    return classSelector;
  }

  const parent = element.parentElement;
  if (parent) {
    const siblings = Array.from(parent.children).filter(
      (child) => child.tagName === element.tagName
    );
    if (siblings.length > 1) {
      const index = siblings.indexOf(element) + 1;
      return `${tag}:nth-of-type(${index})`;
    }
  }

  return tag;
}

function buildNthPart(element: Element): string {
  const tag = element.tagName.toLowerCase();
  const parent = element.parentElement;

  if (parent) {
    const siblings = Array.from(parent.children).filter(
      (child) => child.tagName === element.tagName
    );
    if (siblings.length > 1) {
      const index = siblings.indexOf(element) + 1;
      return `${tag}:nth-of-type(${index})`;
    }
  }

  return tag;
}

function buildClassSelector(element: Element): string | null {
  if (element.classList.length === 0) {
    return null;
  }

  const tag = element.tagName.toLowerCase();
  const className = Array.from(element.classList).find(
    (cls) => cls.length > 1 && !/^[\d_]/.test(cls)
  );

  if (!className) {
    return null;
  }

  return `${tag}.${escapeId(className)}`;
}

function escapeId(id: string): string {
  if (typeof CSS !== 'undefined' && CSS.escape) {
    return CSS.escape(id);
  }
  return id.replace(/([ #.,:[\]()>+~'"!@$%^&*={}`|\\/?])/g, '\\$1');
}

function isUnique(selector: string): boolean {
  try {
    return document.querySelectorAll(selector).length === 1;
  } catch {
    return false;
  }
}
