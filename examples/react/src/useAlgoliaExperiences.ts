import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

type UseAlgoliaExperiencesOptions = {
  src: string;
  appId: string;
  apiKey: string;
  experienceId: string;
  env?: string;
};

export function useAlgoliaExperiences({
  src,
  appId,
  apiKey,
  experienceId,
  env,
}: UseAlgoliaExperiencesOptions) {
  const location = useLocation();
  const loaderInjected = useRef(false);

  useEffect(() => {
    if (!loaderInjected.current) {
      const url = new URL(src);
      url.searchParams.set('appId', appId);
      url.searchParams.set('apiKey', apiKey);
      url.searchParams.set('experienceId', experienceId);
      if (env) {
        url.searchParams.set('env', env);
      }

      const script = document.createElement('script');
      script.src = url.toString();
      document.head.appendChild(script);

      loaderInjected.current = true;
    } else {
      window.AlgoliaExperiences?.run();
    }

    return () => {
      window.AlgoliaExperiences?.dispose();
    };
  }, [location.pathname]);
}
