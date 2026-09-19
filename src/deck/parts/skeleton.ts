export type Point = { x: number; y: number };

export type Limb = { upper: number; lower: number };

export type Pose = {
  turn: number;
  bob: number;
  backArm: Limb;
  frontArm: Limb;
  backLeg: Limb;
  frontLeg: Limb;
};

export const bones = {
  upperArm: { length: 80, width: 22 },
  forearm: { length: 78, width: 20 },
  thigh: { length: 105, width: 34 },
  shin: { length: 100, width: 30 },
};

const facing = {
  backShoulder: { x: 52, y: 140 },
  frontShoulder: { x: 148, y: 140 },
  backHip: { x: 80, y: 300 },
  frontHip: { x: 120, y: 300 },
};

const sideOn = { shoulder: { x: 100, y: 140 }, hip: { x: 100, y: 300 } };

const armSplay = 6;

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function lerpPoint(from: Point, to: Point, amount: number): Point {
  return { x: lerp(from.x, to.x, amount), y: lerp(from.y, to.y, amount) };
}

export function joints(turn: number) {
  return {
    backShoulder: lerpPoint(facing.backShoulder, sideOn.shoulder, turn),
    frontShoulder: lerpPoint(facing.frontShoulder, sideOn.shoulder, turn),
    backHip: lerpPoint(facing.backHip, sideOn.hip, turn),
    frontHip: lerpPoint(facing.frontHip, sideOn.hip, turn),
  };
}

export const restPose: Pose = {
  turn: 0,
  bob: 0,
  backArm: { upper: armSplay, lower: 0 },
  frontArm: { upper: -armSplay, lower: 0 },
  backLeg: { upper: 0, lower: 0 },
  frontLeg: { upper: 0, lower: 0 },
};

const radians = Math.PI / 180;

function along(origin: Point, degrees: number, length: number): Point {
  const angle = degrees * radians;
  return { x: origin.x - Math.sin(angle) * length, y: origin.y + Math.cos(angle) * length };
}

export function handOf(pose: Pose): Point {
  const shoulder = joints(pose.turn).frontShoulder;
  const elbow = along(shoulder, pose.frontArm.upper, bones.upperArm.length);
  const hand = along(elbow, pose.frontArm.upper + pose.frontArm.lower, bones.forearm.length);
  return { x: hand.x, y: hand.y + pose.bob };
}

function segmentAngle(from: Point, to: Point) {
  return Math.atan2(-(to.x - from.x), to.y - from.y) / radians;
}

function shortestTurn(degrees: number) {
  return ((((degrees + 180) % 360) + 360) % 360) - 180;
}

function outermost(first: Point, second: Point) {
  return first.x >= second.x ? first : second;
}

export function reachFor(target: Point, turn = 0): Limb {
  const shoulder = joints(turn).frontShoulder;
  const upper = bones.upperArm.length;
  const lower = bones.forearm.length;
  const dx = target.x - shoulder.x;
  const dy = target.y - shoulder.y;
  const distance = Math.min(Math.hypot(dx, dy), upper + lower - 0.001);
  const towardTarget = Math.atan2(dy, dx);
  const bend = Math.acos((upper * upper + distance * distance - lower * lower) / (2 * upper * distance));
  const elbow = outermost(
    { x: shoulder.x + Math.cos(towardTarget + bend) * upper, y: shoulder.y + Math.sin(towardTarget + bend) * upper },
    { x: shoulder.x + Math.cos(towardTarget - bend) * upper, y: shoulder.y + Math.sin(towardTarget - bend) * upper },
  );
  const hand = { x: shoulder.x + Math.cos(towardTarget) * distance, y: shoulder.y + Math.sin(towardTarget) * distance };
  const upperAngle = segmentAngle(shoulder, elbow);
  return { upper: upperAngle, lower: shortestTurn(segmentAngle(elbow, hand) - upperAngle) };
}

const stride = { legSwing: 28, kneeBend: 48, armSwing: 22, elbowBend: 22, bob: 7 };

export function walkingPose(phase: number, amount: number, turn: number): Pose {
  const swing = Math.sin(phase) * amount;
  const frontKnee = -stride.kneeBend * Math.max(0, Math.cos(phase)) * amount;
  const backKnee = -stride.kneeBend * Math.max(0, -Math.cos(phase)) * amount;
  const splay = armSplay * (1 - turn);
  return {
    turn,
    bob: -stride.bob * Math.abs(Math.cos(phase)) * amount,
    frontLeg: { upper: stride.legSwing * swing, lower: frontKnee },
    backLeg: { upper: -stride.legSwing * swing, lower: backKnee },
    frontArm: { upper: -splay - stride.armSwing * swing, lower: stride.elbowBend * amount },
    backArm: { upper: splay + stride.armSwing * swing, lower: stride.elbowBend * amount },
  };
}

export const stridePerCycle = 150;
