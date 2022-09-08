import { AutoComplete, Layout, PageHeader, Table, Typography } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import React, { Component } from 'react';
import ModuleService from '../services/ModuleService';
import AppUserService from '../services/AppUserService';
import SideBarComponent from './SideBarComponent';
import { debounce } from 'debounce'
import HeaderComponent from './HeaderComponent';

class StudentsPageComponent extends Component {

	constructor(props) {
		super(props);

		this.state = {
			students: [],
			showingStudents: [],
			moduleTitles: [],
			autoCompleteOptions: [],
			moduleSearchValue: "",
			studentSearchValue: ""
		}

		this.onChangeDebounced = this.onChangeDebounced.bind(this);
		this.onChangeModuleSearch = this.onChangeModuleSearch.bind(this);
		this.onSearchModule = this.onSearchModule.bind(this);
		this.onChangeStudentSearch = this.onChangeStudentSearch.bind(this);
	}

	studentIncludesText(student, text) {
		const fullNameIncludes = student.fullName.toLowerCase().includes(text);
		const emailIncludes = student.email.includes(text);
		const studentIdIncludes = student.orgId.includes(text);

		return (fullNameIncludes || emailIncludes || studentIdIncludes);
	}

	studentModulesHasText(student, text) {
		let hasText = false;
		for (const [semester, semesterModule] of Object.entries(student.modules)) {
			semesterModule.forEach(module => {
				if (module.toLowerCase().includes(text)) {
					hasText = true
				}
			})
		}
		return hasText;
	}

	onChangeDebounced() {
		debounce(this.updateStudentListOnChange, 3000);
	}

	updateStudentListOnChange() {
		console.log(this.state.students)
		let moduleSearchValue = document.getElementById('moduleSearchBar').value;
		moduleSearchValue = (moduleSearchValue === null || moduleSearchValue === "") ? "" : moduleSearchValue.trim().toLowerCase();
		let studentSearchValue = document.getElementById('studentSearchBar').value;
		studentSearchValue = (studentSearchValue === null || studentSearchValue === "") ? "" : studentSearchValue.trim().toLowerCase();
		const moduleSearchIsEmpty = (moduleSearchValue.length === 0) ? true : false;
		const studentSearchIsEmpty = (studentSearchValue.length === 0) ? true : false;


		let newStudentList = [];

		if (!moduleSearchIsEmpty && !studentSearchIsEmpty) {
			this.state.students.forEach(student => {
				if (this.studentIncludesText(student, studentSearchValue)) {
					if (this.studentModulesHasText(student, moduleSearchValue)) {
						newStudentList.push(student);
					}
				}
			});
		} else if (!moduleSearchIsEmpty) {	
			this.state.students.forEach(student => {
				if (this.studentModulesHasText(student, moduleSearchValue)) {
					newStudentList.push(student);
				}
			});
		} else if (!studentSearchIsEmpty) {
			this.state.students.forEach(student => {
				if (this.studentIncludesText(student, studentSearchValue)) {
					newStudentList.push(student);
				}
			})
		} else {
			newStudentList = this.state.students;
		}
		this.setState({showingStudents: newStudentList})
	}

	onChangeModuleSearch(searchText) {
		this.onSearchModule(searchText)
		this.setState({moduleSearchValue: searchText}, 
			() => this.updateStudentListOnChange());
		
	}

	onSearchModule(searchText) {
		const newAutoCompleteOptions = [];
		this.state.moduleTitles.forEach(title => {
			if (title.toLowerCase().includes(searchText.toLowerCase())) {
				newAutoCompleteOptions.push({value: title});
			}
		});
		this.setState({autoCompleteOptions: newAutoCompleteOptions});
	}

	onChangeStudentSearch(searchText) {
		this.setState({studentSearchValue: searchText}, () => this.updateStudentListOnChange());
		
	}

	getStudentData() {
		ModuleService.getStudentModules().then(res => {
			const studentModules = res.data;

			AppUserService.getStudents().then(res => {
				const students = res.data.map(student => {
					const modules = studentModules[student.id];
					const fullName = student.firstName + ' ' + student.lastName
					return {...student, modules, fullName: fullName};
				});

				this.setState({students: students, showingStudents: students});
			});
		});

		ModuleService.getModulesInfo().then(res => {
			const autoCompleteOptions = res.data.map(module => ({
				value: module.title
			}));

			const titles = res.data.map(module => {
				return module.title;
			})
			
			this.setState({
				moduleTitles: titles,
				autoCompleteOptions: [...autoCompleteOptions]
			});
		})
	}

	componentDidMount() {
		this.getStudentData();
	}

	

	render() {

		const stringSorter = (a, b) => {
			return a.localeCompare(b);
		}

		const tableColumns = [
			{
				title: 'Student ID',
				dataIndex: 'orgId',
				width: 200,
				sorter: (a,b) => stringSorter(a.orgId, b.orgId),
			},
			{
				title: 'First Name',
				dataIndex: 'firstName',
				width: 200,
				sorter: (a,b) => stringSorter(a.firstName, b.firstName),
			},
			{
				title: 'Last Name',
				dataIndex: 'lastName',
				width: 200,
				sorter: (a,b) => stringSorter(a.lastName, b.lastName),
			},
			{
				title: 'Email',
				dataIndex: 'email',
				width: 300,
				sorter: (a,b) => stringSorter(a.email, b.email),
			},
			{
				title: 'Modules',
				children: [
					{
						title: 'Semester 1',
						dataIndex: 'modules',
						render: (text) => {
							const arr = text.semester1.map(module => module);
							return (arr.join("\n"))
						}
					},
					{
						title: 'Semester 2',
						dataIndex: 'modules',
						render: (text) => {
							const arr = text.semester2.map(module => module);
							return (
								arr.join("\n")
							)
						}
					},
				]
			}
		]

		return (
			<Layout className='outer-layout'>
				<HeaderComponent />
				<Layout className='inner-layout'>
					<SideBarComponent history={this.props.history} selectedKey="students" />
					<Content className='content'>
						<div className='action-buttons-row'>
							<Typography>
								Module:
								<AutoComplete
									id='moduleSearchBar'
									options={this.state.autoCompleteOptions}
									style={ {minWidth: 400, marginLeft: 8} }
									onChange={this.onChangeModuleSearch}
								/>
							</Typography>
							<Typography>
								Student:
								<AutoComplete 
									id='studentSearchBar'
									style={ {minWidth: 400, marginLeft: 8} }
									onChange={this.onChangeStudentSearch}
								/>
							</Typography>
						</div>
						<Table
							columns={tableColumns}
							dataSource={this.state.showingStudents}
							scroll={ {y: 440} }
							pagination={false} 
							rowKey={record => record.index}
						/>
						<div className='action-buttons-row'>
							<Typography>
								Number of students: {this.state.showingStudents.length}
							</Typography>
						</div>
					</Content>
				</Layout>
			</Layout>
		);
	}
}

export default StudentsPageComponent;