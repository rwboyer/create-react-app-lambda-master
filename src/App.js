import React, { Component } from 'react';
import './App.css';
import netlifyIdentity from 'netlify-identity-widget';
import Thermometer from 'react-thermometer-component'
class SlackMessage extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: false, text: null, error: null, success: false };
  }
  generateHeaders() {
    const headers = { "Content-Type": "application/json" };
    if (netlifyIdentity.currentUser()) {
      return netlifyIdentity.currentUser().jwt().then((token) => {
        return { ...headers, Authorization: `Bearer ${token}` };
      })
    }
    return Promise.resolve(headers);
  }  
  handleText = (e) => {
    this.setState({ text: e.target.value });
  };
  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({ loading: true });
    this.generateHeaders().then((headers) => {
      fetch('/.netlify/functions/slack', {
        method: "POST",
        headers,
        body: JSON.stringify({
          text: this.state.text
        })
      })
        .then(response => {
          if (!response.ok) {
            return response.text().then(err => { throw (err) });
          }
        })
        .then(() => this.setState({ loading: false, text: null, success: true, error: null }))
        .catch(err => this.setState({ loading: false, success: false, error: err.toString() }))
      })
  }
  render() {
    const { loading, text, error, success } = this.state;
    return <div> <form onSubmit={this.handleSubmit}>
      {error && <p><strong>Error sending message: {error}</strong></p>}
      {success && <p><strong>Done! Message sent to Slack</strong></p>}
      <p>
        <label>Your Message: <br />
          <textarea onChange={this.handleText} value={text}></textarea>
        </label>
      </p>
      <p>
        <button type="submit" disabled={loading}>{loading ? "Sending Slack Message..." : "Send a Slack Message"}</button>
      </p>
    </form>
    <Thermometer theme="light" value="18" max="100" format="$" size="large" height="300"/>
    </div>;
  }
}
class App extends Component {
  componentDidMount() {
    netlifyIdentity.init();
  }
  handleIdentity = (e) => {
    e.preventDefault();
    netlifyIdentity.open();
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Slack Messenger</h1>
        </header>
        <p><a href="#" onClick={this.handleIdentity}>User Status</a></p>
        <SlackMessage />
      </div>
    );
  }
}
export default App;