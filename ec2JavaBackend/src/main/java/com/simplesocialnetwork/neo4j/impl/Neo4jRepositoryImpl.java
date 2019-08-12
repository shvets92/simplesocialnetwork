package com.simplesocialnetwork.neo4j.impl;

import com.simplesocialnetwork.neo4j.Graph;
import com.simplesocialnetwork.neo4j.Neo4jRepository;
import org.neo4j.driver.v1.StatementResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

@Repository
public class Neo4jRepositoryImpl implements Neo4jRepository {

    @Value("${neo4j.uri}")
    private String graphUri;
    @Value("${neo4j.user}")
    private String graphUser;
    @Value("${neo4j.password}")
    private String graphPass;

    @Override
    public void addUser(String firstName, String lastName, String userUuid) {
        Graph graph = new Graph(graphUri, graphUser, graphPass);
        graph.write("CREATE (u:USER) " +
                        "SET u.uuid = $uuid " +
                        "SET u.firstName = $firstName " +
                        "SET u.lastName = $lastName " +
                        "SET u.profilePic = '' " +
                        "SET u.joined_at = timestamp() " +
                        "SET u.lastNotificationsUpdate: 0 " +
                        "SET u.lastFriendRequestsUpdate: 0",
                "uuid", userUuid, "firstName", firstName, "lastName", lastName);
    }

    @Override
    public StatementResult updateActiveUser(String activeUser) {
        return new Graph(graphUri, graphUser, graphPass)
                .read("MATCH (au:USER) WHERE au.uuid = $activeUser " +
                                "WITH au " +
                                "OPTIONAL MATCH (au)<-[fr:FRIENDSHIP_REQUESTED]-(:USER) " +
                                    "WHERE NOT exists(fr.ignored) AND fr.when > toInteger(au.lastFriendRequestsUpdate) " +
                                "WITH au, count(fr) AS numOfNewFriendRequests " +

                                "OPTIONAL MATCH (au)<-[:OVER_HERE]-(pp:POST)<-[pr:POSTED]-(pu:USER) " +
                                    "WHERE NOT au.uuid = pu.uuid AND pr.when > toInteger(au.lastNotificationsUpdate) " +
                                "WITH au, numOfNewFriendRequests, count(pp) AS numOfNewWallPosts " +

                                "OPTIONAL MATCH (au)-[:POSTED]->(cp:POST)<-[:OVER_HERE]-(c:COMMENT)<-[cpr:POSTED]-(cu:USER) " +
                                    "WHERE NOT au.uuid = cu.uuid AND cpr.when > toInteger(au.lastNotificationsUpdate) " +
                                "WITH au, numOfNewFriendRequests, numOfNewWallPosts, count(c) AS numOfNewPostComments " +

                                "OPTIONAL MATCH (au)-[:POSTED]->(lp:POST)<-[lpr:LIKED]-(lpu:USER) " +
                                    "WHERE NOT au.uuid = lpu.uuid AND lpr.when > toInteger(au.lastNotificationsUpdate) " +
                                "WITH au, numOfNewFriendRequests, numOfNewWallPosts, numOfNewPostComments, " +
                                    "count(lpr) AS numOfNewPostLikes " +

                                "OPTIONAL MATCH (au)-[:POSTED]->(lc:COMMENT)<-[lcr:LIKED]-(lcu:USER) " +
                                    "WHERE NOT au.uuid = lcu.uuid AND lcr.when > toInteger(au.lastNotificationsUpdate) " +
                                "WITH numOfNewFriendRequests, numOfNewWallPosts+numOfNewPostComments+" +
                                    "numOfNewPostLikes+count(lcr) AS numOfNewNotifications " +
                                "RETURN numOfNewFriendRequests, numOfNewNotifications",
                        "activeUser", activeUser);
    }

