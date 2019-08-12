package com.simplesocialnetwork.user.accountCreator;

import com.simplesocialnetwork.neo4j.Neo4jService;
import com.simplesocialnetwork.user.models.NewUserForm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
public class AccountCreatorController {
    @Autowired
    AccountCreatorService accountCreatorService;
    @Autowired
    Neo4jService neo4jService;

    @RequestMapping(value = "/users", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity createAccountNew(@RequestBody NewUserForm newUser) {
        try {
            String newUuid = UUID.randomUUID().toString();
            accountCreatorService.createAccount(newUser, newUuid);
            neo4jService.addUser(newUser.getFirstName(), newUser.getLastName(), newUuid);
            return new ResponseEntity(HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
