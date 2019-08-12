package com.simplesocialnetwork.user.accountCreator;

import com.simplesocialnetwork.user.UserFormValidator;
import com.simplesocialnetwork.user.models.NewUserForm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AccountCreatorService {
    @Autowired
    AccountCreatorRepository accountCreatorRepository;
    @Autowired
    UserFormValidator userFormValidator;

    /**
     * Creates an entry in the database for the new user.
     *
     * @param newUser The user object with the information for the new account.
     */
    public void createAccount(NewUserForm newUser, String newUuid) throws Exception {
        try {
            userFormValidator.validateForm(newUser);
        } catch (Exception e) {
            throw e;
        }
        accountCreatorRepository.createAccount(newUser, newUuid);
    }
}