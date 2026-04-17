export function getNextBriefDate(): Date {
  const now = new Date();
  const nextSunday = new Date();
  
  // Calculate days until next Sunday (0 is Sunday)
  const daysUntilSunday = (7 - now.getDay()) % 7;
  
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(18, 0, 0, 0); // 6:00 PM
  
  // If next Sunday is today but we passed 6pm, move to next week
  if (daysUntilSunday === 0 && now.getHours() >= 18) {
    nextSunday.setDate(nextSunday.getDate() + 7);
  } else if (daysUntilSunday === 0 && now.getHours() < 18) {
    // It is today (Sunday) before 6pm, so nextSunday is correct
  } else if (daysUntilSunday !== 0) {
     // It is not Sunday, so nextSunday logic above works (it finds upcoming Sunday)
  }
  
  // Correction: the modulo logic above might return today if today is Sunday. 
  // Let's make it robust.
  
  // If today is Sunday (0)
  if (now.getDay() === 0) {
      if (now.getHours() >= 18) {
          // Passed 6pm, next one is next week
          nextSunday.setDate(now.getDate() + 7);
      } else {
          // Before 6pm, it's today
          // nextSunday is already set to today 18:00
      }
  } else {
      // Not Sunday. The daysUntilSunday calc:
      // Mon(1) -> 6 days
      // Sat(6) -> 1 day
      nextSunday.setDate(now.getDate() + daysUntilSunday);
  }
  
  return nextSunday;
}

export function daysAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}