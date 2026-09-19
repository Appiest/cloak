export function FaceCount({ className = "" }: { className?: string }) {
  return <p className={`type-osd absolute bottom-6 left-6 bg-redacted/80 px-2 py-1.5 text-mark ${className}`}>Faces found: 0</p>;
}
