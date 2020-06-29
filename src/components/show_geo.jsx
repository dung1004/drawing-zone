import React, { Component } from "react";
import { withStyles } from "@material-ui/styles";

const styles = {
  root: {
    position: "absolute",
    top: "30%",
    // padding: 10,
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
  nodeDataArray: {
    borderBottom: "1px solid seagreen",
    paddingBottom: 10,
  },
  geo: {
    fontSize: 16,
    color: "red",
  },
  logeo: {
    background: "seagreen",
    border: "none",
    color: "white",
    padding: "10px 20px",
    transitions: "3s ease-in-out",
    cursor: "pointer",
    "&:hover": {
      boxShadow: "0px 2px 5px black",
    },
  },
};

class ShowGeo extends Component {
  onClick = () => {
    this.props.logGeo();
  };
  render() {
    const { classes, data } = this.props;
    return (
      <div className={classes.root}>
        <div className={classes.geoBox}>
          {data?.model?.nodeDataArray.length > 0
            ? data.model.nodeDataArray.map((item, index) => {
                return (
                  <ul className={classes.nodeDataArray} key={index}>
                    <li className={classes.title}>Hình {index + 1}</li>
                    <li>
                      <b>category: </b>
                      <span>{item.category}</span>
                    </li>
                    <li>
                      <b>fill: </b>
                      <span>{item.fill}</span>
                    </li>
                    <li>
                      <b>geo: </b>
                      <span className={classes.geo}>{item.geo}</span>
                    </li>
                    <li>
                      <b>key: </b>
                      <span>{item.key}</span>
                    </li>
                    <li>
                      <b>loc: </b>
                      <span className={classes.geo}>{item.loc}</span>
                    </li>
                    <li>
                      <b>stroke: </b>
                      <span>{item.stroke}</span>
                    </li>
                    <li>
                      <b>strokeWidth: </b>
                      <span>{item.strokeWidth}</span>
                    </li>
                  </ul>
                );
              })
            : null}
        </div>

        <button className={classes.logeo} onClick={this.onClick}>
          chi tiết
        </button>
      </div>
    );
  }
}

export default withStyles(styles)(ShowGeo);
