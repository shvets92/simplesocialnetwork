package com.simplesocialnetwork.user;

import com.simplesocialnetwork.user.models.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsersRepository extends CrudRepository<User, String> {
}
