import React from 'react'
import logo from '../assets/crested-wm-white.png'
import { Col, Layout, PageHeader, Row, Typography } from 'antd'
const { Header } = Layout
const { Title } = Typography

function HeaderComponent(props) {
	const uniLogo = (
		<img src={logo} alt="logo" className='logo' />
	);

	const title = (
			<Header style={{
					height: "158.3px",
					position: 'sticky'
				}}
			>
				{uniLogo}
				<Title style={{
					color:'#f5f5f5ec',
					paddingTop: 50,
					paddingLeft: (props.title === 'My Timetable') ? 700 : null,
				}}>
					{props.title ? props.title : "Intelligent University Room Allocation and Scheduling System" }
				</Title>
			</Header>
	);

	return (
		<header>
			{title}
		</header>
	);
}

export default HeaderComponent;