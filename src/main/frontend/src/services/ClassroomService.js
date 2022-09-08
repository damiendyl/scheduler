import axios from 'axios'

const CLASSROOM_API_BASE_URL = "http://localhost:8080/api/v1/classroom"

class ClassroomService {

	getClassrooms() {
		return axios.get(CLASSROOM_API_BASE_URL);
	}

	addClassrooms(classroomList) {
		return axios.post(CLASSROOM_API_BASE_URL, classroomList);
	}

	uploadClassroomFiles(fileList) {
		const formData = new FormData();
		fileList.forEach( file => {
			formData.append('files', file);
		});

		return axios.post(
			CLASSROOM_API_BASE_URL + '/upload',
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data"
				}
			}
		);
	}

	deleteClassroomIds(classroomIds) {
		return axios.delete(CLASSROOM_API_BASE_URL, { data: classroomIds });
	}
}

export default new ClassroomService();