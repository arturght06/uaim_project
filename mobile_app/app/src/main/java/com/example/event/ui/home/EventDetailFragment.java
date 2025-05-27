package com.example.event.ui.home;

import android.app.AlertDialog;
import android.os.AsyncTask;
import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.fragment.NavHostFragment;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.example.event.R;
import com.example.event.data.ApiConfig;
import com.example.event.data.LoginRepository;
import com.example.event.data.TokenManager;
import com.example.event.data.model.LoggedInUser;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import org.json.JSONObject;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class EventDetailFragment extends Fragment {
    private static final String TAG = "EventDetailFragment";

    private TextView textTitle, textOrganizer, textCreatedAt, textDescription, textEventDate, textLocation, textReservations;
    private LinearLayout fabActionsContainer;
    private FloatingActionButton fabEditEvent, fabDeleteEvent;
    private String eventId;
    private String organizerId;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_event_detail, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        textTitle = view.findViewById(R.id.text_event_detail_title);
        textOrganizer = view.findViewById(R.id.text_event_detail_organizer);
        textCreatedAt = view.findViewById(R.id.text_event_detail_created_at);
        textDescription = view.findViewById(R.id.text_event_detail_description);
        textEventDate = view.findViewById(R.id.text_event_detail_event_date);
        textLocation = view.findViewById(R.id.text_event_detail_location);
        textReservations = view.findViewById(R.id.text_event_detail_reservations);
        
        fabActionsContainer = view.findViewById(R.id.fab_actions_container); // Updated ID
        fabEditEvent = view.findViewById(R.id.fab_edit_event); // Updated ID
        fabDeleteEvent = view.findViewById(R.id.fab_delete_event); // Updated ID

        if (getArguments() != null) {
            eventId = getArguments().getString("event_id");
        }

        if (eventId == null) {
            Toast.makeText(getContext(), "Error: Event ID not found.", Toast.LENGTH_LONG).show();
            Log.e(TAG, "Event ID is null.");
            NavHostFragment.findNavController(this).popBackStack();
            return;
        }

        fetchEventDetails(eventId);

        fabEditEvent.setOnClickListener(v -> {
            // Navigate to edit event fragment or show a dialog
            Toast.makeText(getContext(), "Edit event: " + eventId, Toast.LENGTH_SHORT).show();
            // Example navigation:
            // Bundle args = new Bundle();
            // args.putString("event_id", eventId);
            // NavHostFragment.findNavController(this).navigate(R.id.action_eventDetail_to_editEvent, args);
        });

        fabDeleteEvent.setOnClickListener(v -> showDeleteConfirmationDialog());
    }

    private void fetchEventDetails(String eventId) {
        new FetchEventTask().execute(eventId);
    }

    private class FetchEventTask extends AsyncTask<String, Void, JSONObject> {
        @Override
        protected JSONObject doInBackground(String... params) {
            String id = params[0];
            Log.d(TAG, "Fetching event details for ID: " + id);
            try {
                URL url = new URL(ApiConfig.BASE_URL + "api/events/" + id);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                // Add Authorization header if needed for this endpoint, though typically GETs for public data might not.
                // String accessToken = TokenManager.getAccessToken();
                // if (accessToken != null) {
                //     conn.setRequestProperty("Authorization", "Bearer " + accessToken);
                // }

                int responseCode = conn.getResponseCode();
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = in.readLine()) != null) {
                        response.append(line);
                    }
                    in.close();
                    Log.d(TAG, "Successfully fetched event data: " + response.toString());
                    return new JSONObject(response.toString());
                } else {
                    Log.e(TAG, "Failed to fetch event data. HTTP Error: " + responseCode + " for URL: " + url);
                }
            } catch (Exception e) {
                Log.e(TAG, "Error fetching event details", e);
            }
            return null;
        }

        @Override
        protected void onPostExecute(JSONObject eventJson) {
            if (!isAdded() || eventJson == null) {
                Log.e(TAG, "Fragment not added or eventJson is null. Cannot populate UI.");
                if (isAdded()) {
                    Toast.makeText(getContext(), "Failed to load event details.", Toast.LENGTH_SHORT).show();
                }
                return;
            }

            try {
                textTitle.setText(eventJson.optString("title", "N/A"));
                textDescription.setText(eventJson.optString("description", "N/A"));

                organizerId = eventJson.optString("organizer_id", null);
                JSONObject organizerData = eventJson.optJSONObject("organizer_data");
                if (organizerData != null) {
                    String organizerName = organizerData.optString("name", "") + " " + organizerData.optString("surname", "");
                    textOrganizer.setText(organizerName.trim().isEmpty() ? "N/A" : organizerName.trim());
                } else {
                    textOrganizer.setText("N/A");
                }

                textCreatedAt.setText(formatDisplayDate(eventJson.optString("created_at")));
                textEventDate.setText(formatDisplayDate(eventJson.optString("event_date")));

                JSONObject locationData = eventJson.optJSONObject("location_data");
                if (locationData != null) {
                    String country = locationData.optString("country", "");
                    String city = locationData.optString("city", "");
                    String address = locationData.optString("address", "");
                    String fullLocation = "";
                    if (!country.isEmpty()) fullLocation += country;
                    if (!city.isEmpty()) fullLocation += (fullLocation.isEmpty() ? "" : ", ") + city;
                    if (!address.isEmpty()) fullLocation += (fullLocation.isEmpty() ? "" : ", ") + address;
                    textLocation.setText(fullLocation.isEmpty() ? "N/A" : fullLocation);
                } else {
                    textLocation.setText("N/A");
                }

                int reservationCount = eventJson.optInt("reservation_count", 0);
                int maxParticipants = eventJson.optInt("max_participants", 0);
                if (maxParticipants > 0) {
                    int remaining = maxParticipants - reservationCount;
                    textReservations.setText(String.format(Locale.getDefault(), "%d/%d (Pozostało: %d)", reservationCount, maxParticipants, remaining < 0 ? 0 : remaining));
                } else {
                    textReservations.setText(String.valueOf(reservationCount));
                }

                updateActionButtonsVisibility();

            } catch (Exception e) {
                Log.e(TAG, "Error parsing event JSON or populating UI", e);
                Toast.makeText(getContext(), "Error displaying event details.", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void updateActionButtonsVisibility() {
        LoggedInUser currentUser = LoginRepository.getInstance().getLoggedInUser();
        if (currentUser != null && organizerId != null && organizerId.equals(currentUser.getUserId())) {
            fabActionsContainer.setVisibility(View.VISIBLE);
        } else {
            fabActionsContainer.setVisibility(View.GONE);
        }
    }

    private void showDeleteConfirmationDialog() {
        if (getContext() == null) return;
        new AlertDialog.Builder(getContext())
                .setTitle("Potwierdź usunięcie")
                .setMessage("Czy na pewno chcesz usunąć to wydarzenie? Tej operacji nie można cofnąć.")
                .setPositiveButton("Usuń", (dialog, which) -> deleteEvent())
                .setNegativeButton("Anuluj", null)
                .setIcon(R.drawable.trash_fill) // Consider adding a proper drawable
                .show();
    }

    private void deleteEvent() {
        new DeleteEventTask().execute(eventId);
    }

    private class DeleteEventTask extends AsyncTask<String, Void, Boolean> {
        @Override
        protected Boolean doInBackground(String... params) {
            String id = params[0];
            Log.d(TAG, "Attempting to delete event ID: " + id);
            String accessToken = TokenManager.getAccessToken();
            if (accessToken == null) {
                Log.e(TAG, "Cannot delete event: Access token is null.");
                return false;
            }

            try {
                URL url = new URL(ApiConfig.BASE_URL + "api/events/" + id);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("DELETE");
                conn.setRequestProperty("Authorization", "Bearer " + accessToken);

                int responseCode = conn.getResponseCode();
                Log.d(TAG, "Delete event response code: " + responseCode);
                
                return responseCode == HttpURLConnection.HTTP_OK || responseCode == HttpURLConnection.HTTP_NO_CONTENT;
            } catch (Exception e) {
                Log.e(TAG, "Error deleting event", e);
                return false;
            }
        }

        @Override
        protected void onPostExecute(Boolean success) {
            if (!isAdded()) return;
            if (success) {
                Toast.makeText(getContext(), "Wydarzenie usunięte pomyślnie.", Toast.LENGTH_SHORT).show();
                Log.d(TAG, "Event deleted successfully. Navigating back.");
                NavHostFragment.findNavController(EventDetailFragment.this).popBackStack();
            } else {
                Toast.makeText(getContext(), "Nie udało się usunąć wydarzenia.", Toast.LENGTH_SHORT).show();
                Log.e(TAG, "Failed to delete event.");
            }
        }
    }

    private String formatDisplayDate(String apiDateString) {
        if (apiDateString == null || apiDateString.isEmpty() || apiDateString.equals("null")) {
            return "N/A";
        }
        try {
            // Input format from API: "EEE, dd MMM yyyy HH:mm:ss z"
            SimpleDateFormat inputFormat = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z", Locale.ENGLISH);
            Date date = inputFormat.parse(apiDateString);

            // Desired output format: "d MMMM yyyy HH:mm"
            SimpleDateFormat outputFormat = new SimpleDateFormat("d MMMM yyyy HH:mm", new Locale("pl", "PL"));
            return outputFormat.format(date);
        } catch (Exception e) {
            Log.e(TAG, "Error formatting date: " + apiDateString, e);
            return apiDateString; // Fallback to original string if parsing fails
        }
    }
}
