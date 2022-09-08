import axios from 'axios'

const STUDENT_API_BASE_URL = "http://localhost:8080/api/v1/student"

class StudentService {

	getStudents() {
		return axios.get(STUDENT_API_BASE_URL);
	}

}

export default new StudentService();