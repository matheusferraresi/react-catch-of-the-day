import React, { Component } from "react";
import AddFishForm from "./AddFishForm";
import base from "../base";

export default class Inventory extends Component {
  constructor() {
    super();
    this.state = {
      uid: null,
      owner: null
    };
  }

  componentDidMount() {
    base.onAuth(user => {
      if(user) {
        this.authHandler(null, {user});
      }
    })
  }

  handleChange = (e, key) => {
    const fish = this.props.fishes[key];
    // take a copy of that fish and update it with the new data
    const updatedFish = {
      ...fish,
      [e.target.name]: e.target.value
    };
    this.props.updateFish(key, updatedFish);
  };

  authenticate = provider => {
    base.authWithOAuthPopup(provider, this.authHandler);
  };

  logout = () => {
    base.unauth();
    this.setState({ uid: null});
  }

  authHandler = (err, authData) => {
    if (err) {
      return;
    }

    // grab the store info
    const storeRef = base.database().ref(this.props.storeID);

    // query the firebase once for the store data
    storeRef.once('value', snapshot => {
      const data = snapshot.val() || {};

      // claim it as our own if there is no owner already
      if (!data.owner) {
        storeRef.set({
          owner: authData.user.uid
        })
      } 

      this.setState({
        uid: authData.user.uid,
        owner: data.owner || authData.user.uid
      })
    })

  };

  renderLogin = () => {
    return (
      <nav className="login">
        <h2>Inventory</h2>
        <p>Sign in to manage your store's inventory</p>
        <button className="github" onClick={() => this.authenticate("github")}>
          Log In With Github
        </button>
        <button
          className="facebook"
          onClick={() => this.authenticate("facebook")}
        >
          Log In With Facebook
        </button>
        <button
          className="twitter"
          onClick={() => this.authenticate("twitter")}
        >
          Log In With Twitter
        </button>
      </nav>
    );
  };

  renderInventory = key => {
    const fish = this.props.fishes[key];
    return (
      <div className="fish-edit" key={key}>
        <input
          type="text"
          name="name"
          value={fish.name}
          placeholder="Fish Name"
          onChange={e => this.handleChange(e, key)}
        />
        <input
          type="text"
          name="price"
          value={fish.price}
          placeholder="Fish Price"
          onChange={e => this.handleChange(e, key)}
        />

        <select
          type="text"
          name="status"
          value={fish.status}
          placeholder="Fish Status"
          onChange={e => this.handleChange(e, key)}
        >
          <option value="available">Fresh!</option>
          <option value="unavailable">Sold Out!</option>
        </select>

        <textarea
          type="text"
          name="desc"
          value={fish.desc}
          placeholder="Fish Desc"
          onChange={e => this.handleChange(e, key)}
        />
{/*         
        <input
          type="file"
          name="image"
          value={fish.image}
          placeholder="Fish Image"
          accept="image/png, image/jpeg"
          onChange={e => this.handleChange(e, key)}
        /> */}
        <input
          type="text"
          name="image"
          value={fish.image}
          placeholder="Fish Image"
          onChange={e => this.handleChange(e, key)}
        />
        
        <button onClick={() => this.props.removeFish(key)}>Remove fishes</button>
      </div>
    );
  };

  render() {
    const logout = <button onClick={this.logout}>Log Out!</button>;

    // check if they are no logged in at all
    if (!this.state.uid) {
      return <div>{this.renderLogin()}</div>;
    }

    // check if they are the owner of the current store
    if (this.state.uid !== this.state.owner) {
      return (
        <div>
          <p>Sorry you aren't the owner of this store!</p>
          {logout}
        </div>
      );
    }

    return (
      <div>
        <h2>Inventory</h2>
        {logout}
        {Object.keys(this.props.fishes).map(this.renderInventory)}
        <AddFishForm addFish={this.props.addFish} />
        <button onClick={this.props.loadSamples}>Load Sample Fishes</button>
      </div>
    );
  }
}

Inventory.propTypes = {
  fishes: React.PropTypes.object.isRequired,
  updateFish: React.PropTypes.func.isRequired,
  removeFish: React.PropTypes.func.isRequired,
  addFish: React.PropTypes.func.isRequired,
  loadSamples: React.PropTypes.func.isRequired,
  storeID: React.PropTypes.string.isRequired
};
