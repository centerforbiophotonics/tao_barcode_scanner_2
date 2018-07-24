import React, { Component } from 'react';
import './App.css';

import Select from 'react-select';
import 'react-select/dist/react-select.css';

import { FormControl, Grid, Row, Col, Button } from 'react-bootstrap';

import { library } from '@fortawesome/fontawesome-svg-core'
import {faLock, faLockOpen, faSignInAlt, faSignOutAlt, faWifi, faSave, faIdBadge} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'bootstrap/dist/css/bootstrap'

library.add( faLock, faLockOpen, faSignInAlt, faSignOutAlt, faWifi, faSave, faIdBadge)


class App extends Component {
  constructor(props){
    super(props);

    this.handleWorkshopChange = this.handleWorkshopChange.bind(this);
    this.postAttend = this.postAttend.bind(this);
    this.loadWorkshops = this.loadWorkshops.bind(this);
    this.checkScan = this.checkScan.bind(this);
    this.handleScan = this.handleScan.bind(this);
    this.handleLock = this.handleLock.bind(this);
    this.handlePasswordKeyDown = this.handlePasswordKeyDown.bind(this);
    this.handleScanActionChange = this.handleScanActionChange.bind(this);
    this.checkedInNames = this.checkedInNames.bind(this);
    this.notCheckedInNames = this.checkedInNames.bind(this);
    this.updateAttendance = this.updateAttendance.bind(this);
    this.findAttendee = this.findAttendee.bind(this);
    this.sync = this.sync.bind(this);
    this.downloadCSV = this.downloadCSV.bind(this);
    this.cache = this.cache.bind(this);

    this.state = {
      workshops: [],
      data_loaded: false,
      cache_dirty: false,
      selected_workshop: null,
      attendance: {},
      last_checked_name: "",
      check_in: false, //mode
      current_scan_val: "",
      tamper_lock: false,
      unlocking: false,
      password: "",
      error: null,
      current_message:"",
      current_message_color: "green"
    }

    this.scan_timeout = null;
  }

  handleWorkshopChange(e){
    if (e !== null) {
      this.setState(prevState => {
        prevState.selected_workshop = e.value;
        prevState.current_message = "";
        return prevState;
      });
    }
  }

