const door = { x: 150, y: 96, w: 140, h: 344 };
const porchFloor = 440;

export function FrontDoor() {
  return (
    <div className="absolute left-0 top-0 h-[464px] w-[581px]" aria-hidden>
      <div className="absolute inset-0 bg-[oklch(0.2_0_0)]" />
      <div
        className="absolute left-[250px] top-[70px] size-[260px] rounded-full"
        style={{ background: "radial-gradient(closest-side, oklch(0.92 0.04 80 / 0.22), transparent)" }}
      />
      <div className="absolute left-[372px] top-[172px] h-6 w-4 bg-[oklch(0.9_0.05_85)] shadow-[0_0_18px_4px_oklch(0.9_0.05_85/0.5)]" />
      <div className="absolute left-[420px] top-[130px] h-[130px] w-[120px] bg-[oklch(0.3_0_0)] shadow-[inset_0_0_0_6px_oklch(0.24_0_0)]" />
      <div className="absolute bg-[oklch(0.12_0_0)]" style={{ left: door.x - 12, top: door.y - 12, width: door.w + 24, height: door.h + 12 }} />
      <div className="absolute bg-[oklch(0.28_0_0)]" style={{ left: door.x, top: door.y, width: door.w, height: door.h }}>
        <div className="absolute right-4 top-1/2 size-3 rounded-full bg-line" />
      </div>
      <div className="absolute inset-x-0 bg-[oklch(0.16_0_0)]" style={{ top: porchFloor, height: 24 }} />
      <div className="absolute inset-x-0 h-px bg-line/60" style={{ top: porchFloor }} />
    </div>
  );
}
