package com.simplesocialnetwork.neo4j;

import org.neo4j.driver.v1.StatementResult;

public interface Neo4jRepository {
    void addUser(String firstName, String lastName, String userUuid);

    StatementResult updateActiveUser(String activeUser);

    void setNotificationsCheckpoint(String activeUser);

    void setFriendRequestCheckpoint(String activeUser);

    StatementResult getUserProfile(String targetUser, String activeUser);

    StatementResult getProfilePic(String userUuid);

    StatementResult getUserPreviewByUuid(String targetUser, String activeUser);

    StatementResult getUserPreviewByName(String firstName, String lastName, String activeUser);

    void deleteUser(String userUuid);

    void createFriendRequest(String userUuid, String friendUuid);

    StatementResult getFriendRequests(String userUuid, String pageToken, int pageSize);

    void upgradeFriendRequest(String toUser, String fromUser);

    void ignoreFriendRequest(String toUser, String fromUser);

    void deleteFriendRequest(String toUser, String fromUser);

    void unfriend(String activeUser, String targetUser);

    StatementResult getFriends(String targetUser, String activeUser, String pageToken, int pageSize);

    StatementResult getNotifications(String activeUser, String pageToken, int pageSize);

    StatementResult generateNewsFeed(String activeUser, String pageToken, int pageSize);

    StatementResult getUserPosts(String targetUser, String activeUser, String pageToken, int pageSize);

    StatementResult postPost(String userUuid, String textContent, String s3ImgUri, String privacyKey);

    StatementResult postPostToFriend(String userUuid, String textContent, String s3ImageUri, String friendUuid);

    StatementResult getPost(String targetUser, String activeUser, String targetPost);

    StatementResult uploadComment(String userUuid, String text, String postUuid);

    StatementResult getPostComments(String activeUser, String targetUser, String targetPost, String pageToken, int pageSize);

    void like(String likeThisUuid, String userUuid);

    void unlike(String likeThisUuid, String userUuid);

    void flag(String flagThisUuid, String userUuid);

    void updateUserBio(String targetUser, String newBio);

    void saveNewProfilePic(String activeUser, String s3ImgUri);
}
