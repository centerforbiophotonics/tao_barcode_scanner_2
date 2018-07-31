import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

import { FormControl, Grid, Row, Col, Button } from 'react-bootstrap';

import { library } from '@fortawesome/fontawesome-svg-core';
import {faLock, faLockOpen, faSignInAlt, faSignOutAlt, faWifi, faSave, faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'bootstrap/dist/css/bootstrap';

library.add( faLock, faLockOpen, faSignInAlt, faSignOutAlt, faWifi, faSave, faArrowLeft);

const ALL_WORKSHOPS = 999;

class Badge extends Component {
	constructor(props) {
		super(props);


    this.handleWorkshopChange = this.handleWorkshopChange.bind(this);
    this.handleSelectAttendee = this.handleSelectAttendee.bind(this);
    this.loadWorkshops = this.loadWorkshops.bind(this);
    this.generateBadge = this.generateBadge.bind(this);
    this.generateBulkBadges = this.generateBulkBadges.bind(this);
    this.fetchAllAttendees = this.fetchAllAttendees.bind(this);
    this.download = this.download.bind(true);

		this.state = {
			workshops: [],
      attendee_list: [],
      selected_workshop_attendee_list: [],
      attendee_select_options: null,
      selected_workshop: {},
      selected_registrant: null,
      allow_print_all: false,
      attendee_has_been_selected: false,
      workshop_has_been_selected: false,
      data_loaded: null
		};

	}

  handleWorkshopChange(e){
    if (e !== null && e.value !== ALL_WORKSHOPS) {
      let w = this.state.workshops.find(function (w) { return w.id === e.value; });
      this.setState(prevState => {
        prevState.selected_workshop.label = e.label;
        prevState.selected_workshop.value = e.value;
        return prevState;
      });
      this.setState(prevState => {
        prevState.allow_select_attendee = true;
        prevState.workshop_has_been_selected = true;
        return prevState;
      });
      this.setState({
          selected_workshop_attendee_list: []
          });
      w.registrants.forEach(function(r) {
        this.setState(prevState => {prevState.selected_workshop_attendee_list.push(r);
                                    return prevState;
          });
        }, this);
    }
    else if (e !== null && e.value == ALL_WORKSHOPS)  {
        this.setState(prevState => {
          prevState.selected_workshop.label = e.label;
          prevState.selected_workshop.value = e.value;
          prevState.allow_select_attendee = true;
          prevState.workshop_has_been_selected = true;
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
  }


  loadWorkshops(handler){
    fetch(this.props.url + "tao/workshops", {credentials: 'include'})
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

  fetchAllAttendees() {
    let table = new Map();
    this.state.workshops.forEach(function(w) {
      w.registrants.forEach(function(r) {
        if (table[r.name] != 0) { //if registrant has never been encoutered
          this.setState(prevState => {prevState.attendee_list.push(r);
                                      return prevState;
                          });
          table[r.name]++;
        }
      }, this);
    }, this);
  }

  generateBadge() {
      fetch(this.props.url + "tao/generate_pdf", {
        method: 'post',
        body: JSON.stringify({attendee_id: this.state.selected_registrant.value, attendee_name: this.state.selected_registrant.label}), //send string ID instead of numerical ID for attendee_id
        headers: {
          'Content-Type' : 'application/json'
        },
        credentials: 'include'
      })
      .then(response => response.blob())
      .then(response => this.download(response, this.state.selected_registrant.label))
  }

  generateBulkBadges() {
      fetch(this.props.url + "tao/generate_pdf", {
        method: 'post',
        body: JSON.stringify({workshop_id: this.state.selected_workshop.value, all: (this.state.selected_workshop.value == ALL_WORKSHOPS) ? true : false}),
        headers: {
          'Content-Type' : 'application/json'
        }
      })
      .then(response => response.blob())
      .then(response => this.download(response, this.state.selected_workshop.label))
  }

  download(res, name) {
    var blob = new Blob([res], { type: 'application/pdf' });
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = name + ".pdf";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
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

    workshop_select_options.push(
        {
          label: "All",
          value: ALL_WORKSHOPS
        }

      );

    workshop_select_options.sort((a, b) => a.label.localeCompare(b.label));

    let attendee_select_options = [];
    if (this.state.data_loaded) {
      if (this.state.selected_workshop.value != ALL_WORKSHOPS) {
        attendee_select_options = this.state.selected_workshop_attendee_list.map(r =>{
          return (
            {
              label: r.name,
              value: r.id
            }
          )
        });
      }
      else {
        attendee_select_options = this.state.attendee_list.map(r =>{
          return (
            {
              label: r.name,
              value: r.id
            }
          )
        });
      }
    }

		return(
      <Grid>
        <Row>
          <Col md={10}>
          <div>
            <span style={{float:'left'}}><h1>Generate TAO Badge</h1></span>
            <span style={{float:'right'}}>
            <Button href="/" bsSize="large">
                 <FontAwesomeIcon icon="arrow-left" size="lg" style={{color:"black"}}/>
            </Button>
            </span>
          </div>
          </Col>
        </Row>
          <Row>
          <Col md={9}>
            <Select 
                          className="attendees"
                          placeholder="Select a workshop" 
                          options={workshop_select_options}
                          value={this.state.selected_workshop}
                          onChange={this.handleWorkshopChange}
                          onClick={() => {this.setState(prevState => {
                                            prevState.allow_print_all = true;
                                            prevState.workshop_has_been_selected = true;
                                            return prevState;
                                          });}}
                          clearable = {false}
                    />
          </Col>
          {this.state.workshop_has_been_selected?
            <Col md={3}>
              <Button bsSize="large" bsStyle="primary" onClick={this.generateBulkBadges}>Generate All</Button>
            </Col>
            :
            null
            }
        </Row>
        <br />
        <Row>
        {this.state.allow_select_attendee ?
          <Col md={9}>
            <Select 
                          className="workshops"
                          placeholder="Select an attendee (optional)" 
                          options={attendee_select_options}
                          isSearchable={true}
                          value={this.state.selected_registrant}
                          onChange={this.handleSelectAttendee}
                          onClick={() => {this.setState(prevState => {
                                            prevState.allow_select_attendee = true;
                                            return prevState;
                                          });}}
                          clearable = {false}
                    />
          </Col>
        
            :
            null
            }
          {this.state.attendee_has_been_selected ?
            <Col md={3}>
              <Button bsSize="large" bsStyle="primary" onClick={this.generateBadge}>Generate Individual Badge</Button>
            </Col>
            :
            null
            }    
        </Row>
      </Grid>
      );
	}

  componentDidMount(){
    this.loadWorkshops(this.fetchAllAttendees);
  }

}

export default Badge;