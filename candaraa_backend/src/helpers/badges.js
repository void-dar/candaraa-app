
export const checkBadges = (user) => {
  const newBadges = [];

  if (user.level >= 30 && !user.badges.includes("Intermediate")) newBadges.push("Intermediate");
  if (user.points >= 5000 && !user.badges.includes("Collector")) newBadges.push("Collector");

  return newBadges;
};
