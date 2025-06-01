package com.example.event.ui.home;

import android.content.Context;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.event.R;
import com.example.event.data.LoginRepository;
import com.example.event.data.model.LoggedInUser;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

public class CommentAdapter extends RecyclerView.Adapter<CommentAdapter.CommentViewHolder> {
    private static final String TAG = "CommentAdapter";
    private Context context;
    private List<Comment> comments;
    private OnCommentActionListener listener;

    public interface OnCommentActionListener {
        void onEditComment(Comment comment, String newContent);
        void onDeleteComment(Comment comment);
    }

    public CommentAdapter(Context context, List<Comment> comments) {
        this.context = context;
        this.comments = comments;
    }

    public CommentAdapter(Context context, List<Comment> comments, OnCommentActionListener listener) {
        this.context = context;
        this.comments = comments;
        this.listener = listener;
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

        // Check if current user is the author of this comment
        LoggedInUser currentUser = LoginRepository.getInstance().getLoggedInUser();
        boolean isMyComment = currentUser != null && comment.userId != null && 
                             currentUser.getUserId().equals(comment.userId);

        if (isMyComment && listener != null) {
            holder.actionsLayout.setVisibility(View.VISIBLE);
            
            holder.editButton.setOnClickListener(v -> {
                if (holder.editLayout.getVisibility() == View.GONE) {
                    // Show edit mode
                    holder.editLayout.setVisibility(View.VISIBLE);
                    holder.editText.setText(comment.content);
                    holder.editText.requestFocus();
                } else {
                    // Hide edit mode
                    holder.editLayout.setVisibility(View.GONE);
                }
            });

            holder.deleteButton.setOnClickListener(v -> {
                if (listener != null) {
                    new android.app.AlertDialog.Builder(context)
                            .setTitle("Usuń komentarz")
                            .setMessage("Czy na pewno chcesz usunąć ten komentarz?")
                            .setPositiveButton("Usuń", (dialog, which) -> listener.onDeleteComment(comment))
                            .setNegativeButton("Anuluj", null)
                            .show();
                }
            });

            holder.saveButton.setOnClickListener(v -> {
                String newContent = holder.editText.getText().toString().trim();
                if (!newContent.isEmpty() && listener != null) {
                    listener.onEditComment(comment, newContent);
                    holder.editLayout.setVisibility(View.GONE);
                }
            });

            holder.cancelButton.setOnClickListener(v -> {
                holder.editLayout.setVisibility(View.GONE);
                holder.editText.setText(comment.content); // Reset to original content
            });
        } else {
            holder.actionsLayout.setVisibility(View.GONE);
        }

        // Ensure edit layout is hidden by default
        holder.editLayout.setVisibility(View.GONE);
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
        LinearLayout actionsLayout;
        ImageView editButton;
        ImageView deleteButton;
        LinearLayout editLayout;
        EditText editText;
        ImageView saveButton;
        ImageView cancelButton;

        CommentViewHolder(View itemView) {
            super(itemView);
            authorView = itemView.findViewById(R.id.text_comment_author);
            contentView = itemView.findViewById(R.id.text_comment_content);
            dateView = itemView.findViewById(R.id.text_comment_date);
            actionsLayout = itemView.findViewById(R.id.comment_actions_layout);
            editButton = itemView.findViewById(R.id.button_edit_comment);
            deleteButton = itemView.findViewById(R.id.button_delete_comment);
            editLayout = itemView.findViewById(R.id.edit_comment_layout);
            editText = itemView.findViewById(R.id.edit_text_comment);
            saveButton = itemView.findViewById(R.id.button_save_comment);
            cancelButton = itemView.findViewById(R.id.button_cancel_edit);
        }
    }
}
