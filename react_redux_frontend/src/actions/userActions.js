import {FETCH_USER_PROFILE, NEW_BIO, NEW_PROFILE_PIC, USER_SEARCH} from "./types";

export const searchUsers = (searchText, authToken) => dispatch => {
    let headers = new Headers();
    headers.append("Authorization", authToken);
    headers.append("searchText", searchText);

    let re = /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(searchText.length === 36) {
        headers.append("searchBy", "uuid");
    } else if(re.test(String(searchText).toLowerCase()) && searchText.length < 200) {
        headers.append("searchBy", "email");
    } else {
        headers.append("searchBy", "name");
    }

    fetch("/users/search", {
        method: "GET",
        headers: headers
    }).then(res => {
        res.json()
            .then(searchResults => {
                dispatch({
                    type: USER_SEARCH,
                    payload: searchResults
                })
            })
    })
};

export const fetchUserProfile = (targetUser, authToken) => dispatch => {
    let headers = new Headers();
    headers.append("Authorization", authToken);
    fetch("/users/"+targetUser, {
        method: "GET",
        headers: headers
    }).then(res => {
        res.json()
            .then(profile => {
                dispatch({
                    type: FETCH_USER_PROFILE,
                    payload: {
                        targetUser: targetUser,
                        profileData: profile[0]
                    }
                })
            })
    })
};

export const saveNewBio = (authToken, activeUser, bio) => dispatch => {
    let headers = new Headers();
    headers.append('Authorization', authToken);
    headers.append('Content-Type', 'text/plain');

    fetch("/users/"+activeUser+"/bio", {
        method: 'POST',
        headers: headers,
        body: bio
    }).then(response => {
        if(response.status === 200) {
            dispatch({
                type: NEW_BIO,
                payload: {
                    targetUser: activeUser,
                    newBioContent: bio
                }
            })
        }
    });
};

export const saveNewProfilePic = (file, authToken, targetUser, currentProfilePicUri) => dispatch => {
    let data = new FormData();
    data.append('image', file);
    let headers = new Headers();
    headers.append('Authorization', authToken);

    fetch('/users/'+targetUser+'/profile-pic', {
        method: 'POST',
        body: data,
        headers: headers
    }).then(response => {
        response.text().then(s3ImgUri => {
            dispatch({
                type: NEW_PROFILE_PIC,
                payload: {
                    s3ImgUri: s3ImgUri,
                    localImgUrl: URL.createObjectURL(file),
                    targetUser: targetUser,
                    currentProfilePicUri: currentProfilePicUri
                }
            })
        })
    });
};


