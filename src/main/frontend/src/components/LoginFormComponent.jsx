import { Button, Form, Input, Layout, message, PageHeader } from 'antd';
import React, { Component } from 'react';
import { Content } from 'antd/lib/layout/layout';
import LoginService from '../services/LoginService';
import { decodeToken, setAuthToken } from '../helpers';
import HeaderComponent from './HeaderComponent';

class LoginFormComponent extends Component {

	constructor(props) {
		super(props)

		setAuthToken()

		this.onFinish = this.onFinish.bind(this);
		this.onFinishFailed = this.onFinishFailed.bind(this);
	}

	onFinish(formData) {
		LoginService.login(formData.username, formData.password)
			.then(res => {
				const jwt = res.data;
				localStorage.setItem("accessToken", jwt.accessToken);
				localStorage.setItem("refreshToken", jwt.refreshToken);
				setAuthToken(jwt.accessToken);

				const isAdmin = decodeToken(jwt.accessToken).isAdmin;
				const redirect = isAdmin ? "/timetables" : "/my-timetable";
				this.props.history.push(redirect);
			})
			.catch(e => {
				message.error("Login ID and password do not match.")
			})
	};

	onFinishFailed(errorInfo) {
		console.log('Failed:', errorInfo);
	};

	render() {
		return (
			<Layout className='outer-layout'>
				<HeaderComponent />
				<Content className = 'content'>
					<Form
						name="loginForm"
						onFinish={this.onFinish}
						onFinishFailed={this.onFinishFailed}
						autoComplete="off"
						className='loginForm'
						size='large'
					>
						<Form.Item
							label={<label style={ {fontSize: 18} }>University ID</label>}
							name="username"
							labelCol={ {span: 8} }
							wrapperCol={ {span:8} }
							rules={[
							{
								required: true,
								message: 'Please enter your university ID',
							},
							]}
						>
							<Input />
						</Form.Item>

						<Form.Item
							label={<label style={ {fontSize: 18} }>Password</label>}
							name="password"
							labelCol={ {span: 8}}
							wrapperCol={ {span:8} }
							rules={[
							{
								required: true,
								message: 'Please enter password',
							},
							]}
						>
							<Input.Password />
						</Form.Item>

						<Form.Item wrapperCol={ {offset:8} }>
							<Button type="primary" htmlType="submit">
							Submit
							</Button>
						</Form.Item>
					</Form>
				</Content>
			</Layout>
		);
	}
}


export default LoginFormComponent;