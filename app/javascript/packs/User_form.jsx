import React from 'react';
import Select from 'react-select';
import { FormControl, Grid, Row, Col, Button, DropdownButton, MenuItem, ButtonToolbar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap'

export default class AddUserForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleIDChange = this.handleIDChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);

    this.state = {nameValue: "",
  								emailValue: "",
  								idValue: ""};
  }

  handleNameChange(event) {
    this.setState({nameValue: event.target.value});
  }

  handleEmailChange(event) {
    this.setState({emailValue: event.target.value});
  }

  handleIDChange(event) {
    this.setState({idValue: event.target.value});
  }

  handleSubmit() {
  	console.log("submit");
  	fetch(this.props.defaultProps.url + "users/add", {
        method: 'post',
        body: JSON.stringify({name: this.state.nameValue, email: this.state.emailValue, id: this.state.idValue}), //send string ID instead of numerical ID for attendee_id
        headers: {
          'Content-Type' : 'application/json'
        },
        credentials: 'include'
      })
      .then(response => response.json())
      .then(data => this.props.handleResultsResponse(data))
  }

  handleUpdate() {
  	console.log("update");
  	fetch(this.props.defaultProps.url + "users/update", {
        method: 'post',
        body: JSON.stringify({name: this.state.nameValue, email: this.state.emailValue, id: this.props.selectedUser.id}), //send string ID instead of numerical ID for attendee_id
        headers: {
          'Content-Type' : 'application/json'
        },
        credentials: 'include'
      })
      .then(response => response.json())
      .then(data => this.props.handleResultsResponse(data))
  }

  render () {
  	if (this.props.showEdit) {
  		console.log("alt");
  		return (
	  		<div>
		  		<br/>
			    <label style={{paddingRight:"5px"}}>
			     	Name: 
			     	<input type="text" placeholder={this.props.selectedUser.name} value={this.state.nameValue} onChange={this.handleNameChange} name="name"/>
		     	</label>

		     	<label style={{paddingRight:"5px"}}>
			     	Email:
			     	<input type="email" placeholder={this.props.selectedUser.email} value={this.state.emailValue} onChange={this.handleEmailChange}  />
		     	</label>

		     	<label>
			     	<span bsClass="text-muted">ID:</span>
			     	<input style={{width:"75px"}} type="text" value={this.props.selectedUser.cas_user} onChange={this.handleIDChange} disabled="true"  />
		     	</label>
		     	&nbsp;
		     		<DropdownButton
		     		bsStyle="primary"
			      bsSize="small"
			      title="Role"
			      id="dropdown-size-small"
			 			>
			      <MenuItem eventKey="1">Admin</MenuItem>
			      <MenuItem eventKey="2">User</MenuItem>
    			</DropdownButton>
		     	<p></p>
					<Button bsStyle="primary" onClick={this.handleUpdate}>Update</Button>
					&nbsp;
					<Button bsStyle="primary" onClick={this.props.handleEditCancel}>Cancel</Button>
		     </div>
	     )
  	}
  	else {
	  	return (
	  		<div>
	  		<br/>
			    <label style={{paddingRight:"5px"}}>
			     	Name: 
			     	<input type="text" value={this.state.nameValue} onChange={this.handleNameChange} name="name"/>
		     	</label>

		     	<label style={{paddingRight:"5px"}}>
			     	Email:
			     	<input type="email" value={this.state.emailValue} onChange={this.handleEmailChange}  />
		     	</label>

		     	<label>
			     	ID:
			     	<input style={{width:"75px"}} type="text" value={this.state.idValue} onChange={this.handleIDChange} />
		     	</label>
		     		&nbsp;
		     		<DropdownButton
		     		bsStyle="primary"
			      bsSize="small"
			      title="Role"
			      id="dropdown-size-small"
			 			>
			      <MenuItem eventKey="1">Admin</MenuItem>
			      <MenuItem eventKey="2">User</MenuItem>
    			</DropdownButton>
		     	<p></p>
		     	<Button bsStyle="primary" onClick={this.handleSubmit}>Submit</Button>


	      </div>
	      
	  	) 
  	}
	}
}

