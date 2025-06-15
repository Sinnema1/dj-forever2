// TODO: Implement smooth scroll utility or use a library like react-scroll

// Smooth scroll utility (placeholder)
export function smoothScroll(targetId: string) {
  const el = document.getElementById(targetId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}
