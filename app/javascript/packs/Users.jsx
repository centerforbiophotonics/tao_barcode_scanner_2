import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import './App.css';
import AddUserForm from './User_form';

import { FormControl, Grid, Row, Col, Button } from 'react-bootstrap';

import { library } from '@fortawesome/fontawesome-svg-core';
import {faLock, faLockOpen, faSignInAlt, faSignOutAlt, faWifi, faSave, faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'bootstrap/dist/css/bootstrap';

library.add( faLock, faLockOpen, faSignInAlt, faSignOutAlt, faWifi, faSave, faArrowLeft);

class Users extends Component {
	constructor(props) {
		super(props);
    this.showAddUser = this.showAddUser.bind(this)
    this.handleAddResults = this.handleAddResults.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleEdit = this.handleEdit.bind(this)
    this.handleEditCancel = this.handleEditCancel.bind(this)
		this.state = {showEdit: false,
                  showAddUser: false,
                  selectedUser: {},
                  users: []}
	}

  showAddUser(attendee_id) {
   this.state.showAddUser ? this.setState({showAddUser: false}) : this.setState({showAddUser: true});
  }

  handleAddResults(data) {
    this.setState({users: data});
    if (this.state.showEdit) {
      this.setState({showEdit: false});
    } 
  }

  handleEditCancel(data) {
    this.setState({users: data});
    if (this.state.showEdit) {
      this.setState({showEdit: false});
    } 
  }

  handleDelete(id) {
    console.log("submit");
    fetch(this.props.url + "users/delete", {
        method: 'post',
        body: JSON.stringify({id: id}), //send string ID instead of numerical ID for attendee_id
        headers: {
          'Content-Type' : 'application/json'
        },
        credentials: 'include'
      })
      .then(response => response.json())
      .then(data => this.setState({users: data}))
  }

  handleEdit(user) {
    console.log("edit");
    this.setState({showEdit:"true"});
    this.setState({selectedUser: user});
  }

  handleEditCancel() {
    if (this.state.showEdit) {
      this.setState({showEdit: false});
    } 
  }


	render() {
    //console.log(this.props.users);
    this.props.users.forEach((u) => console.log(u));
    console.log(this.props.users && this.props.users.length);
    this.props.users.map((u) => console.log(u));
    console.log(this.state.users);
		return(
      <Grid>
        <Row>
         <Col md={12}>
          <span style={{float:'left'}}>
          <h1 style={{textAlign:"center"}}>TAO Workshop User Page</h1>
          </span>
          <span style={{float:'right'}}>
            <Button href="/" bsSize="large">
                 <FontAwesomeIcon icon="arrow-left" size="lg" style={{color:"black"}}/>
            </Button>
            </span>
          </Col>
        </Row>
        <Row>
          <p>Current users:</p>
        </Row>
        {(this.state.users && this.state.users.length) ? this.state.users.map((u) => <Row style={{paddingBottom: "5px"}}><Col md={3}>{u.name}</Col> <Col md={3}>{u.email}</Col> <Col md={3}><Button bsStyle="warning" bsSize="small" onClick={() => this.handleEdit(u)}>Update</Button>&nbsp;<Button bsStyle="danger" bsSize="small" onClick={() => this.handleDelete(u.id)}>Delete</Button> </Col></Row>) : <p>There are currently no registered users.</p>}
        <Row>
          <Button bsStyle="primary" onClick={this.showAddUser} disabled={this.state.showEdit ? true : false}>
            Add new user
          </Button>
        </Row>
        <Row>
        {this.state.showAddUser || this.state.showEdit ?
          <AddUserForm defaultProps={this.props} handleResultsResponse={this.handleAddResults} handleEditCancel={this.handleEditCancel} showEdit={this.state.showEdit} selectedUser={this.state.selectedUser}/>
          :
          null
        }
        </Row>
      </Grid>
      );
	}

  componentDidMount(){
    this.setState({users: this.props.users});
  }
}

export default Users;