package com.simplesocialnetwork.user.login.impl;

import com.simplesocialnetwork.user.login.LoginRepository;
import com.simplesocialnetwork.util.AccountPasswordWorker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

@Repository
public class LoginRepositoryImpl implements LoginRepository {
    @Autowired
    AccountPasswordWorker accountPasswordWorker;

    @Override
    public boolean authenticate(String password, byte[] passwordHash, byte[] salt) {
        return accountPasswordWorker.checkPassword(password, passwordHash, salt);
    }
}
