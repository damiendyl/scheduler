import React, { Component } from 'react';
import { Layout, Menu } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
const { Sider } = Layout

class SideBarComponent extends Component {

	constructor(props) {
		super(props);
	}

	render() {
		return (
				<Sider theme='light'>
					<Menu 
						theme='light'
						mode='inline'
						style= {{minHeight: "100%"}}
						selectedKeys={this.props.selectedKey}
						items = {[
							{
								key: 'timetables',
								label: <Link to='/timetables'>Timetables</Link>,
							},
							{
								key: 'my-timetable',
								label: <Link to='/my-timetable'>My Timetable</Link>
							},
							{
								key: 'lecturers',
								label: <Link to='/lecturers'>Lecturers</Link>,
							},
							{
								key: 'students',
								label: <Link to='/students'>Students</Link>,
							},
							{
								key: 'classrooms',
								label: <Link to='/classrooms'>Classrooms</Link>,
							},
							{
								key: 'lecturemodules',
								label: <Link to='/lecturemodules'>Modules</Link>,
							},
							{
								key: 'logout',
								label: <Link to='/'>Logout</Link>,
								icon: <LogoutOutlined />
							}
						]}
					/>
				</Sider>
		);
	}
}

export default SideBarComponent;