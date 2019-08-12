package com.simplesocialnetwork.user.login;

import com.simplesocialnetwork.neo4j.Neo4jService;
import com.simplesocialnetwork.user.UserFormValidator;
import com.simplesocialnetwork.user.models.LoginUserForm;
import com.simplesocialnetwork.user.models.User;
import com.simplesocialnetwork.util.AccessTokenWorker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LoginController {
    @Autowired
    LoginService loginService;
    @Autowired
    UserFormValidator userFormValidator;
    @Autowired
    AccessTokenWorker accessTokenWorker;
    @Autowired
    Neo4jService neo4jService;

    @RequestMapping("/users/login")
    @ResponseBody
    public ResponseEntity login(@RequestBody LoginUserForm userLogin) {
        try {
            userFormValidator.validateForm(userLogin);
            User user = loginService.authenticateAccountAndReturnUser(userLogin.getEmail(), userLogin.getPassword());
            String jwt = accessTokenWorker.createJWT(user);
            String profilePic = neo4jService.getProfilePic(user.getUuid());

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(jwt);
            headers.add("profilePic", profilePic);
            return new ResponseEntity("Login Successful", headers, HttpStatus.OK);
        } catch (Exception e) {
            switch (e.getMessage()) {
                case "Email not found":
                    return new ResponseEntity("Email not found", HttpStatus.NOT_FOUND);
                case "Invalid Password":
                    return new ResponseEntity("Invalid Password", HttpStatus.UNAUTHORIZED);
                case "There was an error with one of the fields in the user form":
                    return new ResponseEntity(e.getMessage(), HttpStatus.BAD_REQUEST);
                default:
                    return new ResponseEntity("Error", HttpStatus.BAD_REQUEST);
            }
        }
    }
}
