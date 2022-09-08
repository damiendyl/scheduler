import { UploadOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Layout, message, Modal, PageHeader, Table, Upload } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import React, { Component } from 'react';
import ClassroomService from '../services/ClassroomService';
import HeaderComponent from './HeaderComponent';
import SideBarComponent from './SideBarComponent';

export default class ClassroomsPageComponent extends Component {

	constructor(props) {
		super(props);

		this.setClassroomState = this.setClassroomState.bind(this);
		this.deleteClassrooms = this.deleteClassrooms.bind(this);
		this.addClassroom = this.addClassroom.bind(this);

		this.state = {
			classrooms: [],
			selectedRowKeys: [],
			newlyAddedClassroom: null,
			fileList: [],
			uploading: false,
		};
	}

	setClassroomState() {
		ClassroomService.getClassrooms().then((res) => {
			const classroomData = res.data.map((classroom) => ({
				...classroom,
				key: classroom.id
			}));
			this.setState({ classrooms: classroomData });
		});
	}

	deleteClassrooms() {
		ClassroomService.deleteClassroomIds(this.state.selectedRowKeys).then(res => {
			this.setClassroomState();
			this.setState({
				selectedRowKeys: [],
				selectedModal: null,
				newlyAddedClassroom: null,
				fileList: [],
				uploading: false
			}, 
			() => message.success(res.data.length + ' record(s) deleted.'));
		})
	}

	addClassroom(formData) {
		ClassroomService.addClassrooms([formData]).then(res => {
			const newClassroom = {
				...res.data[0],
				key: res.data[0].id,
			};

			this.setState({
				classrooms: [...this.state.classrooms, newClassroom],
				newlyAddedClassroom: newClassroom
			},
			() => document.getElementById('addClassroomForm').reset());
		})
		.catch((e) => {
			console.log(e)
		});
	}

	componentDidMount() {
		this.setClassroomState();
	}