    @Override
    public void setNotificationsCheckpoint(String activeUser){
        new Graph(graphUri, graphUser, graphPass)
                .write("MATCH (au:USER) " +
                                "WHERE au.uuid = $activeUser " +
                                "SET au.lastNotificationsUpdate = timestamp()",
                        "activeUser", activeUser);
    }

    @Override
    public void setFriendRequestCheckpoint(String activeUser){
        new Graph(graphUri, graphUser, graphPass)
                .write("MATCH (au:USER) " +
                                "WHERE au.uuid = $activeUser " +
                                "SET au.lastFriendRequestsUpdate = timestamp()",
                        "activeUser", activeUser);
    }

    @Override
    public StatementResult getUserProfile(String targetUser, String activeUser) {
        return new Graph(graphUri, graphUser, graphPass)
                .read("MATCH (tu:USER), (au:USER) " +
                                "WHERE tu.uuid = $targetUser AND au.uuid = $activeUser " +

                                "OPTIONAL MATCH (tu)-[friends:FRIENDS]-(au) " +
                                "OPTIONAL MATCH (tu)-[tuReqAu:FRIENDSHIP_REQUESTED]->(au) " +
                                "OPTIONAL MATCH (tu)<-[auReqTu:FRIENDSHIP_REQUESTED]-(au) " +
                                "WITH tu, au, CASE " +
                                    "WHEN exists(friends.since) THEN 'friends' " +
                                    "WHEN exists(tuReqAu.when) THEN 'theyRequestedFriendship' " +
                                    "WHEN exists(auReqTu.when) THEN 'youRequestedFriendShip' " +
                                    "WHEN $targetUser = $activeUser THEN 'self' " +
                                    "ELSE 'newUser' " +
                                    "END AS relationshipStatus " +
                                "OPTIONAL MATCH (tu)<-[bfr:BEST_FRIENDS]-(au) " +

                                "RETURN tu.firstName AS firstName, tu.lastName AS lastName, " +
                                "tu.bio AS bio, relationshipStatus, tu.profilePic AS profilePicUri, " +
                                "exists(bfr.since) AS isBestFriend ",
                        "targetUser", targetUser, "activeUser", activeUser);
    }

    @Override
    public StatementResult getProfilePic(String userUuid) {
        return new Graph(graphUri, graphUser, graphPass)
                .read("MATCH (u:USER {uuid: $userUuid}) " +
                                "RETURN u.profilePic AS profilePic",
                        "userUuid", userUuid);
    }

    @Override
    public StatementResult getUserPreviewByUuid(String targetUser, String activeUser) {
        return new Graph(graphUri, graphUser, graphPass)
                .read("MATCH (tu:USER) WHERE tu.uuid = $targetUser " +
                                "OPTIONAL MATCH (au:USER)-[:FRIENDS]-(mf:USER)-[:FRIENDS]-(tu) " +
                                "WHERE au.uuid = $activeUser " +
                                "RETURN tu.uuid AS userUuid, tu.firstName AS firstName, tu.lastName AS lastName, " +
                                "tu.profilePic AS profilePicUri, count(mf) AS numOfMutualFriends",
                        "targetUser", targetUser, "activeUser", activeUser);
    }

