import { createContext, useContext } from 'react';

const PreviewContext = createContext(false);

export const PreviewProvider = PreviewContext.Provider;

export function useBasePath() {
  const isPreview = useContext(PreviewContext);

  return isPreview ? '/preview' : '';
}
