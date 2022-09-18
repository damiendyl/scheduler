import React, { Component } from 'react';
import SideBarComponent from './SideBarComponent'
import { UploadOutlined, SearchOutlined, InboxOutlined } from '@ant-design/icons';
import { Content } from 'antd/lib/layout/layout';
import { Button, Card, Collapse, Form, Layout, Modal, Popconfirm, Select, Space, Table, Tooltip, Upload, Typography } from 'antd';
import TimetableService from '../services/TimetableService';
import ClassroomService from '../services/ClassroomService';
import ModuleService from '../services/ModuleService';
import Dragger from 'antd/lib/upload/Dragger';
import HeaderComponent from './HeaderComponent';

const { Text } = Typography;

class TimetablePageComponent extends Component {
	constructor(props) {
		super(props)

		this.getTimetableState = this.getTimetableState.bind(this)

		this.state = {
			classrooms: [],
			timetable: {},
			newTimetable: {},
			years: [],
			selectedYear: null,
			modulesList: [],
			yearSearch: [],
			semesterSearch: [],
			editing: null,
			saveLoading: false,
			showModal: '',
			activeTabKey: 'tab1',
			newTimetableSpreadsheet: [],
			newTTMissingValues: {
				modules: [],
				classrooms: [],
			},
			newSpreadsheetUploading: false,
			collapseExpanded: false,
			gettingTimetableState: false
		}
	}

	getTimetableState(year) {
		this.setState({gettingTimetableState: true}, () => {
			ClassroomService.getClassrooms()
				.then(res => {
					this.setState(
						{ classrooms: res.data },
						() => {
							ModuleService.getModulesListByYear(year).then(res => {
								this.setState({
									modulesList: res.data
								},
									() => {
										this.getTimetables(year)
									})
							})
						}
					);
				})
		});
	}

	getTimetables(year, semester = null) {
		const emptyStringArrays = Array.apply(null, Array(9)).map((x, i) => '');

		const daysOfWeek = {
			'monday': structuredClone(emptyStringArrays),
			'tuesday': structuredClone(emptyStringArrays),
			'wednesday': structuredClone(emptyStringArrays),
			'thursday': structuredClone(emptyStringArrays),
			'friday': structuredClone(emptyStringArrays),
			'saturday': structuredClone(emptyStringArrays),
			'sunday': structuredClone(emptyStringArrays)
		};

		var timetable = {};
		// template for initial state for each semester
		const template = this.state.classrooms.map(classroom => {
			return ({
				classroomId: classroom.id,
				classroom: classroom.name,
				schedule: structuredClone(daysOfWeek)
			})
		});


		TimetableService.getTimetables(year, semester).then(res => {
			res.data.forEach(data => {
				var sem = data.semester
				if (timetable[sem] == null) {
					timetable[sem] = structuredClone(template);
				}
				data.schedule.forEach(scheduledLecture => {
					timetable[sem].find((classroom, index) => {
						if (classroom.classroomId === scheduledLecture.classroom.id) {
							const i = index;
							const dayScheduled = scheduledLecture.dow.toLowerCase();
							const hourScheduled = scheduledLecture.hourSlot;
							timetable[sem][i]["schedule"][dayScheduled][hourScheduled] = scheduledLecture.module;
						}
					});
				});
			});

			this.setState({
				timetable: timetable,
				editing: null,
				gettingTimetableState: false,
			})
		})

	}

	componentDidMount() {
		TimetableService.getTimetableYears().then(res => {
			this.setState(
				{ years: res.data.sort((a,b) => a-b) },
				() => {
					this.setState(
						{ selectedYear: this.state.years[this.state.years.length - 1] },
						() => {
							this.getTimetableState(this.state.selectedYear)
						}
					)
				}
			)
		})
	}

