import * as types from './../../actions_type/geo_type'

export const loadGeo = () => {
    return {
        type: types.LOAD_GEO,
    }
}

export const addZone = (payload) => {
    return {
        type: types.ADD_ZONE,
        payload
    }
}

export const formatGeo = (payload) => {
    return {
        type: types.FORMAT_GEO,
        payload
    }
} 

// export const showGeo = (payload) => {
//     return {
//         type: types.SHOW_GEO,
//         payload
//     }
// }