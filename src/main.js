import ReactDOM from "react-dom";
import "./main.css";
import { connect, Provider } from "react-redux";
import { createStore } from "redux";
import React, { Component } from "react";

// Add the following property and value to the object passed as a second argument to fetch
// credentials: "include"
// Upon successful login, instead of setting the session id in the store, place information in the  store to indicate that the user has successfully logged in
// Update the reducer
// Since there is no longer a session id in the store, you'll need to update your App component
// You no longer need to send the session id in the request body of any of your fetches

class UnconnectedChat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: ""
    };
    this.handleMessage = this.handleMessage.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentDidMount() {
    let updater = () => {
      return fetch("http://10.65.106.58:4000/message")
        .then(function(x) {
          return x.text();
        })
        .then(responseBody => {
          let parsed = JSON.parse(responseBody);
          console.log("the parsed response", parsed);
          this.props.dispatch({
            type: "set-message",
            message: parsed
          });
        });
    };
    setInterval(updater, 500);
  }
  handleMessage(event) {
    this.setState({ message: event.target.value });
  }
  handleSubmit(event) {
    event.preventDefault();
    let c = JSON.stringify({
      msg: this.state.message,
      sessionId: this.props.sid
    });
    fetch("http://10.65.106.58:4000/newmessage", {
      method: "POST",
      body: c,
      credentials: "include"
    });
  }
  render() {
    let abricot = function(e) {
      return (
        <li>
          {e.username}: {e.message}
        </li>
      );
    };
    let msgs = this.props.messages;
    if (msgs === undefined) {
      msgs = [];
    }
    return (
      <div>
        <ul>{msgs.map(abricot)}</ul>
        <form onSubmit={this.handleSubmit}>
          <input type="text" onChange={this.handleMessage} />
          <input type="submit" value="send" />
        </form>
      </div>
    );
  }
}

let Chat = connect(function(state) {
  return { sid: state.sessionId, messages: state.message };
})(UnconnectedChat);

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      signedUp: false
    };
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleUsernameChange(event) {
    console.log("new username", event.target.value);
    this.setState({ username: event.target.value });
  }
  handlePasswordChange(event) {
    console.log("new password", event.target.value);
    this.setState({ password: event.target.value });
  }
  handleSubmit(event) {
    event.preventDefault();
    console.log("here is what we submitted");
    this.state.signedUp = true;
    let c = JSON.stringify({
      username: this.state.username,
      password: this.state.password
    });
    fetch("http://10.65.106.58:4000/signup", { method: "POST", body: c });
  }
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        Username
        <input type="text" onChange={this.handleUsernameChange} />
        Password
        <input type="text" onChange={this.handlePasswordChange} />
        <input type="submit" value="Sign up" />
      </form>
    );
  }
}

class UnconnectedLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: ""
    };
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleUsernameChange(event) {
    console.log("new username", event.target.value);
    this.setState({ username: event.target.value });
  }
  handlePasswordChange(event) {
    console.log("new password", event.target.value);
    this.setState({ password: event.target.value });
  }
  handleSubmit(event) {
    event.preventDefault();
    console.log("here is what we submitted");
    let c = JSON.stringify({
      username: this.state.username,
      password: this.state.password
    });
    fetch("http://10.65.106.58:4000/login", {
      method: "POST",
      body: c,
      credentials: "include"
    })
      .then(function(x) {
        return x.text();
      })
      .then(responseBody => {
        let body = JSON.parse(responseBody);
        if (!body.success) {
          alert("login failed");
          return;
        }
        this.props.dispatch({ type: "login-success" });
      });
  }
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        Username
        <input type="text" onChange={this.handleUsernameChange} />
        Password
        <input type="text" onChange={this.handlePasswordChange} />
        <input type="submit" value="Log in" />
      </form>
    );
  }
}

let Login = connect()(UnconnectedLogin);
class UnconnectedApp extends Component {
  render() {
    if (this.props.lgin) {
      return <Chat />;
    }
    return (
      <div>
        <h2>Sign up</h2>
        <Signup />
        <h2>Log in</h2>
        <Login />
      </div>
    );
  }
}

let App = connect(function(state) {
  return { lgin: state.loggedIn };
})(UnconnectedApp);

let reducer = function(state, action) {
  if (action.type === "login-success") {
    return { ...state, loggedIn: true };
  }
  if (action.type === "set-message") {
    return { ...state, message: action.message };
  }
  return state;
};
const store = createStore(
  reducer,
  {}, // initial state
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
