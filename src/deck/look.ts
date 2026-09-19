export const looks = ["cctv", "clean"] as const;

export type Look = (typeof looks)[number];

export function parseLook(value: string | null | undefined): Look {
  return looks.find((look) => look === value) ?? "cctv";
}

export function withLook(search: string, look: Look): string {
  if (look === "cctv") return search;
  const params = new URLSearchParams(search);
  params.set("style", look);
  return `?${params}`;
}
