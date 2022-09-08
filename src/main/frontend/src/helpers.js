import axios from 'axios'
import jwt_decode from 'jwt-decode'

export function setAuthToken(token) {
	if (token) {
		axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
	} else {
		delete axios.defaults.headers.common["Authorization"];
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		localStorage.removeItem("isAdmin");
	}
};

export function decodeToken(token) {
	return jwt_decode(token);
}
