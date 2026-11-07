/**
 * Spaced Repetition Engine (Extension Client)
 *
 * Provides accurate, distinct durations for all 4 ratings (Forgot, Hard, Good, Easy)
 * matching the backend algorithm, capped at a maximum interval.
 */

// Maximum interval cap: cards will be reviewed at least once every 365 days (1 year)
export const MAX_INTERVAL_DAYS = 365;

export const calculateIntervalsForCard = (
  interval = 0,
  repetitions = 0,
  easinessFactor = 2.5,
  learningStep = 0,
  isGraduated = false
) => {
  const safeInterval = Number(interval) || 0;
  const safeRepetitions = Number(repetitions) || 0;
  const currentEF =
    typeof easinessFactor === 'number' && !isNaN(easinessFactor) && easinessFactor >= 1.3
      ? easinessFactor
      : 2.5;
  const step = Number(learningStep) || 0;

  if (!isGraduated) {
    // Phase 1: Learning Phase (Card is brand new or re-learning after forgetting)
    return {
      forgot: {
        interval: 0,
        text: '<1m',
        minutes: 1,
        days: 0,
        isGraduated: false,
        learningStep: 0,
        repetitions: 0,
        newEasinessFactor: currentEF
      },
      hard: {
        interval: 0,
        text: '5m',
        minutes: 5,
        days: 0,
        isGraduated: false,
        learningStep: step,
        repetitions: safeRepetitions,
        newEasinessFactor: currentEF
      },
      good: {
        interval: step === 0 ? 0 : 1,
        text: step === 0 ? '10m' : '1d',
        minutes: step === 0 ? 10 : 0,
        days: step === 0 ? 0 : 1,
        isGraduated: step !== 0,
        learningStep: step === 0 ? 1 : 0,
        repetitions: step === 0 ? safeRepetitions : 1,
        newEasinessFactor: currentEF
      },
      easy: {
        interval: 4,
        text: '4d',
        minutes: 0,
        days: 4,
        isGraduated: true,
        learningStep: 0,
        repetitions: 1,
        newEasinessFactor: currentEF
      }
    };
  } else {
    // Phase 2: Graduated Review Phase (SM-2 with distinct intervals per rating)
    const baseInterval = Math.max(1, safeInterval);

    // 1. Good interval: standard SM-2 progression
    let goodDays;
    if (safeRepetitions === 0) {
      goodDays = 1;
    } else if (safeRepetitions === 1) {
      goodDays = baseInterval <= 1 ? 6 : Math.max(baseInterval + 2, Math.round(baseInterval * currentEF));
    } else {
      goodDays = Math.max(baseInterval + 1, Math.round(baseInterval * currentEF));
    }
    goodDays = Math.min(MAX_INTERVAL_DAYS, goodDays);

    // 2. Hard interval: conservative growth (~1.2x), strictly smaller than goodDays
    let hardDays;
    if (baseInterval <= 1) {
      hardDays = 2;
    } else {
      hardDays = Math.max(baseInterval + 1, Math.round(baseInterval * 1.2));
    }
    // Safety check: Hard must always be strictly less than Good
    if (hardDays >= goodDays) {
      hardDays = Math.max(1, goodDays - 1);
    }
    hardDays = Math.min(MAX_INTERVAL_DAYS, hardDays);

    // 3. Easy interval: easy bonus (~1.3x over Good), capped at MAX_INTERVAL_DAYS
    let easyDays = Math.min(
      MAX_INTERVAL_DAYS,
      Math.max(goodDays + 1, Math.round(goodDays * 1.3))
    );
    // If goodDays has reached the cap, easyDays is also capped at MAX_INTERVAL_DAYS
    if (goodDays >= MAX_INTERVAL_DAYS) {
      easyDays = MAX_INTERVAL_DAYS;
      if (hardDays >= MAX_INTERVAL_DAYS) {
        hardDays = Math.max(1, MAX_INTERVAL_DAYS - 1);
      }
    }

    // EF adjustments
    const forgotEF = Math.max(1.3, Math.round((currentEF - 0.2) * 100) / 100);
    const hardEF = Math.max(1.3, Math.round((currentEF - 0.15) * 100) / 100);
    const goodEF = Math.round(currentEF * 100) / 100;
    const easyEF = Math.round((currentEF + 0.15) * 100) / 100;

    return {
      forgot: {
        interval: 0,
        text: '<1m',
        minutes: 1,
        days: 0,
        isGraduated: false,
        learningStep: 0,
        repetitions: 0,
        newEasinessFactor: forgotEF
      },
      hard: {
        interval: hardDays,
        text: `${hardDays}d`,
        minutes: 0,
        days: hardDays,
        isGraduated: true,
        learningStep: 0,
        repetitions: safeRepetitions + 1,
        newEasinessFactor: hardEF
      },
      good: {
        interval: goodDays,
        text: `${goodDays}d`,
        minutes: 0,
        days: goodDays,
        isGraduated: true,
        learningStep: 0,
        repetitions: safeRepetitions + 1,
        newEasinessFactor: goodEF
      },
      easy: {
        interval: easyDays,
        text: `${easyDays}d`,
        minutes: 0,
        days: easyDays,
        isGraduated: true,
        learningStep: 0,
        repetitions: safeRepetitions + 1,
        newEasinessFactor: easyEF
      }
    };
  }
};

