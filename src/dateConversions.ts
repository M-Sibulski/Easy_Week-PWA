export const dateToInputType = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}

export const dateToTitle = (date:Date) => {
    const day = date.getDay()
    let dayName = ""
    switch(day) {
        case 0: 
            dayName="Sunday";
            break;
        case 1: 
            dayName="Monday";
            break;
        case 2: 
            dayName="Tuesday";
            break;
        case 3: 
            dayName="Wednesday";
            break;
        case 4: 
            dayName="Thursday";
            break;
        case 5: 
            dayName="Friday";
            break;
        case 6: 
            dayName="Saturday";
            break;
    }
    const dayTitle = dayName + ', ' + date.getDate();
    return dayTitle
}

export const getWeek = (today: Date, week_starting_day:number) => {
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const currentDay = normalizedToday.getDay(); // 0 (Sun) - 6 (Sat)
    
    // Calculate how many days to subtract to get to week start
    const daysToWeekStart = (currentDay - week_starting_day + 7) % 7;
    const daysToWeekEnd = 6 - daysToWeekStart;

    const weekStart = new Date(normalizedToday);
    weekStart.setDate(normalizedToday.getDate() - daysToWeekStart);

    const weekEnd = new Date(normalizedToday);
    weekEnd.setDate(normalizedToday.getDate() + daysToWeekEnd);

    return { weekStart, weekEnd };
}

interface Week {weekStart: Date, weekEnd: Date}

export const getNextWeekRange = (week:Week) => {
  // Clone the currentWeekStart to avoid mutating the original
  const nextWeekStart = new Date(week.weekStart);
  nextWeekStart.setDate(week.weekStart.getDate() + 7);

  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekStart.getDate() + 6);

  return { weekStart: nextWeekStart, weekEnd: nextWeekEnd };
}

export const getPrevWeekRange = (week:Week) => {
  // Clone the currentWeekStart to avoid mutating the original
  const nextWeekStart = new Date(week.weekStart);
  nextWeekStart.setDate(week.weekStart.getDate() - 7);

  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekStart.getDate() + 6);

  return { weekStart: nextWeekStart, weekEnd: nextWeekEnd };
}