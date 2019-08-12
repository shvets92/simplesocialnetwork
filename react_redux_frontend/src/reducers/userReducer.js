import {
    FETCH_USER_PROFILE,
    USER_SEARCH,
    UPDATE_PROFILE_RELATIONSHIP,
    LOGOUT,
    NEW_BIO,
    NEW_PROFILE_PIC
} from "../actions/types";

const initialState = {
    userSearchResults: [],
    updates: {}
};

export default function (state = initialState, action) {
    let currentProfile;
    switch (action.type) {
        case USER_SEARCH:
            return {
                ...state,
                userSearchResults: action.payload
            };
        case FETCH_USER_PROFILE:
            return {
                ...state,
                [action.payload.targetUser]: action.payload.profileData
            };
        case UPDATE_PROFILE_RELATIONSHIP:
            currentProfile = state[action.payload.targetUser];
            currentProfile.relationshipStatus = action.payload.newStatus;
            return {
                ...state,
                [action.payload.targetUser]: currentProfile
            };
        case NEW_BIO:
            currentProfile = state[action.payload.targetUser];
            currentProfile.bio = action.payload.newBioContent;
            return {
                ...state,
                [action.payload.targetUser]: currentProfile
            };
        case NEW_PROFILE_PIC:
            currentProfile = state[action.payload.targetUser];
            currentProfile.profilePicUri = action.payload.s3ImgUri;
            return {
                ...state,
                [action.payload.targetUser]: currentProfile
            };
        case LOGOUT:
            return initialState;
        default:
            return state;
    }
}




