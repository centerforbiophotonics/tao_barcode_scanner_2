import React, { Component } from 'react';
import './App.css';

import Select from 'react-select';
import 'react-select/dist/react-select.css';

import { FormControl, Grid, Row, Col, Button, Badge } from 'react-bootstrap';

import { library } from '@fortawesome/fontawesome-svg-core'
import {faLock, faLockOpen, faSignInAlt, faSignOutAlt, faWifi, faSave, faIdBadge, faQuestionCircle} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'bootstrap/dist/css/bootstrap'

library.add( faLock, faLockOpen, faSignInAlt, faSignOutAlt, faWifi, faSave, faIdBadge, faQuestionCircle)


class App extends Component {
  constructor(props){
    super(props);

    this.handleWorkshopChange = this.handleWorkshopChange.bind(this);
    this.postAttend = this.postAttend.bind(this);
    this.loadWorkshops = this.loadWorkshops.bind(this);
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
      workshops: [],
      data_loaded: false,
      cache_dirty: false,
      selected_workshop_id: null,
      attendance: {},
      last_checked_name: "",
      check_in: false, //For events that require checking in and out, currently the icon toggle this has been removed because it is not needed for any upcoming events
      current_scan_val: "",
      filter_input: "",
      tamper_lock: false,
      unlocking: false,
      password: "",
      error: null,
      current_message:"",
      current_message_color: "green",
      two_step_attendance: false
    }

