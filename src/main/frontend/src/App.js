import './App.css';
import React, { useEffect, useState } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import TimetablePageComponent from './components/TimetablePageComponent';
import LoginFormComponent from './components/LoginFormComponent';
import LecturersPageComponent from './components/LecturersPageComponent';
import ClassroomsPageComponent from './components/ClassroomsPageComponent';
import LectureModulesPageComponent from './components/LectureModulesPageComponent';
import StudentsPageComponent from './components/StudentsPageComponent';
import MyTimetableComponent from './components/MyTimetableComponent';
import { setAuthToken } from './helpers';
import AuthRoute from './AuthRoute';
import AdminRoute from './AdminRoute';

function App() {

	const [loggedIn, setLoggedIn] = useState(null);
	const [isAdmin, setAdmin] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem("accessToken");
		setLoggedIn(Boolean(token));
		if (token) {
			setAuthToken(token);
			const isAdmin = localStorage.getItem('isAdmin');
			setAdmin(isAdmin);
		}
	})

	return (
		<React.Fragment>
			{ loggedIn !== null &&
				<Switch>
					<Route exact path="/" component={LoginFormComponent} />
					<AdminRoute path="/timetables" component={TimetablePageComponent} />
					<AdminRoute path="/lecturers" component={LecturersPageComponent} />
					<AdminRoute path="/classrooms" component={ClassroomsPageComponent} />
					<AdminRoute path="/lecturemodules" component={LectureModulesPageComponent} />
					<AdminRoute path="/students" component={StudentsPageComponent} />
					<AuthRoute path="/my-timetable" component={MyTimetableComponent} />
					<Redirect to={ isAdmin ? "timetables" : "my-timetable" } />
				</Switch>
			}
		</React.Fragment> 
	);
}

export default App;
