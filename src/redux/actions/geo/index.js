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

export const isDrawing = (id, typeZone) => {
    return {
        type: types.IS_DRAWING_STATUS,
        id,
        typeZone,
    }
}

export const selectedZone = (payload) => {
    return {
        type: types.SELECTED_ZONE,
        payload
    }
}

export const unselectedZone = (payload) => {
    return {
        type: types.UNSELECTED_ZONE,
        payload
    }
}