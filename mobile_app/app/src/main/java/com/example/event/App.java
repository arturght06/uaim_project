package com.example.event;

import android.app.Application;
import android.content.Context;

public class App extends Application {

    private static App instance;

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
    }

    public static Context getContext() {
        if (instance == null) {
            throw new IllegalStateException("App.instance is null! Upewnij się, że App jest zadeklarowany w AndroidManifest.xml jako <application android:name=\".App\" ...>");
        }
        return instance.getApplicationContext();
    }
}
