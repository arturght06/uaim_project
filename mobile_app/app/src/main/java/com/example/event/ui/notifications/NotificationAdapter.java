package com.example.event.ui.notifications;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.event.R;
import com.example.event.data.Notification;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class NotificationAdapter extends RecyclerView.Adapter<NotificationAdapter.ViewHolder> {

    public interface OnNotificationActionListener {
        void onDeleteNotification(Notification notification);
    }

    private final Context context;
    private final List<Notification> notifications;
    private final OnNotificationActionListener listener;

    public NotificationAdapter(Context context, List<Notification> notifications, OnNotificationActionListener listener) {
        this.context = context;
        this.notifications = notifications;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_notification, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Notification notification = notifications.get(position);

        holder.titleView.setText(notification.title);
        holder.messageView.setText(notification.message);
        holder.dateView.setText(formatDate(notification.createdAt));
        
        // Show unread indicator only for sent notifications that haven't been read
        holder.unreadIndicator.setVisibility(!notification.isRead ? View.VISIBLE : View.GONE);

        holder.deleteButton.setOnClickListener(v -> {
            if (listener != null) {
                listener.onDeleteNotification(notification);
            }
        });
    }

    @Override
    public int getItemCount() {
        return notifications.size();
    }

    private String formatDate(String dateString) {
        try {
            SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault());
            SimpleDateFormat outputFormat = new SimpleDateFormat("d MMMM yyyy HH:mm", new Locale("pl"));
            Date date = inputFormat.parse(dateString);
            return outputFormat.format(date);
        } catch (ParseException e) {
            return dateString;
        }
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView titleView;
        TextView messageView;
        TextView dateView;
        View unreadIndicator;
        ImageView deleteButton;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            titleView = itemView.findViewById(R.id.text_notification_title);
            messageView = itemView.findViewById(R.id.text_notification_message);
            dateView = itemView.findViewById(R.id.text_notification_date);
            unreadIndicator = itemView.findViewById(R.id.unread_indicator);
            deleteButton = itemView.findViewById(R.id.button_delete_notification);
        }
    }
}
