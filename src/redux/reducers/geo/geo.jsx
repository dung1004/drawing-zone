import * as actions from "./../../actions/geo";
import * as types from "./../../actions_type/geo_type";

let nodeData = localStorage.getItem('nodeData')
const initialState = {
  geoArray: {
    position: "0 0",
    model: {
      nodeDataArray: JSON.parse(nodeData) || [],
    },
  },
  geoFormat: [],
};

export const loadGeo = (state = initialState, action) => {
  switch (action.type) {
    case types.LOAD_GEO:
      return state;
    case types.ADD_ZONE:
      let data = JSON.stringify(action.payload);
      localStorage.setItem("nodeData", data);
      
      return {
        ...state,
        model: {
          nodeDataArray: action.payload,
        },
      };
    // case types.FORMAT_GEO:
    //     return {
    //         geoFormat: action.payload
    //     }
    default:
      return state;
  }
};
