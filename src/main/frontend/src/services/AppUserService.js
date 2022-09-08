import axios from "axios";

const APPUSER_API_BASE_URL = 'http://localhost:8080/api/v1/user'

class AppUserService {
	findMe() {
		return axios.get(APPUSER_API_BASE_URL + '/me');
	}

	deleteUserIds(userIds) {
		return axios.delete(APPUSER_API_BASE_URL, { data: userIds });
	}

	getLecturers() {
		return axios.get(APPUSER_API_BASE_URL + '/lecturers');
	}

	getStudents() {
		return axios.get(APPUSER_API_BASE_URL + '/students');
	}

	addLecturer(lecturer) {
		return axios.post(APPUSER_API_BASE_URL, lecturer);
	}

	uploadLecturerFiles(files) {
		const formData = new FormData();
		files.forEach(file => {
			formData.append('files', file);
		});

		return axios.post(
			APPUSER_API_BASE_URL + '/upload',
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data"
				}
			}
		)
	}
}

export default new AppUserService();