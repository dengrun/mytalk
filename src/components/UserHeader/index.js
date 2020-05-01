import React from 'react'
import style from './index.module.css';
import { Person } from 'blockstack';

class UserHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
  	  person: {},
  	};
  }

  login=(e)=> {
    this.props.userSession.redirectToSignIn();
  }

  logout=()=> {
    this.props.userSession.signUserOut(window.location.origin);
  }

  componentWillMount() {
    if(this.props.userSession.isUserSignedIn()){
      console.log(this.props.userSession.loadUserData().profile);

      try {
        let person = new Person(this.props.userSession.loadUserData().profile);
        let personjson = person.toJSON();

        this.setState({
          person: personjson,
        });
      } catch {

      }
      

    }
  }

  render() {
    let user = this.props.user;
    const { person } = this.state;
    

    let userAccount;
    try{
      userAccount = JSON.parse(localStorage.getItem('blockstack-session')).userData.username;
    } catch {
      userAccount = "";
    }
    
     

    return (
      <header className={style.component}>
        {
          !this.props.userSession.isUserSignedIn() ?
          <button onClick={this.login.bind(this)}>Login</button>
          :
          <span>
            <img src={person.avatarUrl} alt={person.name} />
            <button onClick={this.logout.bind(this)}>Logout</button>
            <div>
              <h3>{person.name}</h3>
              <h5>{userAccount}</h5>
            </div>
          </span>
        }
        
      </header>
    )
  }
}

export default UserHeader;