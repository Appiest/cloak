import type { Metadata } from "next";
import { Deck } from "@/deck/Deck";
import { parseLook } from "@/deck/look";
import { outline } from "@/deck/script";
import { parsePosition } from "@/deck/timeline";

export const metadata: Metadata = { title: "Cloak pitch" };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PresentPage({ searchParams }: PageProps<"/present">) {
  const params = await searchParams;
  const initial = parsePosition(first(params.slide), first(params.beat), outline);
  return <Deck initial={initial} look={parseLook(first(params.style))} />;
}
