package com.example.event.ui.login;

import androidx.lifecycle.ViewModel;
import androidx.lifecycle.ViewModelProvider;
import androidx.annotation.NonNull;

import com.example.event.data.LoginDataSource;
import com.example.event.data.LoginRepository;

/**
 * ViewModel provider factory to instantiate LoginViewModel.
 * Required given LoginViewModel has a non-empty constructor
 */
public class LoginViewModelFactory implements ViewModelProvider.Factory {

    @NonNull
    @Override
    @SuppressWarnings("unchecked")
    public <T extends ViewModel> T create(@NonNull Class<T> modelClass) {
        if (modelClass.isAssignableFrom(LoginViewModel.class)) {
            // Zawsze inicjalizuj singleton z LoginDataSource przy pierwszym użyciu
            return (T) new LoginViewModel(LoginRepository.getInstance(new LoginDataSource()));
        }
        throw new IllegalArgumentException("Unknown ViewModel class");
    }
}