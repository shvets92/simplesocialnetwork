package com.simplesocialnetwork.user;

import com.simplesocialnetwork.user.CheckExistingAccount.CheckExistingAccountService;
import com.simplesocialnetwork.user.models.LoginUserForm;
import com.simplesocialnetwork.user.models.NewUserForm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class UserFormValidator {
    private static final Pattern emailRegexPattern = Pattern.compile("^(([^<>()\\[\\]\\\\.,;:\\s@\"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@\"]+)*)|(\".+\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$");

    @Autowired
    CheckExistingAccountService checkExistingAccountService;

    UserFormValidator() {
    }

    private static boolean validateEmail(String email) {
        return emailRegexPattern.matcher(email).find() && email.length() < 200;
    }

    private static boolean validatePassword(String password) {
        return password.length() >= 8;
    }

    private static boolean validateNames(String name) {
        return name.length() > 1;
    }

    public void validateForm(NewUserForm newUser) throws Exception {
        if (!(validateEmail(newUser.getEmail()) && (!checkExistingAccountService.check(newUser.getEmail()))
                && validatePassword(newUser.getPassword()) && validateNames(newUser.getFirstName())
                && validateNames(newUser.getLastName()))) {
            throw new Exception("There was an error with one of the fields in the user form");
        }
    }

    public boolean validateForm(LoginUserForm user) {
        return validateEmail(user.getEmail()) && checkExistingAccountService.check(user.getEmail());
    }
}
