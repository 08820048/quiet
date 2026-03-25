const SHORT_DATE_PATTERN =
  /(\d{4})[./-](\d{1,2})[./-](\d{1,2})(?:[T\s]+(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?)?(?:\s*(Z|[+-]\d{2}:\d{2}))?/;

const longDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const pad = (value) => String(value).padStart(2, '0');

const normalizeDateParts = (value) => {
  const match = String(value).trim().match(SHORT_DATE_PATTERN);
  if (!match) {
    return null;
  }

  const [, year, month, day, hour = '0', minute = '0', second = '0', timezone] = match;
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second),
    timezone,
  };
};

const parseDateValue = (value) => {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const parts = normalizeDateParts(value);
  if (!parts) {
    return null;
  }

  if (parts.timezone) {
    const iso = `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}${parts.timezone}`;
    const date = new Date(iso);
    return Number.isNaN(date.valueOf()) ? null : date;
  }

  return new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
  );
};

const findInlineMetaDate = (raw, label) => {
  const markdownPattern = new RegExp(
    String.raw`^\s*\*\*${label}\*\*[：:]\s*(.+)$`,
    'm'
  );
  const markdownMatch = raw.match(markdownPattern);
  if (markdownMatch) {
    return parseDateValue(markdownMatch[1]);
  }

  const commentPattern = new RegExp(
    String.raw`<!--\s*${label}[：:]\s*(.+?)\s*-->`,
    'm'
  );
  const commentMatch = raw.match(commentPattern);
  if (commentMatch) {
    return parseDateValue(commentMatch[1]);
  }

  return null;
};

const findUpdateLogDate = (raw) => {
  const lines = raw.split('\n');
  let inUpdateLog = false;
  let scanned = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!inUpdateLog) {
      if (/^#{1,6}\s*更新日志/.test(trimmed)) {
        inUpdateLog = true;
      }
      continue;
    }

    if (trimmed && /^#{1,6}\s+/.test(trimmed) && !/^#{1,6}\s*更新日志/.test(trimmed)) {
      break;
    }

    if (!trimmed || /^[-*]{3,}$/.test(trimmed) || /^\*{4,}$/.test(trimmed)) {
      continue;
    }

    scanned += 1;
    const normalized = trimmed.replace(/^>\s*/, '');
    const parsed = parseDateValue(normalized);
    if (parsed) {
      return parsed;
    }

    if (scanned >= 12) {
      break;
    }
  }

  return null;
};

export const resolvePostTitle = (raw, frontmatter = {}, fallbackTitle) => {
  const titleFromContent = raw
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('# '))
    ?.replace(/^#\s+/, '');

  return (
    (typeof frontmatter.title === 'string' ? frontmatter.title : undefined) ??
    titleFromContent ??
    fallbackTitle
  );
};

export const resolvePostDates = (raw, frontmatter = {}) => {
  const frontmatterPublished = parseDateValue(frontmatter.date);
  const frontmatterUpdated = parseDateValue(frontmatter.updated);
  const inlinePublished = findInlineMetaDate(raw, '发布时间');
  const inlineUpdated = findInlineMetaDate(raw, '更新时间');
  const updateLogDate = findUpdateLogDate(raw);

  const publishedAt = frontmatterPublished ?? inlinePublished ?? null;
  const updatedAt = frontmatterUpdated ?? inlineUpdated ?? updateLogDate ?? publishedAt;
  const sortDate = updatedAt ?? publishedAt;

  return {
    publishedAt,
    updatedAt,
    sortDate,
  };
};

export const resolvePostMetadata = (raw, frontmatter = {}, fallbackTitle) => ({
  title: resolvePostTitle(raw, frontmatter, fallbackTitle),
  ...resolvePostDates(raw, frontmatter),
});

export const formatUtcDate = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.valueOf())) {
    return 'Unknown';
  }

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
};

export const formatUtcLongDate = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.valueOf())) {
    return 'Unknown';
  }

  return longDateFormatter.format(date);
};
