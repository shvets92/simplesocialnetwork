package com.simplesocialnetwork.s3ImageAccess;

import com.simplesocialnetwork.neo4j.Neo4jService;
import com.simplesocialnetwork.util.AccessTokenWorker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.UUID;

@RestController
public class S3AccessController {
    @Autowired
    S3AccessService s3AccessService;
    @Autowired
    AccessTokenWorker accessTokenWorker;
    @Autowired
    Neo4jService neo4jService;

    @RequestMapping(value = "/images", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity saveImage(@RequestParam("image") MultipartFile image,
                                    @RequestHeader("Authorization") String token) {
        String activeUser = accessTokenWorker.getUuidIfValid(token);
        String newUuid = UUID.randomUUID().toString();
        s3AccessService.saveImage(image, newUuid);
        return new ResponseEntity(HttpStatus.OK);
    }

    @RequestMapping(value = "/images/{s3ImgUri}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity getImage(@PathVariable String s3ImgUri, @RequestHeader("Authorization") String token,
                                   @RequestHeader("type") String type) {
        String activeUser = accessTokenWorker.getUuidIfValid(token);
        byte[] imageBytes = s3AccessService.getImage(s3ImgUri);
        return new ResponseEntity(imageBytes, HttpStatus.OK);
    }
}
