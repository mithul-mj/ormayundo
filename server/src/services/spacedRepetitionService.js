export const calculateNextReview = (interval, repetitions, easinessFactor, ratingStr) => {
  // Map our UI ratings to SM-2 grades (0-5)
  // SM-2 Grades: 5=Perfect, 4=Hesitation, 3=Hard, 2-0=Failed
  const ratingMap = {
    forgot: 1,
    hard: 3,
    good: 4,
    easy: 5
  };
  const grade = ratingMap[ratingStr] || 1;

  let newInterval = interval;
  let newRepetitions = repetitions;
  let newEasinessFactor = easinessFactor;

  if (grade >= 3) {
    // Correct response
    if (newRepetitions === 0) {
      newInterval = 1;
    } else if (newRepetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(newInterval * newEasinessFactor);
    }
    newRepetitions += 1;
  } else {
    // Incorrect response (forgot)
    newRepetitions = 0;
    newInterval = 1;
  }

  // Update Easiness Factor (EF)
  newEasinessFactor = newEasinessFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (newEasinessFactor < 1.3) {
    newEasinessFactor = 1.3; // EF should never be lower than 1.3
  }

  // Calculate next review date (in days)
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

  // NOTE: For rapid testing, you can use minutes instead of days by commenting the line above and uncommenting below:
  // nextReviewAt.setTime(new Date().getTime() + newInterval * 60 * 1000);

  return { nextReviewAt, newInterval, newRepetitions, newEasinessFactor };
};
