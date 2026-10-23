import { z } from 'zod';

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10000;

const bcbResponseSchema = z
  .array(
    z.object({
      data: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
      valor: z.string(),
    }),
  )
  .min(1);

interface ReferenceRate {
  value: number;
  referenceDate: string;
  fetchedAt: string;
}

interface CachedRate {
  rate: ReferenceRate;
  expiresAt: number;
}

interface RateResult extends ReferenceRate {
  stale: boolean;
}

const cache = new Map<number, CachedRate>();
const pending = new Map<number, Promise<RateResult>>();

function toIsoDate(value: string) {
  const [day, month, year] = value.split('/');
  return `${year}-${month}-${day}`;
}

async function fetchBcbRate(
  series: number,
): Promise<RateResult> {
  const previous = cache.get(series);

  if (previous && previous.expiresAt > Date.now()) {
    return {
      ...previous.rate,
      stale: false,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  try {
    const url =
      'https://api.bcb.gov.br/dados/serie/' +
      `bcdata.sgs.${series}/dados/ultimos/1?formato=json`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha na consulta ao Banco Central');
    }

    const result = bcbResponseSchema.parse(
      await response.json(),
    );

    const item = result[0];
    const value = Number(item.valor.replace(',', '.'));

    if (!Number.isFinite(value) || value < 0 || value > 100) {
      throw new Error('Taxa inválida recebida do Banco Central');
    }

    const rate: ReferenceRate = {
      value,
      referenceDate: toIsoDate(item.data),
      fetchedAt: new Date().toISOString(),
    };

    cache.set(series, {
      rate,
      expiresAt: Date.now() + CACHE_DURATION_MS,
    });

    return {
      ...rate,
      stale: false,
    };
  } catch {
    // Se já houve uma consulta válida, mantém o último dado
    // e identifica que a atualização não foi possível.
    if (previous) {
      return {
        ...previous.rate,
        stale: true,
      };
    }

    throw new Error(
      'Não foi possível consultar a taxa no Banco Central.',
    );
  } finally {
    clearTimeout(timeout);
  }
}

function getBcbRate(series: number): Promise<RateResult> {
  const existing = pending.get(series);

  if (existing) {
    return existing;
  }

  const request = fetchBcbRate(series).finally(() => {
    pending.delete(series);
  });

  pending.set(series, request);

  return request;
}

// A taxa diária do CDI é informada em percentual.
// O percentual contratado é aplicado antes da capitalização.
function monthlyCdiEstimate(
  dailyPercent: number,
  cdiPercentage: number,
) {
  const dailyRate =
    (dailyPercent / 100) * (cdiPercentage / 100);

  return (Math.pow(1 + dailyRate, 21) - 1) * 100;
}

export async function getMarketRates() {
  const [cdi, savings] = await Promise.allSettled([
    getBcbRate(12),
    getBcbRate(195),
  ]);

  const cdiRate =
    cdi.status === 'fulfilled' ? cdi.value : null;

  const savingsRate =
    savings.status === 'fulfilled' ? savings.value : null;

  return {
    cdb: {
      name: 'CDB',
      benchmark: '100% do CDI',
      available: cdiRate !== null,

      // Percentual mensal estimado.
      monthlyPercent: cdiRate
        ? monthlyCdiEstimate(cdiRate.value, 100)
        : null,

      referenceDate: cdiRate?.referenceDate ?? null,
      fetchedAt: cdiRate?.fetchedAt ?? null,
      stale: cdiRate?.stale ?? false,
      source: 'Banco Central — SGS 12',

      note:
        'Estimativa bruta com 21 dias úteis por mês. ' +
        '100% do CDI é um cenário educacional.',
    },

    lci: {
      name: 'LCI/LCA',
      benchmark: '90% do CDI',
      available: cdiRate !== null,

      monthlyPercent: cdiRate
        ? monthlyCdiEstimate(cdiRate.value, 90)
        : null,

      referenceDate: cdiRate?.referenceDate ?? null,
      fetchedAt: cdiRate?.fetchedAt ?? null,
      stale: cdiRate?.stale ?? false,
      source: 'Banco Central — SGS 12',

      note:
        'Estimativa com 21 dias úteis por mês. ' +
        '90% do CDI é um cenário educacional, não uma oferta bancária.',
    },

    poupanca: {
      name: 'Poupança',
      benchmark: 'Remuneração do período publicada pelo BCB',
      available: savingsRate !== null,

      monthlyPercent: savingsRate?.value ?? null,

      referenceDate: savingsRate?.referenceDate ?? null,
      fetchedAt: savingsRate?.fetchedAt ?? null,
      stale: savingsRate?.stale ?? false,
      source: 'Banco Central — SGS 195',

      note:
        'Referência para depósitos a partir de 04/05/2012. ' +
        'O rendimento depende do aniversário do depósito. ' +
        'A repetição dessa taxa em meses futuros é uma hipótese.',
    },
  };
}