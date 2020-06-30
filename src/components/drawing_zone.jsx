import React, { Component } from "react";
import { withStyles } from "@material-ui/styles";
import * as go from "gojs";
import { connect } from "react-redux";
import { Button } from "@material-ui/core";

import GeometryReshapingTool from "./../lib/GeometryReshapingTool";
import PolygonDrawingTool from "./../lib/PolygonDrawingTool";
import DragCreatingTool from "./../lib/DragCreatingTool";
import FormSelected from "./form_selected";
import ShowGeo from "./show_geo";
import GeoFormat from "./geo_format";
import { loadGeo, addZone, formatGeo } from "./../redux/actions/geo";

const styles = {
  myDiagramDiv: {
    border: "solid 1px black",
    width: "calc(2560px / 3)",
    height: "calc(1920px / 3)",
    margin: "0 auto",
    backgroundImage: "url(./images/test.png)",
    backgroundSize: "cover",
  },
  boxButton: {
    position: "absolute",
    top: "50%",
    padding: 10,
  },
  button: {
    textTransform: "lowercase",
  },
};

class DrawingZone extends Component {
  constructor(props) {
    super(props);
    this.state = {
      myDiagram: "",
      $: "",
      typeDrawing: "polygon",
      color: "red",
      isEnabled: 0,
      type: "",
    };
  }

  componentDidMount() {
    this.init();
    this.props.loadGeo();
  }

  componentDidUpdate() {
    this.changeColorType();
  }

  stayInFixedArea(part, pt, gridpt) {
    let diagram = part.diagram;
    if (diagram === null) return pt;
    let v = diagram.documentBounds.copy();
    v.subtractMargin(diagram.padding);
    let b = part.actualBounds;
    let loc = part.location;
    let x = Math.max(v.x, Math.min(pt.x, v.right - b.width)) + (loc.x - b.x);
    let y = Math.max(v.y, Math.min(pt.y, v.bottom - b.height)) + (loc.y - b.y);
    return new go.Point(x, y);
  }

  handleMouseDownTools(e, obj) {
    let itemNode = obj.jb;

    console.log("itemNode", itemNode);
  }

  handleFinishShape() {
    console.log("finish asdjalksdj");
    return;
  }

  init() {
    let $ = go.GraphObject.make;
    let width = 2560 / 3;
    let height = 1920 / 3;
    const myDiagram = $(go.Diagram, "myDiagramDiv", {
      fixedBounds: new go.Rect(0, 0, width, height),
      allowHorizontalScroll: false,
      allowVerticalScroll: false,
      allowZoom: true,
    });
    myDiagram.toolManager.mouseDownTools.insertAt(
      3,
      new GeometryReshapingTool()
    );

    myDiagram.nodeTemplateMap.add(
      "PolygonDrawing",
      $(
        go.Node,
        {
          dragComputation: this.stayInFixedArea,
          click: this.handleMouseDownTools,
          reshapable: this.stayInFixedArea,
        },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
          go.Point.stringify
        ),
        {
          selectionAdorned: true,
          selectionObjectName: "SHAPE",
          selectionAdornmentTemplate: $(
            go.Adornment,
            "Auto",
            $(go.Shape, { stroke: "dodgerblue", fill: "transparents" }),
            $(go.Placeholder, { margin: 0 })
          ),
        },
        // { resizable: false, resizeObjectName: "SHAPE" },
        // { rotatable: false, rotateObjectName: "SHAPE" },
        $(
          go.Shape,
          {
            name: "SHAPE",
            fill: null,
            stroke: null,
            strokeWidth: null,
            maxSize: new go.Size(width, height),
            minSize: new go.Size(20, 20),
          },

          new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(
            go.Size.stringify
          ),
          new go.Binding("angle").makeTwoWay(),
          new go.Binding("geometryString", "geo").makeTwoWay(),
          new go.Binding("fill"),
          new go.Binding("stroke"),
          new go.Binding("strokeWidth")
        )
      )
    );

    //handle drawing polygon
    let tool = new PolygonDrawingTool();
    tool.archetypePartData = {
      fill: "transparent",
      stroke: "red",
      strokeWidth: 3,
      type: null,
      category: "PolygonDrawing",
    };
    tool.doKeyDown = this.handleFinishShape;

