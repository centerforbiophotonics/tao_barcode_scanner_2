import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Select from 'react-select';
import 'react-select/dist/react-select.css';

import { Grid, Row, Col, Button } from 'react-bootstrap';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'bootstrap/dist/css/bootstrap.css';

library.add(faArrowLeft);

const ALL_WORKSHOPS = 999;

/**
 * @class Interface for generating badges
 */
class Badge extends Component {
  static propTypes = {
    /** The URL of the server that the app will make AJAX calls to. */
    url: PropTypes.string
  };

  static defaultProps = {
    url: "http://localhost:3000/"
  };


	constructor(props) {
		super(props);

    this.handleFormatChange = this.handleFormatChange.bind(this);
    this.handleWorkshopChange = this.handleWorkshopChange.bind(this);
    this.handleSelectAttendee = this.handleSelectAttendee.bind(this);
    this.loadWorkshops = this.loadWorkshops.bind(this);
    this.generateBadge = this.generateBadge.bind(this);
    this.generateBulkBadges = this.generateBulkBadges.bind(this);
    this.fetchAllAttendees = this.fetchAllAttendees.bind(this);
    this.download = this.download.bind(true);


    this.format_options = [
      {label: "Address Labels", "value": "address_labels"},
      {label: "Name Badge Stickers", "value": "sticker_name_badges"}
    ];

		this.state = {
			workshops: [], //array of workshop objects
      attendee_list: [], //array of attendee objects
      selected_workshop_attendee_list: [], //array of all registrants that are registered for the currently selected workshop
      attendee_select_options: null, //array of {label: string, value: string} objects passed to react-select components
      selected_format: this.format_options[0].value, //string matching value from format_options to tell the server the format of badge to generate
      selected_workshop: {
          label: "All",
          value: ALL_WORKSHOPS
        }, //currently selected workshop object
      selected_registrant: null, //currently selected registrant 
      allow_print_all: false, //potentially unusued?
      attendee_has_been_selected: false, //flag to check if user has selected an attendee
      workshop_has_been_selected: true, //flag to check if user has selected a workshop
      data_loaded: null, //flag to track if the AJAX request to fetch workshop data has been performed
      waiting_for_download: false
		};

    

	}

  /** 
   * Updates selected format
   * @param {object} e - {label: string, value: number}
   * @public
   */
  handleFormatChange(e){
    this.setState({selected_format:  e.value});
  }

  /** 
   * Updates selected workshop
   * @param {object} e - {label: string, value: number}
   * @public
   */
  handleWorkshopChange(e){
    console.log(e);
    if (e !== null && e.value !== ALL_WORKSHOPS) {
      let w = this.state.workshops.find(function (w) { return w.id === e.value; });
      this.setState(prevState => {
        prevState.selected_workshop.label = e.label;
        prevState.selected_workshop.value = e.value;
        prevState.allow_select_attendee = true;
        prevState.workshop_has_been_selected = true;
        prevState.selected_workshop_attendee_list = w.registrants
        return prevState;
      });
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

  /**
   * Updates selected attendee
   * @param {object} e - {label: string, value: string}
   * @public
   */
  handleSelectAttendee(e){
    console.log(e);
    if (e !== null) {
      this.setState(prevState => {
        prevState.selected_registrant = e;
        prevState.attendee_has_been_selected = true;
        return prevState;
      });
    }
  }


  /**
   * Does an AJAX call to server to retrieve all workshop information, and then stores that information in the state.
   * @param {function} handler - callback function to invoke after AJAX is successful and the state has been updated
   * @public
   */
  loadWorkshops(handler){
    fetch(this.props.url + "events/workshops", {credentials: 'include'})
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


  /**
   * Fetches all attendees from all workshops
   * @public
   */
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

  /**
   * Does an AJAX call to the server in order generate a badge PDF, and then calls download() to offer the server response as a download for the user
   * @public
   */
  generateBadge() {
      let token = document.head.querySelector("[name=csrf-token]").content;
      fetch(this.props.url + "events/generate_pdf", {
        method: 'post',
        body: JSON.stringify({attendee_id: this.state.selected_registrant.value, attendee_name: this.state.selected_registrant.label}), //send string ID instead of numerical ID for attendee_id
        headers: {
          'Content-Type' : 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': token
        },
        credentials: 'same-origin'
      })
      .then(response => response.blob())
      .then(response => this.download(response, this.state.selected_registrant.label))
  }

  /** 
   * Does an AJAX call to the server in order generate a PDF containing many badges, and then calls download() to offer the server response as a download for the user
   * @public
   */
  generateBulkBadges() {
      this.setState({waiting_for_download: true});

      let token = document.head.querySelector("[name=csrf-token]").content;
      fetch(this.props.url + "events/generate_pdf", {
        method: 'post',
        body: JSON.stringify({
          workshop_id: this.state.selected_workshop.value, 
          all: (this.state.selected_workshop.value == ALL_WORKSHOPS) ? true : false,
          format: this.state.selected_format  
        }),
        headers: {
          'Content-Type' : 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': token
        },
        credentials: 'same-origin'
      })
      .then(response => response.blob())
      .then(response => {
        this.setState({waiting_for_download: false});
        this.download(response, this.state.selected_workshop.label)

      })
  }


  /**
   * Uses javascript to make the browser click an invisible link and launch a download prompt of an intended file
   * @public
   */
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
              <span style={{float:'left'}}><h1>Generate Event Badge</h1></span>
              <span style={{float:'right'}}>
                <Button href="/events/scanner" bsSize="large">
                  <FontAwesomeIcon icon="arrow-left" size="lg" style={{color:"black"}}/>
                </Button>
              </span>
            </div>
          </Col>
        </Row>
        <Row>
          <Col md={5}>
            <Select 
              className="workshop_select"
              placeholder="Select a workshop" 
              options={workshop_select_options}
              value={this.state.selected_workshop}
              onChange={this.handleWorkshopChange}
              onClick={() => {
                this.setState(prevState => {
                  prevState.allow_print_all = true;
                  prevState.workshop_has_been_selected = true;
                  return prevState;
                });
              }}
              clearable = {false}
            />
          </Col>
          <Col md={4}>
            <Select 
              className="format_select"
              placeholder="Select a format" 
              options={this.format_options}
              value={this.state.selected_format}
              onChange={this.handleFormatChange}
              clearable = {false}
            />
          </Col>
          {this.state.workshop_has_been_selected &&
            <Col md={3}>
              <Button bsStyle="primary" onClick={this.generateBulkBadges} disabled={this.state.waiting_for_download}>Generate All</Button>
            </Col>
          }
        </Row>
        <br />
        <Row>
          {this.state.allow_select_attendee &&
            <Col md={9}>
              <Select 
                className="attendee_select"
                placeholder="Select an attendee to generate a single badge." 
                options={attendee_select_options}
                isSearchable={true}
                value={this.state.selected_registrant}
                onChange={this.handleSelectAttendee}
              />
            </Col>
          }
          {this.state.attendee_has_been_selected &&
            <Col md={3}>
              <Button bsStyle="primary" onClick={this.generateBadge}>Generate Individual Badge</Button>
            </Col>
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