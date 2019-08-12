package com.simplesocialnetwork.user.login;

public interface LoginRepository {
    boolean authenticate(String password, byte[] passwordHash, byte[] salt);
}
