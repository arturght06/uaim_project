package com.example.event.ui.user;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

public class UserViewModel extends ViewModel { // zmiana nazwy klasy

    private final MutableLiveData<String> mText;

    public UserViewModel() {
        mText = new MutableLiveData<>();
        mText.setValue("To jest strona użytkownika"); // zmiana tekstu
    }

    public LiveData<String> getText() {
        return mText;
    }
}
