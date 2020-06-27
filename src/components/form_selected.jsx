import React, { Component } from "react";
import { withStyles } from "@material-ui/styles";
import { TextField, FormControl } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";

const styles = {
  root: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    top: 30,
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
      </div>
    );
  }
}

export default withStyles(styles)(FormSelected);