    @Override
    public StatementResult getUserPreviewByName(String firstName, String lastName, String activeUser) {
        if (lastName.equals("")) {
            return new Graph(graphUri, graphUser, graphPass)
                    .read("MATCH (tu:USER) WHERE tu.firstName = $firstName AND NOT tu.uuid = $activeUser " +
                                    "OPTIONAL MATCH (au:USER)-[:FRIENDS]-(mf:USER)-[:FRIENDS]-(tu) " +
                                    "WHERE au.uuid = $activeUser " +
                                    "RETURN tu.uuid AS userUuid, tu.firstName AS firstName, tu.lastName AS lastName, " +
                                    "tu.profilePic AS profilePicUri, count(mf) AS numOfMutualFriends ORDER BY tu.firstName DESC",
                            "firstName", firstName, "activeUser", activeUser);
        }
        return new Graph(graphUri, graphUser, graphPass)
                .read("MATCH (tu:USER) " +
                                "WHERE tu.firstName = $firstName " +
                                    "AND tu.lastName = $lastName " +
                                    "AND NOT tu.uuid = $activeUser " +
                                "OPTIONAL MATCH (au:USER)-[:FRIENDS]-(mf:USER)-[:FRIENDS]-(tu) " +
                                "WHERE au.uuid = $activeUser " +
                                "RETURN tu.uuid AS userUuid, tu.firstName AS firstName, tu.lastName AS lastName, " +
                                "tu.profilePic AS profilePic, count(mf) AS numOfMutualFriends ORDER BY tu.firstName DESC",
                        "firstName", firstName, "lastName", lastName, "activeUser", activeUser);
    }

    @Override
    public void deleteUser(String userUuid) {
        Graph graph = new Graph(graphUri, graphUser, graphPass);
        graph.write("MATCH (u:USER {uuid: $uuid}) DETACH DELETE u",
                "uuid", userUuid);
    }

    @Override
    public void createFriendRequest(String userUuid, String friendUuid) {
        new Graph(graphUri, graphUser, graphPass)
                .write("MATCH (u:USER {uuid: $userUuid}), (f:USER {uuid: $friendUuid}) " +
                                "WHERE NOT (u)-[:FRIENDSHIP_REQUESTED]-(f) AND NOT (u)-[:FRIENDS]-(f) " +
                                "CREATE (u)<-[:FRIENDSHIP_REQUESTED {when: timestamp()}]-(f)",
                        "userUuid", userUuid, "friendUuid", friendUuid);
    }

    @Override
    public StatementResult getFriendRequests(String userUuid, String pageToken, int pageSize) {
        if (pageToken.equals("0")) {
            return new Graph(graphUri, graphUser, graphPass)
                    .readPage("MATCH (u:USER {uuid: $uuid})<-[fr:FRIENDSHIP_REQUESTED]-(n:USER) " +
                                    "WHERE NOT exists(fr.ignored) AND fr.when < toInteger(timestamp()) " +
                                    "OPTIONAL MATCH (u)-[:FRIENDS]-(mf:USER)-[:FRIENDS]-(n) " +
                                    "RETURN n.uuid AS userUuid, n.firstName AS firstName, n.lastName AS lastName, " +
                                    "count(mf) AS numOfMutualFriends, 'request' AS type, " +
                                    "n.profilePic AS profilePicUri, " +
                                    "fr.when AS when ORDER BY fr.when DESC LIMIT $pageSize",
                            pageToken, pageSize, "uuid", userUuid);
        } else {
            return new Graph(graphUri, graphUser, graphPass)
                    .readPage("MATCH (u:USER {uuid: $uuid})<-[fr:FRIENDSHIP_REQUESTED]-(n:USER) " +
                                    "WHERE NOT exists(fr.ignored) AND fr.when < toInteger($pageToken) " +
                                    "OPTIONAL MATCH (u)-[:FRIENDS]-(mf:USER)-[:FRIENDS]-(n) " +
                                    "RETURN n.uuid AS uuid, n.firstName AS firstName, n.lastName AS lastName, " +
                                    "count(mf) AS numOfMutualFriends, 'request' AS type, " +
                                    "n.profilePic AS profilePicUri, " +
                                    "fr.when AS when ORDER BY fr.when DESC LIMIT $pageSize",
                            pageToken, pageSize, "uuid", userUuid);
        }
    }

    @Override
    public void upgradeFriendRequest(String toUser, String fromUser) {
        new Graph(graphUri, graphUser, graphPass)
                .write("MATCH (u:USER {uuid: $fromUser})-[fr:FRIENDSHIP_REQUESTED]->(to:USER {uuid: $toUser}) " +
                                "CREATE (u)-[:FRIENDS {since: timestamp()}]->(to) " +
                                "DELETE fr",
                        "fromUser", fromUser, "toUser", toUser);
    }

