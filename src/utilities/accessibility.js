const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG']);

const HOVER_TARGET_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  '[role="button"]',
  '[role="link"]',
  '[role="tab"]',
  '[role="listitem"]',
  '[role="region"]',
  '[aria-label]',
  'label',
  'h1',
  'h2',
  'h3',
  'h4',
].join(', ');

export function getAccessibleName(element) {
  if (!element || SKIP_TAGS.has(element.tagName)) return '';

  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelNode = document.getElementById(labelledBy);
    if (labelNode?.textContent?.trim()) {
      return labelNode.textContent.trim();
    }
  }

  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel?.trim()) return ariaLabel.trim();

  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
    const placeholder = element.getAttribute('placeholder');
    if (placeholder?.trim()) return placeholder.trim();

    const associatedLabel = element.labels?.[0]?.textContent?.trim();
    if (associatedLabel) return associatedLabel;
  }

  if (element.tagName === 'IMG') {
    return element.getAttribute('alt') || 'Image';
  }

  const text = element.textContent?.replace(/\s+/g, ' ').trim();
  if (text) return text.slice(0, 140);

  return '';
}

export function findHoverTarget(node) {
  if (!(node instanceof HTMLElement)) return null;
  if (node.closest('.assist-toggle, .sr-only, [aria-live]')) return null;

  const match = node.closest(HOVER_TARGET_SELECTOR);
  if (match) return match;

  if (node.closest('#main-content, .navbar-pw, .nav-mobile-menu')) {
    const name = getAccessibleName(node);
    if (name) return node;
  }

  return null;
}

export function getActivationMessage(element) {
  const name = getAccessibleName(element);
  if (!name) return '';

  if (element.tagName === 'A') {
    return `Opening ${name}.`;
  }

  if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
    return `Activated ${name}.`;
  }

  return name;
}

export function getHoverMessage(element) {
  const name = getAccessibleName(element);
  if (!name) return '';

  if (element.tagName === 'A') {
    return `Link: ${name}.`;
  }

  if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
    return `Button: ${name}.`;
  }

  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
    return `Field: ${name}.`;
  }

  return name;
}
