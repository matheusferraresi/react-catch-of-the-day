import React from "react";
import Header from "./Header";
import Order from "./Order";
import Inventory from "./Inventory";
import Fish from "./Fish";
import sampleFishes from "../sample-fishes";
import base from "../base";

class App extends React.Component {
  componentWillMount() {
    this.state = {
      fishes: {},
      order: {}
    };

    // this runs right before the <App> is rendered
    this.ref = base.syncState(`${this.props.params.storeID}/fishes`, {
      context: this,
      state: "fishes"
    });

    // Check if there is any order in localstorage
    const localStorageRef = localStorage.getItem(
      `order-${this.props.params.storeID}`
    );

    if (localStorageRef) {
      // update our App component's order state
      this.setState({
        order: JSON.parse(localStorageRef)
      });
    }
  }

  componentWillUnmount() {
    base.removeBinding(this.ref);
  }

  componentWillUpdate(nextProps, nextState) {
    localStorage.setItem(
      `order-${this.props.params.storeID}`,
      JSON.stringify(nextState.order)
    );
  }

  addFish = fish => {
    const fishes = { ...this.state.fishes };

    const timestamp = Date.now();

    fishes[`fish-${timestamp}`] = fish;

    this.setState({ fishes });
  };

  updateFish = (key, updatedFish) => {
    const fishes = { ...this.state.fishes };
    fishes[key] = updatedFish;
    this.setState({ fishes });
  };

  removeFish = key => {
    const fishes = { ...this.state.fishes };
    fishes[key] = null;
    this.setState({ fishes });
  };

  loadSamples = () => {
    this.setState({
      fishes: sampleFishes
    });
  };

  addToOrder = key => {
    const order = { ...this.state.order };

    order[key] = order[key] + 1 || 1;

    this.setState({ order });
  };

  removeFromOrder = key => {
    const order = { ...this.state.order };
    delete order[key];

    this.setState({ order });
  };

  render() {
    return (
      <div className="catch-of-the-day">
        <div className="menu">
          <Header tagline="Fresh Seafood Market" />
          <ul className="list-of-fishes">
            {Object.keys(this.state.fishes).map(key => (
              <Fish
                key={key}
                index={key}
                details={this.state.fishes[key]}
                addToOrder={this.addToOrder}
              />
            ))}
          </ul>
        </div>
        <Order
          fishes={this.state.fishes}
          order={this.state.order}
          params={this.props.params}
          removeFromOrder={this.removeFromOrder}
        />
        <Inventory
          addFish={this.addFish}
          loadSamples={this.loadSamples}
          fishes={this.state.fishes}
          updateFish={this.updateFish}
          removeFish={this.removeFish}
          storeID={this.props.params.storeID}
        />
      </div>
    );
  }
}

App.propTypes = {
  params: React.PropTypes.object.isRequired
};

export default App;
