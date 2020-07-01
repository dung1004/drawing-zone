import React, { Component } from "react";
import { withStyles } from "@material-ui/styles";
import * as go from "gojs";
import { connect } from "react-redux";

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
  myDiagramDiv: {
    border: "solid 1px black",
    width: "calc(2560px / 2)",
    height: "calc(1920px / 2)",
    margin: "0 auto",
    backgroundImage: "url(./images/test.png)",
    backgroundSize: "cover",
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
};

class DrawingZone extends Component {
  constructor(props) {
    super(props);
    this.state = {
      myDiagram: "",
      $: "",
      typeDrawing: "polygon",
      color: "red",
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

    myDiagram.commandHandler.doKeyUp = this.cancelSelectedZone;
    toolGeomytry.doStop = this.handleFinishShape;
    toolResizing.doStop = this.handleFinishShape;

    this.setState({
      myDiagram,
      $,
    });

    this.loadGeo(myDiagram);
    this.configIsEnabled(myDiagram);
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
    const { myDiagram } = this.state;
    if (myDiagram?.model) {
      let dataJson = myDiagram.model.toJson();
      let dataObj = JSON.parse(dataJson);

      this.props.addZone(dataObj.nodeDataArray);
      this.configIsEnabled(myDiagram);
    }
  };

  cancelSelectedZone = () => {
    this.handleFinishShape()
    this.handleDoubleClicked()
  }

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

  render() {
    const { classes } = this.props;
    return (
      <div id="sample">
        <FormSelected
          onChange={this.onChange}
          onChangeTypeDraw={this.onChangeType}
          changeIsDrawingZone={this.changeIsDrawingZone}
        />
  
        <div id="myDiagramDiv" className={classes.myDiagramDiv}></div>
     
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
