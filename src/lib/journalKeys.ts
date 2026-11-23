/** Where a week's goals and a day's journal note are kept (with the person's other progress). */
export const goalKey = (week: number) => `goal:w${week}`;
export const noteKey = (week: number, day: number) => `jn:w${week}d${day}`;
