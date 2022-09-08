import axios from 'axios'

const MODULE_API_BASE_URL = "http://localhost:8080/api/v1/module"

class ModuleService {

	getModulesInfo() {
		return axios.get(MODULE_API_BASE_URL);
	}

	getModulesListByYear(year) {
		return axios.get(MODULE_API_BASE_URL + `/${year}`)
	}

	getStudentModules() {
		return axios.get(MODULE_API_BASE_URL + '/students-modules')
	}

	getDistinctYears() {
		return axios.get(MODULE_API_BASE_URL + '/years');
	}


}

export default new ModuleService();