import React, { Component } from "react";
import { withStyles } from "@material-ui/styles";

const styles = {
  root: {
    position: "absolute",
    top: "30%",
    padding: 10,
    right: 0,
  },
  geoBox: {
    border: "1px solid #c7c0c0",
    overflowY: "auto",
    maxHeight: 250,
    width: 200,
    padding: 10,
    marginBottom: 10,
  },
  title: {
    listStyle: "none",
    fontWeight: "bold",
  },
  showY: {
    marginLeft: 10,
  },
  nodeDataArray: {
    borderBottom: "1px solid seagreen",
    paddingBottom: 10,
  },
  geo: {
    fontSize: 16,
    color: "red",
  },
};
class GeoFormat extends Component {
  render() {
    const { classes, geoArr } = this.props;
    return (
      <div className={classes.root}>
        <div className={classes.geoBox}>
          {geoArr?.length > 0
            ? geoArr.map((item, index) => {
                return (
                  <ul key={index} className={classes.nodeDataArray}>
                    <li className={classes.title}>Hình {index + 1}</li>
                    {item.map((obj, index) => {
                      return (
                        <li key={index}>
                          <b>x: </b>{" "}
                          <span className={classes.geo}>{obj.x}</span>
                          <b className={classes.showY}>y: </b>{" "}
                          <span className={classes.geo}>{obj.y}</span>
                        </li>
                      );
                    })}
                  </ul>
                );
              })
            : null}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(GeoFormat);
