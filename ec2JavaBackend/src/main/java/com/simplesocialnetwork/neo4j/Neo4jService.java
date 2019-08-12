package com.simplesocialnetwork.neo4j;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.neo4j.driver.v1.StatementResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class Neo4jService {
    @Autowired
    Neo4jRepository neo4jRepository;

    private String convertResultsPageToString(StatementResult results, int pageSize, String idLastResultBy) {
        String nextPageToken = "";
        JSONArray jsonResponse = new JSONArray();
        while (results.hasNext()) {
            Map<String, Object> result = results.next().asMap();
            jsonResponse.put(new JSONObject(result));
            //Checks if reached max page length and not the end of the data set.
            if (jsonResponse.length() == pageSize && results.hasNext()) {
                //On success the next token is set
                nextPageToken = result.get(idLastResultBy).toString();
                //And the final result is popped to close the loop
                results.next();
            } else if (!results.hasNext() && jsonResponse.length() < pageSize) {
                //Sets the next token to empty as a signal to the front end that all data has been sent
                nextPageToken = "";
            }
        }

        final String finalToken = nextPageToken;
        jsonResponse.put(new JSONObject(new HashMap<String, String>() {{
            put("nextPageToken", finalToken);
        }}));
        return jsonResponse.toString();
    }

    public void addUser(String firstName, String lastName, String userUuid) {
        neo4jRepository.addUser(firstName, lastName, userUuid);
    }

    public String updateActiveUser(String activeUser) {
        StatementResult results = neo4jRepository.updateActiveUser(activeUser);
        Map<String, Object> result = results.single().asMap();
        return new JSONObject(result).toString();
    }

    public String getUserProfile(String targetUser, String activeUser) {
        StatementResult results = neo4jRepository.getUserProfile(targetUser, activeUser);
        Map<String, Object> result = results.single().asMap();
        JSONArray jsonResponse = new JSONArray();
        jsonResponse.put(new JSONObject(result));
        return jsonResponse.toString();
    }

    public String getProfilePic(String userUuid) {
        StatementResult results = neo4jRepository.getProfilePic(userUuid);
        Map<String, Object> result = results.single().asMap();
        String profilePic = result.get("profilePic").toString();
        return profilePic;
    }

    public void deleteUser(String userUuid) {
        neo4jRepository.deleteUser(userUuid);
    }

    public String getUserPreviewByUuid(String targetUser, String activeUser) {
        StatementResult results = neo4jRepository.getUserPreviewByUuid(targetUser, activeUser);
        Map<String, Object> result = results.single().asMap();
        JSONArray jsonResponse = new JSONArray();
        jsonResponse.put(new JSONObject(result));
        return jsonResponse.toString();
    }

    public String getUserPreviewByName(String firstName, String lastName, String activeUser) {
        StatementResult results = neo4jRepository.getUserPreviewByName(firstName.toLowerCase(), lastName.toLowerCase(), activeUser);
        JSONArray jsonResponse = new JSONArray();
        while (results.hasNext()) {
            Map<String, Object> result = results.next().asMap();
            jsonResponse.put(new JSONObject(result));
        }
        return jsonResponse.toString();
    }

    public void sendFriendRequest(String toUser, String fromUser) {
        neo4jRepository.createFriendRequest(toUser, fromUser);
    }

    public void respondToFriendRequest(String toUser, String fromUser, String response) {
        if (response.equals("accepted")) {
            neo4jRepository.upgradeFriendRequest(toUser, fromUser);
        } else if (response.equals("ignored")) {
            neo4jRepository.ignoreFriendRequest(toUser, fromUser);
        }
    }

    public void deleteFriendRequest(String toUser, String fromUser) {
        neo4jRepository.deleteFriendRequest(toUser, fromUser);
    }

    public void unfriend(String activeUser, String targetUser) {
        neo4jRepository.unfriend(activeUser, targetUser);
    }

    public String getFriendRequestsPage(String targetUser, String pageToken, int pageSize) {
        int pageSizePlus1 = pageSize + 1; //pageSize is incremented to check for the last page of the data set
        StatementResult results = neo4jRepository.getFriendRequests(targetUser, pageToken, pageSizePlus1);
        String jsonString = convertResultsPageToString(results, pageSize, "when");
        neo4jRepository.setFriendRequestCheckpoint(targetUser);
        return jsonString;
    }

    public String getFriendsPage(String targetUser, String activeUser, String pageToken, int pageSize) {
        int pageSizePlus1 = pageSize + 1; //pageSize is incremented to check for the last page of the data set
        StatementResult results = neo4jRepository.getFriends(targetUser, activeUser, pageToken, pageSizePlus1);
        String jsonString = convertResultsPageToString(results, pageSize, "since");
        return jsonString;
    }

    public String uploadPost(String postingUser, String textContent, String s3ImgUri, String targetUser, String privacyKey) {
        StatementResult results;
        if (targetUser.equals(postingUser)) {
            //post to self
            results = neo4jRepository.postPost(postingUser, textContent, s3ImgUri, privacyKey);
        } else {
            //post to user who has to be a friend
            results = neo4jRepository.postPostToFriend(postingUser, textContent, s3ImgUri, targetUser);
        }

        Map<String, Object> result = results.single().asMap();
        JSONArray jsonResponse = new JSONArray();
        jsonResponse.put(new JSONObject(result));
        return jsonResponse.toString();
    }

    public String getNewsFeedPage(String activeUser, String pageToken, int pageSize) {
        int pageSizePlus1 = pageSize + 1;
        StatementResult results = neo4jRepository.generateNewsFeed(activeUser, pageToken, pageSizePlus1);
        String jsonString = convertResultsPageToString(results, pageSize, "when");
        return jsonString;
    }

    public String getUserPostsPage(String target, String activeUser, String pageToken, int pageSize) {
        int pageSizePlus1 = pageSize + 1; //pageSize is incremented to check for the last page of the data set
        StatementResult results = neo4jRepository.getUserPosts(target, activeUser, pageToken, pageSizePlus1);
        String jsonString = convertResultsPageToString(results, pageSize, "when");
        return jsonString;
    }

    public String getPost(String targetUser, String activeUser, String targetPost) {
        StatementResult results = neo4jRepository.getPost(targetUser, activeUser, targetPost);
        Map<String, Object> result = results.single().asMap();
        JSONArray jsonResponse = new JSONArray();
        jsonResponse.put(new JSONObject(result));
        return jsonResponse.toString();
    }

    public String getPostCommentsPage(String activeUser, String targetUser, String targetPost, String pageToken,
                                      int pageSize) {
        int pageSizePlus1 = pageSize + 1;//this function is still in progress
        StatementResult results = neo4jRepository.getPostComments(activeUser, targetUser, targetPost, pageToken,
                pageSizePlus1);
        String jsonString = convertResultsPageToString(results, pageSize, "when");
        return jsonString;
    }

    public String uploadComment(String commentingUser, String text, String targetPost) {
        StatementResult results = neo4jRepository.uploadComment(commentingUser, text, targetPost);
        Map<String, Object> result = results.single().asMap();
        JSONArray jsonResponse = new JSONArray();
        jsonResponse.put(new JSONObject(result));
        return jsonResponse.toString();
    }

    public void like(String likeThisUuid, String userUuid) {
        neo4jRepository.like(likeThisUuid, userUuid);
    }

    public void unlike(String likeThisUuid, String userUuid) {
        neo4jRepository.unlike(likeThisUuid, userUuid);
    }

    public void flag(String flagThisUuid, String userUuid) {
        neo4jRepository.flag(flagThisUuid, userUuid);
    }

    public void updateUserBio(String targetUser, String newBio) {
        neo4jRepository.updateUserBio(targetUser, newBio);
    }

    public String getNotifications(String activeUser, String pageToken, int pageSize) throws JSONException {
        int pageSizePlus1 = pageSize + 1;
        StatementResult results = neo4jRepository.getNotifications(activeUser, pageToken, pageSizePlus1);
        JSONArray jsonResponse = new JSONArray();
        while (results.hasNext()) {
            Map<String, Object> result = results.next().asMap();
            jsonResponse.put(new JSONObject(result));
        }
        JSONArray sortedJsonArray = new JSONArray();
        List<JSONObject> jsonValues = new ArrayList<JSONObject>();
        if(jsonResponse.length() == 0) {
            sortedJsonArray.put(new JSONObject(new HashMap<String, String>() {{
                put("nextPageToken", "");
            }}));
            neo4jRepository.setNotificationsCheckpoint(activeUser);
            return sortedJsonArray.toString();
        }
        for (int i = 0; i < jsonResponse.length(); i++) {
            jsonValues.add((JSONObject) jsonResponse.get(i));
        }
        Collections.sort( jsonValues, new Comparator<JSONObject>() {
            private static final String KEY_NAME = "when";
            @Override
            public int compare(JSONObject a, JSONObject b) {
                Long valA = Long.valueOf(0);
                Long valB = Long.valueOf(0);
                try {
                    valA = (Long) a.get(KEY_NAME);
                    valB = (Long) b.get(KEY_NAME);
                }
                catch (JSONException e) {
                    e.printStackTrace();
                }
                return -valA.compareTo(valB);
            }
        });

        for (int i = 0; i < jsonResponse.length(); i++) {
            sortedJsonArray.put(jsonValues.get(i));
            if(i == pageSize-1 || i == jsonResponse.length()-1) {
                if(jsonResponse.length() >= pageSize) {
                    String nextPageToken = String.valueOf(jsonValues.get(i).get("when"));
                    sortedJsonArray.put(new JSONObject(new HashMap<String, String>() {{
                        put("nextPageToken", nextPageToken);
                    }}));
                    neo4jRepository.setNotificationsCheckpoint(activeUser);
                    return sortedJsonArray.toString();
                } else {
                    sortedJsonArray.put(new JSONObject(new HashMap<String, String>() {{
                        put("nextPageToken", "");
                    }}));
                    neo4jRepository.setNotificationsCheckpoint(activeUser);
                    return sortedJsonArray.toString();
                }
            }
        }
        return null;
    }

    public void saveNewProfilePicUri(String activeUser, String s3ImgUri) {
        neo4jRepository.saveNewProfilePic(activeUser, s3ImgUri);
    }
}