	render() {

		const hourSlots = {
			0: "9am",
			1: "10am",
			2: "11am",
			3: "12pm",
			4: "1pm",
			5: "2pm",
			6: "3pm",
			7: "4pm",
			8: "5pm"
		}

		const stringSorter = (a, b) => {
			return a.firstName.localeCompare(b.firstName)
		}

		const timetableFormSubmit = (value) => {
			this.setState({ selectedYear: value.year }, () => this.getTimetableState(this.state.selectedYear))
		}

		const showModal = () => {
			this.setState({ showModal: 'addNewTimetableModal' })
		}

		const startEdit = (e) => {
			if (this.state.editing != null) {
				const cancelButton = document.getElementById('cancel' + this.state.editing)
				cancelButton.focus();
				cancelButton.click();
				return false;
			}
			this.setState({ editing: e.currentTarget.id });
		}

		const cancelEdit = (semester) => {
			document.getElementById(`form${semester}`).reset()
			this.setState({ editing: null })
		}

		const saveEdit = (formData) => {
			this.setState({ saveLoading: true }, this.forceUpdate())
			const semester = formData.semester;
			const year = formData.year;
			const newTimetableSchedule = [];
			for (const key in formData) {
				if (key !== 'year' && key !== 'semester' && formData[key] != null) {
					const moduleId = formData[key];
					const [classroomId, day, hourSlot] = key.split("_");

					newTimetableSchedule.push({
						dow: day.toUpperCase(),
						hourSlot: hourSlot,
						classroomId: classroomId,
						moduleId: moduleId
					});
				}
			}
			TimetableService.saveNewTimetable(year, semester, newTimetableSchedule)
				.then(res => this.getTimetableState(year))
				.then(this.setState({
					editing: null,
					saveLoading: false
				}))
				.catch(e => console.log('error', e))
		}

		const dataTables = [];

		if (!this.state.timetable || Object.keys(this.state.timetable).length === 0) {
			
			const tableColumns = [
				{
					title: 'Classroom',
					dataIndex: 'classroom',
					width: 200,
					fixed: 'left',
				}
			]

			const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
			
			days.forEach(day => {
				var dayColumns = [];
				for (var slot = 0; slot < 9; slot++) {
					const timeSlot = slot;
					dayColumns.push({
						title: timeSlot,
						width: 100,
						ellipsis: {
							showTitle: false
						},
						dataIndex: 'schedule',
					})
				}
				tableColumns.push({
					title: day[0].toUpperCase() + day.slice(1),
					children: dayColumns
				})
			});

			const dataTable = (
				<>
					<h2>{"Year " + this.state.selectedYear}</h2>
					<Table
						columns={tableColumns}
						dataSource={null}
						scroll={{ x: 800, y: 550 }}
						pagination={false}
						rowKey={record => record.index}
					/>
				</>
			)

			dataTables.push(dataTable)
		} else {
			for (const index in this.state.timetable) {
				// module auto complete for the semester
				const moduleSelectOptions = [];
				for (const moduleIndex in this.state.modulesList) {
					if (index === this.state.modulesList[moduleIndex].semester) {
						const label = this.state.modulesList[moduleIndex].title
						const value = this.state.modulesList[moduleIndex].id
						const moduleCode = this.state.modulesList[moduleIndex].moduleCode

						moduleSelectOptions.push(
							<Select.Option key={moduleIndex} value={value}>
								<Tooltip
									placement='topLeft'
									overlayStyle={{ whiteSpace: 'pre-line', textAlign: 'center' }}
									title={moduleCode + "\n" + label}>
									{label}
								</Tooltip>
							</Select.Option>
						)
					}
				}


				const tableColumns = [
					{
						title: 'Classroom',
						dataIndex: 'classroom',
						width: 200,
						fixed: 'left',
					}
				]

				const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

				days.forEach(day => {
					var dayColumns = [];
					for (var slot = 0; slot < 9; slot++) {
						const timeSlot = slot;
						const d = day;
						dayColumns.push({
							title: hourSlots[timeSlot],
							width: 100,
							editable: true,
							dataIndex: 'schedule',
							render: (text, record) => {
								const moduleTitle = record.schedule[d][timeSlot].title;
								const moduleCode = record.schedule[d][timeSlot].moduleCode;
								const moduleId = record.schedule[d][timeSlot].id;
								const classroomId = record.classroomId;
								const formItemName = [classroomId, d, timeSlot].join("_")
								const cell = (this.state.editing === index) ?
									(<Select
										showSearch
										dropdownMatchSelectWidth={false}
										placement='topLeft'
										filterOption={(inputValue, option) => (
											option.children.props.title.toLowerCase().includes(inputValue.toLowerCase())
										)}
									>
										{moduleSelectOptions}
									</Select>) :
									(<Tooltip
										placement='topLeft'
										overlayStyle={{ textAlign: 'center' }}
										title={moduleCode + "\n" + moduleTitle}>
										{moduleTitle}
									</Tooltip>);


								return (
									<Form.Item key={formItemName} name={formItemName} initialValue={moduleId} style={{ margin: 0 }}>
										{cell}
									</Form.Item>
								)
							}
						})
					}

					tableColumns.push({
						title: day[0].toUpperCase() + day.slice(1),
						children: dayColumns
					})
				});

				const onCollapseChange = () => {
					let expanded = false;

					const headers = document.getElementsByClassName("ant-collapse-header")
					for (const i in headers) {
						if (headers[i].getAttribute('aria-expanded')) {
							expanded = true;
							document.getElementById('topLayout').style.minHeight = "1777px"
							break
						}
					}


					if (!expanded) {
						document.getElementById('topLayout').style.minHeight = "100vh"
					}
				}

				const dataTable = (
					<>
						<Form onFinish={saveEdit} id={`form${index}`}>
							<Form.Item name='year' initialValue={this.state.selectedYear} hidden={true} />
							<Form.Item name='semester' initialValue={index} hidden={true} />
							<div className='action-buttons-row' style={{ position: 'relative' }}>
								<h2>{"Year " + this.state.selectedYear + " Semester " + index}</h2>
								<Button id={index} type='default' onClick={startEdit} style={{ display: ((this.state.editing === index) ? 'none' : 'block') }}>Edit</Button>
								<Popconfirm title='Changes will not be saved. Are you sure?' onConfirm={() => cancelEdit(index)} >
									<Button id={'cancel' + index} loading={this.state.saveLoading} type='danger' style={{ display: ((this.state.editing === index) ? 'block' : 'none') }}>Cancel</Button>
								</Popconfirm>
								<Button type='primary' loading={this.state.saveLoading} htmlType='submit' style={{ display: ((this.state.editing === index) ? 'block' : 'none') }}>Save</Button>
							</div>
							<Table
								bordered
								columns={tableColumns}
								dataSource={ this.state.gettingTimetableState ? null : this.state.timetable[index] }
								scroll={{ x: 800, y: 550 }}
								pagination={false}
								rowKey={record => record.index}
							/>
						</Form>
					</>
				);

				dataTables.push((
					<div style={{ margin: 20}}>
						{dataTable}
					</div>
				));
			}
		}


		const uploadProps = {
			name: 'file',
			maxCount: 1,
			beforeUpload: (file) => {
				this.setState(
					{newSpreadsheetUploading: true},
					() => {
						const allClassrooms = {} 
						ClassroomService.getClassrooms().then(res => {
							res.data.forEach(classroom => {
								allClassrooms[classroom.name] = classroom.id
							})
						}).then( () => {
							const allLectureModules = {}
							ModuleService.getModulesInfo().then(res => {
								res.data.forEach(lectureModule => {
									allLectureModules[lectureModule.moduleCode] = {
										year: lectureModule.year,
										semester: lectureModule.semester,
										id: lectureModule.id
									}
								})
							}).then( () => {
								const fileReader = new FileReader();
								const fileData = [];
								const missingClassrooms = [];
								const missingModules = [];
				
								fileReader.readAsText(file)
								fileReader.onload = rowData => {
									const allData = fileReader.result.split("\r\n");
									allData.forEach(row => {
										const rowData = row.split(",")
										if (rowData.length === 7) {
											const [dow, hourSlot, classroom, moduleCode, moduleTitle, semester, year] = rowData
											fileData.push({
												year: year,
												semester: semester,
												dow: dow.toUpperCase(),
												hourSlot: hourSlot,
												classroom: classroom,
												moduleCode: moduleCode,
												moduleTitle: moduleTitle
											});
				
											if (!(classroom in allClassrooms)) {
												missingClassrooms.push(classroom)
											}
				
											if (!(moduleCode in allLectureModules)) {
												missingModules.push({
													moduleCode: moduleCode,
													moduleTitle: moduleTitle
												})
											}
										}
									})
				
				
				
									this.setState({ 
										newTimetableSpreadsheet: fileData,
										newTTMissingValues: {
											modules: missingModules,
											classrooms: missingClassrooms
										},
										newSpreadsheetUploading: false
									})
								}
							})	
						})
					})

				return false
			},
			onRemove: () => {
				this.setState({ 
					newTimetableSpreadsheet: [],
					newTTMissingValues: {
						modules: [],
						classrooms: []
					}
				})
			},
			accept: '.csv'
		}

		const timetableUploadButton = (
			<Upload {...uploadProps}>
				<Button icon={<UploadOutlined />}
					loading = {this.state.newSpreadsheetUploading}
				>
					Upload File
				</Button>
			</Upload>
		)

		const closeModal = () => {
			this.setState({ showModal: '' })
		}

		const spreadsheetTimetableFormSubmit = () => {
			this.setState({newSpreadsheetUploading: true}, () => {
				TimetableService.saveNewTimetablesSpreadsheet(this.state.newTimetableSpreadsheet).then(res => {
					const year = Math.max(...this.state.newTimetableSpreadsheet.map(o => o.year))
					this.setState({
						selectedYear: year,
						showModal: '',
						newTimetableSpreadsheet: [],
						newTTMissingValues: {
							modules: [],
							classrooms: []
						},
						newSpreadsheetUploading: false
					}, () => this.getTimetableState(this.state.selectedYear))
				})
			})
		}

		const tabList = [
			{
				key: 'tab1',
				tab: 'Visualise Timetable'
			},
			{
				key: 'tab2',
				tab: 'New Timetable'
			}
		];

		const tableColumns = [
			{
				title: 'Day of Week',
				dataIndex: 'dow',
				sorter: (a, b) => stringSorter(a.dow, b.dow)
			},
			{
				title: 'Hour Slot',
				dataIndex: 'hourSlot',
				sorter: (a, b) => stringSorter(a.hourSlot, b.hourSlot)
			},
			{
				title: 'Classroom',
				dataIndex: 'classroom',
				sorter: (a, b) => stringSorter(a.classroom, b.classroom)
			},
			{
				title: 'Module Code',
				dataIndex: 'moduleCode',
				sorter: (a, b) => stringSorter(a.moduleCode, b.moduleCode)
			},
			{
				title: 'Module',
				dataIndex: 'moduleTitle',
				sorter: (a, b) => stringSorter(a.module, b.module)
			},
			{
				title: 'Semester',
				dataIndex: 'semester',
				sorter: (a, b) => stringSorter(a.semester, b.semester)
			},
			{
				title: 'Year',
				dataIndex: 'year',
				sorter: (a, b) => stringSorter(a.year, b.year)
			},
		]

		const classroomWarning = (this.state.newTTMissingValues.classrooms.length > 0) 
			? (<Text type='danger' style={{whiteSpace: 'pre'}}>
					Classrooms: <br />
					{
						this.state.newTTMissingValues.classrooms.map((classroom, index) => {
							return <p style={{margin: 0}}>{(index+1)}. {classroom}</p>
						})
					}
				</Text>)
			: null;

		const moduleWarning = (this.state.newTTMissingValues.modules.length > 0) 
			? (<Text type='danger' style={{whiteSpace: 'pre'}}>
					Modules: <br />
					{
						this.state.newTTMissingValues.modules.map((mod, index) => {
							return <p style={{margin: 0}}>{(index+1)}. {mod.moduleCode} {mod.moduleTitle}</p>
						})
					}
				</Text>)
			: null;
		

		const newTTMissingWarning = (classroomWarning != null || moduleWarning != null) 
			? (<Space direction='vertical' align='start'>
					<Text type='danger' style={{whiteSpace: 'pre-wrap'}}>
						Classrooms / Modules with module codes below are not found in the database. {"\n"}
						They will be added to the database without complete information.
					</Text>
					<Space direction = 'horizontal' size='large' align='start'>
						{classroomWarning}
						{moduleWarning}
					</Space>
				</Space>)
			: null;
		
		const timetableSpreadsheetForm = (
			<Form onFinish={spreadsheetTimetableFormSubmit}>
				<Form.Item label='Please upload spreadsheet following the format of the table below (without headers): '>
					{timetableUploadButton}
				</Form.Item>
				<Table columns={tableColumns}
					dataSource={this.state.newTimetableSpreadsheet}
					scroll={{ x: 850, y: 300 }}
					pagination={false}
				/>
				<span>Number of records: {this.state.newTimetableSpreadsheet.length}</span>
				<Form.Item>
					<Button type='primary' 
						htmlType='submit' 
						disabled={this.state.newTimetableSpreadsheet.length === 0}
						loading = {(this.state.newTimetableSpreadsheet.length > 0 && this.state.newSpreadsheetUploading)}
					>
						Submit
					</Button>
				</Form.Item>
				{newTTMissingWarning}
			</Form>
		)

		const newTimetableForm = (
			<Form>
				<Dragger name='modulesFile' maxCount={1}>
					<p className='ant-upload-drag-icon'><InboxOutlined /></p>
					<p className='ant-upload-hint'>List of modules</p>
				</Dragger>
				<Dragger name='lecturersFile' maxCount={1}>
					<p className='ant-upload-drag-icon'><InboxOutlined /></p>
					<p className='ant-upload-hint'>List of lecturers</p>
				</Dragger>
				<Dragger name='studentsFile' maxCount={1}>
					<p className='ant-upload-drag-icon'><InboxOutlined /></p>
					<p className='ant-upload-hint'>List of students</p>
				</Dragger>
				<Form.Item>
					<Button type='primary' htmlType='submit'>Submit</Button>
				</Form.Item>
			</Form>
		)

		const cardTabContentList = {
			tab1: timetableSpreadsheetForm,
			tab2: newTimetableForm
		}

		const addNewTimetableModal = (
			<Modal visible={this.state.showModal === 'addNewTimetableModal'}
				centered
				onCancel={closeModal}
				cancelText='Close'
				width={1000}
				footer={[
					<Button type='default' onClick={closeModal}>Close</Button>
				]}
			>
				<Card style={{ margin: 30 }}
					tabList={tabList}
					activeTabKey={this.state.activeTabKey}
					onTabChange={key => {
						this.setState({ activeTabKey: key })
					}}
				>
					{cardTabContentList[this.state.activeTabKey]}
				</Card>
			</Modal>

		)

		const timetableForm = (
			<>
				<Form
					name='timetableForm'
					layout='inline'
					onFinish={timetableFormSubmit}
					autoComplete='off'
				>
					<Form.Item
						label='Year:'
						name='year'
						style={{ width: 500, marginLeft: 0 }}
						rules={[
							{
								required: true,
								message: 'Year is required'
							}
						]}
						initialValue = {this.state.years[this.state.years.length-1]}
					>
						<Select
							allowClear
							options={this.state.years.map(year => ({ value: year }))}
						/>
					</Form.Item>
					<Form.Item style={{ marginLeft: -16 }}>
						<Button type='primary' htmlType='submit' loading={this.state.gettingTimetableState}>
							{ this.state.gettingTimetableState ? null : <SearchOutlined /> }
						</Button>
					</Form.Item>
				</Form>
				<Button type='default' htmlType='button' onClick={showModal}>
					New Timetable
				</Button>
				{addNewTimetableModal}
			</>
		);

		return (
			<Layout className='outer-layout'>
				<HeaderComponent />
				<Layout className='inner-layout'>
					<SideBarComponent history={this.props.history} selectedKey="timetables" />
					<Content className='content' style={ { padding: 30, paddingRight: 100} }>
						<div className='action-buttons-row'>
							{timetableForm}
						</div>
						{dataTables}
					</Content>
				</Layout>
			</Layout>
		);
	}
}

export default TimetablePageComponent;