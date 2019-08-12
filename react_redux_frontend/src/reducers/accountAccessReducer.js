import {
    CREATE_ACCOUNT,
    LOGIN,
    LOGIN_FAILED,
    LOGOUT,
    UPDATE,
    FETCH_NOTIFICATIONS,
    NEW_PROFILE_PIC
} from "../actions/types";

const initialState = {
    accountCreated: false,
    isLoggedIn: false,
    authToken: null,
    failureReason: null,
    activeUser: null,
    updates: {},
    notifications: [],
    notificationsPageToken: "0"
};

export default function (state = initialState, action) {
    switch (action.type) {
        case CREATE_ACCOUNT:
            return {
                ...state,
                accountCreated: action.payload,
            };
        case LOGIN_FAILED:
            return {
                ...state,
                isLoggedIn: false,
                failureReason: action.payload
            };
        case LOGIN:
            return {
                ...state,
                isLoggedIn: true,
                failureReason: null,
                authToken: action.payload.authToken,
                activeUser: action.payload.activeUser
            };
        case LOGOUT:
            return initialState;
        case UPDATE:
            let updates = state.updates;
            updates.numOfFriendRequests = action.payload.numOfNewFriendRequests;
            return {
                ...state,
                updates: action.payload
            };
        case FETCH_NOTIFICATIONS:
            let notifications = state.notifications.concat(action.payload.notifications);
            return {
                ...state,
                notifications: notifications,
                notificationsPageToken: action.payload.nextPageToken
            };
        case NEW_PROFILE_PIC:
            let activeUser = state.activeUser;
            activeUser.profilePic = action.payload.s3ImgUri;
            return {
                ...state,
                activeUser: Object.assign({}, activeUser)
            };
        default:
            return state;
    }
}