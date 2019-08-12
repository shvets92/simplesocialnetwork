import {
    FETCH_NEWS_FEED, FETCH_POST,
    FETCH_POST_COMMENTS,
    FETCH_USER_POSTS, LIKE_COMMENT,
    LIKE_POST,
    LOGOUT, NAVIGATE_TO,
    NEW_COMMENT,
    NEW_POST, UNLIKE_COMMENT, UNLIKE_POST
} from "../actions/types";

const initialState = {
    updatePostTrigger: false,
    newsFeedPostLookup: [],
    newsFeedToken: "0",
    notificationPostLookup: null
};

export default function(state = initialState, action) {
    let targetUser;
    let postKey;
    let targetPostComments;
    let targetUserPosts;
    switch(action.type) {
        case FETCH_POST:
            if(state.notificationPostLookup !== null) {
                state[state.notificationPostLookup.userUuid].postObjects.pop();
                if(state[state.notificationPostLookup.userUuid].postObjects.length === 0) {
                    state[state.notificationPostLookup.userUuid] = undefined;
                }
            }
            targetUser = action.payload[0].owner;
            if(state[targetUser] === undefined) {
                targetUserPosts = action.payload;
                return {
                    ...state,
                    [targetUser]: Object.assign({}, { postObjects:targetUserPosts }),
                    notificationPostLookup: {userUuid: targetUser, postKey: targetUserPosts.length-1}
                };
            } else {
                let currentPosts = state[targetUser].postObjects;
                targetUserPosts = currentPosts.concat(action.payload);
                return {
                    ...state,
                    [targetUser]: Object.assign(state[targetUser], { postObjects:targetUserPosts }),
                    notificationPostLookup: {userUuid: targetUser, postKey: targetUserPosts.length-1}
                };
            }
        case NAVIGATE_TO:
            if(state.notificationPostLookup !== null) {
                state[state.notificationPostLookup.userUuid].postObjects.pop();
                if(state[state.notificationPostLookup.userUuid].postObjects.length === 0) {
                    state[state.notificationPostLookup.userUuid] = undefined;
                }
            }
            return {
                ...state,
                notificationPostLookup: null
            };
        case FETCH_NEWS_FEED:
            let tempState = state;
            let tempPostLookup = [];
            let feedCopy = action.payload.posts;
            feedCopy.forEach((post) => {
                targetUser = post.owner;
                if(tempState[targetUser] == null) {
                    targetUserPosts = [];
                    targetUserPosts.push(post);
                    tempState[targetUser] = {pageToken: post.when, postObjects: targetUserPosts};
                } else {
                    let currentPosts = tempState[targetUser].postObjects;
                    currentPosts.push(post);
                    targetUserPosts = currentPosts;
                    tempState[targetUser] = Object.assign(tempState[targetUser], {
                        pageToken: post.when,
                        postObjects: targetUserPosts
                    });
                }
                tempPostLookup.push({userUuid: post.owner, postKey: targetUserPosts.length-1});
            });

            tempState.newsFeedPostLookup = state.newsFeedPostLookup.concat(tempPostLookup);
            tempState.newsFeedToken = action.payload.nextPageToken;

            return {
                ...state,
                updatePostTrigger: !state.updatePostTrigger
            };
        case NEW_POST:
            targetUser = action.payload.targetUser;
            if(state[targetUser] == null) {
                targetUserPosts = action.payload.newPost;
            } else {
                let currentPosts = state[targetUser].postObjects;
                targetUserPosts =  action.payload.newPost.concat(currentPosts);
            }
            return {
                ...state,
                [targetUser]: {pageToken: action.payload.newPost.when, postObjects: targetUserPosts}
            };
        case FETCH_USER_POSTS:
            targetUser = action.payload.targetUser;
            if(state[targetUser] == null) {
                targetUserPosts = action.payload.posts;
            } else {
                let currentPosts = state[targetUser].postObjects;
                targetUserPosts = currentPosts.concat(action.payload.posts);
            }

            return {
                ...state,
                [targetUser]: {pageToken: action.payload.nextPageToken, postObjects: targetUserPosts},
                updatePostTrigger: !state.updatePostTrigger
            };
        case NEW_COMMENT:
            targetUser = action.payload.targetUser;
            postKey = action.payload.postKey;
            if(state[targetUser] == null) {
                targetPostComments = action.payload.newComment;
            } else {
                let currentComments = state[targetUser].postObjects[postKey].comments;
                if(currentComments === undefined) {
                    targetPostComments = action.payload.newComment;
                } else {
                    targetPostComments =  action.payload.newComment.concat(currentComments);
                }
            }
            targetUserPosts = state[targetUser].postObjects;
            targetUserPosts[postKey].comments = targetPostComments;
            targetUserPosts[postKey].numOfComments = targetUserPosts[postKey].numOfComments+1;
            return {
                ...state,
                [targetUser]: Object.assign(state[targetUser], {postObjects: targetUserPosts})
            };
        case FETCH_POST_COMMENTS:
            targetUser = action.payload.targetUser;
            postKey = action.payload.postKey;
            if(state[targetUser] == null) {
                return state;
            } else if(state[targetUser].postObjects[postKey].comments === undefined) {
                targetPostComments = action.payload.comments;
            } else {
                let currentComments = state[targetUser].postObjects[postKey].comments;
                targetPostComments = currentComments.concat(action.payload.comments);
            }

            targetUserPosts = state[targetUser].postObjects;
            targetUserPosts[postKey].comments = targetPostComments;
            targetUserPosts[postKey].commentPageToken = action.payload.nextPageToken;
            return {
                ...state,
                [targetUser]: Object.assign(state[targetUser], {postObjects: targetUserPosts}),
                updatePostTrigger: !state.updatePostTrigger
            };
        case LIKE_POST:
            targetUser = action.payload.targetUser;
            postKey = action.payload.postKey;

            targetUserPosts = state[targetUser].postObjects;
            targetUserPosts[postKey].liked = true;
            targetUserPosts[postKey].numOfLikes = targetUserPosts[postKey].numOfLikes+1;
            return {
                ...state,
                [targetUser]: Object.assign(state[targetUser], {postObjects: targetUserPosts}),
                updatePostTrigger: !state.updatePostTrigger
            };
        case UNLIKE_POST:
            targetUser = action.payload.targetUser;
            postKey = action.payload.postKey;

            targetUserPosts = state[targetUser].postObjects;
            targetUserPosts[postKey].liked = false;
            targetUserPosts[postKey].numOfLikes = targetUserPosts[postKey].numOfLikes-1;
            return {
                ...state,
                [targetUser]: Object.assign(state[targetUser], {postObjects: targetUserPosts}),
                updatePostTrigger: !state.updatePostTrigger
            };
        case LIKE_COMMENT:
            targetUser = action.payload.targetUser;
            postKey = action.payload.postKey;

            targetUserPosts = state[targetUser].postObjects;
            targetPostComments = state[targetUser].postObjects[postKey].comments;
            targetPostComments[action.payload.commentKey].liked = true;
            targetPostComments[action.payload.commentKey].numOfLikes = targetPostComments[action.payload.commentKey].numOfLikes+1;
            return {
                ...state,
                [targetUser]: Object.assign(state[targetUser], {postObjects: targetUserPosts})
            };
        case UNLIKE_COMMENT:
            targetUser = action.payload.targetUser;
            postKey = action.payload.postKey;

            targetUserPosts = state[targetUser].postObjects;
            targetPostComments = state[targetUser].postObjects[postKey].comments;
            targetPostComments[action.payload.commentKey].liked = false;
            targetPostComments[action.payload.commentKey].numOfLikes = targetPostComments[action.payload.commentKey].numOfLikes-1;
            return {
                ...state,
                [targetUser]: Object.assign(state[targetUser], {postObjects: targetUserPosts})
            };
        case LOGOUT:
            return initialState;
        default:
            return state;
    }
}