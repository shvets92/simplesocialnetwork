package com.simplesocialnetwork.s3ImageAccess;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

@Service
public class S3AccessService {
    @Autowired
    S3AccessRepository s3AccessRepository;

    private File convertMultiPartToFile(MultipartFile file) throws IOException {
        String name = file.getOriginalFilename();
        File convFile = new File(name);
        FileOutputStream fos = new FileOutputStream(convFile);
        fos.write(file.getBytes());
        fos.close();
        return convFile;
    }

    public void saveImage(MultipartFile image, String s3ImgUri) {
        try {
            s3AccessRepository.saveImage(convertMultiPartToFile(image), s3ImgUri);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public byte[] getImage(String s3ImgUri) {

        return s3AccessRepository.getImage(s3ImgUri);
    }

}
