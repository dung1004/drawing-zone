import React, { Component } from "react";
import { withStyles } from "@material-ui/styles";
import * as go from "gojs";
import { connect } from "react-redux";
import { Typography, Button } from "@material-ui/core"

import GeometryReshapingTool from "./../lib/GeometryReshapingTool";
import PolygonDrawingTool from "./../lib/PolygonDrawingTool";
import DragCreatingTool from "./../lib/DragCreatingTool";
import FormSelected from "./form_selected";

import {
  loadGeo,
  addZone,
  isDrawing,
  selectedZone,
  unselectedZone,
} from "./../redux/actions/geo";

const styles = {
  root: {
    display: "flex",
    width: "100%",
    height: "100vh",
    overflow: "hidden",
  },
  rootDiagram: {
    width: "100%",
    height: "100%",
    background: "black",
  },
  left: {},
  boxArrow: {
    height: 100
  },
  myDiagramDiv: {
    border: "solid 1px black",
    width: "100%",
    height: "100%",
    // backgroundImage: "url(./images/snapshot_1.png)",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    overflow: "hidden",
  },
  boxButton: {
    position: "absolute",
    top: "50%",
    padding: 10,
  },
  button: {
    textTransform: "lowercase",
  },
  zone: {
    display: "flex",
    justifyContent: "space-between",
    margin: "10px 0",
    padding: "0 10px"
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
      isArrow: false
    };
  }

  componentDidMount() {
    this.init();
    this.props.loadGeo();
  }

  componentDidUpdate() {
    this.changeColorType();
  }

  init() {
    let $ = go.GraphObject.make;
    let width = 2560 / 2;
    let height = 1920 / 2;
    const myDiagram = $(go.Diagram, "myDiagramDiv", {
      fixedBounds: new go.Rect(0, 0, width, height),
      allowHorizontalScroll: false,
      allowVerticalScroll: false,
      allowZoom: false,

      "draggingTool.dragsLink": true,
      "relinkingTool.isUnconnectedLinkValid": true,
      "relinkingTool.fromHandleArchetype": $(go.Shape, "Diamond", {
        segmentIndex: 0,
        cursor: "pointer",
        desiredSize: new go.Size(8, 8),
        fill: "tomato",
        stroke: "darkred",
      }),
      "relinkingTool.toHandleArchetype": $(go.Shape, "Diamond", {
        segmentIndex: -1,
        cursor: "pointer",
        desiredSize: new go.Size(8, 8),
        fill: "darkred",
        stroke: "tomato",
      }),

      "undoManager.isEnabled": true,
    });

    let toolResizing = myDiagram.toolManager.resizingTool;
    let toolGeomytry = new GeometryReshapingTool();
    myDiagram.toolManager.mouseDownTools.insertAt(3, toolGeomytry);

    myDiagram.addDiagramListener(
      "BackgroundDoubleClicked",
      this.handleDoubleClicked
    );

    myDiagram.nodeTemplateMap.add(
      "PolygonDrawing",
      $(
        go.Node,
        {
          dragComputation: this.stayInFixedArea,
          click: this.handleSelectedZone,
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
            $(go.Placeholder, { margin: -1 })
          ),
        },
        { resizable: false, resizeObjectName: "SHAPE" },
        { rotatable: false, rotateObjectName: "SHAPE" },
        { reshapable: true },

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
      typeZone: null,
      category: "PolygonDrawing",
    };
    tool.doStop = this.handleFinishShape;

    tool.isPolygon = true;

    myDiagram.toolManager.mouseDownTools.insertAt(0, tool);

    // handle drawing rectangle
    myDiagram.nodeTemplate = $(
      go.Node,
      "Auto",
      {
        dragComputation: this.stayInFixedArea,
        reshapable: this.stayInFixedArea,
        click: this.handleSelectedZone,
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
            name: "SHAPE",
            fill: "transparent",
            stroke: "",
            strokeWidth: 2,
          })
        ),
        archetypeNodeData: {
          category: "Rectangle",
          stroke: "red",
          fill: "transparent",
          typeZone: null,
          strokeWidth: 2,
        },
        doStop: this.handleFinishShape,
      })
    );

    // handle task drawing a line arrow

    myDiagram.addDiagramListener("Modified", function (e) {
      var button = document.getElementById("SaveButton");
      if (button) button.disabled = !myDiagram.isModified;
      var idx = document.title.indexOf("*");
      if (myDiagram.isModified) {
        if (idx < 0) document.title += "*";
      } else {
        if (idx >= 0) document.title = document.title.substr(0, idx);
      }
    });

    var nodeSelectionAdornmentTemplate = $(
      go.Adornment,
      "Auto",
      $(go.Shape, {
        fill: null,
        stroke: "deepskyblue",
        strokeWidth: 1.5,
        strokeDashArray: [4, 2],
      }),
      $(go.Placeholder)
    );

    var nodeResizeAdornmentTemplate = $(go.Adornment, "Spot");

    function showSmallPorts(node, show) {
      node.ports.each(function (port) {
        if (port.portId !== "") {
          // don't change the default port, which is the big shape
          port.fill = show ? "rgba(0,0,0,.3)" : null;
        }
      });
    }

    var linkSelectionAdornmentTemplate = $(
      go.Adornment,
      "Link",
      $(
        go.Shape,
        // isPanelMain declares that this Shape shares the Link.geometry
        { isPanelMain: true, fill: null, stroke: "deepskyblue", strokeWidth: 0 }
      ) // use selection object's strokeWidth
    );

    myDiagram.linkTemplate = $(
      go.Link, // the whole link panel
      { relinkableFrom: true, relinkableTo: true, reshapable: true },
      new go.Binding("points").makeTwoWay(),
      $(
        go.Shape, // the link path shape
        { isPanelMain: true, strokeWidth: 2 }
      ),
      $(
        go.Shape, // the arrowhead
        { toArrow: "Standard", stroke: null }
      )
    );

    var myPalette = $(
      go.Palette,
      "myPaletteDiv", // must name or refer to the DIV HTML element
      {
        // simplify the link template, just in this Palette
        linkTemplate: $(
          go.Link,
          {
            locationSpot: go.Spot.Center,
            selectionAdornmentTemplate: $(
              go.Adornment,
              "Link",
              { locationSpot: go.Spot.Center },
              $(go.Shape, {
                isPanelMain: true,
                fill: null,
                stroke: "deepskyblue",
                strokeWidth: 0,
              }),
              $(
                go.Shape, // the arrowhead
                { toArrow: "Standard", stroke: null }
              )
            ),
          },

          new go.Binding("points"),
          $(
            go.Shape, // the link path shape
            { isPanelMain: true, strokeWidth: 2 }
          ),
          $(
            go.Shape, // the arrowhead
            { toArrow: "Standard", stroke: null }
          )
        ),
        model: new go.GraphLinksModel(
          [],
          [
            // the Palette also has a disconnected Link, which the user can drag-and-drop
            {
              points: new go.List(/*go.Point*/).addAll([
                new go.Point(0, 0),
                new go.Point(30, 0),
                new go.Point(60, 0),
              ]),
            },
          ]
        ),
      }
    );

    // end handle drawing a line arrow

    myDiagram.commandHandler.doKeyUp = this.cancelSelectedZone;
    toolGeomytry.doStop = this.handleFinishShape;
    toolResizing.doStop = this.handleFinishShape;

    this.setState({
      myDiagram,
      $,
    });

    this.configIsEnabled(myDiagram);
    this.loadGeo(myDiagram);

    this.fixedBoundsImage(myDiagram);
  }

  loadGeo = (myDiagram) => {
    const { geoArray } = this.props;
    if (myDiagram?.toolManager) {
      try {
        myDiagram.initialPosition = go.Point.parse(geoArray.position || "0 0");
        myDiagram.model = go.Model.fromJson(geoArray.model);
        myDiagram.model.undoManager.isEnabled = true;
      } catch (ex) {
        alert(ex);
      }
    }
  };

  stayInFixedArea = (part, pt, gridpt) => {
    let diagram = part.diagram;
    if (diagram === "") return pt;
    let v = diagram.documentBounds.copy();
    v.subtractMargin(diagram.padding);
    let b = part.actualBounds;
    let loc = part.location;
    let x = Math.max(v.x, Math.min(pt.x, v.right - b.width)) + (loc.x - b.x);
    let y = Math.max(v.y, Math.min(pt.y, v.bottom - b.height)) + (loc.y - b.y);

    this.handleFinishShape();

    return new go.Point(x, y);
  };

  handleSelectedZone = (e, obj) => {
    let itemNode = obj.jb;
    this.props.selectedZone(itemNode);
    // console.log('itemNode', itemNode);
  };

  handleDoubleClicked = () => {
    this.props.unselectedZone();
  };

  handleFinishShape = () => {
    console.log("ahihi");
    const { myDiagram } = this.state;
    if (myDiagram?.model) {
      let dataJson = myDiagram.model.toJson();
      let dataObj = JSON.parse(dataJson);

      this.props.addZone(dataObj.nodeDataArray);
      this.configIsEnabled(myDiagram);
    }
  };

  cancelSelectedZone = () => {
    this.handleFinishShape();
    this.handleDoubleClicked();
  };

  onChangeTypeDraw = (type) => {
    const { myDiagram } = this.state;
    const { status } = this.props.control;
    if (myDiagram?.toolManager) {
      if (type === "polygon") {
        if (status && status === 1) {
          let tool = myDiagram.toolManager.mouseDownTools.elt(0);
          tool.isEnabled = true;
        }
      } else if (type === "rectangle") {
        let tool = myDiagram.toolManager.mouseDownTools.elt(0);
        tool.isEnabled = false;
      }
    }
  };

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

  changeIsDrawingZone = (typeZone, id) => {
    const { myDiagram, typeDrawing } = this.state;

    if (typeDrawing === "rectangle") {
      let toolRectange = myDiagram.toolManager.mouseMoveTools.elt(2);
      toolRectange.isEnabled = true;
      toolRectange.archetypeNodeData.typeZone = typeZone;

      let toolPolygon = myDiagram.toolManager.mouseDownTools.elt(0);
      toolPolygon.isEnabled = false;
    } else if (typeDrawing === "polygon") {
      let toolPolygon = myDiagram.toolManager.mouseDownTools.elt(0);
      toolPolygon.isEnabled = true;
      toolPolygon.archetypePartData.typeZone = typeZone;
    }

    this.props.isDrawing(id, typeZone);
  };

  configIsEnabled = (myDiagram) => {
    let toolPolygon = myDiagram.toolManager.mouseDownTools.elt(0);
    toolPolygon.isEnabled = false;
    let toolRectange = myDiagram.toolManager.mouseMoveTools.elt(2);
    toolRectange.isEnabled = false;
  };

  loadImage = (...arg) => {
    let image = arg[0];
    console.log("ahihi", image);

    let widthRoot = arg[1];
    let heightRoot = arg[2];
    let myDiagramDiv = arg[3];

    image.onload = function () {
      let dimension = {
        width: image.naturalWidth,
        height: image.naturalHeight,
      };

      let ratioRoot = widthRoot / heightRoot;
      // let ratioImg = dimension.width / dimension.height;

      // let widthImg = (widthRoot * ratioImg) / ratioRoot;
      // let heightImg = (heightRoot * ratioRoot) / ratioImg;

      let widthImg = (heightRoot * dimension.width) / dimension.height;
      let heightImg = (widthRoot * dimension.height) / dimension.width;

      if (widthImg >= widthRoot) {
        widthImg = widthRoot;
      }
      if (heightImg >= heightRoot) {
        heightImg = heightRoot;
      }

      console.log("dimension", dimension.width);
      console.log("dimension.height", dimension.height);

      console.log("ratioRoot", ratioRoot);

      myDiagramDiv.style.width = `${widthImg}px`;
      myDiagramDiv.style.height = `${heightImg}px`;

      let newDimension = {
        width: Math.round(widthImg),
        height: Math.round(heightImg),
      };

      localStorage.setItem("dimension", JSON.stringify(newDimension));

      let nodeData = JSON.parse(localStorage.getItem("nodeData"));

      console.log("dimension", dimension);
      console.log("nodeData", nodeData);
    };
  };
  fixedBoundsImage = () => {
    let myDiagramDiv = document.getElementById("myDiagramDiv");

    let widthRoot = myDiagramDiv.offsetWidth;
    let heightRoot = myDiagramDiv.offsetHeight;

    let image = new Image();
    let imageSrc = document
      .getElementById("myDiagramDiv")
      .style.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, "$2")
      .split(",")[0];

    image.src = imageSrc;

    console.log("image", image);
    console.log("imageSrc", imageSrc);

    let dimensionFirst = JSON.parse(localStorage.getItem("dimension"));
    if (!dimensionFirst) {
      this.loadImage(image, widthRoot, heightRoot, myDiagramDiv);
    } else {
      let dimension = {
        width: image.naturalWidth,
        height: image.naturalHeight,
      };

      // let ratioRoot = widthRoot / heightRoot;

      let widthImg = (heightRoot * dimension.width) / dimension.height;
      let heightImg = (widthRoot * dimension.height) / dimension.width;

      if (widthImg >= widthRoot) {
        widthImg = widthRoot;
      }
      if (heightImg >= heightRoot) {
        heightImg = heightRoot;
      }

      myDiagramDiv.style.width = `${widthImg}px`;
      myDiagramDiv.style.height = `${heightImg}px`;

      let widthFirst = dimensionFirst.width;
      let heightFist = dimensionFirst.height;

      let scale = (widthFirst * heightFist) / (widthImg * heightImg);

      console.log("widthFirst", widthFirst);
      console.log("heightFist", heightFist);

      console.log("widthImg", widthImg);
      console.log("heightImg", heightImg);

      console.log("scale", scale);

      if (
        widthImg > widthFirst ||
        widthImg < widthFirst ||
        heightImg < heightFist ||
        heightImg > heightFist
      ) {
        let nodeData = JSON.parse(localStorage.getItem("nodeData"));
        if (nodeData?.length > 0) {
          let newNodeDataArray = [];
          let newNodeData = {};
          nodeData.map((node) => {
            let strGeo = node.geo;
            let strLoc = node.loc;
            let strReplace = strGeo.replace(/F|M|L|Z/gi, "");

            let arrGeo = strReplace.split(" ");
            let arrLoc = strLoc.split(" ");

            arrGeo.shift();

            function chunkArray(myArray, chunkSize) {
              let results = [];
              while (myArray.length) {
                results.push(myArray.splice(0, chunkSize));
              }
              return results;
            }

            let result = chunkArray(arrGeo, 2);

            let locX = (Number(arrLoc[0]) / scale).toFixed(2);
            let locY = (Number(arrLoc[1]) / scale).toFixed(2);

            let geoObj = result.map((item) => {
              let geoX = (Number(item[0]) / scale).toFixed(2);
              let geoY = (Number(item[1]) / scale).toFixed(2);

              return {
                x: geoX,
                y: geoY,
              };
            });

            let geoLast = geoObj.pop();
            let geoFirst = geoObj.shift();

            let geoChildren = "";
            geoObj.map((geo) => (geoChildren += `L${geo.x} ${geo.y} `));

            let geo = `F M${geoFirst.x} ${geoFirst.y} ${geoChildren}L${geoLast.x} ${geoLast.y}Z`;
            let loc = `${locX} ${locY}`;

            newNodeData = {
              ...node,
              geo,
              loc,
            };
          });

          newNodeDataArray.push(newNodeData);

          // localStorage.setItem('nodeData', JSON.stringify(newNodeData))
          // if (myDiagram?.model) {
          //   let dataJson = myDiagram.model.toJson();
          //   let dataObj = JSON.parse(dataJson);

          //   console.log('dataObj.nodeDataArray', dataObj.nodeDataArray);
          //   // this.props.addZone(dataObj.nodeDataArray);
          //   // this.configIsEnabled(myDiagram);
          // }
          this.props.addZone(newNodeDataArray);
          console.log("newNodeDataArray=========", newNodeDataArray);
        }
      }

      // console.log('widthImg', widthImg);
      // console.log('heightImg', heightImg);
    }
    console.log("widthRoot", widthRoot, "heightRoot", heightRoot);
  };

  handleIsDrawingArrow = () => {
    this.setState({
      isArrow: true
    });
  }

  render() {
    const { classes } = this.props;
    const { isArrow } = this.state
    return (
      <div id="sample" className={classes.root}>
       <div className={classes.left}>
       <FormSelected
          onChange={this.onChange}
          onChangeTypeDraw={this.onChangeType}
          changeIsDrawingZone={this.changeIsDrawingZone}
        />

        <div className={classes.zone}>
        <Typography>Hướng đi</Typography>
        <Button variant='contained' color="primary" className={classes.button}>Chọn</Button>

        </div>

        <div id="myPaletteDiv" className={classes.boxArrow}></div>
       
       </div>

        <div className={classes.rootDiagram}>
          <div
            id="myDiagramDiv"
            className={classes.myDiagramDiv}
            style={{ backgroundImage: "url(./images/snapshot_1.png)" }}
          ></div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    geoArray: state.loadGeo.geoArray,
    control: state.loadGeo.control,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadGeo: () => {
      dispatch(loadGeo());
    },
    isDrawing: (id, type) => {
      dispatch(isDrawing(id, type));
    },
    addZone: (payload) => {
      dispatch(addZone(payload));
    },
    selectedZone: (payload) => {
      dispatch(selectedZone(payload));
    },
    unselectedZone: () => {
      dispatch(unselectedZone());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(DrawingZone));
