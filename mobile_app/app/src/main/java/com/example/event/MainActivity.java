package com.example.event;

import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.View;

import com.example.event.data.LoginRepository;
import com.example.event.data.Notification;
import com.example.event.data.NotificationDataSource;
import com.example.event.data.Result;
import com.example.event.data.TokenManager;
import com.google.android.material.badge.BadgeDrawable;
import com.google.android.material.bottomnavigation.BottomNavigationView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.navigation.ui.AppBarConfiguration;
import androidx.navigation.ui.NavigationUI;

import com.example.event.data.LoginDataSource;
import com.example.event.databinding.ActivityMainBinding;

import java.util.List;

public class MainActivity extends AppCompatActivity {

    private static android.content.Context appContext;
    private ActivityMainBinding binding;
    private BottomNavigationView navView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        appContext = getApplicationContext();

        LoginRepository.getInstance(new LoginDataSource());

        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        navView = binding.navView;

        // Passing each menu ID as a set of Ids because each
        // menu should be considered as top level destinations.
        AppBarConfiguration appBarConfiguration = new AppBarConfiguration.Builder(
                R.id.navigation_home, R.id.navigation_user, R.id.navigation_notifications)
                .build();
        NavController navController = Navigation.findNavController(this, R.id.nav_host_fragment_activity_main);
        NavigationUI.setupActionBarWithNavController(this, navController, appBarConfiguration);
        NavigationUI.setupWithNavController(binding.navView, navController);

        // Update notification badge when fragment changes
        navController.addOnDestinationChangedListener((controller, destination, arguments) -> {
            if (destination.getId() == R.id.navigation_notifications) {
                // Clear badge when user visits notifications
                clearNotificationBadge();
            } else {
                // Update badge count when navigating away from notifications
                updateNotificationBadge();
            }
        });

        updateNotificationBadge();
    }

    public static android.content.Context getAppContext() {
        return appContext;
    }

    @Override
    public boolean onSupportNavigateUp() {
        NavController navController = Navigation.findNavController(this, R.id.nav_host_fragment_activity_main);
        return NavigationUI.navigateUp(navController, new AppBarConfiguration.Builder(
                R.id.navigation_home, R.id.navigation_user, R.id.navigation_notifications
        ).build()) || super.onSupportNavigateUp();
    }

    @Override
    protected void onResume() {
        super.onResume();
        updateNotificationBadge();
    }

    public void updateNotificationBadgeFromFragment() {
        updateNotificationBadge();
    }

    private void updateNotificationBadge() {
        if (TokenManager.getAccessToken() != null && LoginRepository.getInstance().getLoggedInUser() != null) {
            new LoadNotificationCountTask().execute();
        } else {
            clearNotificationBadge();
        }
    }

    private void clearNotificationBadge() {
        BadgeDrawable badge = navView.getBadge(R.id.navigation_notifications);
        if (badge != null) {
            badge.setVisible(false);
        }
    }

    private void showNotificationBadge(int count) {
        if (count > 0) {
            BadgeDrawable badge = navView.getOrCreateBadge(R.id.navigation_notifications);
            badge.setNumber(count);
            badge.setVisible(true);
            badge.setBackgroundColor(getResources().getColor(R.color.badge_color));
        } else {
            clearNotificationBadge();
        }
    }

    private class LoadNotificationCountTask extends AsyncTask<Void, Void, Result<List<Notification>>> {
        @Override
        protected Result<List<Notification>> doInBackground(Void... voids) {
            NotificationDataSource dataSource = new NotificationDataSource();
            String accessToken = TokenManager.getAccessToken();
            return dataSource.getNotificationsForBadge(accessToken);
        }

        @Override
        protected void onPostExecute(Result<List<Notification>> result) {
            if (result instanceof Result.Success) {
                List<Notification> notifications = ((Result.Success<List<Notification>>) result).getData();
                int unreadCount = 0;
                for (Notification notification : notifications) {
                    if (!notification.isRead) {
                        unreadCount++;
                    }
                }
                showNotificationBadge(unreadCount);
            } else {
                clearNotificationBadge();
            }
        }
    }
}