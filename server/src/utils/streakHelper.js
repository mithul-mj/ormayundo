/**
 * Timezone-aware streak tracking for active recall students.
 * Supports both creating cards and reviewing cards.
 */

export const getLocalDateString = (date = new Date(), timezone = 'UTC') => {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC' }).format(date);
  }
};

export const getYesterdayLocalDateString = (date = new Date(), timezone = 'UTC') => {
  try {
    const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
    return getLocalDateString(yesterday, timezone);
  } catch {
    return getLocalDateString(new Date(Date.now() - 86400000), 'UTC');
  }
};

/**
 * Updates a user's study streak when they create or review a card.
 * @param {Object} user - Mongoose User document
 * @param {string} timezone - e.g. "Asia/Kolkata", "America/New_York", etc.
 * @returns {Promise<boolean>} whether streak was changed
 */
export const recordUserStudyActivity = async (user, timezone = 'UTC') => {
  if (!user) return false;

  const now = new Date();
  const safeTimezone = timezone || 'UTC';
  const todayStr = getLocalDateString(now, safeTimezone);
  const yesterdayStr = getYesterdayLocalDateString(now, safeTimezone);

  const lastActiveDate = user.lastStudiedDate || user.lastAddedDate;
  const lastActiveStr = lastActiveDate ? getLocalDateString(new Date(lastActiveDate), safeTimezone) : null;

  user.lastStudiedDate = now;

  // Already recorded for today
  if (lastActiveStr === todayStr) {
    await user.save();
    return false;
  }

  // Consecutive day
  if (lastActiveStr === yesterdayStr) {
    user.currentStreak = (user.currentStreak || 0) + 1;
  } else {
    // First time or missed day
    user.currentStreak = 1;
  }

  if (user.currentStreak > (user.maxStreak || 0)) {
    user.maxStreak = user.currentStreak;
  }

  user.lastAddedDate = now;
  await user.save();
  return true;
};

