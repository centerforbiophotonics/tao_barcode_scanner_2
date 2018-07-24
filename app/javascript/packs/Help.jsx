import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import './App.css';

import { FormControl, Grid, Row, Col, Button } from 'react-bootstrap';

import { library } from '@fortawesome/fontawesome-svg-core';
import {faLock, faLockOpen, faSignInAlt, faSignOutAlt, faWifi, faSave, faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'bootstrap/dist/css/bootstrap';

library.add( faLock, faLockOpen, faSignInAlt, faSignOutAlt, faWifi, faSave, faArrowLeft);

class Help extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return(
      <Grid>
        <Row>
         <Col md={12}>
          <span style={{float:'left'}}>
          <h1 style={{textAlign:"center"}}>TAO Workshop Help Page</h1>
          </span>
          <span style={{float:'right'}}>
            <Button href="/" bsSize="large">
                 <FontAwesomeIcon icon="arrow-left" size="lg" style={{color:"black"}}/>
            </Button>
            </span>
          </Col>
        </Row>
        <Row>
          <br/>
          <ul>
          <li><p>Supported web browsers: Chrome, Firefox</p></li>
          <li><p>To begin checking registrants into a workshop, select a workshop from the
          dropdown menu on the main page, and click the lock button.</p></li>
          <li><p>When the page is locked, you will be presented with a screen that will allow you to connect
          a barcode scanner and check registrants into the currently selected workshop.
          The page being locked also prevents access to administrative pages and functions such as downloading
          attendee data and generating badges for registrants.</p></li>
          <li><p>To unlock the page from a locked state, click the icon and enter the password.</p></li>
          <li><p>When the page is unlocked, you will once again be able to switch workshops, and access
          other administrative functionality.</p></li>
          </ul>
        </Row>
      </Grid>
      );
	}
}

export default Help;