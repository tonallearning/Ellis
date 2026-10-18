export type ConsolidationSchedule = {
  timeZone: string;
  startHour: number;
  endHour: number;
};

export type ConsolidationStatus = ConsolidationSchedule & {
  active: boolean;
  windowLabel: string;
};

function localHour(now: Date, timeZone: string): number {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    hourCycle: "h23",
  })
    .formatToParts(now)
    .find((part) => part.type === "hour")?.value;

  if (hour === undefined) {
    throw new Error(`Could not resolve local hour for ${timeZone}`);
  }

  return Number(hour);
}

function hourLabel(hour: number): string {
  const normalized = ((hour % 24) + 24) % 24;
  const suffix = normalized < 12 ? "AM" : "PM";
  const display = normalized % 12 || 12;
  return `${display}:00 ${suffix}`;
}

function timeZoneLabel(now: Date, timeZone: string): string {
  return (
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "short",
    })
      .formatToParts(now)
      .find((part) => part.type === "timeZoneName")?.value ?? timeZone
  );
}

export function isConsolidationHour(
  hour: number,
  schedule: ConsolidationSchedule,
): boolean {
  const { startHour, endHour } = schedule;

  if (startHour === endHour) return false;
  if (startHour < endHour) return hour >= startHour && hour < endHour;
  return hour >= startHour || hour < endHour;
}

export function getConsolidationStatus(
  schedule: ConsolidationSchedule,
  now: Date = new Date(),
): ConsolidationStatus {
  const zone = timeZoneLabel(now, schedule.timeZone);

  return {
    ...schedule,
    active: isConsolidationHour(localHour(now, schedule.timeZone), schedule),
    windowLabel: `${hourLabel(schedule.startHour)}–${hourLabel(schedule.endHour)} ${zone}`,
  };
}
