package com.simplesocialnetwork.util;

import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Component
public class AccountPasswordWorker {
    private final int iterations = 12048;
    private final int derivedKeyLength = 256;
    private byte[] salt;
    private SecretKeyFactory factory;
    private SecretKey key;

    public AccountPasswordWorker() {
    }

    public Map<String, byte[]> hash(String password) {
        salt = new byte[128];
        new SecureRandom().nextBytes(salt);
        createSecretKey(password, salt);
        Map<String, byte[]> userInfo = new HashMap<String, byte[]>();
        userInfo.put("hashedPassword", key.getEncoded());
        userInfo.put("salt", salt);
        return userInfo;
    }

    public boolean checkPassword(String password, byte[] passwordHash, byte[] saltInput) {
        createSecretKey(password, saltInput);
        return Arrays.equals(passwordHash, key.getEncoded());
    }

    private void createSecretKey(String password, byte[] saltInput) {
        KeySpec spec = new PBEKeySpec(password.toCharArray(), saltInput, iterations, derivedKeyLength * 8);
        try {
            factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            key = factory.generateSecret(spec);
        } catch (InvalidKeySpecException | NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
    }
}
