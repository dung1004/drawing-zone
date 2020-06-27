import * as actions from './../../actions/geo'
import * as types from './../../actions_type/geo_type'

const initialState = {
    geoArray: {
        position: "0 0",
          model: {
            nodeDataArray: [
              {
              category: "PolygonDrawing",
              fill: "transparent",
              geo: "F M25 12 L1076 0 L1118 129 L44 164 L0 72z",
              loc: "15.75 427.25",
              stroke: "red",
              strokeWidth: 3,
            },
            {
              category: "Rectangle",
              fill: "transparent",
              geo: "F M1214 145 L1264 145 L1264 189 L1214 189z",
              loc: "1218.5 144",
              size: "50 44",
              stroke: "red",
              strokeWidth: 3,
            },
            {
              category: "Rectangle",
              fill: "transparent",
              geo: "F M1220 190 L1265 190 L1265 232 L1220 232z",
              loc: "1219.5 190",
              size: "45 42",
              stroke: "#36e80e",
              strokeWidth: 3,
            },
            {
              category: "Rectangle",
              fill: "transparent",
              geo: "F M1217 237 L1267 237 L1267 279 L1217 279z",
              loc: "1216.5 237",
              size: "50 42",
              stroke: "yellow",
              strokeWidth: 3,
            },
          ]
          },
    },
    geoFormat: []

}

export const loadGeo = (state = initialState, action) => {
    switch(action.type) {
        case types.LOAD_GEO: 
            return state
        case types.ADD_ZONE:
            return {
                ...state,
                model: {
                    nodeDataArray: action.payload
                }
            }
        // case types.FORMAT_GEO:
        //     return {
        //         geoFormat: action.payload
        //     }
        default: 
            return state
    }
}