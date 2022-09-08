import { Layout, Select, Table, Typography } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import React, { Component } from 'react';
import ModuleService from '../services/ModuleService';
import HeaderComponent from './HeaderComponent';
import SideBarComponent from './SideBarComponent';

class LectureModulesPageComponent extends Component {

	constructor(props) {
		
		super(props)

		this.state = {
			lectureModules: [],
			years: [],
			selectedYear: null,
			showingModules: []
		}
	}

	componentDidMount() {
		ModuleService.getModulesInfo().then(res => {
			const moduleData = res.data.map(mod => {
				if (mod.lecturers == null) {
					mod.lecturers = []
				}

				Object.keys(mod).forEach(key => {
					if (mod[key] == null) {
						mod[key] = '';
					}
				})
			
				return {...mod, key: mod.id};
			});
			this.setState({lectureModules: moduleData, showingModules: moduleData})
		});

		ModuleService.getDistinctYears().then(res => {
			this.setState({years: res.data})
		})
	}

	render() {
		const columns = [
			{
				title: 'Level',
				dataIndex: 'level',
				sorter: (a,b) => a.level.localeCompare(b.level),
				defaultSortOrder: 'ascend'
			},
			{
				title: 'Module Code',
				dataIndex: 'moduleCode',
				sorter: (a,b) => a.moduleCode.localeCompare(b.moduleCode),
			},
			{
				title: 'Title',
				dataIndex: 'title',
				sorter: (a,b) => a.title.localeCompare(b.title),
			},
			{
				title: 'Year',
				dataIndex: 'year',
				sorter: (a,b) => (a.year > b.year) ? 1 : (a.year < b.year) ? -1 : 0,
				defaultSortOrder: 'descend'
			},
			{
				title: 'Semester',
				dataIndex: 'semester',
				sorter: (a,b) => a.semester.localeCompare(b.semester),
				defaultSortOrder: 'ascend'
			},
			{
				title: 'Hours per Week',
				dataIndex: 'hoursPerWeek',
				sorter: (a,b) => (a.year > b.year) ? 1 : (a.year < b.year) ? -1 : 0,
			},
			{
				title: 'Lecturers',
				dataIndex: 'lecturers',
				render: (text, record) => {
					return (text == null) ? '' : text.map(lecturer => (<Typography key={lecturer}>{lecturer}</Typography>))
				},
				sorter: (a,b) => (a.lecturers.length > b.lecturers.length) ? 1 : (a.lecturers.length < b.lecturers.length) ? -1 : 0,
			},
			{
				title: 'Coordinator',
				dataIndex: 'coordinator',
				sorter: (a,b) => a.coordinator.localeCompare(b.coordinator),
			},
			{
				title: 'Reviewer',
				dataIndex: 'reviewer',
				sorter: (a,b) => a.reviewer.localeCompare(b.reviewer),
			},
			{
				title: 'Number of Students',
				dataIndex: 'numberOfStudents',
				sorter: (a,b) => (a.numberOfStudents > b.numberOfStudents) ? 1 : (a.numberOfStudents < b.numberOfStudents) ? -1 : 0,
				defaultSortOrder: 'ascend'
			}

		];

		const selectOnChange = (value) => {
			if (value === 'all') {
				this.setState({showingModules: this.state.lectureModules});
			}
			else {
				const showingModules = this.state.lectureModules.filter(mod => mod.year === value);
				this.setState({showingModules: showingModules});
			}
			
		};

		return (
			<Layout className='outer-layout'>
				<HeaderComponent />
				<Layout className='inner-layout'>
					<SideBarComponent history={this.props.history} selectedKey="lecturemodules" />
					<Content className='content'>
						<div className='action-buttons-row'>
							<Typography>
								Year: 
								<Select 
									id='yearSelect'
									defaultValue="all"	
									style={ {width: "73px", marginLeft: 8} }
									onChange={selectOnChange}
								>
									<Select.Option key="all" value="all">All</Select.Option>
									{this.state.years.map(year => (
										<Select.Option key={year} value={year}>{year}</Select.Option>
									))}
								</Select>
							</Typography>
						</div>
						<div>
							<Table
								columns={columns}
								dataSource={this.state.showingModules}
								scroll={ {y: 470} }
								pagination={false} />
						</div>
						<div className='action-buttons-row'>
							<Typography>
								Number of records: {this.state.showingModules.length}
							</Typography>
						</div>
					</Content>
				</Layout>
			</Layout>
		);
	}
}

export default LectureModulesPageComponent;