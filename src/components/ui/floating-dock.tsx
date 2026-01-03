/**
 * Floating Dock (Aceternity-inspired), adapted for Vite + plain CSS (no Tailwind).
 * Desktop dock is centered at the top; Mobile dock is top-right with a popdown menu.
 */

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";

import { cn } from "../../lib/utils";

export type FloatingDockItem = { title: string; icon: ReactNode; href: string };

export function FloatingDock({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: FloatingDockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
}) {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
}

function FloatingDockMobile({
  items,
  className,
}: {
  items: FloatingDockItem[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("floating-dock-mobile", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            key="dock-mobile-menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            className="floating-dock-mobile__menu"
            role="menu"
            aria-label="Navigation"
          >
            {items.map((item, idx) => (
              <motion.a
                key={item.title}
                href={item.href}
                role="menuitem"
                className="floating-dock-mobile__item"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, transition: { delay: idx * 0.04 } }}
                transition={{ delay: (items.length - 1 - idx) * 0.04 }}
                onClick={() => setOpen(false)}
                aria-label={item.title}
                title={item.title}
              >
                <span className="floating-dock-mobile__itemIcon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="floating-dock-mobile__itemLabel">{item.title}</span>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="floating-dock-mobile__toggle"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
      >
        <NavbarCollapseIcon className="floating-dock-mobile__toggleIcon" />
      </button>
    </div>
  );
}

function FloatingDockDesktop({
  items,
  className,
}: {
  items: FloatingDockItem[];
  className?: string;
}) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.nav
      aria-label="Primary"
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn("floating-dock-desktop", className)}
    >
      {items.map((item) => (
        <DockIcon mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.nav>
  );
}

function DockIcon({
  mouseX,
  title,
  icon,
  href,
}: {
  mouseX: MotionValue<number>;
  title: string;
  icon: React.ReactNode;
  href: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const size = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const iconSize = useTransform(distance, [-150, 0, 150], [18, 36, 18]);

  const width = useSpring(size, { mass: 0.1, stiffness: 150, damping: 12 });
  const height = useSpring(size, { mass: 0.1, stiffness: 150, damping: 12 });
  const widthIcon = useSpring(iconSize, { mass: 0.1, stiffness: 150, damping: 12 });
  const heightIcon = useSpring(iconSize, { mass: 0.1, stiffness: 150, damping: 12 });

  const [hovered, setHovered] = useState(false);

  return (
    <a href={href} className="floating-dock-desktop__link" aria-label={title} title={title}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="floating-dock-desktop__icon"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              key="tooltip"
              initial={{ opacity: 0, y: 8, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 4, x: "-50%" }}
              className="floating-dock-desktop__tooltip"
              role="tooltip"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div style={{ width: widthIcon, height: heightIcon }} className="floating-dock-desktop__iconInner">
          {icon}
        </motion.div>
      </motion.div>
    </a>
  );
}

function NavbarCollapseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5 1.5 1.5 0 0 1 18.5 8h-13A1.5 1.5 0 0 1 4 6.5Zm0 5A1.5 1.5 0 0 1 5.5 10h13a1.5 1.5 0 0 1 0 3h-13A1.5 1.5 0 0 1 4 11.5Zm0 5A1.5 1.5 0 0 1 5.5 15h7a1.5 1.5 0 0 1 0 3h-7A1.5 1.5 0 0 1 4 16.5Z"
      />
    </svg>
  );
}


