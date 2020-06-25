import React, { Component } from "react";
import DrawingZone from "./components/drawing_zone";
import Rectangle from "./components/rectangle";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        position: "0 0",
        model: {
          class: "go.GraphLinksModel",
          nodeDataArray: [],
          linkDataArray: [],
        },
      },
      geoArr: [],
      // drawingType: 'polygon'
    };
  }

  getGeo = (nodeDataArray) => {
    this.setState({
      ...this.state.data,
      model: {
        ...this.state.data.model,
        nodeDataArray,
      },
    });
  };

  formatGeo = (nodeDataArray) => {
    const { data } = this.state;
    let geoArr = [];

    if (data.model.nodeDataArray.length > 0) {
      data.model.nodeDataArray.map((item, index) => {
        if (item.category === "PolygonDrawing") {
          let strGeo = item.geo;
          let strLoc = item.loc;
          let strReplace = strGeo.replace(/F|M|L|Z/gi, "");
          let arr = strReplace.split(" ");
          let arrLoc = strLoc.split(" ");
          arr.shift();

          function chunkArray(myArr, chunk_size) {
            let results = [];

            while (myArr.length) {
              results.push(myArr.splice(0, chunk_size));
            }

            return results;
          }
          let result = chunkArray(arr, 2);

          let locX = Number(arrLoc[0]).toFixed(0);
          let locY = Number(arrLoc[1]).toFixed(0);

          let geoObjs = result.map((item) => {
            let geoX = Number(item[0]).toFixed(0);
            let geoY = Number(item[1]).toFixed(0);
            return {
              x: Number(geoX) + Number(locX),
              y: Number(geoY) + Number(locY),
            };
          });

          geoArr.push(geoObjs);

          return true;
        } else if (item.category === "Rectangle") {
          let { size, loc } = item;
          let arrSize = size.split(" ");
          let arrLoc = loc.split(" ");

          let x1 = Number(arrLoc[0]).toFixed(0)
          let y1 = Number(arrLoc[1]).toFixed(0)
          let x2 = (Number(x1) + Number(arrSize[0])).toFixed(0);
          let y2 = y1;
          let x3 = x2;
          let y3 = (Number(y1) + Number(arrSize[1])).toFixed(0);
          let x4 = x1;
          let y4 = y3;

          let geoRectangle = [
            {
              x: x1,
              y: y1,
            },
            {
              x: x2,
              y: y2,
            },
            {
              x: x3,
              y: y3,
            },
            {
              x: x4,
              y: y4,
            },
          ];

          geoArr.push(geoRectangle);
        }
      });
    }

    if (nodeDataArray.length < 1) {
      this.setState({
        geoArr: [],
      });
    }

    if (geoArr.length > 0) {
      this.setState({
        geoArr,
      });
    }
  };

  render() {
    const { data, geoArr } = this.state;

    return (
      <div className="App">
        {/* <Rectangle /> */}
        <DrawingZone
          data={data}
          geoArr={geoArr}
          getGeo={this.getGeo}
          formatGeo={this.formatGeo}
        />
      </div>
    );
  }
}

export default App;
