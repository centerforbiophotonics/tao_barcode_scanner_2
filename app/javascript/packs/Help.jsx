import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import './App.css';

import { FormControl, Grid, Row, Col, Button } from 'react-bootstrap';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'bootstrap/dist/css/bootstrap';

library.add( faArrowLeft);

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
            <li><p>Supported web browsers: Chrome, Firefox. Ensure private browsing or incognito mode is disabled.</p></li>
            <li><p>To begin checking registrants into a workshop, select a workshop from the
            dropdown menu on the main page, and click the lock button.</p></li>
            <li><p>When the page is locked, you can only check registrants into the currently selected workshop using a connected barcode scanner.</p></li>
            <li><p>To unlock the page from a locked state, click the open lock icon, enter the password "ceetao", and press the enter key.</p></li>
            <li><p>If the page does not unlock, check that you typed the possword correctly and try again.</p></li>
            <li><p>When the page is unlocked, you will once again be able to switch workshops and manually check people into a workshop.</p></li>
            <li><p>
              If the page is not able to communicate with the server (bad wifi) the floppy disk icon in the upper right corner will turn red and a red wifi icon will appear beside it.
              Try pressing the wifi icon to sync the attendance data with the server. 
              If the wifi and floppy icon are still red after trying to sync then you can download a backup copy 
              of the attendance record by clicking the floppy disk icon.
              If you use adblock, you may have to pause or disable it on the page in order to download the backup.</p></li>
          </ul>
        </Row>
      </Grid>
      );
	}
}

export default Help;