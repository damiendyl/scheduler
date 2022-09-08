import axios from "axios";

const ROLE_API_BASE_URL = 'http://localhost:8080/api/v1/role'

class RoleService {
	getRoles() {
		return axios.get(ROLE_API_BASE_URL);
	}
}

export default new RoleService();