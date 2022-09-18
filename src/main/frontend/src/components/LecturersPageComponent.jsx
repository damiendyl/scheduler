import { UploadOutlined } from '@ant-design/icons';
import { Button, Form, Input, Layout, message, Modal, Select, Table, Upload } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import React, { Component } from 'react';
import AppUserService from '../services/AppUserService';
import RoleService from '../services/RoleService';
import HeaderComponent from './HeaderComponent';
import SideBarComponent from './SideBarComponent';

class LecturersPageComponent extends Component {

	constructor(props) {
		super(props)

		this.deleteLecturer = this.deleteUserIds.bind(this);
		this.addLecturer = this.addLecturer.bind(this);
		this.setLecturerState = this.setLecturerState.bind(this);

		this.state = {
			lecturers: [],
			selectedRowKeys: [],
			selectedModal: '',
			newlyAddedLecturer: null,
			fileList: [],
			uploading: false,
			duplicateUsers: [],
			rolesSelection: []
		}
		
		RoleService.getRoles().then(res => {
			const roles = [];
			res.data.forEach(role => {
				roles.push({label: role.name, value: role.name});
			})
			this.setState({rolesSelection: roles}, () => this.state.rolesSelection)
		})
	}

	deleteUserIds() {

		AppUserService.deleteUserIds(this.state.selectedRowKeys).then(res => {
			this.setLecturerState();
			this.setState({
				selectedRowKeys: [],
				selectedModal: null,
				newlyAddedLecturer: null,
				fileList: [],
				uploading: false
			}, 
			() => message.success(res.data.length + ' record(s) deleted.'));
		})
	}

	addLecturer(formData) {
		AppUserService.addLecturer(formData).then(res => {
			const newLecturer = {
				...res.data,
				key: res.data.id,
			}
			const newLecturerNameAndEmail = {
				fullName: newLecturer.firstName + ' ' + newLecturer.lastName,
				email: newLecturer.email
			}
			this.setState({
				lecturers: [...this.state.lecturers, newLecturer],
				newlyAddedLecturer: newLecturerNameAndEmail
			},
			document.getElementById('addLecturerForm').reset());
		})
		.catch((e) => {
			const data = JSON.parse(e?.response?.config?.data)
			const orgId = data?.orgId
			const email = data?.email
			if (orgId !== null || email !== null) {
				document.getElementById('addResultMessage').innerHTML = `<span style="color: red;">ID <i><b>${orgId}</b></i> or email <i><b>${email}</b></i> is already taken.</span>`
			} else {
				document.getElementById('addResultMessage').innerHTML = '<span style="color: red;">Unknown error occurred.</span>'
			}
		})
	}

	setLecturerState() {
		AppUserService.getLecturers().then((res) => {
			const tableData = res.data.map((lecturer) => ({
				...lecturer,
				key: lecturer.id
			}))
			this.setState({ lecturers: tableData })
		});
	}

	componentDidMount() {
		this.setLecturerState();
	}


