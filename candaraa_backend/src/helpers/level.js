const BASE_POINTS = 100;
const FACTOR = 1.3;


export const calculateLevel = (totalPoints) => {
  let level = 0;
  let pointsNeeded = BASE_POINTS;

  while (totalPoints >= pointsNeeded) {
    totalPoints -= pointsNeeded;
    pointsNeeded = Math.floor(pointsNeeded * FACTOR);
    level++;
  }

  return level;
};


export const pointsForNextLevel = (level) => {
  return Math.floor(BASE_POINTS * Math.pow(FACTOR, level - 1));
};
