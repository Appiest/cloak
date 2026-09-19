function isHold(values: number[], index: number) {
  const previous = values[index - 1];
  const next = values[index + 1];
  return previous === undefined || next === undefined || previous === values[index] || next === values[index];
}

function tangents(times: number[], values: number[]) {
  return values.map((_, index) => {
    if (isHold(values, index)) return 0;
    return (values[index + 1] - values[index - 1]) / (times[index + 1] - times[index - 1]);
  });
}

function segmentAt(times: number[], at: number) {
  const next = times.findIndex((time) => time > at);
  if (next <= 0) return next === 0 ? 0 : times.length - 2;
  return next - 1;
}

export function smoothPath(times: number[], values: number[]) {
  const slopes = tangents(times, values);
  return (at: number) => {
    const index = segmentAt(times, at);
    const span = times[index + 1] - times[index];
    const t = Math.min(1, Math.max(0, (at - times[index]) / span));
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * values[index] +
      (t3 - 2 * t2 + t) * span * slopes[index] +
      (-2 * t3 + 3 * t2) * values[index + 1] +
      (t3 - t2) * span * slopes[index + 1]
    );
  };
}
