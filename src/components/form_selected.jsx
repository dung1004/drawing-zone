import React, { Component } from "react";
import { connect } from 'react-redux'
import { withStyles } from "@material-ui/styles";
import { TextField, FormControl, Typography, Button } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";

const styles = {
  root: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    top: 30,
    left: 25,
  },
  zone: {
    display: "flex",
    justifyContent: "space-between",
    margin: "10px 0",
  },
  button: {
    textTransform: "lowercase",
  },
};

const colors = [
  {
    title: "Màu đỏ",
    value: "red",
  },
  {
    title: "Màu xanh",
    value: "#36e80e",
  },
  {
    title: "Màu vàng",
    value: "yellow",
  },
];

const typeDraw = [
  {
    title: "Đa giác",
    value: "polygon",
  },
  {
    title: "Chữ nhật",
    value: "rectangle",
  },
];

class FormSelected extends Component {
  onChange = (e, value) => {
    if (value === null) {
      value = {
        title: "Màu đỏ",
        value: "red",
      };
    }
    this.props.onChange(value);
  };

  onChangeTypeDraw = (e, value) => {
    if (value === null) {
      value = {
        title: "Đa giác",
        value: "polygon",
      };
    }
    this.props.onChangeTypeDraw(value);
  };

  handleEnabled = (e, typeTitle) => {
    this.props.changeIsEnabled(1, typeTitle);
  };

  showZoneEnabled = () => {
    const { isEnabled, classes, nodeData } = this.props;
    console.log('isEnabled', isEnabled);
    
    let result = null;
    const type = [
      { title: "Lấn làn" },
      { title: "Đèn xanh" },
      { title: "Đèn đỏ" },
      { title: "Đèn vàng" },
    ];
    if (isEnabled === 0) {
      result = type.map((item, index) => {
        return (
          <div className={classes.zone} key={index} >
            <Typography>{item.title}</Typography>
            <Button
              variant="contained"
              size="small"
              className={classes.button}
              color="primary"
              onClick={(e) => this.handleEnabled(e, item.title)}
            >
              Vẽ
            </Button>
          </div>
        );
      });
    }

    if (isEnabled === 1 ) {
      result = type.map((item, index) => {
        return (
          <div className={classes.zone} key={index}>
            <Typography>{item.title}</Typography>
            <Button
              variant="outlined"
              size="small"
              className={classes.button}
              color="primary"
            >
              Đang vẽ
            </Button>
          </div>
        );
      });
    }

    if (isEnabled === 2) {
      result = type.map((item, index) => {
        if (nodeData.length > 0) {
          nodeData.map(node => {
            if (node.type === item.tile) {
              return (
                <div className={classes.zone} key={index}>
                  <Typography>{item.title}</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    className={classes.button}
                    color="primary"
                    disabled
                  >
                    Vẽ xong
                  </Button>
                </div>
              );
            }
          })
        }
      });
    }

    return result;
  };

  render() {
    const { classes, isEnabled, nodeData } = this.props;
    console.log('nodeData', nodeData);
    

    return (
      <div className={classes.root}>
        <FormControl margin="dense">
          <Autocomplete
            id="combo-box-demo"
            margin="dense"
            options={colors}
            size="small"
            closeIcon=""
            defaultValue={colors[0]}
            getOptionLabel={(option) => option.title}
            style={{ width: 200 }}
            onChange={(e, value) => this.onChange(e, value)}
            renderInput={(params) => (
              <TextField {...params} label="Chọn màu" variant="outlined" />
            )}
          />
        </FormControl>

        <FormControl margin="dense">
          <Autocomplete
            options={typeDraw}
            size="small"
            closeIcon=""
            defaultValue={typeDraw[0]}
            getOptionLabel={(option) => option.title}
            style={{ width: 200 }}
            onChange={(e, value) => this.onChangeTypeDraw(e, value)}
            renderInput={(params) => (
              <TextField {...params} label="Chọn Kiểu vẽ" variant="outlined" />
            )}
          />
        </FormControl>
        {this.showZoneEnabled()}

      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    nodeData: state.loadGeo.geoArray.model.nodeDataArray,
  };
};

export default connect(mapStateToProps)(withStyles(styles)(FormSelected));
