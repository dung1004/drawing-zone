import * as actions from "./../../actions/geo";
import * as types from "./../../actions_type/geo_type";
import _ from "lodash";

let nodeData = localStorage.getItem("nodeData");
const initialState = {
  geoArray: {
    position: "0 0",
    model: {
      nodeDataArray: JSON.parse(nodeData) || [],
    },
  },
  geoFormat: [],
  control: {
    status: null,
    id: null,
    typeZone: null,
  },
  selected: {
    typeZone: null,
  },
};

export const loadGeo = (state = initialState, action) => {
  switch (action.type) {
    case types.LOAD_GEO:
      return state;
    case types.IS_DRAWING_STATUS:
      return {
        ...state,
        control: {
          status: 1,
          id: action.id,
          typeZone: action.typeZone,
        },
      };
    case types.ADD_ZONE:
      let control = {};
      if (action.payload.length > 0) {
        let { typeZone, id } = state.control;

        action.payload.map((node) => {
          if (node.typeZone === typeZone) {
            node.status = 2;

            control.id = id;
            control.status = 2;
            control.typeZone = typeZone;
          }
        });
      } else {
        control.id = null;
        control.status = null;
        control.typeZone = null;
      }

      localStorage.setItem("nodeData", JSON.stringify(action.payload));

      return {
        ...state,
        geoArray: {
          model: {
            nodeDataArray: action.payload,
          },
        },
        control,
      };

    case types.SELECTED_ZONE:
      return {
        ...state,
        selected: {
          typeZone: action.payload.typeZone,
        },
      };
    case types.UNSELECTED_ZONE:
      return {
        ...state,
        selected: {
          typeZone: null,
        },
      };
    default:
      return state;
  }
};