    @Override
    public void ignoreFriendRequest(String toUser, String fromUser) {
        new Graph(graphUri, graphUser, graphPass)
                .write("MATCH (u:USER {uuid: $fromUser})-[r:FRIENDSHIP_REQUESTED]->(:USER {uuid: $toUser}) " +
                                "SET r.ignored = true",
                        "fromUser", fromUser, "toUser", toUser);
    }

    @Override
    public void deleteFriendRequest(String toUser, String fromUser) {
        new Graph(graphUri, graphUser, graphPass)
                .write("MATCH (u:USER {uuid: $fromUser})-[fr:FRIENDSHIP_REQUESTED]->(to:USER {uuid: $toUser}) " +
                                "DELETE fr",
                        "fromUser", fromUser, "toUser", toUser);
    }

    @Override
    public void unfriend(String activeUser, String targetUser) {
        new Graph(graphUri, graphUser, graphPass)
                .write("MATCH (au:USER)-[r:FRIENDS]-(tu:USER) " +
                                    "WHERE au.uuid = $activeUser AND tu.uuid = $targetUser " +
                                "OPTIONAL MATCH (au)-[bfr:BEST_FRIENDS]-(tu) " +
                                "DELETE r, bfr",
                        "targetUser", targetUser, "activeUser", activeUser);
    }

    @Override
    public StatementResult getFriends(String targetUser, String activeUser, String pageToken, int pageSize) {
        if (activeUser.equals(targetUser)) {
            return new Graph(graphUri, graphUser, graphPass)
                    .readPage("MATCH (au:USER)-[fd:FRIENDS]-(f:USER) " +
                                    "WHERE au.uuid = $activeUser AND fd.since > toInteger($pageToken) " +
                                    "WITH DISTINCT f, fd " +

                                    "RETURN f.uuid AS userUuid, f.firstName AS firstName, f.lastName AS lastName, " +
                                    "'friend' AS type, f.profilePic as profilePicUri, " +
                                    "fd.since AS since ORDER BY fd.since DESC LIMIT $pageSize",
                            pageToken, pageSize, "activeUser", activeUser);
        }
        return new Graph(graphUri, graphUser, graphPass)
                .readPage("MATCH (tu:USER)-[fd:FRIENDS]-(f:USER) " +
                                    "WHERE tu.uuid = $targetUser AND fd.since > toInteger($pageToken) " +
                                "WITH DISTINCT f, fd " +
                                "RETURN f.uuid AS userUuid, f.firstName AS firstName, f.lastName AS lastName, " +
                                "f.profilePic AS profilePicUri, " +
                                "'friend' AS type, fd.since AS since ORDER BY fd.since DESC LIMIT $pageSize",
                        pageToken, pageSize, "targetUser", targetUser, "activeUser", activeUser);
    }

