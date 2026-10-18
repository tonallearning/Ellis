import assert from "node:assert/strict";
import test from "node:test";
import {
  getConsolidationStatus,
  isConsolidationHour,
  type ConsolidationSchedule,
} from "./consolidation";

const daytime: ConsolidationSchedule = {
  timeZone: "UTC",
  startHour: 2,
  endHour: 4,
};

test("consolidation includes the opening boundary and excludes the closing boundary", () => {
  assert.equal(isConsolidationHour(1, daytime), false);
  assert.equal(isConsolidationHour(2, daytime), true);
  assert.equal(isConsolidationHour(3, daytime), true);
  assert.equal(isConsolidationHour(4, daytime), false);
});

test("consolidation can cross midnight", () => {
  const overnight = { ...daytime, startHour: 23, endHour: 2 };

  assert.equal(isConsolidationHour(22, overnight), false);
  assert.equal(isConsolidationHour(23, overnight), true);
  assert.equal(isConsolidationHour(0, overnight), true);
  assert.equal(isConsolidationHour(1, overnight), true);
  assert.equal(isConsolidationHour(2, overnight), false);
});

test("status evaluates the configured timezone rather than server local time", () => {
  const chicago = { ...daytime, timeZone: "America/Chicago" };
  const during = getConsolidationStatus(
    chicago,
    new Date("2026-10-17T07:30:00.000Z"),
  );
  const after = getConsolidationStatus(
    chicago,
    new Date("2026-10-17T09:00:00.000Z"),
  );

  assert.equal(during.active, true);
  assert.equal(after.active, false);
  assert.match(during.windowLabel, /2:00 AM.*4:00 AM/);
});

test("matching start and end hours disable the window", () => {
  assert.equal(
    isConsolidationHour(2, { ...daytime, startHour: 2, endHour: 2 }),
    false,
  );
});
