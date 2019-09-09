import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';

import Select from 'react-select';
import 'react-select/dist/react-select.css';

import { FormControl, Grid, Row, Col, Button, Badge } from 'react-bootstrap';

import { library } from '@fortawesome/fontawesome-svg-core'
import { faLock, faLockOpen, faSignInAlt, faSignOutAlt, faWifi, faSave, faIdBadge, faQuestionCircle, faHome} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'bootstrap/dist/css/bootstrap.css'

library.add( faLock, faLockOpen, faSignInAlt, faSignOutAlt, faWifi, faSave, faIdBadge, faQuestionCircle, faHome)

/**
 * Interface for registering attendees in workshops using a scanning device or manually.
 */
class Scanner extends Component {
  static propTypes = {
    /** The URL of the server that the app will make AJAX calls to. */
    url: PropTypes.string,
    /** @type {string} Name of the backend server */
    server_name: PropTypes.string
  };

  static defaultProps = {
    url: "http://localhost:3000/"
  };

  /**
   * The constructor lifecycle method.
   * @param {object} props - The component's props
   */
  constructor(props){
    super(props);

    this.handleWorkshopChange = this.handleWorkshopChange.bind(this);
    this.postAttend = this.postAttend.bind(this);
    this.loadWorkshops = this.loadWorkshops.bind(this);
    this.loadWorkshop = this.loadWorkshop.bind(this);
    this.updateAttendanceFromWorkshops = this.updateAttendanceFromWorkshops.bind(this);
    this.recordAttendance = this.recordAttendance.bind(this);
    this.selectedWorkshop = this.selectedWorkshop.bind(this);
    this.checkScan = this.checkScan.bind(this);
    this.handleScan = this.handleScan.bind(this);
    this.handleLock = this.handleLock.bind(this);
    this.handlePasswordKeyDown = this.handlePasswordKeyDown.bind(this);
    this.handleScanActionChange = this.handleScanActionChange.bind(this);
    this.checkedIn = this.checkedIn.bind(this);
    this.notCheckedIn = this.notCheckedIn.bind(this);
    this.findAttendee = this.findAttendee.bind(this);
    this.filterChangeHandler = this.filterChangeHandler.bind(this);
    this.sync = this.sync.bind(this);
    this.downloadCSV = this.downloadCSV.bind(this);
    this.cache = this.cache.bind(this);



    this.state = {
      /**
      * An array of objects representing the workshops. Loaded from the server or browser cache and should never be updated directly.
      * [{id:number, name:string, registrants:[{id:number, name:string, attended:boolean}, ...]}, ...]
      */
      workshops: [],
      /**
      * Object with a key for each workshop-attendee pair that tracks whether they have checked in and checked out
      * {"1-kerbuser": {checked_in:boolean, checked_out:boolean}}
      */
      attendance: {},
      /** Whether data has been loaded from the server or browser cache */
      data_loaded: false,
      /** Whether the browser cache has data that differs from the server */
      cache_dirty: false,
      /** The id of the workshop currently selected */
      selected_workshop_id: null,
      /** The name last person who was checked in/out. Used to display confirmation messages to the attendees */
      last_checked_name: "",
      /** For events that require checking in and out, currently the icon toggle this has been removed because it is not needed for any upcoming events */
      check_in: false,
      /** Contains characters from keypress events triggered by a barcode scanner or mag stripe reader. Is cleared on a 50ms timeout from the last keypress event to prevent manually entering an attendee_id. */
      current_scan_val: "",
      /** The value of the filter box used to filter the list of attendees who have not yet checked in. */
      filter_input: "",
      /** Boolean indicating whether the page view is locked to prevent attendee shenanigans. */
      tamper_lock: false,
      /** Boolean indicating the unlock button has been pressed and the app is waiting to recieve the unlock password from the user. */
      unlocking: false,
      /** The unlock password entered by the user */
      password: "",
      /** If any AJAX calls result in an error the error attribute from the response data is saved here. */
      error: null,
      /** The current confirmation or error message to display to an attendee when the page is locked. */
      current_message:"",
      /** The color of the current confirmation or error message to display to an attendee when the page is locked. */
      current_message_color: "green",
      /** Whether the app should require a check-in and check-out scan before marking the attendee as having attended. */
      two_step_attendance: false
    }

    this.scan_timeout = null;
  }

