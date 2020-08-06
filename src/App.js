import React, { Component } from "react";
import DrawingZone from "./components/drawing_zone";
// import Rectangle from "./components/rectangle";
import ShapeD3 from './components/shape_d3'

class App extends Component {
  render() {
    return (
      <div className="App">
        {/* <DrawingZone /> */}
        <ShapeD3 />
      </div>
    );
  }
}

export default App;
