package com.simplesocialnetwork.user.models;

public class LoginUserForm {
    private String email;
    private String password;

    LoginUserForm() {
    }

    LoginUserForm(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email.toLowerCase();
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
