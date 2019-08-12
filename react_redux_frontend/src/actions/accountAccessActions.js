import {UPDATE, CREATE_ACCOUNT, LOGIN, LOGIN_FAILED, LOGOUT, FETCH_NOTIFICATIONS} from "./types";
import JWT from "jsonwebtoken";

export const createAccount = (data) => dispatch => {
    fetch("/users", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            password: data.password,
            email: data.email,
        })
    }).then(response => {
        dispatch({
            type: CREATE_ACCOUNT,
            payload: response.status === 200
        });
    });
};

export const login = (data) => dispatch => {
    fetch("/users/login", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: data.email,
            password: data.password
        })
    }).then(response => {
        response.text().then(responseMessage => {
            switch (response.status) {
                case 200:
                    let rawToken = response.headers.get("Authorization");
                    let justJWT = rawToken.replace("Bearer ", "");
                    let decoded = JWT.decode(justJWT);
                    let profilePic = response.headers.get("profilePic");
                    dispatch({
                        type: LOGIN,
                        payload: {
                            authToken: rawToken,
                            activeUser: {
                                uuid: decoded.UUID,
                                firstName: decoded.FIRST_NAME,
                                lastName: decoded.LAST_NAME,
                                profilePic: profilePic
                            }
                        }
                    });
                    break;
                case 404:
                    dispatch({
                       type: LOGIN_FAILED,
                       payload: responseMessage
                    });
                    break;
                case 401:
                    dispatch({
                        type: LOGIN_FAILED,
                        payload: responseMessage
                    });
                    break;
                default:
                    dispatch({
                        type: LOGIN_FAILED,
                        payload: responseMessage
                    });
            }
        });
    });
};

export const logout = () => dispatch => {
    dispatch({
        type: LOGOUT
    });
};

export const updateActiveUser = (authToken, activeUser) => dispatch => {
    let headers = new Headers();
    headers.append('Authorization', authToken);
    fetch("/users/"+activeUser+"/update", {
        method: 'GET',
        headers: headers
    }).then(res => res.json()
        .then(updates => {
            dispatch({
                type: UPDATE,
                payload: updates
            })
        })
    )
};

export const fetchNotifications = (authToken, activeUser, pageToken) => dispatch => {
    if(pageToken === "") {
        return;
    }
    let headers = new Headers();
    headers.append('Authorization', authToken);
    headers.append('page_token', pageToken);
    headers.append('page_size', 10);
    fetch('/users/'+activeUser+'/notifications', {
        method: 'GET',
        headers: headers
    }).then(res => {
        res.json().then(notifications => {
            let nextPageToken = notifications.pop().nextPageToken;
            dispatch({
                type: FETCH_NOTIFICATIONS,
                payload: {
                    nextPageToken: nextPageToken,
                    notifications: notifications
                }
            })
        })
    })

};