    @Override
    public StatementResult getNotifications(String activeUser, String pageToken, int pageSize) {//need to be able to store old notifications into dynamo
        return new Graph(graphUri, graphUser, graphPass)
                .readPage("WITH CASE $pageToken WHEN '0' THEN timestamp() ELSE toInteger($pageToken) " +
                                    "END AS token " +
                                "MATCH (au:USER) WHERE au.uuid = $activeUser " +
                                    "WITH token, au " +
                                "MATCH (au)<-[:OVER_HERE]-(pp:POST)<-[pr:POSTED]-(pu:USER) " +
                                    "WHERE NOT au.uuid = pu.uuid AND pr.when < token " +
                                "RETURN 'wallPost' AS type, pp.uuid AS postUuid, pu.firstName AS actionUserFirstName, " +
                                    "pu.profilePic AS actionUserS3Uri, au.uuid AS postOwner, " +
                                    "pr.when AS when ORDER BY pr.when DESC LIMIT $pageSize " +

                                "UNION " +

                                "WITH CASE $pageToken WHEN '0' THEN timestamp() ELSE toInteger($pageToken) " +
                                    "END AS token " +
                                "MATCH (au:USER) WHERE au.uuid = $activeUser " +
                                    "WITH token, au " +
                                "MATCH (au)-[:POSTED]->(cp:POST)<-[:OVER_HERE]-(c:COMMENT)<-[cpr:POSTED]-(cu:USER) " +
                                    "WHERE NOT au.uuid = cu.uuid AND cpr.when < token " +
                                "OPTIONAL MATCH (cp)-[:OVER_HERE]->(cptu:USER)" +
                                "RETURN 'postComment' AS type, cp.uuid AS postUuid, cu.firstName AS actionUserFirstName, " +
                                    "cu.profilePic AS actionUserS3Uri, cptu.uuid AS postOwner, " +
                                    "cpr.when AS when ORDER BY cpr.when DESC LIMIT $pageSize " +

                                "UNION " +

                                "WITH CASE $pageToken WHEN '0' THEN timestamp() ELSE toInteger($pageToken) " +
                                    "END AS token " +
                                "MATCH (au:USER) WHERE au.uuid = $activeUser " +
                                    "WITH token, au " +
                                "MATCH (au)-[:POSTED]->(lp:POST)<-[lpr:LIKED]-(lpu:USER) " +
                                    "WHERE NOT au.uuid = lpu.uuid AND lpr.when < token " +
                                "OPTIONAL MATCH (lp)-[:OVER_HERE]->(lptu:USER) " +
                                "RETURN 'postLike' AS type, lp.uuid AS postUuid, lpu.firstName AS actionUserFirstName, " +
                                    "lpu.profilePic AS actionUserS3Uri, lptu.uuid AS postOwner, " +
                                    "lpr.when AS when ORDER by lpr.when DESC LIMIT $pageSize " +

                                "UNION " +

                                "WITH CASE $pageToken WHEN '0' THEN timestamp() ELSE toInteger($pageToken) " +
                                    "END AS token " +
                                "MATCH (au:USER) WHERE au.uuid = $activeUser " +
                                    "WITH token, au " +
                                "MATCH (au)-[:POSTED]->(lc:COMMENT)<-[lcr:LIKED]-(lcu:USER) " +
                                    "WHERE NOT au.uuid = lcu.uuid AND lcr.when < token " +
                                "WITH au, lc, lcu, lcr " +
                                "MATCH (lc)-[:OVER_HERE]->(lcp:POST) " +
                                "OPTIONAL MATCH (lcp)-[:OVER_HERE]->(lcptu:USER) " +
                                "RETURN 'commentLike' AS type, lcp.uuid AS postUuid, lcu.firstName AS actionUserFirstName, " +
                                    "lcu.profilePic AS actionUserS3Uri, lcptu.uuid AS postOwner, " +
                                    "lcr.when AS when ORDER by lcr.when DESC LIMIT $pageSize ",
                        //should match: 1. posts on their wall, 2. comments on posts they posted, 3. likes on posts they posted, 4. likes on comments they posted
                        pageToken, pageSize, "activeUser", activeUser);
    }

