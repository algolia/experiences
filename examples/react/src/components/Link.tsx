import { Link as RouterLink, type LinkProps } from 'react-router-dom';

import { useBasePath } from '../PreviewContext';

export function Link({ to, ...props }: LinkProps) {
  const basePath = useBasePath();
  const resolvedTo =
    typeof to === 'string' && to.startsWith('/') ? `${basePath}${to}` : to;

  return <RouterLink to={resolvedTo} {...props} />;
}
