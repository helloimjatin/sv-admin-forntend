export function MaterialIcon({ name, className = "", size = 24 }: { name: string; className?: string; size?: number }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontSize: size, lineHeight: 1 }}
      aria-hidden
    >
      {name}
    </span>
  );
}
