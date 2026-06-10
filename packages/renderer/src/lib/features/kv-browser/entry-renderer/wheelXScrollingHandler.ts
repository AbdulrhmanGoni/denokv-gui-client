export function wheelXScrollingHandler(e: WheelEvent) {
  if (e.deltaY === 0) return;
  const container = e.currentTarget as HTMLDivElement;
  if (container.scrollWidth > container.clientWidth) {
    container.scrollBy({
      left: e.deltaY,
      behavior: "smooth",
    });
    e.preventDefault();
  }
}
