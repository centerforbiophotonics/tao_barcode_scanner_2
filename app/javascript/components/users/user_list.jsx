import React from 'react';
import PropTypes from 'prop-types';

/**
 * Bootstrap list group showing a collection of model instances. Initially shows the modele ID as a placeholder.
 */
class UserList extends React.Component {
  static propTypes = {
    /** The model instances to display */
    users: PropTypes.object,
  }

  /** 
   * The render lifecycle method. 
   * @public
   */
  render(){
    let users = this.props.users;

    return (
      <ul class="list-group">
        {users.map(user =>
          <li key={user.id} class="list-group-item p-0">{user.id}</li>
        )} 
      </ul>
    )   
  }
}

export default UserList;