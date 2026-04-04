type ToastItemGuidMap = Record<string, string>;

export function getToastItemGuidMap(): ToastItemGuidMap {
  const rawValue = process.env.TOAST_ITEM_GUIDS_JSON?.trim();

  if (!rawValue) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("TOAST_ITEM_GUIDS_JSON must be a JSON object.");
    }

    return Object.fromEntries(
      Object.entries(parsed).map(([key, value]) => {
        if (typeof value !== "string" || !value.trim()) {
          throw new Error(`Toast item mapping for ${key} must be a non-empty string.`);
        }

        return [key, value.trim()];
      }),
    );
  } catch (error) {
    if (error instanceof Error && error.message !== "TOAST_ITEM_GUIDS_JSON must be a JSON object.") {
      throw new Error(`TOAST_ITEM_GUIDS_JSON must be valid JSON. ${error.message}`);
    }

    throw error;
  }
}

export function getToastMenuItemGuid(menuItemId: string) {
  const itemGuidMap = getToastItemGuidMap();
  const toastGuid = itemGuidMap[menuItemId];

  if (!toastGuid) {
    throw new Error(`Missing Toast item mapping for ${menuItemId}.`);
  }

  return toastGuid;
}
