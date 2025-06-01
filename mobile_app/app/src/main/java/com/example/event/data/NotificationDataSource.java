package com.example.event.data;

import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public class NotificationDataSource {

    private static final String TAG = "NotificationDataSource";

    public Result<List<Notification>> getNotifications(String token) {
        return getNotifications(token, false);
    }
    
    public Result<List<Notification>> getNotificationsForBadge(String token) {
        return getNotifications(token, false);
    }
    
    private Result<List<Notification>> getNotifications(String token, boolean markAsSeen) {
        Log.d(TAG, "getNotifications called with token: " + (token != null ? "present" : "null") + ", markAsSeen: " + markAsSeen);
        
        // Get user ID from LoginRepository
        if (LoginRepository.getInstance().getLoggedInUser() == null) {
            Log.w(TAG, "User not logged in, returning empty notifications");
            return new Result.Success<>(new ArrayList<>());
        }
        
        String userId = LoginRepository.getInstance().getLoggedInUser().getUserId();
        
        try {
            URL url = new URL(ApiConfig.BASE_URL + "api/notifications/user/" + userId);
            Log.d(TAG, "Making request to URL: " + url.toString());
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Authorization", "Bearer " + token);
            Log.d(TAG, "Authorization header set with Bearer token");

            int responseCode = conn.getResponseCode();
            Log.d(TAG, "HTTP response code: " + responseCode);
            
            BufferedReader in = new BufferedReader(new InputStreamReader(
                    responseCode == HttpURLConnection.HTTP_OK ? conn.getInputStream() : conn.getErrorStream()));
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = in.readLine()) != null) {
                response.append(line);
            }
            in.close();
            
            String responseBody = response.toString();
            Log.d(TAG, "Response body: " + responseBody);

            if (responseCode == HttpURLConnection.HTTP_OK) {
                List<Notification> notifications = new ArrayList<>();
                JSONArray jsonArray = new JSONArray(responseBody);
                Log.d(TAG, "Parsed JSON array with " + jsonArray.length() + " items");
                
                for (int i = 0; i < jsonArray.length(); i++) {
                    JSONObject notificationJson = jsonArray.getJSONObject(i);
                    Log.d(TAG, "Processing notification " + i + ": " + notificationJson.toString());
                    
                    String status = notificationJson.optString("status", "pending");
                    boolean isRead = !"sent".equals(status); // Only show as unread if status is "sent"
                    
                    Notification notification = new Notification(
                        notificationJson.optString("id", ""),
                        notificationJson.optString("title", "No title"),
                        notificationJson.optString("content", "No message"),
                        notificationJson.optString("created_at", ""),
                        isRead,
                        notificationJson.optString("type", "info")
                    );
                    notifications.add(notification);
                    Log.d(TAG, "Added notification: " + notification.title);
                }
                
                Log.d(TAG, "Successfully processed " + notifications.size() + " notifications");
                return new Result.Success<>(notifications);
            } else {
                Log.e(TAG, "HTTP error response: " + responseCode + ", body: " + responseBody);
                return new Result.Error(new Exception("Failed to load notifications: HTTP " + responseCode));
            }
        } catch (Exception e) {
            Log.e(TAG, "Error fetching notifications", e);
            return new Result.Error(e);
        }
    }

    public Result<Void> deleteNotification(String token, String notificationId) {
        Log.d(TAG, "deleteNotification called for ID: " + notificationId);
        try {
            URL url = new URL(ApiConfig.BASE_URL + "api/notifications/" + notificationId);
            Log.d(TAG, "Making DELETE request to URL: " + url.toString());
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("DELETE");
            conn.setRequestProperty("Authorization", "Bearer " + token);

            int responseCode = conn.getResponseCode();
            Log.d(TAG, "DELETE response code: " + responseCode);
            
            if (responseCode == HttpURLConnection.HTTP_OK || responseCode == HttpURLConnection.HTTP_NO_CONTENT) {
                Log.d(TAG, "Notification deleted successfully");
                return new Result.Success<>(null);
            } else {
                Log.e(TAG, "Failed to delete notification, HTTP: " + responseCode);
                return new Result.Error(new Exception("Failed to delete notification: HTTP " + responseCode));
            }
        } catch (Exception e) {
            Log.e(TAG, "Error deleting notification", e);
            return new Result.Error(e);
        }
    }

    public Result<Void> markNotificationAsSeen(String token, String notificationId) {
        Log.d(TAG, "markNotificationAsSeen called for ID: " + notificationId);
        try {
            URL url = new URL(ApiConfig.BASE_URL + "api/notifications/" + notificationId + "/seen");
            Log.d(TAG, "Making PUT request to URL: " + url.toString());
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("PUT");
            conn.setRequestProperty("Authorization", "Bearer " + token);

            int responseCode = conn.getResponseCode();
            Log.d(TAG, "PUT seen response code: " + responseCode);
            
            if (responseCode == HttpURLConnection.HTTP_OK || responseCode == HttpURLConnection.HTTP_NO_CONTENT) {
                Log.d(TAG, "Notification marked as seen successfully");
                return new Result.Success<>(null);
            } else {
                Log.e(TAG, "Failed to mark notification as seen, HTTP: " + responseCode);
                return new Result.Error(new Exception("Failed to mark notification as seen: HTTP " + responseCode));
            }
        } catch (Exception e) {
            Log.e(TAG, "Error marking notification as seen", e);
            return new Result.Error(e);
        }
    }
}
