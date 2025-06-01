package com.example.event.ui.home;

import android.content.Context;
import android.os.AsyncTask;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.event.R;
import com.example.event.data.ApiConfig;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

public class EventAdapter extends RecyclerView.Adapter<EventAdapter.ViewHolder> {

    private Context context;
    private List<Event> events;
    private OnEventActionListener listener;

    public interface OnEventActionListener {
        void onComment(Event event);
        void onJoin(Event event);
        void onDetails(Event event);
        void onSendComment(Event event, String commentText);
        void onEditComment(Comment comment, String newContent);
        void onDeleteComment(Comment comment);
        void onLoginRequired();
    }

    public EventAdapter(Context context, List<Event> events, OnEventActionListener listener) {
        this.context = context;
        this.events = events;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_event, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Event event = events.get(position);

        boolean isLoggedIn = com.example.event.data.LoginRepository.getInstance().getLoggedInUser() != null;
        String loggedUserId = isLoggedIn ? com.example.event.data.LoginRepository.getInstance().getLoggedInUser().getUserId() : null;
        boolean isMyEvent = (loggedUserId != null && event.organizerId != null && loggedUserId.equals(event.organizerId));

        // Autor i data utworzenia
        if (isMyEvent) {
            holder.authorView.setText("Twoje wydarzenie");
        } else {
            holder.authorView.setText(event.organizerFirstName + " " + event.organizerLastName);
        }
        holder.createdView.setText(formatDate(event.createdAt, "dd.MM.yyyy, HH:mm"));

        // Tytuł
        holder.titleView.setText(event.title);

        // Lokalizacja
        String loc = event.country;
        if (event.city != null && !event.city.isEmpty())
            loc += ", " + event.city;
        if (event.address != null && !event.address.isEmpty())
            loc += ", " + event.address;
        holder.locationView.setText(loc);

        // Data eventu
        holder.eventDateView.setText(formatDate(event.eventDate, "dd.MM.yyyy, HH:mm"));

        // Opis
        holder.descriptionView.setText(event.description);

        // Liczba rezerwacji
        String reservationText;
        if (event.maxParticipants > 0) {
            reservationText = event.reservationCount + "/" + event.maxParticipants;
        } else {
            reservationText = String.valueOf(event.reservationCount);
        }
        holder.reservationCountView.setText(reservationText);

        // Liczba komentarzy
        holder.commentCountView.setText(String.valueOf(event.commentCount));

        // Comment button click handler
        holder.commentBtn.setOnClickListener(v -> {
            if (holder.commentSection.getVisibility() == View.GONE) {
                holder.commentSection.setVisibility(View.VISIBLE);
                updateCommentInputVisibility(holder);
                loadCommentsForEvent(event, holder);
            } else {
                holder.commentSection.setVisibility(View.GONE);
            }
        });

        // Send comment button click handler
        holder.sendCommentBtn.setOnClickListener(v -> {
            String commentText = holder.commentInput.getText().toString().trim();
            if (!commentText.isEmpty()) {
                listener.onSendComment(event, commentText);
                holder.commentInput.setText("");
                // Reload comments after sending
                loadCommentsForEvent(event, holder);
            }
        });

        // Ikona dołączania
        if (!isLoggedIn || isMyEvent) {
            holder.joinBtn.setVisibility(View.GONE);
            Log.d("EventAdapter", "Join button hidden for event " + event.id + " - isLoggedIn: " + isLoggedIn + ", isMyEvent: " + isMyEvent);
        } else {
            holder.joinBtn.setVisibility(View.VISIBLE);
            Log.d("EventAdapter", "Event " + event.id + " - reservationStatus: '" + event.reservationStatus + "'");
            if ("confirmed".equals(event.reservationStatus)) {
                holder.joinBtn.setImageResource(R.drawable.person_dash_fill);
                holder.joinBtn.setColorFilter(context.getResources().getColor(R.color.primary_color));
                holder.joinBtn.setContentDescription("Wycofaj udział");
                Log.d("EventAdapter", "Set leave button for event " + event.id);
            } else {
                holder.joinBtn.setImageResource(R.drawable.person_check_fill);
                holder.joinBtn.setColorFilter(context.getResources().getColor(R.color.secondary_color));
                holder.joinBtn.setContentDescription("Weź udział");
                Log.d("EventAdapter", "Set join button for event " + event.id);
            }
            holder.joinBtn.setOnClickListener(v -> listener.onJoin(event));
        }

        // Obsługa kliknięć
        holder.itemView.setOnClickListener(v -> listener.onDetails(event));
    }

    @Override
    public int getItemCount() {
        return events.size();
    }

    private String formatDate(String dateString, String pattern) {
        try {
            // Input format from API: "EEE, dd MMM yyyy HH:mm:ss z" (e.g., "Sun, 01 Jun 2025 16:42:19 GMT")
            SimpleDateFormat inputFormat = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z", Locale.ENGLISH);
            Date date = inputFormat.parse(dateString);
            
            SimpleDateFormat outputFormat = new SimpleDateFormat(pattern, new Locale("pl", "PL"));
            outputFormat.setTimeZone(TimeZone.getDefault());
            return outputFormat.format(date);
        } catch (Exception e) {
            Log.e("EventAdapter", "Error formatting date: " + dateString, e);
            // Fallback to original microsecond format if GMT parsing fails
            try {
                SimpleDateFormat fallbackFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSSSS", Locale.getDefault());
                fallbackFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
                Date date = fallbackFormat.parse(dateString);
                
                SimpleDateFormat outputFormat = new SimpleDateFormat(pattern, new Locale("pl", "PL"));
                outputFormat.setTimeZone(TimeZone.getDefault());
                return outputFormat.format(date);
            } catch (Exception fallbackException) {
                Log.e("EventAdapter", "Fallback date parsing also failed: " + dateString, fallbackException);
                return dateString;
            }
        }
    }

