import axios from 'axios'

const LECTURER_API_BASE_URL = "http://localhost:8080/api/v1/lecturer"

class LecturerService {
	
	getLecturers() {
		return axios.get(LECTURER_API_BASE_URL);
	}

	addLecturer(lecturer) {
		return axios.post(LECTURER_API_BASE_URL, lecturer);
	}

	uploadLecturerFiles(files) {
		const formData = new FormData();
		files.forEach(file => {
			formData.append('files', file);	
		});

		return axios.post(
			LECTURER_API_BASE_URL + '/upload',
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data"
				}
			}
		)
	}

	deleteLecturerIds(lecturerIds) {
		return axios.delete(LECTURER_API_BASE_URL, { data: lecturerIds });
	}
}

export default new LecturerService();