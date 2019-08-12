package com.simplesocialnetwork.user.login;

import com.simplesocialnetwork.user.UsersRepository;
import com.simplesocialnetwork.user.models.User;
import com.simplesocialnetwork.util.AccessTokenWorker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LoginService {
    @Autowired
    UsersRepository usersRepository;
    @Autowired
    LoginRepository loginRepository;
    @Autowired
    AccessTokenWorker accessTokenWorker;

    public User authenticateAccountAndReturnUser(String email, String password) throws Exception {
        if (!usersRepository.existsById(email)) {
            throw new Exception("Email not found");
        }

        User user = usersRepository.findById(email).get();
        if (!loginRepository.authenticate(password, user.getPasswordHash(), user.getSalt())) {
            throw new Exception("Invalid Password");
        }
        return user;
    }
}
