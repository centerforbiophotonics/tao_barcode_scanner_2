import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

import { FormControl, Grid, Row, Col, Button } from 'react-bootstrap';

import { library } from '@fortawesome/fontawesome-svg-core';
import {faLock, faLockOpen, faSignInAlt, faSignOutAlt, faWifi, faSave} from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap';

library.add( faLock, faLockOpen, faSignInAlt, faSignOutAlt, faWifi, faSave);

class Badge extends Component {
	constructor(props) {
		super(props);


    this.handleWorkshopChange = this.handleWorkshopChange.bind(this);
    this.handleSelectAttendee = this.handleSelectAttendee.bind(this);
    this.loadWorkshops = this.loadWorkshops.bind(this);
    this.fetchAttendees = this.fetchAttendees.bind(this);
    this.generateBadge = this.generateBadge.bind(this);
    this.fetchAllAttendees = this.fetchAllAttendees.bind(this);

		this.state = {
			workshops: [],
      attendee_list: [],
      attendee_select_options: null,
      selected_registrant: null,
      attendee_has_been_selected: false,
      data_loaded: null
		};

	}

  handleWorkshopChange(e){
    if (e !== null) {
      this.setState(prevState => {
        prevState.selected_workshop = e.value;
        return prevState;
      });
      this.setState(prevState => {
        prevState.allow_select_attendee = true;
        return prevState;
      });
    }
  }

  handleSelectAttendee(e){
    if (e !== null) {
      this.setState(prevState => {
        prevState.selected_registrant = e;
        return prevState;
      });
      this.setState(prevState => {
        prevState.attendee_has_been_selected = true;
        return prevState;
      });
    }
    console.log(e.value);
  }


  loadWorkshops(handler){
    fetch(this.props.url + "tao/workshops")
        .then(res => res.json())
        .then(
          (result) => {
            this.setState({
              data_loaded: true,
              workshops: result,
              error: null
            }, () => {handler(result)});
          },
          (error) => {
            this.setState({
              error:error
            });
          }
        )
  }


	fetchAttendees() {
    let workshop_registrants = this.state.workshops.find(w => {return w.id === this.state.selected_workshop }).registrants.map((r) => { return r});
    let workshop_registrants_names = this.state.workshops.find(w => {return w.id === this.state.selected_workshop }).registrants.map((r) => { return r.name});
		console.log(workshop_registrants);
    console.log(workshop_registrants_names);
    console.log(this.state);
    return workshop_registrants
	}

  fetchAllAttendees() {
    let table = new Map();
    this.state.workshops.forEach(function(w) {
      w.registrants.forEach(function(r) {
        if (table[r.name] != 0) { //if registrant has never been encoutered
          this.setState(prevState => {prevState.attendee_list.push(r);
                                      return prevState;
                          });
          table[r.name]++;
          console.log(w.registrants);
          console.log(r);
        }
      }, this);
    }, this);
  }

  generateBadge() {
      //convert_to_pdf(this.state.selected_registrant);
      fetch(this.props.url + "tao/generate_pdf", {
        method: 'post',
        body: JSON.stringify({attendee_id: this.state.selected_registrant.value, attendee_name: this.state.selected_registrant.label}), //send string ID instead of numerical ID for attendee_id
        headers: {
          'Content-Type' : 'application/json'
        }
      })
      .then(console.log(this.state.selected_registrant))
  }


	render() {
    let workshop_select_options = this.state.workshops.map(w =>{
      return (
        {
          label: w.name,
          value: w.id
        } 
      )
    });

    let attendee_select_options = [];
    console.log(this.state.attendee_list);
    if (this.state.data_loaded) {
      attendee_select_options = this.state.attendee_list.map(r =>{
      return (
        {
          label: r.name,
          value: r.id
        }
      )
    });
    }


		return(
      <Grid>
        <Row>
          <Col md={11}>
            <h1>Generate Badge</h1>
          </Col>
        </Row>
        <Row>
          <Col md={11}>
            <h2>This page will generate a badge for you.</h2>
          </Col>
        </Row>
        <Row>
          <Col md={11}>
            <Select 
                          className="attendees"
                          placeholder="Select an attendee." 
                          options={attendee_select_options}
                          value={this.state.selected_registrant}
                          onChange={this.handleSelectAttendee}
                          onClick={() => {this.setState(prevState => {
                                            prevState.allow_select_attendee = true;
                                            return prevState;
                                          });}}
                          clearable = {false}
                    />
            {this.state.attendee_has_been_selected ?
            <Button bsSize="large" onClick={this.generateBadge}>I think therefore I am a button</Button>
            :
            null
            }
          </Col>
        </Row>
      </Grid>
      );
	}

  componentDidMount(){
    this.loadWorkshops(this.fetchAllAttendees);
  }

}

export default Badge;