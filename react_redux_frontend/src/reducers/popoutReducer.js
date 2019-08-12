import {LOGOUT, OPEN_POPOUT} from "../actions/types";

const initialState = {
    anchorElement: null,
    content: {},
    offset: 0,
    trigger: false
};

export default function (state = initialState, action) {
    switch (action.type) {
        case OPEN_POPOUT:
            return {
                ...state,
                anchorElement: action.payload.anchorEl,
                content: action.payload.content,
                offset: action.payload.offset,
                trigger: !state.trigger
            };
        case LOGOUT:
            return initialState;
        default:
            return state;
    }
}