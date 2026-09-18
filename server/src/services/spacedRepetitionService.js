export const calculateNextReview = (interval, repetitions, easinessFactor, ratingStr, learningStep = 0, isGraduated = false) => {
  // Map our UI ratings to SM-2 grades (0-5)
  const ratingMap = { forgot: 1, hard: 3, good: 4, easy: 5 };
  const grade = ratingMap[ratingStr] || 1;

  let newInterval = interval;
  let newRepetitions = repetitions;
  let newEasinessFactor = easinessFactor;
  let newLearningStep = learningStep;
  let newIsGraduated = isGraduated;
  const nextReviewAt = new Date();

  // If the card has not graduated yet, or if it was just forgotten, it's in the Learning Phase
  if (!newIsGraduated) {
    if (ratingStr === 'forgot') {
      newLearningStep = 0;
      nextReviewAt.setTime(nextReviewAt.getTime() + 1 * 60 * 1000); // 1 minute
    } else if (ratingStr === 'hard') {
      // Repeat current step, wait 5 minutes
      nextReviewAt.setTime(nextReviewAt.getTime() + 5 * 60 * 1000); // 5 minutes
    } else if (ratingStr === 'good') {
      if (newLearningStep === 0) {
        newLearningStep = 1;
        nextReviewAt.setTime(nextReviewAt.getTime() + 10 * 60 * 1000); // 10 minutes
      } else {
        // Graduate to SM-2
        newIsGraduated = true;
        newInterval = 1;
        newRepetitions = 1;
        nextReviewAt.setDate(nextReviewAt.getDate() + newInterval); // 1 day
      }
    } else if (ratingStr === 'easy') {
      // Instantly graduate to a longer interval
      newIsGraduated = true;
      newInterval = 4;
      newRepetitions = 1;
      nextReviewAt.setDate(nextReviewAt.getDate() + newInterval); // 4 days
    }
  } else {
    // Graduated Phase (Standard SM-2)
    if (grade >= 3) {
      if (newRepetitions === 0) {
        newInterval = 1;
      } else if (newRepetitions === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(newInterval * newEasinessFactor);
      }
      newRepetitions += 1;
      nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);
    } else {
      // Incorrect response (forgot) - re-enter learning phase!
      newIsGraduated = false;
      newLearningStep = 0;
      newRepetitions = 0;
      newInterval = 0;
      nextReviewAt.setTime(nextReviewAt.getTime() + 1 * 60 * 1000); // 1 minute
    }

    // Update Easiness Factor (EF)
    newEasinessFactor = newEasinessFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    if (newEasinessFactor < 1.3) {
      newEasinessFactor = 1.3;
    }
  }

  return { nextReviewAt, newInterval, newRepetitions, newEasinessFactor, newLearningStep, newIsGraduated };
};
