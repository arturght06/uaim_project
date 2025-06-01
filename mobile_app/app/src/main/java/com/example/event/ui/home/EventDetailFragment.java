package com.example.event.ui.home;

import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.fragment.NavHostFragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.event.R;
import com.example.event.data.ApiConfig;
import com.example.event.data.LoginRepository;
import com.example.event.data.TokenManager;
import com.example.event.data.model.LoggedInUser;
import com.example.event.databinding.FragmentEventDetailBinding;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

public class EventDetailFragment extends Fragment {

    private static final String TAG = "EventDetailFragment";
    private FragmentEventDetailBinding binding;
    private String eventId;
    private Event currentEvent;
    private CommentAdapter commentAdapter;
    private List<Comment> commentList = new ArrayList<>();
    
    // Action buttons
    private View fabActionsContainer;
    private FloatingActionButton fabEditEvent;
    private FloatingActionButton fabDeleteEvent;

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        binding = FragmentEventDetailBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        // Get event ID from arguments
        if (getArguments() != null) {
            eventId = getArguments().getString("event_id");
        }

        if (eventId == null) {
            Toast.makeText(getContext(), "Błąd: Brak ID wydarzenia", Toast.LENGTH_SHORT).show();
            NavHostFragment.findNavController(this).navigateUp();
            return;
        }

        // Initialize action buttons
        fabActionsContainer = view.findViewById(R.id.fab_actions_container);
        fabEditEvent = view.findViewById(R.id.fab_edit_event);
        fabDeleteEvent = view.findViewById(R.id.fab_delete_event);

        // Setup comments RecyclerView
        RecyclerView recyclerViewComments = view.findViewById(R.id.recycler_view_comments);
        recyclerViewComments.setLayoutManager(new LinearLayoutManager(getContext()));
        commentAdapter = new CommentAdapter(getContext(), commentList, new CommentAdapter.OnCommentActionListener() {
            @Override
            public void onEditComment(Comment comment, String newContent) {
                editComment(comment, newContent);
            }

            @Override
            public void onDeleteComment(Comment comment) {
                deleteComment(comment);
            }
        });
        recyclerViewComments.setAdapter(commentAdapter);

        // Setup comment input
        setupCommentInput();

