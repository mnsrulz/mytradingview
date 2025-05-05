import Link from 'next/link';
import type { LinkProps } from 'next/link';

const OriginalLink = Link;

Object.defineProperty(Link, 'default', {
  configurable: true,
  writable: true,
  value: (props: LinkProps) => {
    return <OriginalLink {...props} prefetch={props.prefetch ?? false} />;
  },
});