package com.simplesocialnetwork.s3ImageAccess.impl;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.services.s3.transfer.Download;
import com.amazonaws.services.s3.transfer.TransferManager;
import com.amazonaws.services.s3.transfer.TransferManagerBuilder;
import com.amazonaws.services.s3.transfer.Upload;
import com.amazonaws.services.s3.transfer.model.UploadResult;

import com.simplesocialnetwork.s3ImageAccess.S3AccessRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

@Repository
public class S3AccessRepositoryImpl implements S3AccessRepository {
    @Value("${amazonProperties.bucketName}")
    private String bucketName;

    @Override
    public void saveImage(File image, String s3ImgUri) {
        TransferManager xfer_mgr = TransferManagerBuilder.standard().build();
        try {
            Upload xfer = xfer_mgr.upload(bucketName, s3ImgUri, image);
            UploadResult result = xfer.waitForUploadResult();
            System.out.println(result.toString());
        } catch (AmazonServiceException | InterruptedException e) {
            System.err.println(e.getMessage());
        }
        xfer_mgr.shutdownNow();
    }

    @Override
    public byte[] getImage(String s3ImgUri) {
        File f = new File(s3ImgUri);
        TransferManager xfer_mgr = TransferManagerBuilder.standard().build();
        byte [] imageBytes = null;
        try {
            Download xfer = xfer_mgr.download(bucketName, s3ImgUri, f);
            xfer.waitForCompletion();
            imageBytes = Files.readAllBytes(f.toPath());
        } catch (AmazonServiceException | InterruptedException | IOException e) {
            System.err.println(e.getMessage());
        }
        xfer_mgr.shutdownNow();
        f.delete();
        return imageBytes;
    }
}
