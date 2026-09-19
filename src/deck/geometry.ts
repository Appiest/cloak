export type Rect = { x: number; y: number; w: number; h: number };

export const canvas = { w: 1920, h: 1080 };

export const figureSize = { w: 246, h: 640 };

export const tileSize = { w: 581, h: 464 };

export const screenFeed: Rect = { x: 40, y: 40, w: 1840, h: 1000 };

const wallOrigin = { x: 64, y: 64 };
const wallGap = 24;

export const wallTiles: Rect[] = Array.from({ length: 6 }, (_, index) => ({
  x: wallOrigin.x + (index % 3) * (tileSize.w + wallGap),
  y: wallOrigin.y + Math.floor(index / 3) * (tileSize.h + wallGap),
  ...tileSize,
}));

const thumb = { w: 200, h: 160, gap: 12, x: 120, y: 300 };

export const thumbTiles: Rect[] = Array.from({ length: 6 }, (_, index) => ({
  x: thumb.x + (index % 2) * (thumb.w + thumb.gap),
  y: thumb.y + Math.floor(index / 2) * (thumb.h + thumb.gap),
  w: thumb.w,
  h: thumb.h,
}));

export const thumbStackRight = thumb.x + 2 * thumb.w + thumb.gap;
export const thumbStackMiddle = thumb.y + (3 * thumb.h + 2 * thumb.gap) / 2;

export type Placement = { x: number; y: number; scale: number };

const heroInTile = { x: 213, y: 40, scale: 0.625 };

export function heroInside(tile: Rect): Placement {
  const k = tile.w / tileSize.w;
  return {
    x: Math.round(tile.x + heroInTile.x * k),
    y: Math.round(tile.y + heroInTile.y * k),
    scale: heroInTile.scale * k,
  };
}

export function standingAt(centerX: number, feetY: number, height: number): Placement {
  const scale = height / figureSize.h;
  return {
    x: Math.round(centerX - (figureSize.w * scale) / 2),
    y: Math.round(feetY - height),
    scale,
  };
}

const headCenter = { x: 123, y: 71.3 };

export function headAt(centerX: number, centerY: number, scale: number): Placement {
  return {
    x: Math.round(centerX - headCenter.x * scale),
    y: Math.round(centerY - headCenter.y * scale),
    scale,
  };
}

export function pointOnFigure(placement: Placement, viewBoxX: number, viewBoxY: number) {
  const unit = (figureSize.w / 200) * placement.scale;
  return { x: placement.x + viewBoxX * unit, y: placement.y + viewBoxY * unit };
}

export function tileScale(tile: Rect): number {
  return tile.w / tileSize.w;
}
