// Spaced Repetition SM-2 Calculator (Client-side interval label preview)
export const SPACED_REPETITION = {
  MAX_INTERVAL_DAYS: 365,
  DEFAULT_EASINESS_FACTOR: 2.5,
  MIN_EASINESS_FACTOR: 1.3,
  HARD_GROWTH_FACTOR: 1.2,
  EASY_BONUS_FACTOR: 1.3,
};

export const calculateIntervalsForCard = (
  interval = 0,
  repetitions = 0,
  easinessFactor = SPACED_REPETITION.DEFAULT_EASINESS_FACTOR,
  learningStep = 0,
  isGraduated = false
) => {
  const safeInterval = Number(interval) || 0;
  const safeRepetitions = Number(repetitions) || 0;
  const currentEF =
    typeof easinessFactor === 'number' && !isNaN(easinessFactor) && easinessFactor >= SPACED_REPETITION.MIN_EASINESS_FACTOR
      ? easinessFactor
      : SPACED_REPETITION.DEFAULT_EASINESS_FACTOR;
  const step = Number(learningStep) || 0;

  // Phase 1: Learning Phase (New or re-learning cards)
  if (!isGraduated) {
    return {
      forgot: { interval: 0, text: '<1m', minutes: 1, days: 0 },
      hard: { interval: 0, text: '5m', minutes: 5, days: 0 },
      good: { interval: step === 0 ? 0 : 1, text: step === 0 ? '10m' : '1d', minutes: step === 0 ? 10 : 0, days: step === 0 ? 0 : 1 },
      easy: { interval: 4, text: '4d', minutes: 0, days: 4 }
    };
  }

  // Phase 2: Graduated Review Phase (SM-2 with interval caps)
  const baseInterval = Math.max(1, safeInterval);

  let goodDays;
  if (safeRepetitions === 0) {
    goodDays = 1;
  } else if (safeRepetitions === 1) {
    goodDays = baseInterval <= 1 ? 6 : Math.max(baseInterval + 2, Math.round(baseInterval * currentEF));
  } else {
    goodDays = Math.max(baseInterval + 1, Math.round(baseInterval * currentEF));
  }
  goodDays = Math.min(SPACED_REPETITION.MAX_INTERVAL_DAYS, goodDays);

  let hardDays;
  if (baseInterval <= 1) {
    hardDays = 2;
  } else {
    hardDays = Math.max(baseInterval + 1, Math.round(baseInterval * SPACED_REPETITION.HARD_GROWTH_FACTOR));
  }
  if (hardDays >= goodDays) {
    hardDays = Math.max(1, goodDays - 1);
  }
  hardDays = Math.min(SPACED_REPETITION.MAX_INTERVAL_DAYS, hardDays);

  let easyDays = Math.min(
    SPACED_REPETITION.MAX_INTERVAL_DAYS,
    Math.max(goodDays + 1, Math.round(goodDays * SPACED_REPETITION.EASY_BONUS_FACTOR))
  );

  return {
    forgot: { interval: 0, text: '<1m', minutes: 1, days: 0 },
    hard: { interval: hardDays, text: `${hardDays}d`, minutes: 0, days: hardDays },
    good: { interval: goodDays, text: `${goodDays}d`, minutes: 0, days: goodDays },
    easy: { interval: easyDays, text: `${easyDays}d`, minutes: 0, days: easyDays }
  };
};

