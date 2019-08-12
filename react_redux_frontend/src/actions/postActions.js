import {
    FETCH_NEWS_FEED,
    FETCH_POST_COMMENTS,
    FETCH_USER_POSTS,
    NEW_COMMENT,
    NEW_POST,
    LIKE_POST,
    UNLIKE_POST, FETCH_POST, LIKE_COMMENT, UNLIKE_COMMENT
} from "./types";

export const fetchNewsFeed = (activeUser, authToken, pageToken) => dispatch => {
    if(pageToken === "" || pageToken === undefined) {
        return;
    }
    let headers = new Headers();
    headers.append('Authorization', authToken);
    headers.append('page_token', pageToken);
    headers.append('page_size', 10);
    fetch('/users/'+activeUser+'/newsfeed', {
        method: 'GET',
        headers: headers
    }).then(res => {
        res.json().then(posts => {
            let nextPageToken = posts.pop().nextPageToken;
            dispatch({
                type: FETCH_NEWS_FEED,
                payload: {
                    posts: posts,
                    nextPageToken: nextPageToken
                }
            })
        })
    })
};

export const fetchUserPosts = (targetUser, authToken, pageToken) => dispatch => {
    if(pageToken === "" || pageToken === undefined) {
        return;
    }
    let headers = new Headers();
    headers.append('Authorization', authToken);
    headers.append('page_token', pageToken);
    headers.append('page_size', 10);
    fetch('/users/'+targetUser+'/posts', {
        method: 'GET',
        headers: headers
    }).then(res => {
        res.json()
            .then(posts => {
                let nextPageToken = posts.pop().nextPageToken;
                dispatch({
                    type: FETCH_USER_POSTS,
                    payload: {
                        targetUser: targetUser,
                        posts: posts,
                        nextPageToken: nextPageToken
                    }
                })
            });
    });
};

export const createPost = (postData, image, authToken, targetUser) => dispatch => {
    let headers = new Headers();
    headers.append('Authorization', authToken);
    let data = new FormData();
    data.append('text', postData.text);
    data.append('image', image);
    if(postData.showEveryone) {
        data.append('privacyKey', 2);
    } else if(postData.showFriends) {
        data.append('privacyKey', 1);
    } else {
        data.append('privacyKey', 0);
    }
    fetch('/users/'+targetUser+'/posts', {
        method: 'POST',
        body: data,
        headers: headers
    }).then( res => {
        res.json()
            .then(newPost =>{
                dispatch({
                    type: NEW_POST,
                    payload: {
                        newPost: newPost,
                        targetUser: targetUser
                    }
                })
            });
    });
};

export const fetchPostComments = (authToken, targetUser, targetPost, postKey, pageToken) => dispatch => {
    let headers = new Headers();
    headers.append('Authorization', authToken);
    headers.append('page_token', pageToken);
    headers.append('page_size', 10);
    fetch('/users/'+targetUser+'/posts/'+targetPost+'/comments', {
        method: 'GET',
        headers: headers
    }).then(res => {
        res.json()
            .then(comments => {
                let nextPageToken = comments.pop().nextPageToken;
                dispatch({
                    type: FETCH_POST_COMMENTS,
                    payload: {
                        targetUser: targetUser,
                        postKey: postKey,
                        comments: comments,
                        nextPageToken: nextPageToken
                    }
                })
            });
    });
};

export const createComment = (commentText, authToken, targetUser, targetPost, postKey) => dispatch => {
    let headers = new Headers();
    headers.append('Authorization', authToken);
    headers.append('Content-Type', 'text/plain');
    fetch('/users/'+targetUser+'/posts/'+targetPost+'/comments', {
        method: 'POST',
        headers: headers,
        body: commentText
    }).then(res => {
        res.json()
            .then(newComment => {
                dispatch({
                    type: NEW_COMMENT,
                    payload: {
                        targetUser: targetUser,
                        postKey: postKey,
                        newComment: newComment
                    }
                })
            });
    });
};

export const likePost = (targetUser, targetPost, authToken, postKey) => dispatch => {
    let headers = new Headers();
    headers.append('Authorization', authToken);
    fetch('/users/'+targetUser+'/posts/'+targetPost+'/likes', {
        method: 'POST',
        headers: headers
    }).then(res => {
        if(res.status === 200) {
            dispatch({
                type: LIKE_POST,
                payload: {
                    targetUser: targetUser,
                    postKey: postKey
                }
            })
        }
    })
};

export const unlikePost = (targetUser, targetPost, authToken, postKey) => dispatch => {
    let headers = new Headers();
    headers.append('Authorization', authToken);
    fetch('/users/'+targetUser+'/posts/'+targetPost+'/likes', {
        method: 'DELETE',
        headers: headers
    }).then(res => {
        if(res.status === 200) {
            dispatch({
                type: UNLIKE_POST,
                payload: {
                    targetUser: targetUser,
                    postKey: postKey
                }
            })
        }
    })
};

export const likeComment = (targetUser, targetPost, targetComment, authToken, postKey, commentKey) => dispatch => {
    let headers = new Headers();
    headers.append('Authorization', authToken);
    fetch('/users/'+targetUser+'/posts/'+targetPost+'/comments/'+targetComment+'/likes', {
        method: 'POST',
        headers: headers
    }).then(response => {
        if(response.status === 200) {
            dispatch({
                type: LIKE_COMMENT,
                payload: {
                    targetUser: targetUser,
                    postKey: postKey,
                    commentKey: commentKey
                }
            })
        }
    })
};

export const unlikeComment = (targetUser, targetPost, targetComment, authToken, postKey, commentKey) => dispatch => {
    let headers = new Headers();
    headers.append('Authorization', authToken);
    fetch('/users/'+targetUser+'/posts/'+targetPost+'/comments/'+targetComment+'/likes', {
        method: 'DELETE',
        headers: headers
    }).then(response => {
        if(response.status === 200) {
            dispatch({
                type: UNLIKE_COMMENT,
                payload: {
                    targetUser: targetUser,
                    postKey: postKey,
                    commentKey: commentKey
                }
            })
        }
    })
};

export const fetchPost = (targetPost, postOwner, authToken) => dispatch => {
    let headers = new Headers();
    headers.append('Authorization', authToken);
    fetch('/users/'+postOwner+'/posts/'+targetPost, {
        method: 'GET',
        headers: headers
    }).then(res => {
        res.json().then(post => {
            dispatch({
                type: FETCH_POST,
                payload: post
            })
        })
    })
};



















