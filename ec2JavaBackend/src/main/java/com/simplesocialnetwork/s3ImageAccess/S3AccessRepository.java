package com.simplesocialnetwork.s3ImageAccess;

import java.io.File;

public interface S3AccessRepository {
    void saveImage(File image, String s3ImgUri);

    byte[] getImage(String s3ImgUri);
}
