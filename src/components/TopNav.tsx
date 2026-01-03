import { FloatingDock } from "./ui/floating-dock";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 3.2 2.8 11a1 1 0 0 0-.3 1.1 1 1 0 0 0 1 .7H5v7.2c0 .6.4 1 1 1h4.2v-5.4h3.6V21H18c.6 0 1-.4 1-1v-7.2h1.5a1 1 0 0 0 1-.7 1 1 0 0 0-.3-1.1L12 3.2Z"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4.8a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm1.6 12.6h-3.2a1 1 0 1 1 0-2h.6v-4h-.6a1 1 0 1 1 0-2H13a1 1 0 0 1 1 1v5h.6a1 1 0 1 1 0 2Z"
      />
    </svg>
  );
}

export function TopNav() {
  return (
    <FloatingDock
      items={[
        { title: "Home", icon: <HomeIcon />, href: "#home" },
        { title: "About", icon: <InfoIcon />, href: "#about" },
      ]}
    />
  );
}



