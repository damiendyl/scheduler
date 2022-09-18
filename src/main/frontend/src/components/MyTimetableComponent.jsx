import { Breadcrumb, Button, Layout, Tooltip } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { LogoutOutlined } from '@ant-design/icons';
import React, { Component } from 'react';
import TimetableService from '../services/TimetableService';
import HeaderComponent from './HeaderComponent';
import { WeeklyCalendar } from 'antd-weekly-calendar';
import getDatesOfDayBetweenDates from '../getDatesOfDayBetweenDates';
import { decodeToken } from '../helpers';
import SideBarComponent from './SideBarComponent';

class MyTimetableComponent extends Component {

	constructor(props) {
		super(props)
		
		this.state = {
			isAdmin: false,
			timetableEvents: []
		}

		this.fixCSS = this.fixCSS.bind(this)
		this.eventClicked = this.eventClicked.bind(this)
	}

	eventClicked(event) {
		console.log(event)
	}

	fixCSS() {
		const divs = document.getElementsByTagName("div");
		for (var i = 0; i < divs.length; i++) {
			const top = divs[i].style.top;
			if (parseInt(top) > 100) {
				divs[i].style.top = "0";
			}
		}
	}

	componentDidMount() {
		this.setState({
			isAdmin: decodeToken(localStorage.getItem('accessToken')).isAdmin
		})

		TimetableService
			.getMyTimetable(new Date().getFullYear())
			.then(res => {
				const events = [];
				res.data.map(semesterSchedule => {
					const year = semesterSchedule.year;
					semesterSchedule.schedule.map(schedule => {
						const classroom = schedule.classroom.name;
						const startHour = parseInt(schedule.hourSlot) + 9;
						const moduleName = schedule.module.title;
						const dow = schedule.dow;
						const beginDate = new Date(schedule.module.beginDate);
						const endDate = new Date(schedule.module.endDate);
						const dates = getDatesOfDayBetweenDates(beginDate, endDate, dow)
						const title = <Tooltip placement="topLeft" overlayStyle={{whiteSpace: 'pre-line'}} title={moduleName + '\n' + classroom}>{moduleName}</Tooltip>
						dates.forEach(date => {
							events.push({
								startTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour, 0, 0),
								endTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour+1, 0, 0),
								title: title,
								location: classroom
							})
						})
					})
				})
				this.setState(
					{timetableEvents: events});
			})
			.catch(e => console.log('error', e))

		
		const divs = document.getElementsByClassName("ant-table-body");
		for (var i = 0; i < divs.length; i++) {
			divs[i].style.maxHeight = "500px"
		}
	}

	render() {
		return (
			<Layout className='outer-layout'>
				<HeaderComponent title={this.state.isAdmin ? null : 'My Timetable'} />
				<Layout className='inner-layout'>
					{ this.state.isAdmin ? <SideBarComponent history={this.props.history} selectedKey='my-timetable' /> : null }
					<Content className='content'>
						{ this.state.isAdmin ? null :
							<Breadcrumb style={ {margin: "0 0 10px 15px"} }>
								<Breadcrumb.Item href="/">
									<Button>
										<LogoutOutlined style={{marginRight: 10}}/>
										<a>Logout</a>
									</Button>
								</Breadcrumb.Item>
							</Breadcrumb>
						}
						<WeeklyCalendar events={this.state.timetableEvents} 
							style = {{outerHeight: 300}}
							onSelectDate={this.fixCSS}
							onEventClick={this.eventClicked}
							weekends={true}
						/>
					</Content>
				</Layout>
			</Layout>
		);
	}
}

export default MyTimetableComponent;