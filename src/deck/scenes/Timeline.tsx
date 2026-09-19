"use client";

import { motion } from "motion/react";
import { quickFade, sceneEase } from "../motion";
import type { Beat } from "../script";
import { sources, type Source } from "../sources";
import { splitBar, timelineAxisY } from "./Manipulated";

type Side = "watchers" | "protections";

type Milestone = {
  side: Side;
  year: number;
  date: string;
  text: string;
  source: Source;
  cardX: number;
};

const firstYear = 2011;
const lastYear = 2027;
const cardWidth = 400;

const milestones: Milestone[] = [
  {
    side: "watchers",
    year: 2011.2,
    date: "March 2011",
    text: "UK police estimate the country has about 1.85 million CCTV cameras",
    source: sources.ukCctvEstimate,
    cardX: 100,
  },
  {
    side: "watchers",
    year: 2023.2,
    date: "March 2023",
    text: "The FTC warns that scammers are cloning voices with AI",
    source: sources.ftcVoiceCloning,
    cardX: 540,
  },
  {
    side: "watchers",
    year: 2024.9,
    date: "December 2024",
    text: "The FBI warns criminals use AI-generated audio and video",
    source: sources.fbiGenerativeFraud,
    cardX: 980,
  },
  {
    side: "watchers",
    year: 2026.6,
    date: "July 2026",
    text: "Flock Safety says more than 5,000 law enforcement agencies use it",
    source: sources.flockAgencies,
    cardX: 1420,
  },
  {
    side: "protections",
    year: 2020.5,
    date: "July 2020",
    text: "The GAO finds no comprehensive federal privacy law covers what companies collect",
    source: sources.gaoPrivacyLaw,
    cardX: 640,
  },
  {
    side: "protections",
    year: 2024.2,
    date: "March 2024",
    text: "Airbnb bans cameras inside listings. It’s a company rule, not a law.",
    source: sources.airbnbCameraBan,
    cardX: 1120,
  },
];

const tickYears = [2015, 2020, 2025];

function yearToX(year: number): number {
  return splitBar.x + ((year - firstYear) / (lastYear - firstYear)) * splitBar.w;
}

const sidesShown: Partial<Record<Beat, Side[]>> = {
  watchers: ["watchers"],
  protections: ["watchers", "protections"],
};

export function Timeline({ beat }: { beat: Beat }) {
  const shown = sidesShown[beat] ?? [];
  const onTimeline = shown.length > 0;
  return (
    <div className="pointer-events-none absolute inset-0">
      <motion.div initial={false} animate={{ opacity: onTimeline ? 1 : 0 }} transition={quickFade}>
        <SideLabel y={timelineAxisY - 60}>Watching you</SideLabel>
        <SideLabel y={timelineAxisY + 56} visible={shown.includes("protections")}>
          Protecting you
        </SideLabel>
        {tickYears.map((year) => (
          <span
            key={year}
            className="type-osd absolute text-[18px] text-ink-muted"
            style={{ left: yearToX(year) - 22, top: timelineAxisY + 18 }}
          >
            {year}
          </span>
        ))}
      </motion.div>
      {milestones.map((milestone, order) => (
        <MilestoneMark key={milestone.date} milestone={milestone} visible={shown.includes(milestone.side)} order={order} />
      ))}
    </div>
  );
}

function SideLabel({ y, visible = true, children }: { y: number; visible?: boolean; children: string }) {
  return (
    <motion.span
      className="type-label absolute left-[220px] text-[30px] text-ink-muted"
      style={{ top: y }}
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={quickFade}
    >
      {children}
    </motion.span>
  );
}

const rows: Record<Side, { cardTop: number; anchorY: number; dot: string; enterY: number }> = {
  watchers: { cardTop: 150, anchorY: 400, dot: "bg-mark", enterY: 12 },
  protections: { cardTop: 720, anchorY: 708, dot: "bg-ink", enterY: -12 },
};

type MilestoneMarkProps = { milestone: Milestone; visible: boolean; order: number };

function MilestoneMark({ milestone, visible, order }: MilestoneMarkProps) {
  const pointX = yearToX(milestone.year);
  const row = rows[milestone.side];
  const anchorX = milestone.cardX + 40;
  const delay = visible ? 0.4 + (order % 4) * 0.35 : 0;
  return (
    <>
      <svg className="absolute inset-0 size-full" viewBox="0 0 1920 1080" aria-hidden>
        <motion.path
          d={`M${pointX} ${timelineAxisY} L${anchorX} ${row.anchorY}`}
          stroke="var(--color-line)"
          strokeWidth={1.5}
          fill="none"
          initial={false}
          animate={{ pathLength: visible ? 1 : 0 }}
          transition={{ duration: 0.5, ease: sceneEase, delay }}
        />
      </svg>
      <motion.span
        className={`absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full ${row.dot}`}
        style={{ left: pointX, top: timelineAxisY + 2 }}
        initial={false}
        animate={{ scale: visible ? 1 : 0 }}
        transition={{ duration: 0.4, ease: sceneEase, delay }}
      />
      <motion.div
        className="absolute flex flex-col gap-2"
        style={{ left: milestone.cardX, top: row.cardTop, width: cardWidth }}
        initial={false}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : row.enterY }}
        transition={{ ...quickFade, delay: visible ? delay + 0.2 : 0 }}
      >
        <p className="type-label text-[22px] text-ink-muted">{milestone.date}</p>
        <p className="type-label text-[28px] leading-tight text-ink" style={{ textWrap: "pretty" }}>
          {milestone.text}
        </p>
        <p className="type-source text-[15px] text-ink-muted">{milestone.source.citation}</p>
      </motion.div>
    </>
  );
}
