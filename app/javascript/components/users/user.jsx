import React from 'react';
import PropTypes from 'prop-types';

/**
 * Bootstrap card showing all the details of a user and its associated models.
 */
class User extends React.Component {
  static propTypes = {
    /** The model instance to display */
    user: PropTypes.object,
    /** @type {object} The attributes of the user who requested the page. */
    current_user: PropTypes.object,
    /** @type {function} A handler to invoke to close/hide the show card. */
    close: PropTypes.func,
  }

  /** 
   * The constructor lifecycle method. 
   * @param {object} props - The component's props 
   * @public
   */
  constructor(props){
    super(props);
  }

  /** 
   * The render lifecycle method.
   * @public
   */
  render(){
    let user = this.props.user;

    let buttons = (
      <a className="btn btn-secondary text-white" onClick={this.props.close}>Close</a>
    );

    return (
      <div className="card mb-3" id={"user_"+this.props.user.id}>
        <div className="card-body">
          <h3 className="card-title">{user.name}</h3>
          <div className="ml-3">
            {buttons}
            <p><strong>Name: </strong>{user.name}</p>
              <p><strong>Email: </strong>{user.email}</p>
              <p><strong>Cas User: </strong>{user.cas_user}</p>
              <p><strong>Roles: </strong>{user.roles}</p>
            {buttons}
          </div>
        </div>
      </div>
    )   
  }
}

export default User;