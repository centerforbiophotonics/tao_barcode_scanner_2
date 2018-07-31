import React from 'react';
import Select from 'react-select';
import { FormControl, Grid, Row, Col, Button } from 'react-bootstrap';

export default class AddUserForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleIDChange = this.handleIDChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

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

  render () {
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
		     	<input style={{width:"75px"}} type="text" value={this.state.idValue} onChange={this.handleIDChange}  />
	     	</label>
	     	<p>{this.state.nameValue}</p>
	     	<Button bsStyle="primary" onClick={this.handleSubmit}>Submit</Button>
      </div>
      
  	)
	}
}

