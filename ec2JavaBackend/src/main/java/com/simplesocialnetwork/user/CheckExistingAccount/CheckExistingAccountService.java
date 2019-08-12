package com.simplesocialnetwork.user.CheckExistingAccount;

import com.simplesocialnetwork.user.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CheckExistingAccountService {
    @Autowired
    UsersRepository usersRepository;

    public boolean check(String email) {
        return usersRepository.existsById(email);
    }
}
