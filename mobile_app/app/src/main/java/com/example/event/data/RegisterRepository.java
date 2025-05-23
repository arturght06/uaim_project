package com.example.event.data;

public class RegisterRepository {

    private static volatile RegisterRepository instance;
    private RegisterDataSource dataSource;

    private RegisterRepository(RegisterDataSource dataSource) {
        this.dataSource = dataSource;
    }

    public static RegisterRepository getInstance(RegisterDataSource dataSource) {
        if (instance == null) {
            instance = new RegisterRepository(dataSource);
        }
        return instance;
    }

    public Result<Void> register(String username, String firstName, String lastName, String birthDate, String email, String countryCode, String phoneNumber, String password, String confirmPassword) {
        return dataSource.register(username, firstName, lastName, birthDate, email, countryCode, phoneNumber, password, confirmPassword);
    }
}
