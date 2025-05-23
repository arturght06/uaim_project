package com.example.event.data;

import android.content.Context;
import android.content.SharedPreferences;

import com.example.event.App;

public class TokenManager {

    private static final String PREF_NAME = "auth_tokens";
    private static final String ACCESS_TOKEN_KEY = "access_token";
    private static final String REFRESH_TOKEN_KEY = "refresh_token";

    private static SharedPreferences getPreferences(Context context) {
        return context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    public static void saveTokens(String accessToken, String refreshToken) {
        SharedPreferences.Editor editor = getPreferences(App.getContext()).edit();
        editor.putString(ACCESS_TOKEN_KEY, accessToken);
        editor.putString(REFRESH_TOKEN_KEY, refreshToken);
        editor.apply();
    }

    public static String getAccessToken() {
        return getPreferences(App.getContext()).getString(ACCESS_TOKEN_KEY, null);
    }

    public static String getRefreshToken() {
        return getPreferences(App.getContext()).getString(REFRESH_TOKEN_KEY, null);
    }

    public static void clearTokens() {
        SharedPreferences.Editor editor = getPreferences(App.getContext()).edit();
        editor.remove(ACCESS_TOKEN_KEY);
        editor.remove(REFRESH_TOKEN_KEY);
        editor.apply();
    }
}