    tool.isPolygon = true;

    myDiagram.toolManager.mouseDownTools.insertAt(0, tool);

    // handle drawing rectangle
    myDiagram.nodeTemplate = $(
      go.Node,
      "Auto",
      {
        dragComputation: this.stayInFixedArea,
        reshapable: this.stayInFixedArea,
        click: this.handleMouseDownTools,
      },
      { minSize: new go.Size(20, 20), resizable: true },
      new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(
        go.Size.stringify
      ),
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
        go.Point.stringify
      ),
      $(
        go.Shape,
        "Rectangle",
        { name: "SHAPE" },
        new go.Binding("fill"),
        new go.Binding("stroke"),
        new go.Binding("strokeWidth")
      )
    );

    myDiagram.add($(go.Part));

    myDiagram.toolManager.mouseMoveTools.insertAt(
      2,
      $(DragCreatingTool, {
        delay: 0,
        box: $(
          go.Part,
          $(go.Shape, {
            // name: "SHAPE",
            fill: "transparent",
            stroke: "",
            strokeWidth: 2,
          })
        ),
        archetypeNodeData: {
          category: "Rectangle",
          stroke: "red",
          fill: "transparent",
          type: null,
          strokeWidth: 2,
        },
      })
    );

    this.setState({
      myDiagram,
      $,
    });

    this.loadGeo(myDiagram);
    this.configIsEnabled(myDiagram);
  }

  onChangeTypeDraw = (type) => {
    const { myDiagram, $, isEnabled } = this.state;
    if (myDiagram?.toolManager) {
      if (type === "polygon") {
        if (isEnabled === 1) {
          let tool = myDiagram.toolManager.mouseDownTools.elt(0);
          tool.isEnabled = true;
        }
      } else if (type === "rectangle") {
        let tool = myDiagram.toolManager.mouseDownTools.elt(0);
        tool.isEnabled = false;
      }
    }
  };

  updateGeo = () => {
    const { myDiagram } = this.state;
    if (myDiagram?.model) {
      let dataJson = myDiagram.model.toJson();
      let dataObj = JSON.parse(dataJson);

      this.props.addZone(dataObj.nodeDataArray);

      this.setState({
        type: 2
      });
    }
  };

  // handleFormatGeo = (nodeDataArray) => {
  //   const data = this.props.geoArray;

  //   // console.log("data format geo", this.props.geoArray);

  //   let geoArr = [];

  //   if (data.model.nodeDataArray.length > 0) {
  //     data.model.nodeDataArray.map((item, index) => {
  //       if (item.category === "PolygonDrawing") {
  //         let strGeo = item.geo;
  //         let strLoc = item.loc;
  //         let strReplace = strGeo.replace(/F|M|L|Z/gi, "");
  //         let arr = strReplace.split(" ");
  //         let arrLoc = strLoc.split(" ");
  //         arr.shift();

  //         function chunkArray(myArr, chunk_size) {
  //           let results = [];

  //           while (myArr.length) {
  //             results.push(myArr.splice(0, chunk_size));
  //           }

  //           return results;
  //         }
  //         let result = chunkArray(arr, 2);

  //         let locX = Number(arrLoc[0]).toFixed(0);
  //         let locY = Number(arrLoc[1]).toFixed(0);

  //         let geoObjs = result.map((item) => {
  //           let geoX = Number(item[0]).toFixed(0);
  //           let geoY = Number(item[1]).toFixed(0);
  //           return {
  //             x: Number(geoX) + Number(locX),
  //             y: Number(geoY) + Number(locY),
  //           };
  //         });

  //         geoArr.push(geoObjs);

  //         return true;
  //       } else if (item.category === "Rectangle") {
  //         let { size, loc } = item;
  //         let arrSize = size.split(" ");
  //         let arrLoc = loc.split(" ");

  //         let x1 = Number(arrLoc[0]).toFixed(0);
  //         let y1 = Number(arrLoc[1]).toFixed(0);
  //         let x2 = (Number(x1) + Number(arrSize[0])).toFixed(0);
  //         let y2 = y1;
  //         let x3 = x2;
  //         let y3 = (Number(y1) + Number(arrSize[1])).toFixed(0);
  //         let x4 = x1;
  //         let y4 = y3;

  //         let geoRectangle = [
  //           {
  //             x: x1,
  //             y: y1,
  //           },
  //           {
  //             x: x2,
  //             y: y2,
  //           },
  //           {
  //             x: x3,
  //             y: y3,
  //           },
  //           {
  //             x: x4,
  //             y: y4,
  //           },
  //         ];

  //         geoArr.push(geoRectangle);

  //         item.geo = `F M${x1} ${y1} L${x2} ${y2} L${x3} ${y3} L${x4} ${y4}z`;
  //       }
  //     });
  //   }

  //   // if (nodeDataArray.length < 1) {
  //   //   this.props.formatGeo([]);
  //   // }

  //   // if (geoArr.length > 0) {
  //   //   this.props.formatGeo(geoArr);
  //   // }
  // };

  changeColorType = () => {
    const { myDiagram, typeDrawing, color } = this.state;
    if (myDiagram?.toolManager) {
      let toolPolygon = myDiagram.toolManager.mouseDownTools.elt(0);
      toolPolygon.isPolygon = true;
      toolPolygon.archetypePartData.stroke = color;

      if (typeDrawing === "rectangle") {
        let toolRectangle = myDiagram.toolManager.mouseMoveTools.elt(2);
        toolRectangle.archetypeNodeData.stroke = color;
      }
    }
  };

  onChange = (payload) => {
    this.setState({
      ...this.state,
      color: payload.value,
    });
  };

  onChangeType = (payload) => {
    this.onChangeTypeDraw(payload.value);
    this.setState({
      typeDrawing: payload.value,
    });
  };

  loadGeo = (myDiagram) => {
    const { geoArray } = this.props;
    if (myDiagram?.toolManager) {
      try {
        myDiagram.model = go.Model.fromJson(geoArray.model);
        myDiagram.model.undoManager.isEnabled = true;
      } catch (ex) {
        alert(ex);
      }
    }
  };

  changeIsEnabled = (isEnabled, typeTitle) => {
    const { myDiagram } = this.state;

    let toolPolygon = myDiagram.toolManager.mouseDownTools.elt(0);
    toolPolygon.archetypePartData.type = typeTitle
    toolPolygon.isEnabled = true;
    let toolRectangle = myDiagram.toolManager.mouseMoveTools.elt(2);
    toolRectangle.isEnabled = true;
    toolRectangle.archetypeNodeData.type = typeTitle;

    this.setState({
      isEnabled: isEnabled,
    });
  };

  configIsEnabled = (myDiagram) => {
    let toolPolygon = myDiagram.toolManager.mouseDownTools.elt(0);
    toolPolygon.isEnabled = false;
    let toolRectange = myDiagram.toolManager.mouseMoveTools.elt(2);
    toolRectange.isEnabled = false;
  };

  render() {
    const { classes } = this.props;
    const { isEnabled } = this.state;

    return (
      <div id="sample">
        <FormSelected
          onChange={this.onChange}
          onChangeTypeDraw={this.onChangeType}
          isEnabled={isEnabled}
          changeIsEnabled={this.changeIsEnabled}
        />

        <div className={classes.boxButton}>
          <Button
            variant="contained"
            color="primary"
            onClick={this.updateGeo}
            className={classes.button}
          >
            Cập nhật
          </Button>
        </div>
        {/* <ShowGeo updateGeo={this.updateGeo} /> */}
        {/* <GeoFormat /> */}
        <div id="myDiagramDiv" className={classes.myDiagramDiv}></div>

        <div
          id="goog-gt-tt"
          className="skiptranslate"
          dir="ltr"
          style={{ display: "none" }}
        ></div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    geoArray: state.loadGeo.geoArray,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadGeo: () => {
      dispatch(loadGeo());
    },
    addZone: (payload) => {
      dispatch(addZone(payload));
    },
    formatGeo: (payload) => {
      dispatch(formatGeo(payload));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(DrawingZone));
