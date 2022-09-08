const getDatesOfDayBetweenDates = (start, end, dayOfWeek) => {
	var result = [];
	const days = {
		SUNDAY: 0,
		MONDAY: 1,
		TUESDAY: 2,
		WEDNESDAY: 3,
		THURSDAY: 4,
		FRIDAY: 5,
		SATURDAY: 6
	};
	const dayToFind = days[dayOfWeek];
	var current = start;
	// find next date of the day we are looking for
	// mod 7 so if current date is the day we are looking for it is not skipped i.e. current date + 0 days
	current.setDate(current.getDate() + (dayToFind - current.getDay() + 7) % 7)
	while (current < end) {
		result.push(new Date(current));
		current.setDate(current.getDate() + 7);
	}
	return result;
}

export default getDatesOfDayBetweenDates;