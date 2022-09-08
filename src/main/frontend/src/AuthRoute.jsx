import React, { useEffect, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { setAuthToken } from './helpers';

const AuthRoute = ({ component: Component, ...rest }) => {

	const [loggedIn, setLoggedIn] = useState(null);
	const [atLogin, setAtLogin] = useState(null);

	useEffect(() => {
		setAtLogin(window.location.pathname === "/");

		const token = localStorage.getItem("accessToken");
		setLoggedIn(Boolean(token));
		if (token) {
			setAuthToken(token);
		}
	}, [])

	return (
		<>
		{ 
			loggedIn !== null && atLogin !== null &&
				<Route {...rest}
					render={props => (
						(loggedIn && !atLogin) || (atLogin)
						? <Component {...props} /> 
						: <Redirect to={{ pathname: "/" }} />
					)}
				/>
		}
		</>
	);
};

export default AuthRoute;