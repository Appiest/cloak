type BracketsProps = { arm?: number; weight?: number; inset?: string };

const corners = [
  "left-0 top-0 border-l border-t",
  "right-0 top-0 border-r border-t",
  "left-0 bottom-0 border-l border-b",
  "right-0 bottom-0 border-r border-b",
];

export function Brackets({ arm = 44, weight = 3, inset = "0px" }: BracketsProps) {
  return (
    <div className="pointer-events-none absolute" style={{ inset }} aria-hidden>
      {corners.map((corner) => (
        <span
          key={corner}
          className={`absolute border-mark ${corner}`}
          style={{ width: arm, height: arm, borderWidth: 0, ...cornerWidths(corner, weight) }}
        />
      ))}
    </div>
  );
}

function cornerWidths(corner: string, weight: number) {
  return {
    borderLeftWidth: corner.includes("border-l") ? weight : 0,
    borderRightWidth: corner.includes("border-r") ? weight : 0,
    borderTopWidth: corner.includes("border-t") ? weight : 0,
    borderBottomWidth: corner.includes("border-b") ? weight : 0,
  };
}
