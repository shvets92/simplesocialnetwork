package com.simplesocialnetwork.user.models;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity(name = "users")
@Table(name = "users")
public class User {
    @Id
    @Column(name = "email")
    private String email;
    @Column(name = "first_name")
    private String firstName;
    @Column(name = "last_name")
    private String lastName;
    @Column(name = "password_hash")
    private byte[] passwordHash;
    @Column(name = "role")
    private String role;
    @Column(name = "salt")
    private byte[] salt;
    @Column(name = "uuid")
    private String uuid;

    public User() {
    }

    public User(String email, String firstName, String lastName, byte[] passwordHash, String role, byte[] salt, String uuid) {
        this.email = email.toLowerCase();
        this.firstName = firstName.toLowerCase();
        this.lastName = lastName.toLowerCase();
        this.passwordHash = passwordHash;
        this.role = role;
        this.salt = salt;
        this.uuid = uuid;
    }

    public User(NewUserForm newUser, byte[] passwordHash, byte[] salt, String uuid) {
        this.email = newUser.getEmail().toLowerCase();
        this.firstName = newUser.getFirstName().toLowerCase();
        this.lastName = newUser.getLastName().toLowerCase();
        this.passwordHash = passwordHash;
        this.salt = salt;
        this.role = "USER";
        this.uuid = uuid;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName.toLowerCase();
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName.toLowerCase();
    }

    public byte[] getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(byte[] passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email.toLowerCase();
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public byte[] getSalt() {
        return salt;
    }

    public void setSalt(byte[] salt) {
        this.salt = salt;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }
}