        // Load event details
        loadEventDetails();
    }

    private void setupCommentInput() {
        binding.buttonSendComment.setOnClickListener(v -> {
            LoggedInUser user = LoginRepository.getInstance().getLoggedInUser();
            if (user == null) {
                Toast.makeText(getContext(), "Musisz być zalogowany, aby komentować", Toast.LENGTH_SHORT).show();
                NavHostFragment.findNavController(this).navigate(R.id.navigation_login);
                return;
            }

            String commentText = binding.editTextComment.getText().toString().trim();
            if (!commentText.isEmpty()) {
                sendComment(commentText);
            }
        });

        // Update comment input visibility
        updateCommentInputVisibility();
    }

    private void updateCommentInputVisibility() {
        LoggedInUser user = LoginRepository.getInstance().getLoggedInUser();
        boolean isLoggedIn = (user != null);
        
        if (isLoggedIn) {
            binding.commentInputLayout.setVisibility(View.VISIBLE);
            binding.textLoginPrompt.setVisibility(View.GONE);
        } else {
            binding.commentInputLayout.setVisibility(View.GONE);
            binding.textLoginPrompt.setVisibility(View.VISIBLE);
            binding.textLoginPrompt.setOnClickListener(v -> 
                NavHostFragment.findNavController(this).navigate(R.id.navigation_login)
            );
        }
    }

    private void loadEventDetails() {
        new LoadEventDetailsTask().execute(eventId);
    }

    private void updateActionButtonsVisibility() {
        LoggedInUser loggedInUser = LoginRepository.getInstance().getLoggedInUser();
        boolean isLoggedIn = (loggedInUser != null);
        boolean isMyEvent = isLoggedIn && currentEvent != null && 
                          loggedInUser.getUserId().equals(currentEvent.organizerId);

        if (fabActionsContainer != null) {
            if (isMyEvent) {
                fabActionsContainer.setVisibility(View.VISIBLE);
                
                // Set up edit button
                fabEditEvent.setOnClickListener(v -> {
                    Log.d(TAG, "Edit event button clicked for event: " + currentEvent.id);
                    Bundle args = new Bundle();
                    args.putString("event_id", currentEvent.id);
                    NavHostFragment.findNavController(EventDetailFragment.this)
                            .navigate(R.id.action_eventDetail_to_editEvent, args);
                });
                
                // Set up delete button
                fabDeleteEvent.setOnClickListener(v -> {
                    Log.d(TAG, "Delete event button clicked for event: " + currentEvent.id);
                    showDeleteConfirmationDialog();
                });
            } else {
                fabActionsContainer.setVisibility(View.GONE);
            }
        }
    }

    private void showDeleteConfirmationDialog() {
        new android.app.AlertDialog.Builder(requireContext())
                .setTitle("Usuń wydarzenie")
                .setMessage(getString(R.string.event_delete_confirm))
                .setPositiveButton(getString(R.string.button_delete), (dialog, which) -> deleteEvent())
                .setNegativeButton(getString(R.string.button_cancel), null)
                .show();
    }

    private void deleteEvent() {
        if (currentEvent == null) return;
        
        new DeleteEventTask().execute(currentEvent.id);
    }

    private void sendComment(String commentText) {
        new SendCommentTask().execute(commentText);
    }

    private void loadComments() {
        new LoadCommentsTask().execute(eventId);
    }

    private String formatDate(String dateString, String pattern) {
        try {
            SimpleDateFormat inputFormat = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z", Locale.ENGLISH);
            Date date = inputFormat.parse(dateString);
            
            SimpleDateFormat outputFormat = new SimpleDateFormat(pattern, new Locale("pl", "PL"));
            outputFormat.setTimeZone(TimeZone.getDefault());
            return outputFormat.format(date);
        } catch (Exception e) {
            Log.e(TAG, "Error formatting date: " + dateString, e);
            return dateString;
        }
    }

    private class LoadEventDetailsTask extends AsyncTask<String, Void, Event> {
        @Override
        protected Event doInBackground(String... params) {
            try {
                String eventId = params[0];
                URL url = new URL(ApiConfig.BASE_URL + "api/events/" + eventId);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                
                String accessToken = TokenManager.getAccessToken();
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
                    
                    JSONObject obj = new JSONObject(response.toString());
                    JSONObject loc = obj.optJSONObject("location_data");
                    JSONObject org = obj.optJSONObject("organizer_data");
                    
                    return new Event(
                        obj.optString("id"),
                        obj.optString("title"),
                        obj.optString("created_at"),
                        obj.optString("event_date"),
                        loc != null ? loc.optString("country", "") : "",
                        loc != null ? loc.optString("city", "") : "",
                        loc != null ? loc.optString("address", "") : "",
                        obj.optString("description"),
                        org != null ? org.optString("name", "") : "",
                        org != null ? org.optString("surname", "") : "",
                        obj.optString("reservation_status", null),
                        obj.optInt("reservation_count", 0),
                        obj.has("max_participants") && !obj.isNull("max_participants") ? obj.optInt("max_participants", 0) : 0,
                        obj.optString("reservation_id", null),
                        obj.optString("organizer_id", null),
                        obj.optInt("comment_count", 0)
                    );
                }
            } catch (Exception e) {
                Log.e(TAG, "Error loading event details", e);
            }
            return null;
        }

        @Override
        protected void onPostExecute(Event event) {
            if (!isAdded() || event == null) return;

            currentEvent = event;
            
            // Populate UI elements
            binding.textEventTitle.setText(event.title);
            binding.textEventDescription.setText(event.description);
            binding.textEventDate.setText(formatDate(event.eventDate, "dd.MM.yyyy, HH:mm"));
            
            String location = event.country;
            if (!event.city.isEmpty()) location += ", " + event.city;
            if (!event.address.isEmpty()) location += ", " + event.address;
            binding.textEventLocation.setText(location);
            
            binding.textEventOrganizer.setText(event.organizerFirstName + " " + event.organizerLastName);
            
            String reservationText;
            if (event.maxParticipants > 0) {
                reservationText = event.reservationCount + "/" + event.maxParticipants;
            } else {
                reservationText = String.valueOf(event.reservationCount);
            }
            binding.textReservationCount.setText(reservationText);
            
            // Update action buttons visibility
            updateActionButtonsVisibility();
            
            // Load comments
            loadComments();
        }
    }

    private class LoadCommentsTask extends AsyncTask<String, Void, List<Comment>> {
        @Override
        protected List<Comment> doInBackground(String... params) {
            List<Comment> comments = new ArrayList<>();
            try {
                String eventId = params[0];
                URL url = new URL(ApiConfig.BASE_URL + "api/comments/" + eventId);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                
                String accessToken = TokenManager.getAccessToken();
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
                Log.e(TAG, "Error loading comments", e);
            }
            return comments;
        }

        @Override
        protected void onPostExecute(List<Comment> comments) {
            if (!isAdded()) return;
            
            commentList.clear();
            commentList.addAll(comments);
            commentAdapter.notifyDataSetChanged();
        }
    }

    private class SendCommentTask extends AsyncTask<String, Void, Boolean> {
        @Override
        protected Boolean doInBackground(String... params) {
            try {
                String commentText = params[0];
                URL url = new URL(ApiConfig.BASE_URL + "api/comments/");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                
                String accessToken = TokenManager.getAccessToken();
                if (accessToken != null) {
                    conn.setRequestProperty("Authorization", "Bearer " + accessToken);
                }
                conn.setDoOutput(true);

                JSONObject json = new JSONObject();
                json.put("event_id", eventId);
                json.put("content", commentText);

                OutputStream os = conn.getOutputStream();
                os.write(json.toString().getBytes());
                os.close();

                int responseCode = conn.getResponseCode();
                return responseCode == HttpURLConnection.HTTP_CREATED;
            } catch (Exception e) {
                Log.e(TAG, "Error sending comment", e);
                return false;
            }
        }

        @Override
        protected void onPostExecute(Boolean success) {
            if (!isAdded()) return;
            
            if (success) {
                Toast.makeText(getContext(), "Komentarz dodany", Toast.LENGTH_SHORT).show();
                binding.editTextComment.setText("");
                loadComments(); // Reload comments
            } else {
                Toast.makeText(getContext(), "Błąd podczas dodawania komentarza", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private class DeleteEventTask extends AsyncTask<String, Void, Boolean> {
        private String errorMessage = "";

        @Override
        protected Boolean doInBackground(String... params) {
            try {
                String eventId = params[0];
                URL url = new URL(ApiConfig.BASE_URL + "api/events/" + eventId);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("DELETE");
                
                String accessToken = TokenManager.getAccessToken();
                if (accessToken != null) {
                    conn.setRequestProperty("Authorization", "Bearer " + accessToken);
                }

                int responseCode = conn.getResponseCode();
                Log.d(TAG, "Delete event response code: " + responseCode);
                
                if (responseCode != HttpURLConnection.HTTP_OK) {
                    BufferedReader errorReader = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
                    StringBuilder errorResponse = new StringBuilder();
                    String line;
                    while ((line = errorReader.readLine()) != null) {
                        errorResponse.append(line);
                    }
                    errorReader.close();
                    errorMessage = errorResponse.toString();
                }
                
                return responseCode == HttpURLConnection.HTTP_OK;
            } catch (Exception e) {
                Log.e(TAG, "Error deleting event", e);
                errorMessage = e.getMessage();
                return false;
            }
        }

        @Override
        protected void onPostExecute(Boolean success) {
            if (!isAdded()) return;

            if (success) {
                Toast.makeText(getContext(), getString(R.string.event_delete_success), Toast.LENGTH_SHORT).show();
                NavHostFragment.findNavController(EventDetailFragment.this).navigateUp();
            } else {
                Toast.makeText(getContext(), getString(R.string.event_delete_failed) + ": " + errorMessage, Toast.LENGTH_LONG).show();
            }
        }
    }

    private class EditCommentTask extends AsyncTask<String, Void, Boolean> {
        @Override
        protected Boolean doInBackground(String... params) {
            try {
                String commentId = params[0];
                String newContent = params[1];
                
                URL url = new URL(ApiConfig.BASE_URL + "api/comments/" + commentId);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("PUT");
                conn.setRequestProperty("Content-Type", "application/json");
                
                String accessToken = TokenManager.getAccessToken();
                if (accessToken != null) {
                    conn.setRequestProperty("Authorization", "Bearer " + accessToken);
                }
                conn.setDoOutput(true);

                JSONObject json = new JSONObject();
                json.put("content", newContent);

                OutputStream os = conn.getOutputStream();
                os.write(json.toString().getBytes());
                os.close();

                int responseCode = conn.getResponseCode();
                return responseCode == HttpURLConnection.HTTP_OK;
            } catch (Exception e) {
                Log.e(TAG, "Error editing comment", e);
                return false;
            }
        }

        @Override
        protected void onPostExecute(Boolean success) {
            if (!isAdded()) return;
            
            if (success) {
                Toast.makeText(getContext(), "Komentarz zaktualizowany", Toast.LENGTH_SHORT).show();
                loadComments(); // Reload comments
            } else {
                Toast.makeText(getContext(), "Błąd podczas aktualizacji komentarza", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private class DeleteCommentTask extends AsyncTask<String, Void, Boolean> {
        @Override
        protected Boolean doInBackground(String... params) {
            try {
                String commentId = params[0];
                
                URL url = new URL(ApiConfig.BASE_URL + "api/comments/" + commentId);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("DELETE");
                
                String accessToken = TokenManager.getAccessToken();
                if (accessToken != null) {
                    conn.setRequestProperty("Authorization", "Bearer " + accessToken);
                }

                int responseCode = conn.getResponseCode();
                return responseCode == HttpURLConnection.HTTP_OK;
            } catch (Exception e) {
                Log.e(TAG, "Error deleting comment", e);
                return false;
            }
        }

        @Override
        protected void onPostExecute(Boolean success) {
            if (!isAdded()) return;
            
            if (success) {
                Toast.makeText(getContext(), "Komentarz usunięty", Toast.LENGTH_SHORT).show();
                loadComments(); // Reload comments
            } else {
                Toast.makeText(getContext(), "Błąd podczas usuwania komentarza", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void deleteComment(Comment comment) {
        new DeleteCommentTask().execute(comment.id);
    }

    private void editComment(Comment comment, String newContent) {
        new EditCommentTask().execute(comment.id, newContent);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
