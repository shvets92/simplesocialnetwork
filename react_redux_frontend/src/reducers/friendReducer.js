import {
    FETCH_USER_FRIENDS,
    FETCH_FRIEND_REQUESTS,
    RESPOND_TO_REQUEST,
    LOGOUT
} from "../actions/types";

const initialState = {
    friendRequests: [],
    requestPageToken: "0",
    friendsMenuTrigger: false
};

export default function(state = initialState, action) {
    let targetUser;
    let targetUserFriends;
    let friendRequests;
    switch (action.type) {
        case FETCH_USER_FRIENDS:
            targetUser = action.payload.targetUser;
            if(state[targetUser] == null) {
                targetUserFriends = action.payload.friends;
            } else {
                let currentFriendsArray = state[targetUser].friends;
                targetUserFriends = currentFriendsArray.concat(action.payload.friends);
            }
            return {
                ...state,
                [targetUser]: {pageToken:action.payload.nextPageToken, friends:targetUserFriends}
            };
        case FETCH_FRIEND_REQUESTS:
            friendRequests = state.friendRequests.concat(action.payload.friendRequests);
            return {
                ...state,
                friendRequests: friendRequests,
                requestPageToken: action.payload.nextPageToken
            };
        case RESPOND_TO_REQUEST:
            friendRequests = state.friendRequests;
            let requestKey = action.payload.requestKey;
            if(action.payload.accepted === true) {
                friendRequests[requestKey].type = 'accepted';
                let activeUser = action.payload.activeUser;
                if(state[activeUser] === undefined) {
                    return {
                        ...state,
                        friendRequests: friendRequests,
                        friendsMenuTrigger: !state.friendsMenuTrigger
                    }
                }
                let currentFriendsArray = state[activeUser].friends;
                if(state[activeUser].pageToken === "") {
                    friendRequests[requestKey].since = friendRequests[requestKey].when;
                    currentFriendsArray.push(friendRequests[requestKey]);
                }
                return {
                    ...state,
                    friendRequests: friendRequests,
                    [activeUser]: {pageToken: "timestamp", friends: currentFriendsArray},
                    friendsMenuTrigger: !state.friendsMenuTrigger
                }
            } else {
                friendRequests[requestKey].type = 'ignored';
                return {
                    ...state,
                    friendRequests: friendRequests,
                    friendsMenuTrigger: !state.friendsMenuTrigger
                };
            }
        case LOGOUT:
            return initialState;
        default:
            return state;
    }
}