	render() {

		const showModal = (e) => {
			switch (e.currentTarget.id) {
				case 'deleteLecturerButton':
					this.setState({selectedModal: 'deleteLecturerModal'});
					break;

				case 'addLecturerButton':
					this.setState({selectedModal: 'addLecturerModal'});
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
				title: 'ID',
				dataIndex: 'orgId',
				sorter: (a,b) => a.firstName.localeCompare(b.firstName),
			},
			{
				title: 'First Name',
				dataIndex: 'firstName',
				sorter: (a,b) => a.firstName.localeCompare(b.firstName),
			},
			{
				title: 'Last Name',
				dataIndex: 'lastName',
				sorter: (a,b) => a.lastName.localeCompare(b.lastName),
			},
			{
				title: 'Email',
				dataIndex: 'email',
				sorter: (a,b) => a.email.localeCompare(b.email),
			},
			{
				title: 'Roles',
				dataIndex: 'roles',
				sorter: (a,b) => a.email.localeCompare(b.email),
				render: (text) => {
					return text.join("\n")
				}
			},
			{
				title: 'Created At',
				dataIndex: 'createdAt',
				sorter: (a,b) => a.createdAt.localeCompare(b.createdAt),
			}
		];

		const deleteLecturerModal = (
			<Modal title="Confirm delete" 
				key='deleteLecturerModal'
				centered
				width={1000}
				visible={this.state.selectedModal === 'deleteLecturerModal'} 
				onOk={this.deleteLecturer} 
				okButtonProps={ {type: 'danger'} }
				okText='Delete'
				onCancel={handleCancel}
			>
				<p>Deleting {this.state.selectedRowKeys.length} records. Are you sure?</p>
				<Table
					columns={columns} 
					dataSource={this.state.lecturers.filter( row => {
						return this.state.selectedRowKeys.includes(row.key);
					})} 
					scroll={ {y: 300} } 
					pagination={false} />
			</Modal>
		);


		const addLecturerModal = (
			<Modal title="Add new lecturer" 
				key='addLecturerModal'
				centered
				visible={this.state.selectedModal === 'addLecturerModal'} 
				width={1000}
				okButtonProps={ {form: 'addLecturerForm', key: 'submit', htmlType: 'submit'} }
				okText='Save'
				onCancel={handleCancel}
			>
				<Form
					id='addLecturerForm'
					name="addLecturerForm"
					onFinish={this.addLecturer}
					onFinishFailed={this.onFinishFailed}
					autoComplete="off"
				>
					<Form.Item
						label='University ID'
						name='orgId'
						labelCol={{span:8}}
						wrapperCol={{span:8}}
						rules={[
							{
								required: true,
								message: 'Please enter university ID',
							}
						]}>
						<Input />
					</Form.Item>
					<Form.Item
						label="Email"
						name="email"
						labelCol={ {span: 8} }
						wrapperCol={ {span: 8} }
						rules={[
							{
								required: true,
								type: 'email',
								message: 'Please enter a valid email'
							}
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						label="First Name"
						name="firstName"
						labelCol={ {span: 8} }
						wrapperCol={ {span: 8} }
						rules={[
							{
								required: true,
								message: 'Please enter first name',
							},
					]}>
						<Input />
					</Form.Item>
					<Form.Item
						label="Last Name"
						name='lastName'
						labelCol={ {span: 8} }
						wrapperCol={ {span: 8} }
						rules={[
							{
								required: true,
								message: 'Please enter last name',
							}
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						label = 'Roles'
						name = 'roles'
						labelCol={ {span: 8} }
						wrapperCol={ {span: 8} }
						rules={[
							{
								required: true,
								message: 'Please select roles',
							}
						]}
					>
						<Select showSearch
							mode = 'multiple'
							options = {this.state.rolesSelection} />
					</Form.Item>
				</Form>
				<p id='addResultMessage' style={ {textAlign: 'center', color: 'green'} }>
					{ this.state.newlyAddedLecturer ? 'Successfully added ' + this.state.newlyAddedLecturer.fullName + ' with email ' + this.state.newlyAddedLecturer.email : '' }
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
			AppUserService.uploadLecturerFiles(this.state.fileList)
				.then(res => {
					this.setState({fileList: [], uploading: false},
						() => {
							message.success('Added ' + res.data.length + ' records.');
						})
					})
				.then(this.setLecturerState)
				.catch(e => {
					const duplicates = e.response.data;
					this.setState(
						{
							uploading: false,
							duplicateUsers: (duplicates !== null && duplicates.length > 0) ? duplicates : []
						},
						() => {
							if (this.state.duplicateUsers.length === 0) {
								message.error('An error occured. Check console for more information.');
								console.log(e)
							} else {
								console.log(this.state.duplicateUsers)
								let errorMessage = 'The ID(s) or email(s) below are taken:';
								this.state.duplicateUsers.forEach(user => {
									console.log(user.email)
									errorMessage = errorMessage.concat("\nID: ", user.orgId, ", email: ", user.email);
								});
								message.error({
									content: errorMessage,
									key: 'destroyErrorMessage',
									duration: 0,
									onClick: () => message.destroy('destroyErrorMessage'),
									style: { whiteSpace: "pre-line" }
								});
							}
						}
					)
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
					<SideBarComponent history={this.props.history} selectedKey="lecturers" />
					<Content className='content'>
						<div className='action-buttons-row'>
							<Button type='danger' 
								id='deleteLecturerButton'
								onClick={showModal} 
								disabled={!hasSelected}
							>
								Delete
							</Button>
							<span style={ {marginLeft: 8} }>{hasSelected ? `Selected ${this.state.selectedRowKeys.length} rows` : ''}</span>
						{deleteLecturerModal}
						</div>
						<div>
							<Table 
								rowSelection={rowSelection}
								columns={columns} 
								dataSource={this.state.lecturers} 
								scroll={ {y: 430} } 
								pagination={false} />
						</div>
						<div className='action-buttons-row'>
							<Button type='default'
								id='addLecturerButton'
								onClick={showModal} 
							>
								Add Lecturer
							</Button>
							{addLecturerModal}
							<span style={ {marginLeft: 8 } }>Number of records: {this.state.lecturers.length}</span>
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

export default LecturersPageComponent;