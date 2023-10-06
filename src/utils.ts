import type { Achievement } from './@types';

export const countAchievement: (
  arr: Achievement[],
  val: Achievement['name'],
  max?: number
) => number = (arr, val, max) => {
  let count = 0;

  for (const achievement of arr) {
    if (achievement.name === val) {
      count++;

      if (max && count >= max) {
        break;
      }
    }
  }

  return count;
};
