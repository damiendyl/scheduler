import React, { useEffect, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { decodeToken, setAuthToken } from './helpers';


const AdminRoute = ({ component: Component, ...rest }) => {

	const [loggedIn, setLoggedIn] = useState(null);
	const [isAdmin, setAdmin] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem("accessToken");
		if (token) {
			setAuthToken(token);
			setAdmin(decodeToken(token).isAdmin);
		}
		setLoggedIn(Boolean(token));
	}, [])

	if (loggedIn !== null) {
		if (!loggedIn) {
			return <Redirect to='/' />;
		} else if (!isAdmin) {
			return <Redirect to='/my-timetable' />
		} else {
			return (
				<Route {...rest}
					render={props => (<Component {...props} />)}
				/> 
			);
		}
	}
};

export default AdminRoute;