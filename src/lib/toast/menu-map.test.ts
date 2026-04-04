import assert from "node:assert/strict";
import test from "node:test";

import { getToastItemGuidMap, getToastMenuItemGuid } from "./menu-map";

const ORIGINAL_ENV = { ...process.env };

function resetEnv(overrides: Record<string, string | undefined>) {
  process.env = { ...ORIGINAL_ENV, ...overrides };
}

test("parses Toast item GUID mappings from JSON", () => {
  resetEnv({
    TOAST_ITEM_GUIDS_JSON: JSON.stringify({
      samosa: "guid-1",
      "chicken-tikka-masala": "guid-2",
    }),
  });

  assert.deepEqual(getToastItemGuidMap(), {
    samosa: "guid-1",
    "chicken-tikka-masala": "guid-2",
  });
});

test("throws for invalid mapping JSON", () => {
  resetEnv({
    TOAST_ITEM_GUIDS_JSON: "{bad json}",
  });

  assert.throws(() => getToastItemGuidMap(), /TOAST_ITEM_GUIDS_JSON must be valid JSON/);
});

test("throws when a Toast mapping is missing for an item", () => {
  resetEnv({
    TOAST_ITEM_GUIDS_JSON: JSON.stringify({
      samosa: "guid-1",
    }),
  });

  assert.throws(
    () => getToastMenuItemGuid("chicken-tikka-masala"),
    /Missing Toast item mapping for chicken-tikka-masala/,
  );
});
