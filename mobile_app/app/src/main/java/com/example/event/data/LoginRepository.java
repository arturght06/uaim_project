package com.example.event.data;

import com.example.event.data.model.LoggedInUser;

public class LoginRepository {

    private static volatile LoginRepository instance;

    private LoginDataSource dataSource;

    // user object is now more detailed
    private LoggedInUser user = null;

    private LoginRepository(LoginDataSource dataSource) {
        this.dataSource = dataSource;
    }

    public static LoginRepository getInstance(LoginDataSource dataSource) {
        if (instance == null) {
            if (dataSource == null) {
                throw new IllegalArgumentException("LoginDataSource cannot be null on first initialization");
            }
            instance = new LoginRepository(dataSource);
        }
        return instance;
    }

    public static LoginRepository getInstance() {
        if (instance == null) {
            throw new IllegalStateException("LoginRepository is not initialized. Call getInstance(LoginDataSource) first.");
        }
        return instance;
    }

    public boolean isLoggedIn() {
        return user != null;
    }

    public void logout() {
        user = null;
        dataSource.logout();
    }

    private void setLoggedInUser(LoggedInUser user) {
        this.user = user;
    }

    public void updateLoggedInUserDetails(String firstName, String lastName, String email, String birthDate, String countryCode, String phoneNumber, String username) {
        if (this.user != null) {
            this.user.setUserDetails(firstName, lastName, email, birthDate, countryCode, phoneNumber);
        }
    }

    public Result<LoggedInUser> login(String username, String password) {
        Result<LoggedInUser> result = dataSource.login(username, password);
        if (result instanceof Result.Success) {
            setLoggedInUser(((Result.Success<LoggedInUser>) result).getData());
        }
        return result;
    }

    public LoggedInUser getLoggedInUser() {
        return this.user;
    }
}