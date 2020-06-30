import React, { Component } from "react";
import DrawingZone from "./components/drawing_zone";
// import Rectangle from "./components/rectangle";

class App extends Component {
  render() {
    return (
      <div className="App">
        <DrawingZone />
      </div>
    );
  }
}

export default App;
