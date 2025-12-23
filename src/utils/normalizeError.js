export function normalizeParserError(rawError) {
  if (!rawError) return null;

  const text = String(rawError);

  // === АНТИБОТ ===
  if (text.includes('Waiting for selector') || text.includes('webListReviews')) {
    return {
      code: 'ANTIBOT',
      message: 'Обнаружен антибот. Требуется обновление cookies.',
      severity: 'error',
    };
  }

  // === ССЫЛКА НЕ НАЙДЕНА ===
  if (text.includes('Ответ получен, но ссылка не найдена') || text.includes('not found')) {
    return {
      code: 'NOT_FOUND',
      message: 'Ответ получен, но ссылка не найдена.',
      severity: 'warning',
    };
  }

  // === FALLBACK ===
  return {
    code: 'UNKNOWN',
    message: text,
    severity: 'error',
  };
}