    private void loadCommentsForEvent(Event event, ViewHolder holder) {
        new LoadCommentsTask(event.id, holder).execute();
    }

    private void updateCommentInputVisibility(ViewHolder holder) {
        boolean isLoggedIn = com.example.event.data.LoginRepository.getInstance().getLoggedInUser() != null;
        
        if (isLoggedIn) {
            holder.commentInputLayout.setVisibility(View.VISIBLE);
            holder.loginPromptButton.setVisibility(View.GONE);
        } else {
            holder.commentInputLayout.setVisibility(View.GONE);
            holder.loginPromptButton.setVisibility(View.VISIBLE);
            
            // Set click listener for login prompt button
            holder.loginPromptButton.setOnClickListener(v -> listener.onLoginRequired());
        }
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView authorView;
        TextView createdView;
        TextView titleView;
        TextView locationView;
        TextView eventDateView;
        TextView descriptionView;
        TextView reservationCountView;
        TextView commentCountView;
        ImageView commentBtn;
        ImageView joinBtn;
        LinearLayout commentSection;
        EditText commentInput;
        ImageView sendCommentBtn;
        RecyclerView commentsRecycler;
        LinearLayout commentInputLayout;
        TextView loginPromptButton; // Changed from loginPrompt to loginPromptButton

        public ViewHolder(View view) {
            super(view);
            authorView = view.findViewById(R.id.text_event_author);
            createdView = view.findViewById(R.id.text_event_created);
            titleView = view.findViewById(R.id.text_event_title);
            locationView = view.findViewById(R.id.text_event_location);
            eventDateView = view.findViewById(R.id.text_event_date);
            descriptionView = view.findViewById(R.id.text_event_description);
            reservationCountView = view.findViewById(R.id.text_reservation_count);
            commentCountView = view.findViewById(R.id.text_comment_count);
            commentBtn = view.findViewById(R.id.button_comment);
            joinBtn = view.findViewById(R.id.button_join);
            commentSection = view.findViewById(R.id.comment_section);
            commentInput = view.findViewById(R.id.edit_comment_input);
            sendCommentBtn = view.findViewById(R.id.button_send_comment);
            commentsRecycler = view.findViewById(R.id.recycler_comments);
            commentInputLayout = view.findViewById(R.id.comment_input_layout);
            loginPromptButton = view.findViewById(R.id.button_login_prompt);
        }
    }

    private class LoadCommentsTask extends AsyncTask<Void, Void, List<Comment>> {
        private String eventId;
        private ViewHolder holder;

        LoadCommentsTask(String eventId, ViewHolder holder) {
            this.eventId = eventId;
            this.holder = holder;
        }

        @Override
        protected List<Comment> doInBackground(Void... voids) {
            List<Comment> comments = new ArrayList<>();
            try {
                URL url = new URL(ApiConfig.BASE_URL + "api/comments/" + eventId);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                String accessToken = com.example.event.data.TokenManager.getAccessToken();
                if (accessToken != null) {
                    conn.setRequestProperty("Authorization", "Bearer " + accessToken);
                }

                int responseCode = conn.getResponseCode();
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = in.readLine()) != null) {
                        response.append(line);
                    }
                    in.close();

                    JSONArray commentsArray = new JSONArray(response.toString());
                    for (int i = 0; i < commentsArray.length(); i++) {
                        JSONObject commentObj = commentsArray.getJSONObject(i);
                        // Backend returns "user_data" instead of "author_data"
                        JSONObject userObj = commentObj.optJSONObject("user_data");
                        
                        comments.add(new Comment(
                            commentObj.optString("id"),
                            commentObj.optString("event_id"),
                            commentObj.optString("user_id"),
                            commentObj.optString("content"),
                            commentObj.optString("created_at"),
                            userObj != null ? userObj.optString("name", "") : "",
                            userObj != null ? userObj.optString("surname", "") : ""
                        ));
                    }
                }
            } catch (Exception e) {
                Log.e("EventAdapter", "Error loading comments", e);
            }
            return comments;
        }

        @Override
        protected void onPostExecute(List<Comment> comments) {
            if (holder.commentsRecycler != null) {
                CommentAdapter commentAdapter = new CommentAdapter(context, comments, new CommentAdapter.OnCommentActionListener() {
                    @Override
                    public void onEditComment(Comment comment, String newContent) {
                        if (listener != null) {
                            listener.onEditComment(comment, newContent);
                            // Reload comments after edit
                            new LoadCommentsTask(eventId, holder).execute();
                        }
                    }

                    @Override
                    public void onDeleteComment(Comment comment) {
                        if (listener != null) {
                            listener.onDeleteComment(comment);
                            // Reload comments after delete
                            new LoadCommentsTask(eventId, holder).execute();
                        }
                    }
                });
                holder.commentsRecycler.setLayoutManager(new LinearLayoutManager(context));
                holder.commentsRecycler.setAdapter(commentAdapter);
            }
        }
    }
}