  /**
   * Changes the selected workshop. Invoked as an onChange handler from "select.workshops"
   * @param {object} option - {label:string, value:string}
   * @public
   */
  handleWorkshopChange(option){
    if (option !== null) {
      this.loadWorkshop(option.value, (results) => {
        this.setState(prevState => {
          let workshop_id = prevState.workshops.find(w => w.id == option.value).id
          prevState.selected_workshop_id = workshop_id;
          prevState.current_message = "";
          return prevState;
        }, () => {
          this.updateAttendanceFromWorkshops()
        });
      });
    }
  }

  /**
   * Make an AJAX call to record a single attendees attendance. Even if the AJAX call fails the state is updated to display a green confirmation message so that the attendee will leave the room.
   * @param {integer} workshop_id
   * @param {string} attendee_id - Kerberos username or Student ID
   * @public
   */
  postAttend(workshop_id, attendee_id){
    let token = document.head.querySelector("[name=csrf-token]").content;
    let attendee = this.findAttendee(workshop_id, attendee_id)
    fetch(this.props.url + "events/attend", {
        method: 'post',
        body: JSON.stringify({event: {workshop_id: workshop_id, attendee_id:attendee.id}}),
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
            this.setState(prevState => {
              let current_r = prevState.workshops.find(w => {return w.id == workshop_id}).registrants.find(r => {return r.kerberos_id == attendee_id})

              prevState.current_scan_val = "";
              prevState.error = null;
              prevState.cache_dirty = false;
              current_r.attended = true;
              prevState.workshops.forEach(w => {
                if (w.registrants){
                  w.registrants.forEach((r) => {
                    let attendance_record = prevState.attendance[w.id + "-" + r.kerberos_id]
                      if (r.attended == false && attendance_record.checked_in && attendance_record.checked_out) {
                        prevState.cache_dirty = true;
                      }
                  })
                }
              })
              return prevState;
            });
          },
          (error) => {
            this.setState({
              error:error,
              current_message: "Thanks for coming "+this.state.last_checked_name,
              current_message_color: "green"
            });
          }
        )
  }

  /**
   * Makes an AJAX call to update the workshops in state. This is invoked once when the component mounts.
   * @param {function} handler - (OPTIONAL) callback function to invoke after AJAX is successful and the state has been updated
   * @public
   */
  loadWorkshops(handler){
    fetch(this.props.url + "events/workshops", {credentials: 'include'})
      .then(res => res.json())
      .then(
        (result) => {
          if (result != null) {
            this.setState({
              data_loaded: true,
              workshops: result,
              error: null
            }, () => {
              this.updateAttendanceFromWorkshops(handler)
            })
          }
        },
        (error) => {
          this.setState({
            error:error
          });
        }
      );
  }


