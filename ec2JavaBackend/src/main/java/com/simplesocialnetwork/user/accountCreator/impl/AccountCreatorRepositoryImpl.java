package com.simplesocialnetwork.user.accountCreator.impl;

import com.simplesocialnetwork.user.UsersRepository;
import com.simplesocialnetwork.user.accountCreator.AccountCreatorRepository;
import com.simplesocialnetwork.user.models.NewUserForm;
import com.simplesocialnetwork.user.models.User;
import com.simplesocialnetwork.util.AccountPasswordWorker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Map;

@Repository
public class AccountCreatorRepositoryImpl implements AccountCreatorRepository {
    @Autowired
    UsersRepository usersRepository;
    @Autowired
    AccountPasswordWorker accountPasswordWorker;

    Map<String, byte[]> userInfo;

    public void createAccount(NewUserForm newUser, String newUuid) {
        userInfo = accountPasswordWorker.hash(newUser.getPassword());
        this.usersRepository.save(new User(newUser, userInfo.get("hashedPassword"), userInfo.get("salt"), newUuid));
    }
}
