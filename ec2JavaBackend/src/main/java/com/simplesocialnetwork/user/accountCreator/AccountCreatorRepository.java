package com.simplesocialnetwork.user.accountCreator;

import com.simplesocialnetwork.user.models.NewUserForm;

public interface AccountCreatorRepository {
    void createAccount(NewUserForm newUser, String newUuid);
}
