import {
    POST_IMAGE,
    FETCH_IMAGE,
    LOGOUT,
    NEW_PROFILE_PIC,
    REQUEST_IMAGE_FETCH
} from "../actions/types";

const initialState = {
    requestedImages: [],
    requestCounterTrigger: 0
};

export default function(state = initialState, action) {
    switch(action.type) {
        case POST_IMAGE:
            return {
                ...state,
                [action.payload.s3ImgUri]:action.payload.localImgUrl
            };
        case FETCH_IMAGE:
            return {
                ...state,
                [action.payload.s3ImgUri]: action.payload.localImgUrl
            };
        case REQUEST_IMAGE_FETCH:
            let currentRequests = state.requestedImages;
            currentRequests.push(action.payload);
            return {
                ...state,
                requestedImages: currentRequests,
                requestCounterTrigger: state.requestCounterTrigger+1
            };
        case NEW_PROFILE_PIC:
            if(action.payload.currentProfilePicUri === "") {
                return {
                    ...state,
                    [action.payload.s3ImgUri]:action.payload.localImgUrl
                };
            }
            return {
                ...state,
                [action.payload.s3ImgUri]: action.payload.localImgUrl,
                [action.payload.currentProfilePicUri]: action.payload.localImgUrl
            };
        case LOGOUT:
            return initialState;
        default:
            return state;
    }
}