    @Override
    public StatementResult generateNewsFeed(String activeUser, String pageToken, int pageSize) {
        return new Graph(graphUri, graphUser, graphPass)
                .readPage("WITH CASE $pageToken " +
                                    "WHEN '0' THEN timestamp() ELSE toInteger($pageToken) " +
                                    "END AS token " +

                                "MATCH (au:USER)-[:FRIENDS]-(f:USER) " +
                                    "WHERE au.uuid = $activeUser " +
                                "WITH token, au, f " +

                                "MATCH (pu:USER)-[pr:POSTED]->(p:POST)-[:OVER_HERE]->(f) " +
                                    "WHERE pr.when < token AND p.privacy >= 1 " +
                                "WITH au, f, p, pr, pu ORDER BY pr.when DESC LIMIT $pageSize " +

                                "OPTIONAL MATCH (c:COMMENT)-[:OVER_HERE]->(p) " +
                                "OPTIONAL MATCH (:USER)-[lk:LIKED]->(p) " +
                                "OPTIONAL MATCH (au)-[aul:LIKED]->(p) " +
                                "RETURN p.uuid AS postUuid, p.text AS text, p.s3ImgUri as s3ImgUri, " +
                                    "pu.uuid AS userUuid, pu.firstName as firstName, pr.when AS when, " +
                                    "exists(aul.when) AS liked, count(lk) AS numOfLikes, count(c) AS numOfComments, " +
                                    "f.uuid AS owner, f.profilePic AS ownerProfilePicUri , pu.profilePic AS posterProfilePicUri, " +
                                    "f.firstName AS ownerFirstName",
                        pageToken, pageSize, "activeUser", activeUser);
    }

    @Override
    public StatementResult getUserPosts(String targetUser, String activeUser, String pageToken, int pageSize) {
        return new Graph(graphUri, graphUser, graphPass)
                .readPage("WITH CASE $pageToken " +
                                    "WHEN '0' THEN timestamp() ELSE toInteger($pageToken) " +
                                    "END AS token " +

                                "MATCH (au:USER), (tu:USER) " +
                                    "WHERE au.uuid = $activeUser AND tu.uuid = $targetUser " +
                                "OPTIONAL MATCH (au)-[fr:FRIENDS]-(tu) " +

                                "WITH token, au, tu, CASE " +
                                    "WHEN tu.uuid = au.uuid THEN 0 " +
                                    "WHEN fr.since IS NOT NULL THEN 1 " +
                                    "ELSE 2 " +
                                    "END AS privacyToken " +

                                "MATCH (pu:USER)-[pr:POSTED]->(p:POST)-[:OVER_HERE]->(tu) " +
                                    "WHERE pr.when < token AND p.privacy >= privacyToken " +
                                "WITH au, p, pr, pu, tu ORDER BY pr.when DESC LIMIT $pageSize " +

                                "OPTIONAL MATCH (c:COMMENT)-[:OVER_HERE]->(p) " +
                                "OPTIONAL MATCH (:USER)-[lk:LIKED]->(p) " +
                                "OPTIONAL MATCH (au)-[aul:LIKED]->(p) " +
                                "RETURN p.uuid AS postUuid, p.text AS text, p.s3ImgUri AS s3ImgUri, " +
                                    "pu.uuid AS userUuid, pu.firstName as firstName, pr.when AS when, " +
                                    "exists(aul.when) AS liked, count(DISTINCT lk) AS numOfLikes, count(DISTINCT c) AS numOfComments," +
                                    "tu.uuid AS owner, tu.profilePic AS ownerProfilePicUri , pu.profilePic AS posterProfilePicUri, " +
                                    "tu.firstName AS ownerFirstName",
                        pageToken, pageSize, "targetUser", targetUser, "activeUser", activeUser);
    }