  postAttend(workshop_id, attendee_id){
    console.log(this.props.url);
    console.log(JSON.stringify({workshop_id: workshop_id, attendee_id:attendee_id}));

    fetch(this.props.url + "tao/attend", {
        method: 'post',
        body: JSON.stringify({data: {workshop_id: workshop_id, attendee_id:attendee_id}}), //send string ID instead of numerical ID for attendee_id
        headers: {
          'Content-Type' : 'application/json'
        }
      }).then(res => {
          if (res.ok) {
            return res.json();
          }
          else {
            throw new Error('something went wrong!')
          }
        })
        .then(
          (result) => {
            this.setState(prevState => {
              let name = prevState.workshops.find(w => {return w.id == workshop_id}).registrants.find(r => {return r.id == attendee_id})["name"]
              let current_r = this.state.workshops.find(w => {return w.id == workshop_id}).registrants.find(r => {return r.id == attendee_id})
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
            let name = this.state.workshops.find(w => {return w.id == workshop_id}).registrants.find(r => {return r.id == attendee_id})["name"]
            this.setState({
              error:error,
              current_message: "Thanks for coming "+this.state.last_checked_name,
              urrent_message_color: "green"
            });
          }
        )
  }

  loadWorkshops(handler){
    fetch(this.props.url + "tao/workshops")
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

  updateAttendance(workshops, handler) {
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
            }
            else {
              if (handler) {
                handler();
              }
            }
          }
          else {
            this.setState(prevState => {
              prevState.attendance[key] = {
                checked_in : true,
                checked_out : r.attended
              };
              return prevState
            }, handler);
          }
        })
      })
    } 
  }

  checkScan(){
    if (this.state.workshops != null) {
      let workshop_registrants = this.state.workshops.find(w => {return w.id === this.state.selected_workshop }).registrants.map((r) => { return r.id});
      let attendee_id = this.state.current_scan_val;
      if (workshop_registrants.includes(attendee_id)){
        let key = this.state.selected_workshop + "-" + attendee_id;
        let name = this.state.workshops.find(w => {return w.id == this.state.selected_workshop}).registrants.find(r => {return r.id == attendee_id})["name"]
        this.setState({
            last_checked_name: name
        });
        this.setState(prevState => {   
          if (prevState.check_in) {
            prevState.attendance[key].checked_in = true;
          }
          else {
            prevState.attendance[key].checked_out = true;
          }
          prevState.current_scan_val = "";
          return prevState;
        }, () => {
          this.cache();
          if (this.state.attendance[key].checked_out == true && this.state.attendance[key].checked_in == true) {
            let r = this.state.workshops.find(w => {return w.id == this.state.selected_workshop}).registrants.find(r => {return r.id == attendee_id});
            if (r.attended) {
              this.setState(
                {
                  current_message:this.state.last_checked_name+", you are already checked in.",
                  current_message_color:"orange"
                }
              );
            }
            else {
              this.setState(
                {
                  current_message:"Thanks for coming "+this.state.last_checked_name,
                  current_message_color:"green"
                }
              );
            }

            this.sync();
          }
        });
      } else {
        // Refresh workshop data in case attendee was just registered
        this.loadWorkshops(workshops => {
          this.updateAttendance(workshops, () => {
            if (this.state.workshops != null) {
            let workshop_registrants = this.state.workshops.find(w => {return w.id === this.state.selected_workshop }).registrants.map((r) => { return r.id});
            let attendee_id = this.state.current_scan_val;
            if (workshop_registrants.includes(attendee_id)){
              this.postAttend(this.state.selected_workshop, attendee_id);  
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
      if (this.state.selected_workshop !== null){
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

  checkedInNames(){
    if (this.state.selected_workshop == null) {
      return []
    }
    else {
      var names = [];
      for (let key in this.state.attendance) {
        if (key.split("-")[0] == this.state.selected_workshop 
          && this.state.attendance[key].checked_out == true 
          && this.state.attendance[key].checked_in == true) {
            console.log(key.split("-")[0]);
            console.log(key.split("-")[1]);
            console.log(this.findAttendee(key.split("-")[0], key.split("-")[1]));
            names.push(this.findAttendee(key.split("-")[0], key.split("-")[1]).name);
            names.push('\n'); //add line breaks to array used to display names in the attendance list
        }
      }
      return names;
    }
  }

  notCheckedInNames(){
    if (this.state.selected_workshop == null) {
      return []
    }
    else {
      var names = [];
      for (let key in this.state.attendance) {
        if (key.split("-")[0] == this.state.selected_workshop 
          && this.state.attendance[key].checked_out == false 
          && this.state.attendance[key].checked_in == true) {
            let r = this.findAttendee(key.split("-")[0], key.split("-")[1]);
            names.push(r);
            names.push("\n"); //add line breaks to array used to display names in the attendance list
        }
      }
      return names;
    }
  }

  findAttendee(workshop_id, attendee_id) {
    return this.state.workshops.find(w => {return w.id == workshop_id}).registrants.find((r) => { return r.id == attendee_id});
  }

  sync() {
    this.state.workshops.forEach(w => {w.registrants.forEach((r) => {
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
    rows[i++] = ["Workshop ID", "Attendee ID", "Attended"];
    this.state.workshops.forEach(w => {
      w.registrants.forEach((r) => {
        let attendance_record = this.state.attendance[w.id + "-" + r.id];
        rows[i] = [];
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
      let workshop_select_options = this.state.workshops.map(w =>{
        return (
          {
            label: w.name,
            value: w.id
          } 
        )
      });


      let selected_workshop_name = this.state.selected_workshop != null ? 
        this.state.workshops.find(w => {return w.id === this.state.selected_workshop}).name
        :
        "None";

      var storage = JSON.parse(localStorage.getItem('check_out_cache'));

      return (
        <Grid>
          <Row>
            <Col md={8} mdOffset={2}>
              <h1> TAO Workshop Attendance Scanner </h1>
              
              <Row style={{marginBottom:"5px"}}>
                <Col md={11}>
                  {this.state.tamper_lock === false ? 
                    <Select 
                      className="workshops"
                      placeholder="Select a Workshop" 
                      options={workshop_select_options} 
                      value={this.state.selected_workshop}
                      onChange={this.handleWorkshopChange}
                      clearable = {false}
                    />
                    :
                    <h3 style={{marginTop:"5px"}}>{this.state.check_in ? "Checking in to" : "Checking out of"} {selected_workshop_name} </h3>
                  }
                </Col>

                <Col md={1}>
                  <Button bsSize="large" style={{color:"black", float:"right"}} onClick={this.handleLock}>
                    {this.state.tamper_lock ? 
                      <FontAwesomeIcon icon="lock-open"/>
                      : 
                      <FontAwesomeIcon icon="lock"/>
                    }
                  </Button>

                  {this.state.tamper_lock === false ?
                    null
                    :
                    null
                  }
                </Col>
              </Row>

              {this.state.tamper_lock ?
                <div>
                <h2 style={{color:this.state.current_message_color}}>{this.state.current_message}</h2>
                </div>
                :
                <div>
                <div className="display-linebreak">
                  <h2>Attendance List:</h2>
                  {this.checkedInNames()}
                  <br/>
                  <h2>Not Checked In:</h2>
                  {this.notCheckedInNames().map((r) =>
                    (r === "\n") ? r : r.name
                  )}
                </div>
              </div>

              }
             
            </Col>
            <Col md={2}>
            <div>
              {this.state.cache_dirty ?
                <Button bsSize="large" onClick={this.sync} disabled={this.state.cache_dirty ? false : true}>
                <FontAwesomeIcon icon="wifi" style={this.state.cache_dirty ? {color:"red"} : {color:"black"}} />
                </Button>
                :
                null
              }
                <Button bsSize="large"  onClick={this.downloadCSV} disabled={this.state.tamper_lock ? true : false}>
                  {this.state.cache_dirty && this.state.error !== null   ? 
                  <FontAwesomeIcon icon="save" style={{color:"red"}}/>
                  : 
                  <FontAwesomeIcon icon="save" style={{color:"black"}}/>
                  }
                </Button>
                <Button href="tao/print" bsSize="large" disabled={this.state.tamper_lock ? true : false}>
                  <FontAwesomeIcon icon="id-badge" style={{color:"black"}}/>
                </Button>
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
      this.setState({attendance:cache_data}, () => {this.loadWorkshops(this.updateAttendance)});
    }
    else {
      this.loadWorkshops(this.updateAttendance)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

}

export default App;
