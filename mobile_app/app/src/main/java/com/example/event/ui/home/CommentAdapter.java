package com.example.event.ui.home;

import android.content.Context;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.event.R;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

public class CommentAdapter extends RecyclerView.Adapter<CommentAdapter.CommentViewHolder> {
    private static final String TAG = "CommentAdapter";
    private Context context;
    private List<Comment> comments;

    public CommentAdapter(Context context, List<Comment> comments) {
        this.context = context;
        this.comments = comments;
    }

    @NonNull
    @Override
    public CommentViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_comment, parent, false);
        return new CommentViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull CommentViewHolder holder, int position) {
        Comment comment = comments.get(position);
        
        String authorName = (comment.authorFirstName + " " + comment.authorLastName).trim();
        if (authorName.isEmpty()) {
            authorName = "Anonim";
        }
        holder.authorView.setText(authorName);
        holder.contentView.setText(comment.content);
        holder.dateView.setText(getRelativeTime(comment.createdAt));
    }

    @Override
    public int getItemCount() {
        return comments.size();
    }

    private String getRelativeTime(String dateString) {
        if (dateString == null || dateString.isEmpty()) {
            return "nieznana data";
        }

        try {
            Date commentDate = parseDate(dateString);
            if (commentDate == null) {
                Log.w(TAG, "Failed to parse date: " + dateString);
                return dateString;
            }

            Date now = new Date();
            long diffInMillis = now.getTime() - commentDate.getTime();
            
            // If difference is negative, comment is from future (shouldn't happen)
            if (diffInMillis < 0) {
                SimpleDateFormat outputFormat = new SimpleDateFormat("d MMM HH:mm", Locale.getDefault());
                return outputFormat.format(commentDate);
            }
            
            long diffInSeconds = diffInMillis / 1000;
            long diffInMinutes = diffInSeconds / 60;
            long diffInHours = diffInMinutes / 60;
            long diffInDays = diffInHours / 24;
            
            if (diffInMinutes < 1) {
                return "teraz";
            } else if (diffInMinutes < 60) {
                return diffInMinutes + " min temu";
            } else if (diffInHours < 24) {
                return diffInHours + " godz temu";
            } else if (diffInDays < 7) {
                return diffInDays + (diffInDays == 1 ? " dzień temu" : " dni temu");
            } else {
                // For older comments, show the date
                SimpleDateFormat outputFormat = new SimpleDateFormat("d MMM", Locale.getDefault());
                return outputFormat.format(commentDate);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error calculating relative time for: " + dateString, e);
            return dateString;
        }
    }

    private Date parseDate(String dateString) {
        try {
            // Handle the specific format: "2025-05-31T21:21:09.186588"
            // Server sends data in UTC timezone
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSSSS", Locale.getDefault());
            sdf.setTimeZone(TimeZone.getTimeZone("UTC")); // Parse as UTC
            Date utcDate = sdf.parse(dateString);
            
            // Convert UTC to local timezone for display
            return utcDate;
        } catch (Exception e) {
            Log.w(TAG, "Could not parse date with primary format, trying fallbacks for: " + dateString);
        }

        // Fallback formats
        String[] dateFormats = {
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
            "yyyy-MM-dd'T'HH:mm:ss'Z'",
            "yyyy-MM-dd'T'HH:mm:ss.SSS",
            "yyyy-MM-dd'T'HH:mm:ss",
            "yyyy-MM-dd HH:mm:ss",
            "yyyy-MM-dd"
        };

        for (String format : dateFormats) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat(format, Locale.getDefault());
                if (format.contains("Z")) {
                    sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
                } else {
                    // For formats without 'Z', assume UTC since server sends UTC data
                    sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
                }
                return sdf.parse(dateString);
            } catch (Exception e) {
                // Continue to next format
            }
        }

        Log.w(TAG, "Could not parse date with any known format: " + dateString);
        return null;
    }

    static class CommentViewHolder extends RecyclerView.ViewHolder {
        TextView authorView;
        TextView contentView;
        TextView dateView;

        CommentViewHolder(View itemView) {
            super(itemView);
            authorView = itemView.findViewById(R.id.text_comment_author);
            contentView = itemView.findViewById(R.id.text_comment_content);
            dateView = itemView.findViewById(R.id.text_comment_date);
        }
    }
}
