package com.example.event.ui.notifications;

import android.app.AlertDialog;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.event.MainActivity;
import com.example.event.R;
import com.example.event.data.LoginRepository;
import com.example.event.data.Notification;
import com.example.event.data.NotificationDataSource;
import com.example.event.data.Result;
import com.example.event.data.TokenManager;
import com.example.event.databinding.FragmentNotificationsBinding;

import java.util.ArrayList;
import java.util.List;

public class NotificationsFragment extends Fragment implements NotificationAdapter.OnNotificationActionListener {

    private static final String TAG = "NotificationsFragment";
    private FragmentNotificationsBinding binding;
    private RecyclerView recyclerView;
    private TextView emptyView;
    private NotificationAdapter adapter;
    private List<Notification> notifications = new ArrayList<>();

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        Log.d(TAG, "onCreateView called");
        NotificationsViewModel notificationsViewModel =
                new ViewModelProvider(this).get(NotificationsViewModel.class);

        binding = FragmentNotificationsBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        recyclerView = root.findViewById(R.id.recycler_notifications);
        emptyView = root.findViewById(R.id.text_empty_notifications);

        setupRecyclerView();
        loadNotifications();

        Log.d(TAG, "onCreateView completed");
        return root;
    }

    private void setupRecyclerView() {
        Log.d(TAG, "setupRecyclerView called");
        adapter = new NotificationAdapter(getContext(), notifications, this);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerView.setAdapter(adapter);
        Log.d(TAG, "RecyclerView setup completed");
    }

    private void loadNotifications() {
        Log.d(TAG, "loadNotifications called");
        
        // Check if user is logged in
        if (LoginRepository.getInstance().getLoggedInUser() == null) {
            Log.w(TAG, "User not logged in, showing empty state");
            showEmptyState();
            return;
        }
        
        String accessToken = TokenManager.getAccessToken();
        if (accessToken != null) {
            Log.d(TAG, "Access token found, starting LoadNotificationsTask");
            new LoadNotificationsTask().execute();
        } else {
            Log.w(TAG, "No access token found, showing empty state");
            showEmptyState();
        }
    }

    private void showEmptyState() {
        Log.d(TAG, "showEmptyState called");
        recyclerView.setVisibility(View.GONE);
        emptyView.setVisibility(View.VISIBLE);
    }

    private void showNotifications() {
        Log.d(TAG, "showNotifications called");
        recyclerView.setVisibility(View.VISIBLE);
        emptyView.setVisibility(View.GONE);
    }

    @Override
    public void onDeleteNotification(Notification notification) {
        Log.d(TAG, "onDeleteNotification called for notification: " + notification.id);
        new AlertDialog.Builder(getContext())
                .setTitle("Usuń powiadomienie")
                .setMessage(R.string.notification_delete_confirm)
                .setPositiveButton("Usuń", (dialog, which) -> deleteNotification(notification))
                .setNegativeButton("Anuluj", null)
                .show();
    }

    private void deleteNotification(Notification notification) {
        Log.d(TAG, "deleteNotification called for notification: " + notification.id);
        new DeleteNotificationTask(notification).execute();
    }

    private class LoadNotificationsTask extends AsyncTask<Void, Void, Result<List<Notification>>> {
        @Override
        protected Result<List<Notification>> doInBackground(Void... voids) {
            Log.d(TAG, "LoadNotificationsTask doInBackground started");
            NotificationDataSource dataSource = new NotificationDataSource();
            String token = TokenManager.getAccessToken();
            Log.d(TAG, "Using access token: " + (token != null ? "present" : "null"));
            Result<List<Notification>> result = dataSource.getNotifications(token);
            Log.d(TAG, "LoadNotificationsTask doInBackground completed with result: " + 
                  (result instanceof Result.Success ? "Success" : "Error"));
            return result;
        }

        @Override
        protected void onPostExecute(Result<List<Notification>> result) {
            Log.d(TAG, "LoadNotificationsTask onPostExecute called");
            if (result instanceof Result.Success) {
                List<Notification> fetchedNotifications = ((Result.Success<List<Notification>>) result).getData();
                Log.d(TAG, "Successfully loaded " + fetchedNotifications.size() + " notifications");
                notifications.clear();
                notifications.addAll(fetchedNotifications);
                adapter.notifyDataSetChanged();

                if (notifications.isEmpty()) {
                    Log.d(TAG, "No notifications to display, showing empty state");
                    showEmptyState();
                } else {
                    Log.d(TAG, "Displaying " + notifications.size() + " notifications");
                    showNotifications();
                }
                
                // Mark all notifications as seen when user enters the screen
                markAllNotificationsAsSeen();
            } else {
                Log.e(TAG, "Failed to load notifications: " + 
                      (result instanceof Result.Error ? ((Result.Error) result).getError().getMessage() : "Unknown error"));
                showEmptyState();
            }
        }
    }
    
    private void markAllNotificationsAsSeen() {
        Log.d(TAG, "markAllNotificationsAsSeen called");
        String token = TokenManager.getAccessToken();
        if (token == null) return;
        
        for (Notification notification : notifications) {
            if (!notification.isRead) {
                new MarkAsSeenTask(notification.id).execute();
            }
        }
    }
    
    private class MarkAsSeenTask extends AsyncTask<Void, Void, Result<Void>> {
        private final String notificationId;

        public MarkAsSeenTask(String notificationId) {
            this.notificationId = notificationId;
        }

        @Override
        protected Result<Void> doInBackground(Void... voids) {
            Log.d(TAG, "MarkAsSeenTask doInBackground started for notification: " + notificationId);
            NotificationDataSource dataSource = new NotificationDataSource();
            String token = TokenManager.getAccessToken();
            return dataSource.markNotificationAsSeen(token, notificationId);
        }

        @Override
        protected void onPostExecute(Result<Void> result) {
            if (result instanceof Result.Success) {
                Log.d(TAG, "Notification marked as seen: " + notificationId);
                // Don't update local notification state immediately - let it stay visible until next reload
                
                // Update badge in MainActivity after marking as seen
                if (getActivity() instanceof MainActivity) {
                    ((MainActivity) getActivity()).runOnUiThread(() -> {
                        // Trigger badge update
                        ((MainActivity) getActivity()).updateNotificationBadgeFromFragment();
                    });
                }
            } else {
                Log.e(TAG, "Failed to mark notification as seen: " + notificationId);
            }
        }
    }

    private class DeleteNotificationTask extends AsyncTask<Void, Void, Result<Void>> {
        private final Notification notification;

        public DeleteNotificationTask(Notification notification) {
            this.notification = notification;
        }

        @Override
        protected Result<Void> doInBackground(Void... voids) {
            Log.d(TAG, "DeleteNotificationTask doInBackground started for notification: " + notification.id);
            NotificationDataSource dataSource = new NotificationDataSource();
            String token = TokenManager.getAccessToken();
            Result<Void> result = dataSource.deleteNotification(token, notification.id);
            Log.d(TAG, "DeleteNotificationTask doInBackground completed with result: " + 
                  (result instanceof Result.Success ? "Success" : "Error"));
            return result;
        }

        @Override
        protected void onPostExecute(Result<Void> result) {
            Log.d(TAG, "DeleteNotificationTask onPostExecute called");
            if (result instanceof Result.Success) {
                Log.d(TAG, "Notification deleted successfully: " + notification.id);
                notifications.remove(notification);
                adapter.notifyDataSetChanged();

                if (notifications.isEmpty()) {
                    showEmptyState();
                }

                Toast.makeText(getContext(), R.string.notification_deleted, Toast.LENGTH_SHORT).show();
            } else {
                Log.e(TAG, "Failed to delete notification: " + notification.id + 
                      ", error: " + (result instanceof Result.Error ? ((Result.Error) result).getError().getMessage() : "Unknown error"));
                Toast.makeText(getContext(), R.string.notification_delete_failed, Toast.LENGTH_SHORT).show();
            }
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}