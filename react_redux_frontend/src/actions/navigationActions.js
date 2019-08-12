import {NAVIGATE_TO} from "./types";

export const navigateTo = (destination) => dispatch =>{
    dispatch({
        type: NAVIGATE_TO,
        payload: destination
    })
};

