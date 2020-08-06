import React, { Component } from "react";
import { withStyles } from "@material-ui/styles";
import * as d3 from "d3";

const styles = {
  root: {},
  button: {
    cursor: "pointer",
    margin: 10,
  },
};

class ShapeD3 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      svgCanvas: null,
      shapePoints: [],
      shapePointsActive: null,
      dataShapePoints: [],
      pointsShapeSelected: null,
      isDrawing: false,
      isDragging: false,
      linePoint1: null,
      gShape: null,
      shapeSelected: null,
      shapeDrag: null,
      dragCircle: null,
      dragCircleLoad: null,
      isDrawPolygon: false,
      isArrowLine: false,
    };
  }

  componentDidMount = () => {
    this.init();
  };

  init = () => {
    let width = 1000;
    let height = 500;
    let svgCanvas = d3
      .select("#rootCanvas")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "svgContainer")
      .attr("id", "svgContent")
      .style("border", "1px solid black");

    // console.log('svgCanvas', svgCanvas)

    if (svgCanvas) {
      d3.select("#svgContent")
        .append("marker")
        .attr("id", "arrow")
        .attr("markerUnits", "strokeWidth")
        .attr("markerHeight", "12")
        .attr("markerWidth", "12")
        .attr("viewBox", "0 0 12 12")
        .attr("refX", "6")
        .attr("refY", "6")
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M2, 2 L10, 6 L2, 10 L6, 6 L2, 2")
        .style("fill", "#f00");
    }

    this.setState({
      svgCanvas,
    });

    this.loadData(svgCanvas);
  };

  loadData = (svgCanvas) => {
    let { dragCircleLoad } = this.state;
    let color = d3.scaleOrdinal(d3.schemeCategory10);
    let _this = this;

    dragCircleLoad = d3.drag().on("drag", function () {
      _this.handleDragCircle(this);
    });

    const arrayOfPolygons = [
      {
        name: "polygon_1",
        points: [
          { x: 127, y: 148.53125 },
          { x: 442, y: 61.53125 },
          { x: 407, y: 257.53125 },
          { x: 160, y: 295.53125 },
        ],
      },
      {
        name: "polygon_2",
        points: [
          { x: 290, y: 176.53125 },
          { x: 710, y: 142.53125 },
          { x: 723, y: 296.53125 },
          { x: 315, y: 319.53125 },
        ],
      },
      {
        name: "polygon_3",
        points: [
          { x: 57, y: 441.53125 },
          { x: 730, y: 421.53125 },
          { x: 317, y: 468.53125 },
        ],
      },
    ];

    arrayOfPolygons.map((polygon) => {
      let g = svgCanvas
        .append("g")
        .attr("class", "polygon")
        .attr("id", polygon.name);

      g.append("polygon")
        .attr(
          "points",
          polygon.points.map((point) => [point.x, point.y])
        )
        .attr("stroke", "red")
        .attr("stroke-width", 3)
        .attr("fill", color(polygon.name));

      polygon.points.map((point) => {
        g.append("circle")
          .attr("cx", point.x)
          .attr("cy", point.y)
          .attr("r", 4)
          .attr("fill", "red")
          .attr("stroke", "black")
          .attr("stroke-width", 3)
          .attr("cursor", "pointer")
          .style("display", "none")
          .call(dragCircleLoad);
      });

      g.datum({
        x: 0,
        y: 0,
      });

      g.call(
        d3.drag().on("drag", function (d) {
          _this.handleShapeDrag(this, d);
        })
      );
    });

    d3.selectAll("polygon").on("dblclick", function () {
      _this.handleDblClick(this);
    });

    d3.select("body").on("keyup", function () {
      _this.handleKeyupShape();
    });

    // this.setState({
    //     ...this.state,
    //     dragCircle
    // });
  };

  // createRectangle = () => {
  //   console.log("asdaksdj");
  // };

  handleIsDrawArrow = () => {
    this.setState(
      {
        ...this.state,
        isDrawPolygon: false,
        isArrowLine: true,
      },
      () => this.createShape()
    );
  };

  handleIsDrawPolygon = () => {
    this.setState(
      {
        ...this.state,
        isDrawPolygon: true,
        isArrowLine: false,
      },
      () => this.createShape()
    );
  };

  createShape = () => {
    console.log("create shape", this.state);
    let { svgCanvas, dragCircle } = this.state;
    let gContainer = svgCanvas.append("g").classed("drawPoly", true);
    let _this = this;

    svgCanvas
      .on("mousedown", this.handleMouseDown)
      .on("mousemove", this.handleMouseMove)
      .on("mouseup", this.handleMouseUp)
      .on("click", this.handleMouseDown);

    d3.select("body").on("keyup", function () {
      _this.handleKeyupShape();
    });

    d3.selectAll("polygon").on("dblclick", function () {
      _this.handleDblClick(this);
    });

    d3.selectAll("circle").style("display", "none");

    dragCircle = d3.drag().on("drag", function () {
      _this.handleDragCircle(this);
    });

    this.setState({
      ...this.state,
      gContainer,
      svgCanvas,
      dragCircle,
    });
  };

  handleMouseDown = () => {
    let {
      svgCanvas,
      shapePoints,
      gContainer,
      isDragging,
      linePoint1,
      isDrawPolygon,
      isArrowLine,
    } = this.state;

    console.log("mouse down", this.state);

    if (isDragging) return;
    if (!isDrawPolygon && !isArrowLine) return;

    let innerHtmlCanvas = svgCanvas.nodes()[0];
    let plod = d3.mouse(innerHtmlCanvas);

    linePoint1 = {
      x: plod[0],
      y: plod[1],
    };

    shapePoints.push(plod);

    this.setState({
      ...this.state,
      isDrawing: true,
      linePoint1,
      shapePoints,
    });

    if (isArrowLine) {
      gContainer
        .append("circle")
        .attr("cx", linePoint1.x)
        .attr("cy", linePoint1.y)
        .attr("r", 4)
        .attr("fill", "seagreen")
        .attr("stroke", "tomato")
        .attr("stroke-width", 3)
        .attr("start-point", true);
      // .classed("handle", true);

      if (shapePoints.length === 2) {
        this.handleCompleteShape();
      }
    }

    if (isDrawPolygon) {
      gContainer
        .append("circle")
        .attr("cx", linePoint1.x)
        .attr("cy", linePoint1.y)
        .attr("r", 4)
        .attr("fill", "seagreen")
        .attr("stroke", "tomato")
        .attr("stroke-width", 3)
        .attr("start-point", true)
        .classed("handle", true);

      if (d3.event.target.hasAttribute("handle")) {
        this.handleCompleteShape();
      }
    }
  };

  handleMouseMove = () => {
    let {
      svgCanvas,
      gContainer,
      isDrawing,
      isDragging,
      linePoint1,
    } = this.state;

    if (isDrawing) {
      let innerHtmlCanvas = svgCanvas.nodes()[0];
      let linePoint2 = d3.mouse(innerHtmlCanvas);
      gContainer.select("line").remove();
      gContainer
        .append("line")
        .attr("x1", linePoint1.x)
        .attr("y1", linePoint1.y)
        .attr("x2", linePoint2[0] + 2)
        .attr("y2", linePoint2[1])
        .attr("stroke", "red")
        .attr("stroke-width", 3);
    }
  };

  handleMouseUp = () => {
    let { shapePoints, gContainer, isDrawPolygon, isArrowLine } = this.state;

    if (isDrawPolygon) {
      gContainer.select("line").remove();
      gContainer.select("polyline").remove();

      gContainer
        .append("polyline")
        .attr("points", shapePoints)
        .style("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 3);

      gContainer.selectAll("circle").remove();

      for (var i = 0; i < shapePoints.length; i++) {
        gContainer
          .append("circle")
          .attr("cx", shapePoints[i][0])
          .attr("cy", shapePoints[i][1])
          .attr("r", 4)
          .attr("stroke", "seagreen")
          .attr("fill", "#000")
          .attr("stroke-width", 3)
          .attr("handle", true)
          .classed("handle", true)
          .attr("cursor", "pointer");
      }
    }

    if (isArrowLine) {
      gContainer.select("line").remove();
      gContainer.selectAll("circle").remove();

      for (var i = 0; i < shapePoints.length; i++) {
        gContainer
          .append("circle")
          .attr("cx", shapePoints[i][0])
          .attr("cy", shapePoints[i][1])
          .attr("r", 4)
          .attr("stroke", "seagreen")
          .attr("fill", "#000")
          .attr("stroke-width", 3)
          .attr("handle", true)
          .classed("handle", true)
          .attr("cursor", "pointer");
      }
    }

    this.setState({
      ...this.state,
      shapePoints,
      gContainer,
    });
  };

  handleCompleteShape = () => {
    console.log("handleCompleteShape");
    let {
      svgCanvas,
      shapePoints,
      gShape,
      shapeSelected,
      dataShapePoints,
      dragCircle,
      shapeDrag,
      isDrawPolygon,
      isArrowLine,
    } = this.state;

    d3.select("g.drawPoly").remove();

    if (isDrawPolygon) {
      gShape = svgCanvas
        .append("g")
        .classed("polygon", true)
        .attr("id", this.getRandomColor());

      shapePoints.splice(shapePoints.length - 1);

      gShape
        .append("polygon")
        .attr("points", shapePoints)
        .attr("fill", this.getRandomColor())
        .attr("stroke", "red")
        .attr("stroke-width", 3);

      for (var i = 0; i < shapePoints.length; i++) {
        gShape
          .append("circle")
          .attr("cx", shapePoints[i][0])
          .attr("cy", shapePoints[i][1])
          .attr("r", 4)
          .attr("fill", "red")
          .attr("stroke", "black")
          .attr("stroke-width", 3)
          .attr("cursor", "pointer")
          .call(dragCircle);
      }
    }

    if (isArrowLine) {
      gShape = svgCanvas.append("g").classed("line_arrow", true);
      gShape
        .append("line")
        .attr("x1", shapePoints[0][0])
        .attr("y1", shapePoints[0][1])
        .attr("x2", shapePoints[1][0])
        .attr("y2", shapePoints[1][1])
        .attr("stroke", "red")
        .attr("stroke-width", 3)
        .attr("marker-end", "url(#arrow)");

      for (var i = 0; i < shapePoints.length; i++) {
        gShape
          .append("circle")
          .attr("cx", shapePoints[i][0])
          .attr("cy", shapePoints[i][1])
          .attr("r", 4)
          .attr("fill", "red")
          .attr("stroke", "black")
          .attr("stroke-width", 3)
          .attr("cursor", "pointer")
          .call(dragCircle);
      }
    }

    dataShapePoints.push(shapePoints);

    gShape.datum({
      x: 0,
      y: 0,
    });

    let _this = this;
    gShape.call(
      d3.drag().on("drag", function (d) {
        _this.handleShapeDrag(this, d);
      })
    );

    d3.selectAll("polygon").on("dblclick", function () {
      _this.handleDblClick(this);
    });

    this.setState({
      ...this.state,
      gShape,
      dataShapePoints,
      shapePoints: [],
      shapePointsActive: shapePoints,
      //   isDragging: true,
      isDrawing: false,
      isDrawPolygon: false,
      isArrowLine: false,
    });
  };

  handleDblClick = (_this) => {
    let { shapeSelected } = this.state;

    shapeSelected = d3.select(_this.parentNode);
    this.handleShapeSelected(d3.select(_this), shapeSelected);

    let shape = shapeSelected.select("polygon").nodes()[0];
    let g = shapeSelected.nodes()[0];
    let id = d3.select(g).attr("id");
    console.log("id", id);

    // chunk point string => []
    let newArr = d3.select(shape).attr("points").split(",");
    newArr = newArr.map((item) => Number(item));
    let pointsShapeSelected = this.handleChunkArray(newArr, 2);

    this.setState({
      ...this.state,
      shapeSelected,
      pointsShapeSelected,
    });
  };

  handleShapeDrag = (_this, d) => {
    let { shapeSelected } = this.state;
    d3.select(_this).attr(
      "transform",
      "translate(" + (d.x = d3.event.x) + "," + (d.y = d3.event.y) + ")"
    );
    shapeSelected = d3.select(_this);

    let shape;
    if (d3.select(_this).select("polygon").nodes().length) {
      shape = d3.select(_this).select("polygon");
    } else {
      shape = d3.select(_this).select("line");
    }
    this.handleShapeSelected(shape, shapeSelected);
  };

  handleShapeSelected = (shape, shapeOrder) => {
    d3.selectAll("polygon").style("stroke", "red");
    d3.selectAll("line").style("stroke", "red");
    d3.selectAll("circle").style("display", "none");
    if (shape) {
      shape.style("stroke", "black").style("cursor", "pointer");
      shapeOrder.selectAll("circle").style("display", "block");
      shapeOrder.raise();
    }
  };

  handleDragCircle = (_this) => {
    let { isDrawing, isDrawPolygon } = this.state;

    if (isDrawing || isDrawPolygon) return;

    let alteredPoints = [];
    let selectedP = d3.select(_this);

    let circles = d3.select(_this.parentNode).selectAll("circle");
    let polygon = d3.select(_this.parentNode).select("polygon");
    let lineArrow = d3.select(_this.parentNode).select("line");
    if (polygon.nodes().length) {
      // chunk point string => []
      let shape = polygon.nodes()[0];
      let newArr = d3.select(shape).attr("points").split(",");
      newArr = newArr.map((item) => Number(item));
      let pointsShapeSelected = this.handleChunkArray(newArr, 2);

      let pointCX = d3.event.x;
      let pointCY = d3.event.y;

      selectedP.attr("cx", pointCX).attr("cy", pointCY);

      for (let i = 0; i < pointsShapeSelected.length; i++) {
        let circleCoord = d3.select(circles._groups[0][i]);
        let pointCoord = [circleCoord.attr("cx"), circleCoord.attr("cy")];
        alteredPoints[i] = pointCoord;
      }
      polygon.attr("points", alteredPoints);

      // this.setState({
      //   ...this.state,
      //   pointsShapeSelected,
      // });
    }

    if (lineArrow.nodes().length) {
      let line = lineArrow.nodes()[0];

      let arrayLine = [
        d3.select(line).attr("x1"),
        d3.select(line).attr("y1"),
        d3.select(line).attr("x2"),
        d3.select(line).attr("y2"),
      ];
      arrayLine = arrayLine.map((item) => Number(item));

      let pointsShapeSelected = this.handleChunkArray(arrayLine, 2);
      let pointCX = d3.event.x;
      let pointCY = d3.event.y;
      selectedP.attr("cx", pointCX).attr("cy", pointCY);

      for (let i = 0; i < pointsShapeSelected.length; i++) {
        let circleCoord = d3.select(circles._groups[0][i]);
        let pointCoord = [circleCoord.attr("cx"), circleCoord.attr("cy")];
        alteredPoints[i] = pointCoord;
      }
      lineArrow
        .attr("x1", alteredPoints[0][0])
        .attr("y1", alteredPoints[0][1])
        .attr("x2", alteredPoints[1][0])
        .attr("y2", alteredPoints[1][1]);
    }
  };

  handleKeyupShape = () => {
    let { shapeSelected } = this.state;

    if (d3.event.keyCode === 46 || d3.event.keyCode === 8) {
      if (shapeSelected) {
        shapeSelected.remove();
      }
    }

    if (d3.event.keyCode === 27) {
      if (shapeSelected) {
        this.handleShapeSelected(null, null);
        this.setState({
          ...this.state,
          shapeSelected: null,
        });
      }
    }
  };

  getRandomColor = () => {
    let letters = "0123456789ABCDEF".split("");
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  handleChunkArray = (arr, size) => {
    let result = [];

    Array.from({ length: Math.round(arr.length / size) }, (v, i) => {
      result.push(arr.slice(i * size, i * size + size));
    });
    return result;
  };

  render() {
    const { classes } = this.props;

    return (
      <div className="root">
        <button className={classes.button} onClick={this.handleIsDrawPolygon}>
          is polygon
        </button>
        {/* <button className={classes.button} onClick={this.createRectangle}>
          is rectangle
        </button> */}
        <button className={classes.button} onClick={this.handleIsDrawArrow}>
          is arrow
        </button>
        <div id="rootCanvas"></div>
      </div>
    );
  }
}

export default withStyles(styles)(ShapeD3);