    @Override
    public StatementResult getPost(String targetUser, String activeUser, String targetPost) {
        return new Graph(graphUri, graphUser, graphPass)
                .read("MATCH (au:USER), (tu:USER) " +
                                    "WHERE au.uuid = $activeUser AND tu.uuid = $targetUser " +
                                "OPTIONAL MATCH (au)-[fr:FRIENDS]-(tu) " +

                                "WITH au, tu, CASE " +
                                    "WHEN tu.uuid = au.uuid THEN 0 " +
                                    "WHEN fr.since IS NOT NULL THEN 1 " +
                                    "ELSE 2 " +
                                    "END AS privacyToken " +

                                "MATCH (pu:USER)-[pr:POSTED]->(p:POST)-[:OVER_HERE]->(tu) " +
                                    "WHERE p.uuid = $targetPost AND p.privacy >= privacyToken " +
                                "OPTIONAL MATCH (c:COMMENT)-[:OVER_HERE]->(p) " +
                                "OPTIONAL MATCH (:USER)-[lk:LIKED]->(p) " +
                                "OPTIONAL MATCH (au)-[aul:LIKED]->(p) " +

                                "RETURN p.uuid AS postUuid, p.text AS text, p.s3ImgUri AS s3ImgUri, " +
                                "pu.uuid AS userUuid, pu.firstName as firstName, pr.when AS when, " +
                                "exists(aul.when) AS liked, count(lk) AS numOfLikes, count(c) AS numOfComments," +
                                "tu.uuid AS owner, tu.profilePic AS ownerProfilePicUri , pu.profilePic AS posterProfilePicUri, " +
                                "tu.firstName AS ownerFirstName",
                        "targetUser", targetUser, "activeUser", activeUser, "targetPost", targetPost);
    }

    @Override
    public StatementResult postPost(String userUuid, String text, String s3ImgUri, String privacyKey) {
        return new Graph(graphUri, graphUser, graphPass)
                .write("MATCH (u:USER) " +
                                    "WHERE u.uuid = $userUuid " +
                                "CREATE (p:POST {uuid: randomUUID(), text: $text, s3ImgUri: $s3ImgUri, " +
                                                "privacy: toInteger($privacyKey)}) " +
                                "CREATE (u)-[r:POSTED {uuid: randomUUID(), when: timestamp()}]->(p) " +
                                "CREATE (p)-[:OVER_HERE]->(u) " +
                                "RETURN p.uuid AS postUuid, p.text AS text, p.s3ImgUri as s3ImgUri, " +
                                "u.uuid AS userUuid, u.firstName AS firstName, r.when AS when, 0 AS numOfComments, " +
                                "0 AS numOfLikes, NULL as liked, u.uuid AS owner, u.profilePic AS ownerProfilePicUri , u.profilePic AS posterProfilePicUri, " +
                                "u.firstName AS ownerFirstName",
                        "userUuid", userUuid, "text", text, "s3ImgUri", s3ImgUri, "privacyKey", privacyKey);
    }

    @Override
    public StatementResult postPostToFriend(String userUuid, String textContent, String s3ImageUri,
                                            String friendUuid) {
        return new Graph(graphUri, graphUser, graphPass)
                .write("MATCH (u:USER)-[:FRIENDS]-(f:USER) " +
                                    "WHERE u.uuid = $userUuid AND f.uuid = $friendUuid " +
                                "CREATE (p:POST {uuid: randomUUID(), text: $text, s3ImgUri: $s3ImgUri, privacy: 1}) " +
                                "CREATE (u)-[r:POSTED {uuid: randomUUID(), when: timestamp()}]->(p) " +
                                "CREATE (p)-[:OVER_HERE]->(f) " +
                                "RETURN p.uuid AS postUuid, p.text AS text, p.s3ImgUri as s3ImgUri, " +
                                "u.uuid AS userUuid, u.firstName AS firstName, r.when AS when, 0 AS numOfComments, " +
                                "0 AS numOfLikes, NULL AS liked, f.uuid AS owner, f.profilePic AS ownerProfilePicUri , u.profilePic AS posterProfilePicUri, " +
                                "f.firstName AS ownerFirstName",
                        "userUuid", userUuid, "friendUuid", friendUuid, "text", textContent,
                        "s3ImgUri", s3ImageUri);
    }

