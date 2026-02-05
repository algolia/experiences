export function loadScript(bundleUrl: string): void {
  const script = document.createElement('script');
  script.src = bundleUrl;
  script.async = true;
  script.onerror = () => {
    console.error(
      new Error(`[@algolia/experiences] Failed to load bundle: ${bundleUrl}`)
    );
  };

  document.head.appendChild(script);
}
