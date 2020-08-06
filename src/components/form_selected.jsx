import React, { Component } from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/styles";
import { TextField, FormControl, Typography, Button } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";

const styles = {
  root: {
    width: 400,
    // position: "absolute",
    // display: "flex",
    // flexDirection: "column",
    // top: 30,
    // left: 25,
    padding: 10
  },
  zone: {
    display: "flex",
    justifyContent: "space-between",
    margin: "10px 0",
  },
  zoneActive: {
    display: "flex",
    justifyContent: "space-between",
    margin: "10px 0",
    alignItems: 'center',
    border: '2px solid orange',
    padding: 10,
    borderRadius: 5,
    transition: '.3s ease-in-out'

  },
  button: {
    textTransform: "lowercase",
  },
  title: {
    fontWeight: 'bold',
    transition: '.3s ease-in-out'
  }
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

  handleEnabled = (e, type, id) => {
    this.props.changeIsDrawingZone(type, id);
  };

  showZoneEnabled = () => {
    const { data, classes, control, selected } = this.props;
    let result = null;
    const type = [
      { id: 1, title: "Lấn làn" },
      { id: 2, title: "Đèn xanh" },
      { id: 3, title: "Đèn đỏ" },
      { id: 4, title: "Đèn vàng" },
    ];

    result = type.map((item) => {
      let selectedDisable =
        data.length > 0
          ? data.filter((node) => node.typeZone === item.title)
          : [];
      let isDisable;
      if (selectedDisable.length > 0) {
        isDisable = true;
      }

      return (
        <div className={selected && selected === item.title ? classes.zoneActive : classes.zone} key={item.id}>
          <Typography className={selected && selected === item.title ? classes.title : null}>{item.title}</Typography>
          <Button
            variant={
              control.id === item.id && control.status === 1
                ? "outlined"
                : "contained"
            }
            size="small"
            className={classes.button}
            color="primary"
            disabled={isDisable}
            onClick={(e) => this.handleEnabled(e, item.title, item.id)}
          >
            {(control.id === item.id && control.status === 2) ||
            selectedDisable.length > 0
              ? "Vẽ xong"
              : control.id === item.id && control.status === 1
              ? "Đang vẽ"
              : "Vẽ"}
          </Button>
        </div>
      );
    });
    return result;
  };

  render() {

    const { classes } = this.props;
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
    control: state.loadGeo.control,
    data: state.loadGeo.geoArray.model.nodeDataArray,
    selected: state.loadGeo.selected.typeZone
  };
};

export default connect(mapStateToProps)(withStyles(styles)(FormSelected));
