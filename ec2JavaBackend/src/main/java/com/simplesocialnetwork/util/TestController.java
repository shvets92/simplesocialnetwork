package com.simplesocialnetwork.util;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    @RequestMapping("/test")
    public ResponseEntity tester() {
        return new ResponseEntity("Success", HttpStatus.OK);
    }
}


