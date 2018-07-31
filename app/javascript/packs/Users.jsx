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
		this.state = {showAddUser: false};
	}

  showAddUser(attendee_id) {
   this.state.showAddUser ? this.setState({showAddUser: false}) : this.setState({showAddUser: true});
  }

	render() {
    console.log(this.props);
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
        <Row>
        {(this.props.users && this.props.users.length) ? this.props.users.forEach((u) => <p>{u.name}</p>) : <p>There are currently no registered users.</p>}
        </Row>
        <Row>
          <Button bsStyle="primary" onClick={this.showAddUser}>
            Add new user
          </Button>
        </Row>
        <Row>
        {this.state.showAddUser ?
          <AddUserForm />
          :
          null
        }
        </Row>
      </Grid>
      );
	}
}

export default Users;