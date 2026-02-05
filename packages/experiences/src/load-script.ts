export function loadScript(bundleUrl: string): void {
  const script = document.createElement('script');
  script.src = bundleUrl;
  script.async = true;

  document.head.appendChild(script);
}
