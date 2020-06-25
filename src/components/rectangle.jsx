import React, { Component } from "react";
import { withStyles } from "@material-ui/styles";
import * as go from "gojs";
import DragCreatingTool from "./../lib/DragCreatingTool";

const styles = {
  myDiagramDiv: {
    border: "solid 1px black",
    width: "calc(2560px / 2)",
    height: "calc(1920px / 2)",
    margin: "0 auto",
    backgroundImage: "url(./images/test.png)",
    backgroundSize: "cover",
  },
};

class Rectangle extends Component {
  componentDidMount() {
    this.init();
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

  init() {
    var $ = go.GraphObject.make; // for conciseness in defining templates
    let width = 2560 / 2;
    let height = 1920 / 2;
    const myDiagram = $(go.Diagram, "myDiagramDiv", {
      fixedBounds: new go.Rect(0, 0, width, height),
    });

    myDiagram.nodeTemplate = $(
      go.Node,
      "Auto",
      { dragComputation: this.stayInFixedArea },
      { minSize: new go.Size(60, 20), resizable: true },
      new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(
        go.Size.stringify
      ),
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
        go.Point.stringify
      ),
      { reshapable: this.stayInFixedArea },
      $(go.Shape, "Rectangle", {
        name: "SHAPE",
        // fill: null,
        // stroke: "red",
        // strokeWidth: 2,
      },
      new go.Binding("fill"),
      new go.Binding("stroke"),
      new go.Binding("strokeWidth")
        )
    );

    myDiagram.add($(go.Part));

    myDiagram.toolManager.mouseMoveTools.insertAt(
      2,
      $(DragCreatingTool, {
        // isEnabled: true, // disabled by the checkbox
        delay: 0, // always canStart(), so PanningTool never gets the chance to run
        box: $(
          go.Part,
        //   { layerName: "Tool" },
          $(go.Shape, {
            name: "SHAPE",
            fill: null,
            stroke: "red",
            strokeWidth: 2,
          })
        ),
        archetypeNodeData: { color: "white", fill: "transparent", stroke: "seagreen", strokeWidth: 3 }, // initial properties shared by all nodes
        // insertPart: function (bounds) {
        //   return DragCreatingTool.prototype.insertPart.call(this, bounds);
        // },
      })
    );
    
  }

  render() {
    const { classes } = this.props;
    return (
      <div id="sample">
        <div id="myDiagramDiv" className={classes.myDiagramDiv}></div>
      </div>
    );
  }
}

export default withStyles(styles)(Rectangle);
