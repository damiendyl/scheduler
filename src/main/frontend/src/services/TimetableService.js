import axios from 'axios'

const TIMETABLE_API_BASE_URL = 'http://localhost:8080/api/v1/timetable'

class TimetableService {

	getTimetables(year, semester) {
		const params = {
			year: year,
			semester: semester
		}
		return axios.get(TIMETABLE_API_BASE_URL, {params: params});
	}

	getMyTimetable(year) {
		return axios.get(TIMETABLE_API_BASE_URL + `/my-timetable/${year}`)
	}

	getTimetableYears() {
		return axios.get(TIMETABLE_API_BASE_URL + '/years');
	}

	saveNewTimetable(year, semester, scheduleList) {
		const body = {
			year: year,
			semester: semester,
			schedules: scheduleList
		}
		return axios.post(TIMETABLE_API_BASE_URL, body)
	}

	saveNewTimetablesSpreadsheet(listOfSlots) {
		return axios.post(TIMETABLE_API_BASE_URL + '/new-timetables', listOfSlots)
	}

}

export default new TimetableService();