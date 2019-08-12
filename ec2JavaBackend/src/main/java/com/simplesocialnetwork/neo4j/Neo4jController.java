package com.simplesocialnetwork.neo4j;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.simplesocialnetwork.s3ImageAccess.S3AccessService;
import com.simplesocialnetwork.user.UsersRepository;
import com.simplesocialnetwork.user.models.User;
import com.simplesocialnetwork.util.AccessTokenWorker;
import org.json.JSONException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.UUID;

@RestController
public class Neo4jController {
    @Autowired
    Neo4jService neo4jService;
    @Autowired
    AccessTokenWorker accessTokenWorker;
    @Autowired
    UsersRepository usersRepository;
    @Autowired
    S3AccessService s3AccessService;

    @RequestMapping(value = "/users/{targetUser}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity deleteUser(@PathVariable String targetUser, @RequestHeader("Authorization") String token) {
        String activeUser = accessTokenWorker.getUuidIfValid(token);
        if (activeUser.equals(targetUser)) {
            neo4jService.deleteUser(activeUser);
        }
        return new ResponseEntity(HttpStatus.OK);
    }

    @RequestMapping(value = "/users/{targetUser}/update", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity updateActiveUser(@PathVariable String targetUser,
                                           @RequestHeader("Authorization") String token) {
        String activeUser = accessTokenWorker.getUuidIfValid(token);
        if (activeUser.equals(targetUser)) {
            String jsonString = neo4jService.updateActiveUser(activeUser);
            return new ResponseEntity(jsonString, HttpStatus.OK);
        }
        return new ResponseEntity(HttpStatus.OK);
    }

    @RequestMapping(value = "/users/search", method = RequestMethod.GET)
    public ResponseEntity searchUsers(@RequestHeader("searchText") String searchText,
                                      @RequestHeader("searchBy") String searchBy,
                                      @RequestHeader("Authorization") String token) {
        String activeUser = accessTokenWorker.getUuidIfValid(token);
        String jsonString;
        switch (searchBy) {
            case "email":
                if (!usersRepository.existsById(searchText)) {
                    return new ResponseEntity("[]", HttpStatus.OK);
                }
                User user = usersRepository.findById(searchText).get();
                jsonString = neo4jService.getUserPreviewByUuid(user.getUuid(), activeUser);
                return new ResponseEntity(jsonString, HttpStatus.OK);
            case "uuid":
                jsonString = neo4jService.getUserPreviewByUuid(searchText, activeUser);
                return new ResponseEntity(jsonString, HttpStatus.OK);
            case "name":
                String[] searchWords = searchText.split(" ", 2);
                String lastName = "";
                if (searchWords.length > 1) {
                    lastName = searchWords[1];
                }
                jsonString = neo4jService.getUserPreviewByName(searchWords[0], lastName, activeUser);
                return new ResponseEntity(jsonString, HttpStatus.OK);
            default:
                return new ResponseEntity(HttpStatus.BAD_REQUEST);
        }
    }

    @RequestMapping(value = "/users/{targetUser}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity getUserProfile(@PathVariable String targetUser, @RequestHeader("Authorization") String token) {
        String activeUser = accessTokenWorker.getUuidIfValid(token);
        String jsonString = neo4jService.getUserProfile(targetUser, activeUser);
        return new ResponseEntity(jsonString, HttpStatus.OK);
    }

    @RequestMapping(value = "/users/{targetUser}/profile-pic", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity saveNewProfilePicture(@PathVariable String targetUser,
                                                @RequestHeader("Authorization") String token,
                                                @RequestParam("image") MultipartFile image) {
        String activeUser = accessTokenWorker.getUuidIfValid(token);
        if(targetUser.equals(activeUser)) {
            String newUuid = UUID.randomUUID().toString();
            s3AccessService.saveImage(image, newUuid);
            neo4jService.saveNewProfilePicUri(activeUser, newUuid);
            return new ResponseEntity(newUuid, HttpStatus.OK);
        }

        return new ResponseEntity(HttpStatus.OK);

    }

    @RequestMapping(value = {"/users/{targetUser}/friend-requests", "/users/{targetUser}/friend-requests/{requestSender}"},
            method = {RequestMethod.PUT, RequestMethod.POST, RequestMethod.GET, RequestMethod.DELETE})
    @ResponseBody
    public ResponseEntity friendRequestHandler(@PathVariable String targetUser,
                                               @PathVariable(required = false) String requestSender,
                                               @RequestBody(required = false) String response,
                                               @RequestHeader("Authorization") String token,
                                               @RequestHeader(value = "page_size", required = false) String pageSizeString,
                                               @RequestHeader(value = "page_token", required = false) String pageToken,
                                               HttpServletRequest request) {
        String activeUser;
        try {
            activeUser = accessTokenWorker.getUuidIfValid(token);
        } catch (JWTVerificationException e) {
            return new ResponseEntity(HttpStatus.UNAUTHORIZED);
        }
        switch (request.getMethod()) {
            case "PUT"://the active user responds to a request they received
                if (activeUser.equals(targetUser)) {
                    neo4jService.respondToFriendRequest(targetUser, requestSender, response);
                }
                break;
            case "POST"://sends a new friend request
                neo4jService.sendFriendRequest(targetUser, activeUser);
                break;
            case "GET":
                int pageSize = Integer.valueOf(pageSizeString);
                int finalPageSize = pageSize;
                if (pageSize <= 0 || pageSize > 30) {
                    finalPageSize = 10;
                }
                if (activeUser.equals(targetUser)) {
                    String jsonString = neo4jService.getFriendRequestsPage(activeUser, pageToken, finalPageSize);
                    return new ResponseEntity(jsonString, HttpStatus.OK);
                } else {
                    return new ResponseEntity(HttpStatus.FORBIDDEN);
                }
            case "DELETE":
                if (activeUser.equals(requestSender)) {
                    neo4jService.deleteFriendRequest(targetUser, activeUser);
                }
                break;
            default:
                break;
        }
        return new ResponseEntity(HttpStatus.OK);
    }

    @RequestMapping(value = "/users/{targetUser}/friends", method = {RequestMethod.GET, RequestMethod.DELETE})
    @ResponseBody
    public ResponseEntity friendsHandler(@PathVariable String targetUser, @RequestHeader("Authorization") String token,
                                         @RequestHeader(value = "page_size", required = false) String pageSizeString,
                                         @RequestHeader(value = "page_token", required = false) String pageToken,
                                         HttpServletRequest request) {
        String activeUser = accessTokenWorker.getUuidIfValid(token);
        switch (request.getMethod()) {
            case "DELETE":
                neo4jService.unfriend(activeUser, targetUser);
                return new ResponseEntity(HttpStatus.OK);
            case "GET":
                int pageSize = Integer.valueOf(pageSizeString);
                int finalPageSize = pageSize;
                if (pageSize <= 0 || pageSize > 30) {
                    finalPageSize = 10;
                }
                String jsonString = neo4jService.getFriendsPage(targetUser, activeUser, pageToken, finalPageSize);
                return new ResponseEntity(jsonString, HttpStatus.OK);
            default:
                return new ResponseEntity(HttpStatus.OK);
        }
    }

    @RequestMapping(value = "/users/{targetUser}/posts", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity createPostController(@PathVariable String targetUser,
                                               @RequestParam("text") String text,
                                               @RequestParam(value = "image", required = false) MultipartFile image,
                                               @RequestParam("privacyKey") String privacyKey,
                                               @RequestHeader("Authorization") String token) {
        String activeUser;
        try {
            activeUser = accessTokenWorker.getUuidIfValid(token);
        } catch (JWTVerificationException e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }

        String s3ImgUri = "";
        if(image != null) {
            String newUuid = UUID.randomUUID().toString();
            s3AccessService.saveImage(image, newUuid);
            s3ImgUri = newUuid;
        }

        String jsonString = neo4jService.uploadPost(activeUser, text, s3ImgUri, targetUser, privacyKey);
        return new ResponseEntity(jsonString, HttpStatus.OK);
    }

    @RequestMapping(value = "/users/{targetUser}/newsfeed", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity getNewsFeed(@PathVariable String targetUser, @RequestHeader("Authorization") String token,
                                      @RequestHeader("page_token") String pageToken,
                                      @RequestHeader("page_size") int pageSize) {
        String activeUser = accessTokenWorker.getUuidIfValid(token);
        if(!activeUser.equals(targetUser)) {
            return new ResponseEntity(HttpStatus.FORBIDDEN);
        }

        int finalSize = pageSize;
        if(pageSize <= 0 || pageSize > 30) {
            finalSize = 10;
        }
        String jsonString = neo4jService.getNewsFeedPage(activeUser, pageToken, finalSize);
        return new ResponseEntity(jsonString, HttpStatus.OK);
    }

    @RequestMapping(value = "/users/{targetUser}/posts", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity getUserPosts(@PathVariable String targetUser, @RequestHeader("Authorization") String token,
                                       @RequestHeader("page_token") String pageToken,
                                       @RequestHeader("page_size") int pageSize) {
        String activeUser = accessTokenWorker.getUuidIfValid(token);
        int finalSize = pageSize;
        if (pageSize <= 0 || pageSize > 30) {
            finalSize = 10;
        }
        String jsonString = neo4jService.getUserPostsPage(targetUser, activeUser, pageToken, finalSize);
        return new ResponseEntity(jsonString, HttpStatus.OK);
    }

    @RequestMapping(value = "/users/{targetUser}/posts/{targetPost}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity getPost(@PathVariable String targetUser, @PathVariable String targetPost,
                                  @RequestHeader("Authorization") String token) {
        String activeUser = accessTokenWorker.getUuidIfValid(token);
        String jsonString = neo4jService.getPost(targetUser, activeUser, targetPost);
        return new ResponseEntity(jsonString, HttpStatus.OK);
    }

    @RequestMapping(value = "/users/*/posts/{targetPost}/comments", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity createCommentController(@PathVariable String targetPost, @RequestBody String text,
                                                  @RequestHeader("Authorization") String token) {
        String activeUser = accessTokenWorker.getUuidIfValid(token);
        String jsonString = neo4jService.uploadComment(activeUser, text, targetPost);
        return new ResponseEntity(jsonString, HttpStatus.OK);
    }

    @RequestMapping(value = "/users/{targetUser}/posts/{targetPost}/comments", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity getPostComments(@PathVariable String targetPost, @PathVariable String targetUser,
                                          @RequestHeader("Authorization") String token,
                                          @RequestHeader("page_token") String pageToken,
                                          @RequestHeader("page_size") int pageSize) {
        String activeUser = accessTokenWorker.getUuidIfValid(token);
        int finalSize = pageSize;
        if (pageSize <= 0 || pageSize > 30) {
            finalSize = 10;
        }
        String jsonString = neo4jService.getPostCommentsPage(activeUser, targetUser, targetPost, pageToken, finalSize);
        return new ResponseEntity(jsonString, HttpStatus.OK);
    }

    @RequestMapping(value = {"/users/*/posts/{target}/likes", "/users/*/posts/*/comments/{target}/likes"},
            method = {RequestMethod.POST, RequestMethod.DELETE})
    @ResponseBody
    public void likeController(@PathVariable String target, @RequestHeader("Authorization") String token,
                               HttpServletRequest request) {
        String activeUser = accessTokenWorker.getUuidIfValid(token);
        switch (request.getMethod()) {
            case "POST":
                neo4jService.like(target, activeUser);
                break;
            case "DELETE":
                neo4jService.unlike(target, activeUser);
                break;
        }
    }

    @RequestMapping(value = "/users/*/posts/{target}/flags", method = RequestMethod.POST)
    @ResponseBody
    public void flagController(@PathVariable String target, @RequestHeader("Authorization") String token) {
        String activeUser = accessTokenWorker.getUuidIfValid(token);
        neo4jService.flag(target, activeUser);
    }

    @RequestMapping(value = "/users/{targetUser}/bio", method = RequestMethod.POST)
    @ResponseBody
    public void updateBioController(@PathVariable String targetUser, @RequestHeader("Authorization") String token,
                                    @RequestBody String newBio) {
        String activeUser = accessTokenWorker.getUuidIfValid(token);
        String safeBioText = newBio;
        if(newBio.length() > 500) {
            safeBioText = newBio.substring(0, 500);
        }
        if(targetUser.equals(activeUser)) {
            neo4jService.updateUserBio(activeUser, safeBioText);
        }
    }

    @RequestMapping(value = "/users/{targetUser}/notifications", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity getNotifications(@PathVariable String targetUser,
                                           @RequestHeader("Authorization") String token,
                                           @RequestHeader("page_token") String pageToken,
                                           @RequestHeader("page_size") int pageSize) {
        String activeUser = accessTokenWorker.getUuidIfValid(token);
        if(targetUser.equals(activeUser)) {
            String jsonString = null;
            try {
                jsonString = neo4jService.getNotifications(activeUser, pageToken, pageSize);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return new ResponseEntity(jsonString, HttpStatus.OK);
        }

        return new ResponseEntity(HttpStatus.OK);
    }
}




