   /**
   * Makes an AJAX call to update a single workshop in state. This is invoked when an attendee_id is scanned which is not found in the selected workshop in case the workshop registration has been updated since the page was loaded.
   * @param {function} handler - (OPTIONAL) callback function to invoke after AJAX is successful and the state has been updated
   * @public
   */
  loadWorkshop(workshop_id, handler){
    fetch(this.props.url + "events/workshops?id="+workshop_id, {credentials: 'include'})
        .then(res => res.json())
        .then(
          (result) => {
            this.setState(prevState => {
              let workshop = prevState.workshops.find(w => (w.id == workshop_id));
              workshop.registrants = result.registrants;
              prevState.error = null;
              return prevState;
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
   * Updates the attendance state variable after the workshops data has been updated so the two stay in sync. Is called by loadWorkshops after it finished updating the state.
   * @param {function} handler - (OPTIONAL) callback function to invoke after the state has been updated
   * @public
   */
  updateAttendanceFromWorkshops(handler) {
    let workshops = this.state.workshops;
    if (workshops != null) {
      workshops.forEach(w => {
        if (w.registrants){
          w.registrants.forEach(r => {
            let key = w.id + "-" + r.kerberos_id;
            if (key in this.state.attendance) {
              if (r.attended) {
                this.setState(prevState => {
                  prevState.attendance[key].checked_in = true;
                  prevState.attendance[key].checked_out = true;
                  return prevState
                }, () => {if (handler) handler()});
              } else {
                if (handler) handler()
              }
            } else {
              this.setState(prevState => {
                prevState.attendance[key] = {
                  checked_in : (this.state.two_step_attendance ? r.attended : true),
                  checked_out : r.attended
                };
                return prevState
              }, handler);
            }
          })
        }
      })
    }
  }

  /**
   * Updates the state to indicate an attendee being registered. Caches the attendance state variable and then syncs with the server.
   * @param {string} attendee_id - the attendee to mark attendance for in the selected workshop.
   * @public
   */
  recordAttendance(attendee_id){
    let key = this.state.selected_workshop_id + "-" + attendee_id;
    let attendee = this.findAttendee(this.state.selected_workshop_id, attendee_id);

    this.setState(
      prevState => {
        prevState.last_checked_name = attendee.name;

        let attendance = prevState.attendance[key];

        if (prevState.check_in) {
          attendance.checked_in = true;
        } else {
          attendance.checked_out = true;
        }
        prevState.current_scan_val = "";

        if (attendance.checked_out == true && attendance.checked_in == true) {
          if (attendee.attended){
            prevState.current_message = prevState.last_checked_name+", you are already checked in.";
            prevState.current_message_color = "orange";
          } else {
            prevState.current_message = "Thanks for coming "+prevState.last_checked_name;
            prevState.current_message_color = "green";
          }
        }

        return prevState;
      },
      () => {
        this.cache();
        if (this.state.attendance[key].checked_out == true && this.state.attendance[key].checked_in == true) {
          this.sync();
        }
      }
    );
  }

  /**
   * Gets the workshop object for the currently selected workshop id.
   * @public
   * @return {object} {id:number, name:string, registrants:array}
   */
  selectedWorkshop(){
    return this.state.workshops.find(w => {return w.id === this.state.selected_workshop_id })
  }

  /**
   * Checks if the text that has just been scanned matches any attendee ids in the selected workshop.
   * Refreshes the workshop data after the first mismatch in it has been recently updated.
   * After two failures it shows a message to the attendee warning them that are not registered.
   * @public
   */
  checkScan(){
    if (this.state.workshops != null) {
      let workshop_registrants = this.selectedWorkshop().registrants.map((r) => { return r.kerberos_id});
      let attendee_id = this.state.current_scan_val;

      if (workshop_registrants.includes(attendee_id)){
        this.recordAttendance(attendee_id);
      } else {
        // Refresh workshop data in case attendee was just registered
        this.loadWorkshop(
          this.state.selected_workshop_id,
          () => {
            if (this.state.workshops != null) {
              let workshop_registrants = this.selectedWorkshop().registrants.map((r) => { return r.kerberos_id});

              if (workshop_registrants.includes(attendee_id)){
                this.recordAttendance(attendee_id);
              } else {
                this.setState(
                  {
                    current_scan_val: "",
                    current_message:"You aren't registered for this workshop.",
                    current_message_color:"red"
                  }
                );
              }
            }
          }
        );
      }
    }
  }

  /**
   * Handles all keypress events on the page when the page is locked.
   * A timeout is used to make it difficult/impossible for someone to enter an attendee id using the keyboard and not a barcode scanner or mag stripe reader.
   * @param {object} e - The javascript keypress event object
   * @public
   */
  handleScan(e){
    if (e.key !== "Meta" && e.key !== 'Enter'){
      this.setState(prevState => {
        prevState.current_scan_val = prevState.current_scan_val+e.key;

        clearTimeout(this.scan_timeout);
        this.scan_timeout = setTimeout(this.checkScan, 50)
        return prevState;
      });
    }
  }

  /**
   * Button handler that turns the tamper lock and causes a password prompt to appear to turn the lock off.
   * @param {object} e - The javascript click event object
   * @public
   */
  handleLock(e){
    if (this.state.tamper_lock){
      this.setState({unlocking:true});
      document.removeEventListener("keydown", this.handleScan, false);
    } else {
      if (this.state.selected_workshop_id !== null){
        this.setState({tamper_lock:true});
        if (document.activeElement) {
            document.activeElement.blur();
        }
        document.addEventListener("keydown", this.handleScan, false);
      } else {
        alert("You must select a workshop.")
      }
    }
  }

  /**
   * Handler that updates the state as a user enters the unlock password and checks the password if the enter key is pressed.
   * @param {object} e - The javascript keypress event object
   * @public
   */
  handlePasswordKeyDown(e){
    if(e.key === 'Enter'){
      if (this.state.password === "ceetao"){
        this.setState({password: "", tamper_lock:false, unlocking:false})
        document.removeEventListener("keydown", this.handleScan, false);
      } else {
        this.setState({password: "", unlocking:false})
        document.addEventListener("keydown", this.handleScan, false);
      }
    } else {
      this.setState({password: e.target.value});
    }
  }

  /**
   * Handler for a button not currently included in the render method that toggles between checking attendees in and out.
   * @param {object} e - The javascript click event object
   * @public
   */
  handleScanActionChange(e){
    this.setState(prevState => {
      prevState.check_in = !prevState.check_in;
      return prevState;
    });
  }


  /**
  * A convenience function that returns an array of attendee objects for attendees that are already checked-in.
  * @return {array} An array of objects of the form {id:number, name:string, attended:boolean}
  * @public
  */
  checkedIn(){
    if (this.state.selected_workshop_id == null) {
      return []
    }
    else {
      var registrants = [];
      for (let key in this.state.attendance) {
        if (key.split("-")[0] == this.state.selected_workshop_id
          && this.state.attendance[key].checked_out == true
          && this.state.attendance[key].checked_in == true) {
            let attendee = this.findAttendee(key.split("-")[0], key.split("-")[1]);
            if (attendee != undefined)
              registrants.push(attendee);
        }
      }
      return registrants.sort((a,b) => {
        if (a.name < b.name)
          return -1;
        if (a.name > b.name)
          return 1;
        return 0;
      });;
    }
  }

  /**
  * A convenience function that returns an array of attendee objects for attendees that are NOT already checked-in.
  * @return {array} An array of objects of the form {id:number, name:string, attended:boolean}
  * @public
  */
  notCheckedIn(){
    if (this.state.selected_workshop_id == null) {
      return [];
    }

    else {
      var registrants = [];
      for (let key in this.state.attendance) {
        if (key.split("-")[0] == this.state.selected_workshop_id
          && this.state.attendance[key].checked_out == false
          && this.state.attendance[key].checked_in == true) {
            let attendee = this.findAttendee(key.split("-")[0], key.split("-")[1]);
            if (attendee != undefined)
              registrants.push(attendee);
        }
      }

      return registrants.sort((a,b) => {
        if (a.name < b.name)
          return -1;
        if (a.name > b.name)
          return 1;
        return 0;
      });
    }
  }

  /**
  * A convenience function that returns an attendee object given a workshop if and an attendee id.
  * @param {number} workshop_id - The workshop to look for the attendee in.
  * @param {string} attendee_id - The attendee record to look for.
  * @return {object} {id:number, name:string, attended:boolean}
  * @public
  */
  findAttendee(workshop_id, attendee_id) {
    if (this.state.workshops.find(w => {return w.id == workshop_id}) === undefined){
      return undefined
    } else {
      return this.state.workshops.find(w => {return w.id == workshop_id}).registrants.find((r) => { return r.kerberos_id == attendee_id});
    }
  }

  /**
   * Updates the filter_input state variable when text is entered
   * @param {object} e - the javascript change event object
   * @public
  */
  filterChangeHandler(e){
    this.setState({
      filter_input: e.target.value,
    })
  }

  /**
   * Compares the attendance state variable to the workshop state variable to determine if any attendance records need to be updated on the server and calls postAttend for each.
   * @public
  */
  sync() {
    this.state.workshops.forEach(w => {
      if (w.registrants){
        w.registrants.forEach((r) => {
          let key = w.id + "-" + r.kerberos_id
          let attendance_record = this.state.attendance[key]
          if (r.attended == false && attendance_record.checked_in && attendance_record.checked_out) {
            this.postAttend(w.id, r.kerberos_id);
          }
        })
      }
    })
  }

  /**
   * Generates and prompts the user to download a CSV file containing attendance information for every workshop.
   * @public
  */
  downloadCSV() { //https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
    let rows = [];
    let i = 0;
    rows[i++] = ["Workshop Name", "Workshop ID", "Attendee ID", "Attendee Kerberos ID", "Attended"];
    this.state.workshops.forEach(w => {
      if (w.registrants){
        w.registrants.forEach((r) => {
          let attendance_record = this.state.attendance[w.id + "-" + r.kerberos_id];
          rows[i] = [];
          rows[i].push(w.name);
          rows[i].push(w.id);
          rows[i].push(r.id);
          rows[i].push(r.kerberos_id);
          rows[i].push(attendance_record.checked_out);
          i++;
        })
      }
    })

    let csvContent = "data:text/csv;charset=utf-8,";
    rows.forEach(function(rowArray){
      let row = rowArray.join(",");
      csvContent += row + "\r\n";
    });
    var encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
  }

  /**
   * Stores the attendance state variable to browser localStorage and sets a flag indicating the cache has been changed.
   * @public
  */
  cache() {
    let cache_data = localStorage.getItem("check_out_cache");
    if (JSON.stringify(this.state.attendance) != cache_data) {
      localStorage.setItem('check_out_cache', JSON.stringify(this.state.attendance));
      this.setState(prevState => {
        prevState.cache_dirty = true;
        return prevState;
      });
    }
  }

  /**
   * The render lifecycle method.
   * @public
   */
  render() {
    if (this.state.unlocking){
      return (
        <Grid>
          <Row>
            <Col md={8} mdOffset={2}>
              <h1>Enter Password</h1>
              <FormControl id="password" label="Password" type="password" onKeyUp={this.handlePasswordKeyDown}/>
            </Col>
          </Row>
        </Grid>
      );
    }

    if (this.state.data_loaded && this.state.workshops != null){
      let workshop_select_options = this.state.workshops.map(w =>({ label: w.name, value: w.id}));

      let selected_workshop_name = this.state.selected_workshop_id != null ?
        this.selectedWorkshop().name
        :
        "None";

      var storage = JSON.parse(localStorage.getItem('check_out_cache'));
      let locked = this.state.tamper_lock;


      return (
        <Grid>
          <Row>
            <Col md={10} >
              <Row style={{marginBottom:"5px"}}>
                {!locked &&
                  <Col md={1}>
                    <Button bsSize="large" style={{color:"black"}} href={this.props.url}>
                        <FontAwesomeIcon icon="home"/>
                    </Button>
                  </Col>
                }
                <Col md={6}>
                  <h2>{this.props.server_name}</h2>
                </Col>
              </Row>
              <Row style={{marginBottom:"5px"}}>
                <Col md={11}>
                  {locked  ?
                    <h3 style={{marginTop:"5px"}}>
                      {this.state.check_in ? "Checking in to" : "Checking out of"} {selected_workshop_name}
                    </h3>
                    :
                    <Select
                      className="workshops"
                      placeholder="Select a Workshop"
                      options={workshop_select_options}
                      value={this.state.selected_workshop_id}
                      onChange={this.handleWorkshopChange}
                      clearable = {false}
                    />
                  }
                </Col>

                <Col md={1}>
                  <Button bsSize="large" style={{color:"black", float:"right"}} onClick={this.handleLock}>
                    {locked ?
                      <FontAwesomeIcon icon="lock-open"/>
                      :
                      <FontAwesomeIcon icon="lock"/>
                    }
                  </Button>
                </Col>
              </Row>

              {locked ?
                <div>
                  <h2 style={{color:this.state.current_message_color}}>{this.state.current_message}</h2>
                </div>
                :
                (this.state.selected_workshop_id === null ? null :
                  <div>
                    <div className="display-linebreak">
                      <h2>Attendance List:</h2>
                      <ul>
                        {this.checkedIn().map(r => (<li key={r.id}>{r.name}</li>))}
                      </ul>
                      <br/>

                      <h2>Not Checked In:</h2>

                      {this.state.selected_workshop_id === null ? null :
                        <input
                          value={this.state.filter_input}
                          placeholder="Filter.."
                          type="text"
                          className="form-control"
                          style={{width: "250px"}}
                          onChange={this.filterChangeHandler.bind(this)}
                        />
                      }

                      {this.notCheckedIn().filter(r => {
                        let f_string = this.state.filter_input.toLowerCase();
                        let lc_name = r.name.toLowerCase();
                        return (
                          f_string === '' || lc_name.includes(f_string)
                        )
                      }).map((r) =>
                        <div key={r.id} className="row manual_checkin">
                          <div className="col-md-6">{r.name}</div>
                          <div className="col-md-2">
                            <a onClick={() => this.recordAttendance(r.kerberos_id)}>
                              <Badge className={"badge-warning"} style={{cursor: 'pointer'}}>Manual Check-in</Badge>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              }

            </Col>
            <Col md={2}>
              <div>
                {this.state.cache_dirty ?
                  <Button bsSize="large" onClick={this.sync} disabled={this.state.cache_dirty ? false : true}>
                    <FontAwesomeIcon icon="wifi" style={{color:"red"}} />
                  </Button>
                  :
                  null
                }

                { !locked &&
                  <Button bsSize="large"  onClick={this.downloadCSV} disabled={locked}>
                    {this.state.cache_dirty && this.state.error !== null ?
                      <FontAwesomeIcon icon="save" style={{color:"red"}}/>
                      :
                      <FontAwesomeIcon icon="save" style={{color:"black"}}/>
                    }
                  </Button>
                }

                { !locked &&
                  <Button href="print" bsSize="large">
                    <FontAwesomeIcon icon="id-badge" style={{color:"black"}}/>
                  </Button>
                }

                {locked ? null :
                  <Button href="help" bsSize="large">
                    <FontAwesomeIcon icon="question-circle" style={{color:"black"}}/>
                  </Button>
                }
              </div>
            </Col>
          </Row>
        </Grid>
      );
    } else {
      return (
        <div>
          <h1> Loading... </h1>
          <h2> If this message does not go away after a few seconds try refreshing the page.  If the problem persists contact mksteinwachs@ucdavis.edu</h2>
        </div>
      );
    }
  }

  /**
   * The componentDidMount lifecycle method. Used to set the value of the workshops and attendance state variables when the page first loads.
   * @public
  */
  componentDidMount(){
    let cache_data = JSON.parse(localStorage.getItem("check_out_cache"));

    if (cache_data != null) {
      this.setState({attendance:cache_data}, () => {this.loadWorkshops()});
    } else {
      this.loadWorkshops()
    }
  }
}

export default Scanner;
