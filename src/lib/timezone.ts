const DEFAULT_TIMEZONE = "America/New_York";

export function getRestaurantTimeZone() {
  return process.env.NEXT_PUBLIC_TIMEZONE || DEFAULT_TIMEZONE;
}

function extractDateParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const valueByType = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return {
    year: Number(valueByType.year),
    month: Number(valueByType.month),
    day: Number(valueByType.day),
    hour: Number(valueByType.hour),
    minute: Number(valueByType.minute),
    second: Number(valueByType.second),
  };
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = extractDateParts(date, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return asUtc - date.getTime();
}

export function parseRestaurantLocalDateTime(localDateTime: string, timeZone = getRestaurantTimeZone()) {
  const match = localDateTime.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (!match) {
    return new Date(Number.NaN);
  }

  const [, year, month, day, hour, minute, second = "00"] = match;
  const utcGuess = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    ),
  );

  const offsetMs = getTimeZoneOffsetMs(utcGuess, timeZone);
  return new Date(utcGuess.getTime() - offsetMs);
}

export function formatRestaurantTime(dateValue: string | Date, timeZone = getRestaurantTimeZone()) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateValue));
}

export function formatRestaurantDate(dateValue: string | Date, timeZone = getRestaurantTimeZone()) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
  }).format(new Date(dateValue));
}
