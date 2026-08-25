const UNIT_TO_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/**
 * Converte uma string de duracao (ex: "15m", "1h", "7d") ou um numero puro
 * (interpretado em segundos, seguindo a convencao do JWT) em milissegundos.
 */
export function parseDurationToMs(duration: string): number {
  const trimmed = duration.trim();

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed) * 1000;
  }

  const match = trimmed.match(/^(\d+(?:\.\d+)?)(ms|s|m|h|d)$/i);

  if (!match) {
    throw new Error(`Formato de duração inválido: "${duration}". Use algo como "15m", "1h" ou "7d".`);
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  return value * UNIT_TO_MS[unit];
}
