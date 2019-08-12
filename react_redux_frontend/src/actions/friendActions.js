import {
    FETCH_USER_FRIENDS,
    FETCH_FRIEND_REQUESTS,
    RESPOND_TO_REQUEST,
    UPDATE_PROFILE_RELATIONSHIP
} from "./types";

export const fetchFriendRequests = (authToken, activeUser, pageToken) => dispatch => {
    if(pageToken === "") {
        return;
    }
    let headers = new Headers();
    headers.append('Authorization', authToken);
    headers.append('page_token', pageToken);
    headers.append('page_size', 10);
    fetch("/users/"+activeUser+"/friend-requests", {
        method: 'GET',
        headers: headers
    })
        .then(res => res.json()
            .then(friendRequests => {
                let nextPageToken = friendRequests.pop().nextPageToken;
                dispatch({
                    type: FETCH_FRIEND_REQUESTS,
                    payload: {nextPageToken: nextPageToken, friendRequests: friendRequests}
                })
            }))

};

export const fetchUserFriends = (authToken, targetUser, pageToken) => dispatch => {
    if(pageToken === "") {
        return;
    }
    let headers = new Headers();
    headers.append('Authorization', authToken);
    headers.append('page_token', pageToken);
    headers.append('page_size', 10);
    fetch("/users/"+targetUser+"/friends", {
        method: 'GET',
        headers: headers
    })
        .then(res => res.json()
            .then(friends => {
                let nextPageToken = friends.pop().nextPageToken;
                dispatch({
                    type: FETCH_USER_FRIENDS,
                    payload: {
                        targetUser: targetUser,
                        friends: friends,
                        nextPageToken: nextPageToken
                    }
                })
            })
        )
};

export const unfriend = (authToken, targetUser) => dispatch => {
    let headers = new Headers();
    headers.append('Authorization', authToken);
    fetch("/users/"+targetUser+"/friends", {
        method: 'DELETE',
        headers: headers
    });
    dispatch({
        type: UPDATE_PROFILE_RELATIONSHIP,
        payload: {targetUser: targetUser, newStatus: 'newUser'}
    })
};

export const sendFriendRequest = (authToken, targetUser) => dispatch => {
    let headers = new Headers();
    headers.append('Authorization', authToken);
    fetch("/users/"+targetUser+"/friend-requests", {
        method: 'POST',
        headers: headers
    });
    dispatch({
        type: UPDATE_PROFILE_RELATIONSHIP,
        payload: {targetUser: targetUser, newStatus: 'youRequestedFriendShip'}
    })
};

export const respondToRequest = (authToken, activeUser, sendingUser, response, requestKey) => dispatch => {
    let headers = new Headers();
    headers.append('Authorization', authToken);
    headers.append('Content-Type', 'text/plain');
    fetch("/users/"+activeUser+"/friend-requests/"+sendingUser, {
        method: 'PUT',
        headers: headers,
        body: response
    });

    if(response === 'accepted') {
        if(requestKey === undefined) {
            dispatch({
                type: UPDATE_PROFILE_RELATIONSHIP,
                payload: {targetUser: sendingUser, newStatus: 'friends'}
            })
        } else {
            dispatch({
                type: RESPOND_TO_REQUEST,
                payload: {requestKey: requestKey, accepted: true, activeUser: activeUser}
            })
        }
    } else if(response === 'ignored') {
        if(requestKey === undefined) {
            dispatch({
                type: UPDATE_PROFILE_RELATIONSHIP,
                payload: {targetUser: sendingUser, newStatus: 'ignored'}
            })
        } else {
            dispatch({
                type: RESPOND_TO_REQUEST,
                payload: {requestKey: requestKey, accepted: false}
            })
        }
    }
};

export const deleteFriendRequest = (authToken, activeUser, targetUser) => dispatch => {
    let headers = new Headers();
    headers.append('Authorization', authToken);
    fetch("/users/"+targetUser+"/friend-requests/"+activeUser, {
        method: 'DELETE',
        headers: headers,
    });

    dispatch({
        type: UPDATE_PROFILE_RELATIONSHIP,
        payload: {targetUser: targetUser, newStatus: 'newUser'}
    })
};




