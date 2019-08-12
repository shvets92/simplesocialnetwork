import {FETCH_POST, LOGOUT, NAVIGATE_TO} from "../actions/types";

const initialState = {
    displayPage: 'login',
};

export default function (state = initialState, action) {
    switch (action.type) {
        case NAVIGATE_TO:
            return {
                ...state,
                displayPage: action.payload
            };
        case FETCH_POST:
            return {
                ...state,
                displayPage: "notificationPost"
            };
        case LOGOUT:
            return initialState;
        default:
            return state;
    }
}