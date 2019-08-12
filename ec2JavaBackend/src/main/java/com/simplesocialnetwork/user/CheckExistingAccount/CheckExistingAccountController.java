package com.simplesocialnetwork.user.CheckExistingAccount;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class CheckExistingAccountController {
    @Autowired
    CheckExistingAccountService checkExistingAccountService;

    @RequestMapping(value = "/checkexistingaccount", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity checkExistingAccount(@RequestBody(required = false) String email) {
        if(email == null) {
            return new ResponseEntity(false, HttpStatus.OK);
        }

        return new ResponseEntity(checkExistingAccountService.check(email), HttpStatus.OK);
    }
}
