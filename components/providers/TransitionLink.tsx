"use client";

import { usePathname, useRouter } from "next/navigation";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { useTransitionNavigate } from "./TransitionProvider";

interface TransitionLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  children: ReactNode;
}

/**
 * Drop-in replacement for next/link on the handful of links that cross a
 * major chapter of the experience (marketing → product, marketing → admin).
 * Same-page clicks just scroll to top instead of replaying the wipe.
 */
export function TransitionLink({ href, children, onClick, ...rest }: TransitionLinkProps) {
  const navigate = useTransitionNavigate();
  const router = useRouter();
  const pathname = usePathname();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (href === pathname) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (href.startsWith("#")) {
      router.push(href);
      return;
    }
    navigate(href);
  }

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
