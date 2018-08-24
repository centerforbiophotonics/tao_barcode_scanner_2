import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Select from 'react-select';
import 'react-select/dist/react-select.css';
import './App.css';

import { Grid, Row, Col, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';


/** 
 * Renders help page.
 */
class Home extends Component {
  static propTypes = {
    /** @type {array} The backend servers available. */
    servers: PropTypes.array,
    /** The URL of the server that the app will make AJAX calls to. */
    url: PropTypes.string
  };

  constructor(props){
    super(props);

    this.setServer = this.setServer.bind(this);
  }

  setServer(e,server){
    e.preventDefault();

    let token = document.head.querySelector("[name=csrf-token]").content;
    
    fetch(this.props.url + "users/set_event_server", {
        method: 'post',
        body: JSON.stringify({user: {server_name:server}}), 
        headers: {
          'Content-Type' : 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': token
        },
        credentials: 'same-origin'
      }).then(res => {
          if (res.ok) {
            return res.json();
          } else {
            throw new Error('something went wrong!')
          }
        })
        .then(
          (result) => {
            window.location.href = this.props.url+"events/scanner";
          },
          (error) => {
            throw new Error(error)
          }
        )
  } 

  render() {
    return(
      <Grid>
        <Row>
          <h1 className="mx-auto">Event Attendance Scanner</h1>
        </Row>
        <Row>
          <h3 className="mx-auto">Choose a Server</h3>
        </Row>
        <Row>
          {this.props.servers.map(s =>
            <Col className="text-center" md={12/this.props.servers.length} key={s}>
              <Button bsSize="large" bsStyle="primary" onClick={(e) => this.setServer(e,s)}>
                {s}
              </Button>
            </Col>
          )}
        </Row>
      </Grid>
    );
  }
}

export default Home;