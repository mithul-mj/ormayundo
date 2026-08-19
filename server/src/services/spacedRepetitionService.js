export const calculateNextReview = (currentCorrectCount, rating) => {
  let newCorrectCount = currentCorrectCount;
  let intervalMinutes = 1; // Used for testing instead of days

  if (rating === 'forgot') {
    newCorrectCount = 0; // Reset streak
    intervalMinutes = 1; // See it in 1 minute
  } else {
    // If they got it right, increase their streak
    newCorrectCount += 1;

    // Apply the multiplier based on how easy it was
    if (rating === 'hard') {
      newCorrectCount -= 0.5; // Slow down progression
    } else if (rating === 'easy') {
      newCorrectCount += 1;   // Speed up progression
    }

    // Determine interval based on streak (IN MINUTES FOR TESTING)
    if (newCorrectCount <= 1) intervalMinutes = 1;
    else if (newCorrectCount <= 2) intervalMinutes = 3;
    else if (newCorrectCount <= 3) intervalMinutes = 5;
    else if (newCorrectCount <= 4) intervalMinutes = 10;
    else intervalMinutes = 15; // Max out at 15 minutes for testing
  }

  // Calculate the exact future date by adding minutes instead of days
  const nextReviewAt = new Date();
  nextReviewAt.setMinutes(nextReviewAt.getMinutes() + Math.round(intervalMinutes));

  return { nextReviewAt, newCorrectCount, intervalDays: intervalMinutes };
};