    this.scan_timeout = null;
  }

  handleWorkshopChange(e){
    if (e !== null) {
      this.setState(prevState => {
        prevState.selected_workshop_id = e.value;
        prevState.current_message = "";
        return prevState;
      });
    }
  }

  postAttend(workshop_id, attendee_id){
    let token = document.head.querySelector("[name=csrf-token]").content;
    fetch(this.props.url + "tao/attend", {
        method: 'post',
        body: JSON.stringify({data: {workshop_id: workshop_id, attendee_id:attendee_id}}), 
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
              let current_r = prevState.workshops.find(w => {return w.id == workshop_id}).registrants.find(r => {return r.id == attendee_id})
              
              prevState.current_scan_val = "";
              prevState.error = null;
              prevState.cache_dirty = false;
              current_r.attended = true;
              prevState.workshops.forEach(w => {w.registrants.forEach((r) => {
                let attendance_record = prevState.attendance[w.id + "-" + r.id]
                  if (r.attended == false && attendance_record.checked_in && attendance_record.checked_out) {
                    prevState.cache_dirty = true;
                  }
                })
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

  loadWorkshops(handler){
    fetch(this.props.url + "tao/workshops", {credentials: 'include'})
        .then(res => res.json())
        .then(
          (result) => {
            if (result != null) {
            this.setState({
              data_loaded: true,
              workshops: result,
              error: null
            }, () => {handler(result)});}
          },
          (error) => {
            this.setState({
              error:error
            });
          }
        )
  }

  updateAttendanceFromWorkshops(workshops, handler) {
    if (workshops != null) {
      workshops.forEach(w => {
        w.registrants.forEach(r => {
          let key = w.id + "-" + r.id;
          if (key in this.state.attendance) {
            if (r.attended) {
              this.setState(prevState => {
                prevState.attendance[key].checked_in = true;
                prevState.attendance[key].checked_out = true;
                return prevState
              }, handler);
            } else {
              if (handler) {
                handler();
              }
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
      })
    } 
  }

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

  selectedWorkshop(){
    return this.state.workshops.find(w => {return w.id === this.state.selected_workshop_id })
  }

  checkScan(){
    if (this.state.workshops != null) {
      let workshop_registrants = this.selectedWorkshop().registrants.map((r) => { return r.id});
      let attendee_id = this.state.current_scan_val;
      
      if (workshop_registrants.includes(attendee_id)){
        this.recordAttendance(attendee_id);
      } else {
        // Refresh workshop data in case attendee was just registered
        this.loadWorkshops(workshops => {
          this.updateAttendanceFromWorkshops(workshops, () => {
            if (this.state.workshops != null) {
              let workshop_registrants = this.selectedWorkshop().registrants.map((r) => { return r.id});

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
          });
        });
      }
    }
  }

  handleScan(e){
    if (e.key !== "Meta"){
      this.setState(prevState => {       
        prevState.current_scan_val = prevState.current_scan_val+e.key;
        
        clearTimeout(this.scan_timeout);
        this.scan_timeout = setTimeout(this.checkScan, 50)
        return prevState;
      });
    }
  }

  handleLock(e){
    if (this.state.tamper_lock){
      this.setState({unlocking:true});
      document.removeEventListener("keydown", this.handleScan, false);
    } else {
      if (this.state.selected_workshop_id !== null){
        this.setState({tamper_lock:true});
        document.addEventListener("keydown", this.handleScan, false);
      } else {
        alert("You must select a workshop.")
      }
    }
  } 

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

  handleScanActionChange(e){
    this.setState(prevState => {
      prevState.check_in = !prevState.check_in;
      return prevState;
    });
  }

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
            registrants.push(this.findAttendee(key.split("-")[0], key.split("-")[1]));
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
            registrants.push(this.findAttendee(key.split("-")[0], key.split("-")[1]));
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

  findAttendee(workshop_id, attendee_id) {
    if (this.state.workshops.find(w => {return w.id == workshop_id}) === undefined){
      return undefined
    } else {
      return this.state.workshops.find(w => {return w.id == workshop_id}).registrants.find((r) => { return r.id == attendee_id});
    }
  }


  filterChangeHandler(e){
    this.setState({
      filter_input: e.target.value,
    })
  }

  sync() {
    this.state.workshops.forEach(w => {
      w.registrants.forEach((r) => {
        let attendance_record = this.state.attendance[w.id + "-" + r.id]
        if (r.attended == false && attendance_record.checked_in && attendance_record.checked_out) {
          this.postAttend(w.id, r.id);
        }
      })
    })
  }

  downloadCSV() { //https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
    let rows = [];
    let i = 0;
    rows[i++] = ["Workshop Name", "Workshop ID", "Attendee ID", "Attended"];
    this.state.workshops.forEach(w => {
      w.registrants.forEach((r) => {
        let attendance_record = this.state.attendance[w.id + "-" + r.id];
        rows[i] = [];
        rows[i].push(w.name);
        rows[i].push(w.id);
        rows[i].push(r.id);
        rows[i].push(attendance_record.checked_out);
        i++;
      })
    })
    
    let csvContent = "data:text/csv;charset=utf-8,";
    rows.forEach(function(rowArray){
      let row = rowArray.join(",");
      csvContent += row + "\r\n";
    }); 
    var encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
  }

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
            <Col md={8} mdOffset={2}>
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
                        (r === "\n") ? r : 
                          <div key={r.id}> 
                            {r.name} 
                            <a onClick={() => this.recordAttendance(r.id)}>
                              <Badge className={"badge-warning"} style={{cursor: 'pointer'}}>Manual Check-in</Badge>
                            </a>
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
                <Button bsSize="large"  onClick={this.downloadCSV} disabled={locked}>
                  {this.state.cache_dirty && this.state.error !== null ? 
                    <FontAwesomeIcon icon="save" style={{color:"red"}}/>
                    : 
                    <FontAwesomeIcon icon="save" style={{color:"black"}}/>
                  }
                </Button>
                {
                  /*<Button href="tao/print" bsSize="large" disabled={locked}>
                    <FontAwesomeIcon icon="id-badge" style={{color:"black"}}/>
                  </Button>*/
                }
                {locked ? null :
                  <Button href="tao/help" bsSize="large">
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
          <h2>(potential connection error, please refresh the page)</h2>
        </div>
      );
    }   
  }

  componentDidMount(){
    let cache_data = JSON.parse(localStorage.getItem("check_out_cache"));
    if (cache_data != null) {
      this.setState({attendance:cache_data}, () => {this.loadWorkshops(this.updateAttendanceFromWorkshops)});
    }
    else {
      this.loadWorkshops(this.updateAttendanceFromWorkshops)
    }
  }
}

export default App;