	render() {

		const showModal = (e) => {
			switch (e.currentTarget.id) {
				case 'deleteClassroomsButton':		
					this.setState({selectedModal: 'deleteClassroomsModal'});
					break;

				case 'addClassroomButton':
					this.setState({selectedModal: 'addClassroomsModal'});
					break;

				default:
					break;
			}
		}

		const hasSelected = this.state.selectedRowKeys.length > 0;
	
		const handleCancel = () => {
			this.setState({selectedModal: null});
		};

		const onSelectChange = (newSelectedRowKeys) => {
			this.setState({ selectedRowKeys: newSelectedRowKeys })
		}

		const rowSelection = {
			selectedRowKeys: this.state.selectedRowKeys,
			onChange: onSelectChange,
		};

		const columns = [
			{
				title: 'Name',
				dataIndex: 'name',
				sorter: (a,b) => a.name.localeCompare(b.name),
			},
			{
				title: 'Capacity',
				dataIndex: 'capacity',
				sorter: (a,b) => (a.capacity > b.capacity) ? 1 : (a.capacity < b.capacity) ? -1 : 0,
			},
			{
				title: 'Latitude',
				dataIndex: 'latitude',
				sorter: (a,b) => (a.latitude > b.latitude) ? 1 : (a.latitude < b.latitude) ? -1 : 0,
			},
			{
				title: 'Longitude',
				dataIndex: 'longitude',
				sorter: (a,b) => (a.longitude > b.longitude) ? 1 : (a.longitude < b.longitude) ? -1 : 0,
			}
		];

		const deleteClassroomsModal = (
			<Modal title="Confirm delete" 
				key='deleteClassroomsModal'
				centered
				width={1000}
				visible={this.state.selectedModal === 'deleteClassroomsModal'} 
				onOk={this.deleteClassrooms} 
				okButtonProps={ {type: 'danger'} }
				okText='Delete'
				onCancel={handleCancel}
			>
				<p>Deleting {this.state.selectedRowKeys.length} records. Are you sure?</p>
				<Table
					columns={columns} 
					dataSource={this.state.classrooms.filter( row => {
						return this.state.selectedRowKeys.includes(row.key);
					})} 
					scroll={ {y: 300} } 
					pagination={false} />
			</Modal>
		);

		const addClassroomsModal = (
			<Modal title="Add new classroom" 
				key='addClassroomsModal'
				centered
				visible={this.state.selectedModal === 'addClassroomsModal'} 
				width={1000}
				okButtonProps={ {form: 'addClassroomForm', key: 'submit', htmlType: 'submit'} }
				okText='Save'
				onCancel={handleCancel}
			>
				<Form
					id='addClassroomForm'
					name="addClassroomForm"
					onFinish={this.addClassroom}
					onFinishFailed={this.onFinishFailed}
					autoComplete="off"
				>
					<Form.Item
						label="Name"
						name="name"
						labelCol={ {span: 8} }
						wrapperCol={ {span: 8} }
						rules={[
							{
								whitespace: true,
								required: true,
								message: 'Please enter name of classroom',
							},
					]}>
						<Input />
					</Form.Item>
					<Form.Item
						label="Capacity"
						name='capacity'
						labelCol={ {span: 8} }
						wrapperCol={ {span: 8} }
						rules={[
							{
								required: true,
								type: 'number',
								message: 'Please enter capacity of the classroom',
							}
						]}
					>
						<InputNumber style={ {width: '100%'} } />
					</Form.Item>
					<Form.Item
						label="Latitude"
						name="latitude"
						labelCol={ {span: 8} }
						wrapperCol={ {span: 8} }
						rules={[
							{
								required: true,
								type: 'number',
								message: 'Please enter latitude'
							}
						]}
					>
						<InputNumber style={ {width: '100%'} } />
					</Form.Item>
					<Form.Item
						label="Longitude"
						name="longitude"
						labelCol={ {span: 8} }
						wrapperCol={ {span: 8} }
						rules={[
							{
								required: true,
								type: 'number',
								message: 'Please enter longitude'
							}
						]}
					>
						<InputNumber style={ {width: '100%'} } />
					</Form.Item>
				</Form>
				<p id='addResultMessage' style={ {textAlign: 'center', color: 'green'} }>
					{ this.state.newlyAddedClassroom ? 'Successfully added ' + this.state.newlyAddedClassroom.name + ' located at ' + this.state.newlyAddedClassroom.latitude + ', ' + this.state.newlyAddedClassroom.longitude : '' }
				</p>
			</Modal>
		);

		const uploadProps = {
			onRemove: (file) => {
				const index = this.state.fileList.indexOf(file);
				const newFileList = this.state.fileList.slice();
				newFileList.splice(index, 1);
				this.setState({fileList: newFileList});
			},
			beforeUpload: (file) => {
				this.setState(state => ({
					fileList: [...state.fileList, file]
				}));
				return false;
			},
			fileList: this.state.fileList,
			accept: '.csv',
			multiple: true
		}

		const handleUpload = (e) => {
			this.setState({uploading: true});
			ClassroomService.uploadClassroomFiles(this.state.fileList)
				.then(res => {
					this.setState({fileList: [], uploading: false},
						() => {
							message.success('Added ' + res.data.length + ' records.');
						})
					})
				.then(this.setClassroomState)
				.catch(e => {
					console.log('error', e);
					this.setState({uploading: false});
					message.error('An error occured. Check console for more information.');
				})
		}

		const uploadFileComponent = (
			<>
				<div style={ {'width': '8%'} }>
					<Upload {...uploadProps}>
						<Button icon={<UploadOutlined />}>Select File</Button>
					</Upload>
				</div>
				<div style={ {'width': '92%'} }>
					<Button
						type='primary'
						onClick={handleUpload}
						disabled={this.state.fileList.length === 0}
						loading={this.state.uploading}
					>
						{this.state.uploading ? 'Uploading' : 'Start Upload'}
					</Button>
				</div>
			</>
		);


		return (
			<Layout className='outer-layout'>
				<HeaderComponent />
				<Layout className='inner-layout'>
					<SideBarComponent history={this.props.history} selectedKey="classrooms" />
					<Content className='content'>
						<div className='action-buttons-row'>
							<Button type='danger' 
								id='deleteClassroomsButton'
								onClick={showModal} 
								disabled={!hasSelected}
							>
								Delete
							</Button>
							<span style={ {marginLeft: 8} }>{hasSelected ? `Selected ${this.state.selectedRowKeys.length} rows` : ''}</span>
						{deleteClassroomsModal}
						</div>
						<div>
							<Table 
								rowSelection={rowSelection}
								columns={columns} 
								dataSource={this.state.classrooms} 
								scroll={ {y: 430} } 
								pagination={false} />
						</div>
						<div className='action-buttons-row'>
							<Button type='default'
								id='addClassroomButton'
								onClick={showModal} 
							>
								Add Classroom
							</Button>
							{addClassroomsModal}
							<span style={ {marginLeft: 8 } }>Number of records: {this.state.classrooms.length}</span>
						</div>
						<div className='action-buttons-row'>
							{uploadFileComponent}
						</div>
					</Content>
				</Layout>
			</Layout>
		);
	}
}