    @Override
    public StatementResult uploadComment(String userUuid, String text, String targetPost) {
        return new Graph(graphUri, graphUser, graphPass)
                .write("MATCH (p:POST {uuid: $targetPost}), (u:USER {uuid: $userUuid}) " +
                                "CREATE (u)-[r:POSTED {when: timestamp()}]->" +
                                "(c:COMMENT {uuid: randomUUID(), text: $text})-[:OVER_HERE]->(p) " +
                                "RETURN c.uuid AS commentUuid, c.text AS text, u.uuid AS userUuid, " +
                                "u.firstName AS firstName, r.when AS when, FALSE AS liked, 0 AS numOfLikes, " +
                                "u.profilePic AS posterProfilePicUri",
                        "userUuid", userUuid, "text", text, "targetPost", targetPost);
    }

    @Override
    public StatementResult getPostComments(String activeUser, String targetUser, String targetPost, String pageToken,
                                           int pageSize) {
        return new Graph(graphUri, graphUser, graphPass)
                .readPage("WITH CASE $pageToken " +
                                    "WHEN '0' THEN timestamp() ELSE toInteger($pageToken) " +
                                    "END AS token " +

                                "MATCH (cu:USER)-[cr:POSTED]->(c:COMMENT)-[:OVER_HERE]->(p:POST)-[:OVER_HERE]->(tu:USER) " +
                                    "WHERE tu.uuid = $targetUser AND p.uuid = $targetPost AND cr.when < token " +
                                "WITH c, cr, cu ORDER BY cr.when DESC LIMIT $pageSize " +

                                "OPTIONAL MATCH (:USER)-[lk:LIKED]->(c) " +
                                "OPTIONAL MATCH (au:USER)-[aul:LIKED]->(c) " +
                                "WHERE au.uuid = $activeUser " +
                                "RETURN c.uuid AS commentUuid, c.text AS text, " +
                                "cu.uuid AS userUuid, cu.firstName as firstName, cr.when AS when, " +
                                "exists(aul.when) AS liked, count(lk) AS numOfLikes, cu.profilePic AS posterProfilePicUri",
                        pageToken, pageSize, "activeUser", activeUser, "targetUser", targetUser,
                        "targetPost", targetPost);
    }

    @Override
    public void like(String likeThisUuid, String userUuid) {
        new Graph(graphUri, graphUser, graphPass)
                .read("MATCH (n {uuid: $likeThisUuid}), (u:USER {uuid: $userUuid}) " +
                                "WHERE NOT (u)-[:LIKED]->(n) " +
                                "CREATE (u)-[:LIKED {when: timestamp()}]->(n)",
                        "likeThisUuid", likeThisUuid, "userUuid", userUuid);
    }

    @Override
    public void unlike(String likeThisUuid, String userUuid) {
        new Graph(graphUri, graphUser, graphPass)
                .write("MATCH (n {uuid: $likeThisUuid})<-[lk:LIKED]-(u:USER {uuid: $userUuid}) " +
                                "DELETE lk",
                        "likeThisUuid", likeThisUuid, "userUuid", userUuid);
    }

    @Override
    public void flag(String flagThisUuid, String userUuid) {
        new Graph(graphUri, graphUser, graphPass)
                .write("MATCH (n {uuid: $flagThisUuid}), (u:USER {uuid: $userUuid}) " +
                                "WHERE NOT (u)-[:FLAGGED]->(n) " +
                                "CREATE (u)-[:FLAGGED {when: timestamp()}]->(n)",
                        "flagThisUuid", flagThisUuid, "userUuid", userUuid);
    }

    @Override
    public void updateUserBio(String targetUser, String newBio) {
        new Graph(graphUri, graphUser, graphPass)
                .write("MATCH (u:USER) " +
                                "WHERE u.uuid = $targetUser " +
                            "SET u.bio = $newBio",
                        "targetUser", targetUser, "newBio", newBio);
    }

    @Override
    public void saveNewProfilePic(String activeUser, String s3ImgUri) {
        new Graph(graphUri, graphUser, graphPass)
                .write("MATCH (au:USER) " +
                                "WHERE au.uuid = $activeUser " +
                        "SET au.profilePic = $s3ImgUri",
                        "activeUser", activeUser, "s3ImgUri", s3ImgUri);
    }
}
