import axios from 'axios'

const USER_API_BASE_URL = 'http://localhost:8080/api/v1/auth/login'

class LoginService {
	login(username, password) {
		const payload = {
			username: username,
			password: password
		}

		return axios.post(USER_API_BASE_URL, payload)
	}
}

export default new LoginService();