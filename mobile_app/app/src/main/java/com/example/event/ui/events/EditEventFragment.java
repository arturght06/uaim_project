package com.example.event.ui.events;

import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.os.AsyncTask;
import android.os.Bundle;
import android.text.InputType;
import android.text.TextUtils;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.fragment.NavHostFragment;

import com.example.event.R;
import com.example.event.data.ApiConfig;
import com.example.event.data.LoginRepository;
import com.example.event.data.TokenManager;
import com.example.event.data.model.LoggedInUser;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

public class EditEventFragment extends Fragment {

    private static final String TAG = "EditEventFragment";
    
    private EditText editTextEventTitle;
    private EditText editTextEventDescription;
    private EditText editTextEventDate;
    private EditText editTextAddress;
    private EditText editTextCity;
    private EditText editTextCountry;
    private EditText editTextMaxParticipants;
    private Button buttonSaveEvent;
    
    private String eventId;
    private String locationId;

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_edit_event, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        Log.d(TAG, "onViewCreated started");

        // Check if user is logged in
        LoggedInUser user = LoginRepository.getInstance().getLoggedInUser();
        if (user == null) {
            Log.w(TAG, "User not logged in, navigating back");
            Toast.makeText(getContext(), "Musisz być zalogowany, aby edytować wydarzenie", Toast.LENGTH_SHORT).show();
            NavHostFragment.findNavController(this).navigateUp();
            return;
        }

        // Get event ID from arguments
        if (getArguments() != null) {
            eventId = getArguments().getString("event_id");
            Log.d(TAG, "Event ID from arguments: " + eventId);
        }

        if (eventId == null) {
            Log.e(TAG, "Event ID is null");
            Toast.makeText(getContext(), "Błąd: Brak ID wydarzenia", Toast.LENGTH_SHORT).show();
            NavHostFragment.findNavController(this).navigateUp();
            return;
        }

        Log.d(TAG, "User logged in: " + user.getUserId() + ", editing event: " + eventId);
        initViews(view);
        setupClickListeners();
        loadEventData();
        Log.d(TAG, "onViewCreated completed");
    }

    private void initViews(View view) {
        editTextEventTitle = view.findViewById(R.id.editTextEventTitle);
        editTextEventDescription = view.findViewById(R.id.editTextEventDescription);
        editTextEventDate = view.findViewById(R.id.editTextEventDate);
        editTextAddress = view.findViewById(R.id.editTextAddress);
        editTextCity = view.findViewById(R.id.editTextCity);
        editTextCountry = view.findViewById(R.id.editTextCountry);
        editTextMaxParticipants = view.findViewById(R.id.editTextMaxParticipants);
        buttonSaveEvent = view.findViewById(R.id.buttonSaveEvent);

        // Setup date picker for event date
        setupEventDatePicker();
    }

    private void setupEventDatePicker() {
        editTextEventDate.setFocusable(false);
        editTextEventDate.setFocusableInTouchMode(false);
        editTextEventDate.setClickable(true);
        editTextEventDate.setInputType(InputType.TYPE_NULL);
        editTextEventDate.setOnClickListener(v -> showDateTimePicker());
    }

    private void showDateTimePicker() {
        final Calendar calendar = Calendar.getInstance();
        
        // Try to parse existing date if available
        String currentDateText = editTextEventDate.getText().toString().trim();
        if (!currentDateText.isEmpty()) {
            try {
                SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault());
                Date existingDate = format.parse(currentDateText);
                if (existingDate != null) {
                    calendar.setTime(existingDate);
                }
            } catch (Exception e) {
                Log.w(TAG, "Could not parse existing date: " + currentDateText);
            }
        }
        
        int year = calendar.get(Calendar.YEAR);
        int month = calendar.get(Calendar.MONTH);
        int day = calendar.get(Calendar.DAY_OF_MONTH);
        int hour = calendar.get(Calendar.HOUR_OF_DAY);
        int minute = calendar.get(Calendar.MINUTE);

        DatePickerDialog datePickerDialog = new DatePickerDialog(
            requireContext(),
            (view, selectedYear, selectedMonth, selectedDay) -> {
                // After date selection, show time picker
                TimePickerDialog timePickerDialog = new TimePickerDialog(
                    requireContext(),
                    (timeView, selectedHour, selectedMinute) -> {
                        String formatted = String.format(Locale.getDefault(), "%04d-%02d-%02d %02d:%02d", 
                                selectedYear, selectedMonth + 1, selectedDay, selectedHour, selectedMinute);
                        editTextEventDate.setText(formatted);
                    },
                    hour, minute, true
                );
                timePickerDialog.show();
            },
            year, month, day
        );
        
        // Set minimum date to today
        datePickerDialog.getDatePicker().setMinDate(System.currentTimeMillis());
        datePickerDialog.show();
    }

    private void setupClickListeners() {
        buttonSaveEvent.setOnClickListener(v -> {
            if (validateInputs()) {
                updateEvent();
            }
        });
    }

    private void loadEventData() {
        Log.d(TAG, "loadEventData started for event: " + eventId);
        new LoadEventTask().execute(eventId);
    }

    private boolean validateInputs() {
        String title = editTextEventTitle.getText().toString().trim();
        String description = editTextEventDescription.getText().toString().trim();
        String eventDate = editTextEventDate.getText().toString().trim();
        String address = editTextAddress.getText().toString().trim();
        String city = editTextCity.getText().toString().trim();
        String country = editTextCountry.getText().toString().trim();

        if (TextUtils.isEmpty(title)) {
            editTextEventTitle.setError(getString(R.string.validation_title_required));
            return false;
        }

        if (TextUtils.isEmpty(description)) {
            editTextEventDescription.setError(getString(R.string.validation_description_required));
            return false;
        }

        if (TextUtils.isEmpty(eventDate)) {
            editTextEventDate.setError(getString(R.string.validation_date_required));
            return false;
        }

        if (TextUtils.isEmpty(address)) {
            editTextAddress.setError(getString(R.string.validation_address_required));
            return false;
        }

        if (TextUtils.isEmpty(city)) {
            editTextCity.setError(getString(R.string.validation_city_required));
            return false;
        }

        if (TextUtils.isEmpty(country)) {
            editTextCountry.setError(getString(R.string.validation_country_required));
            return false;
        }

        // Validate date format
        if (!isValidDateFormat(eventDate)) {
            editTextEventDate.setError(getString(R.string.validation_date_format));
            return false;
        }

        return true;
    }

    private boolean isValidDateFormat(String date) {
        try {
            SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault());
            format.setLenient(false);
            Date parsedDate = format.parse(date);
            return parsedDate != null;
        } catch (Exception e) {
            return false;
        }
    }

    private void updateEvent() {
        String title = editTextEventTitle.getText().toString().trim();
        String description = editTextEventDescription.getText().toString().trim();
        String eventDate = editTextEventDate.getText().toString().trim();
        String address = editTextAddress.getText().toString().trim();
        String city = editTextCity.getText().toString().trim();
        String country = editTextCountry.getText().toString().trim();
        String maxParticipantsStr = editTextMaxParticipants.getText().toString().trim();

        new UpdateEventTask().execute(title, description, eventDate, address, city, country, maxParticipantsStr);
    }

    private class LoadEventTask extends AsyncTask<String, Void, JSONObject> {
        @Override
        protected JSONObject doInBackground(String... params) {
            String eventId = params[0];
            Log.d(TAG, "LoadEventTask doInBackground for event: " + eventId);
            try {
                URL url = new URL(ApiConfig.BASE_URL + "api/events/" + eventId);
                Log.d(TAG, "Loading event from URL: " + url.toString());
                
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                
                String accessToken = TokenManager.getAccessToken();
                if (accessToken != null) {
                    conn.setRequestProperty("Authorization", "Bearer " + accessToken);
                    Log.d(TAG, "Access token added to request");
                }

                int responseCode = conn.getResponseCode();
                Log.d(TAG, "Load event response code: " + responseCode);
                
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = in.readLine()) != null) {
                        response.append(line);
                    }
                    in.close();
                    
                    Log.d(TAG, "Event data loaded successfully");
                    return new JSONObject(response.toString());
                } else {
                    Log.e(TAG, "Failed to load event data, response code: " + responseCode);
                }
            } catch (Exception e) {
                Log.e(TAG, "LoadEventTask exception", e);
            }
            return null;
        }

        @Override
        protected void onPostExecute(JSONObject eventJson) {
            Log.d(TAG, "LoadEventTask onPostExecute");
            if (!isAdded() || eventJson == null) {
                Log.w(TAG, "Fragment not attached or eventJson is null");
                return;
            }

            try {
                Log.d(TAG, "Populating form with event data: " + eventJson.toString());
                
                // Populate form fields
                editTextEventTitle.setText(eventJson.optString("title", ""));
                editTextEventDescription.setText(eventJson.optString("description", ""));
                
                // Format date for display
                String eventDate = eventJson.optString("event_date", "");
                Log.d(TAG, "Original event date: " + eventDate);
                
                if (!eventDate.isEmpty()) {
                    try {
                        SimpleDateFormat inputFormat = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z", Locale.ENGLISH);
                        SimpleDateFormat outputFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault());
                        Date date = inputFormat.parse(eventDate);
                        String formattedDate = outputFormat.format(date);
                        Log.d(TAG, "Formatted event date: " + formattedDate);
                        editTextEventDate.setText(formattedDate);
                    } catch (Exception e) {
                        Log.w(TAG, "Date parsing failed, using original format", e);
                        editTextEventDate.setText(eventDate);
                    }
                }

                // Location data
                JSONObject locationData = eventJson.optJSONObject("location_data");
                if (locationData != null) {
                    locationId = locationData.optString("id", "");
                    Log.d(TAG, "Location ID: " + locationId);
                    editTextAddress.setText(locationData.optString("address", ""));
                    editTextCity.setText(locationData.optString("city", ""));
                    editTextCountry.setText(locationData.optString("country", ""));
                }

                // Max participants
                if (eventJson.has("max_participants") && !eventJson.isNull("max_participants")) {
                    int maxParticipants = eventJson.optInt("max_participants", 0);
                    Log.d(TAG, "Max participants: " + maxParticipants);
                    editTextMaxParticipants.setText(String.valueOf(maxParticipants));
                }

                Log.d(TAG, "Form populated successfully");

            } catch (Exception e) {
                Log.e(TAG, "Error populating form", e);
                Toast.makeText(getContext(), "Błąd podczas ładowania danych wydarzenia", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private class UpdateEventTask extends AsyncTask<String, Void, Boolean> {
        private String errorMessage = "";

        @Override
        protected Boolean doInBackground(String... params) {
            Log.d(TAG, "UpdateEventTask doInBackground started");
            try {
                String title = params[0];
                String description = params[1];
                String eventDate = params[2];
                String address = params[3];
                String city = params[4];
                String country = params[5];
                String maxParticipantsStr = params[6];

                Log.d(TAG, "Updating event with data - title: " + title + ", eventDate: " + eventDate);

                // Update location first if needed
                if (locationId != null && !locationId.isEmpty()) {
                    Log.d(TAG, "Updating location: " + locationId);
                    updateLocation(locationId, address, city, country);
                }

                // Convert date format for API
                SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault());
                SimpleDateFormat outputFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault());
                Date date = inputFormat.parse(eventDate);
                String formattedDate = outputFormat.format(date);

                Log.d(TAG, "Date converted from '" + eventDate + "' to '" + formattedDate + "'");

                // Update event
                URL url = new URL(ApiConfig.BASE_URL + "api/events/" + eventId);
                Log.d(TAG, "Updating event at URL: " + url.toString());
                
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("PUT");
                conn.setRequestProperty("Content-Type", "application/json");
                
                String accessToken = TokenManager.getAccessToken();
                if (accessToken != null) {
                    conn.setRequestProperty("Authorization", "Bearer " + accessToken);
                }
                conn.setDoOutput(true);

                JSONObject jsonPayload = new JSONObject();
                jsonPayload.put("title", title);
                jsonPayload.put("description", description);
                jsonPayload.put("event_date", formattedDate);
                
                if (!TextUtils.isEmpty(maxParticipantsStr)) {
                    try {
                        int maxParticipants = Integer.parseInt(maxParticipantsStr);
                        if (maxParticipants > 0) {
                            jsonPayload.put("max_participants", maxParticipants);
                            Log.d(TAG, "Max participants set to: " + maxParticipants);
                        }
                    } catch (NumberFormatException e) {
                        Log.w(TAG, "Invalid max participants number: " + maxParticipantsStr);
                    }
                }

                Log.d(TAG, "Update event JSON Payload: " + jsonPayload.toString());

                OutputStream os = conn.getOutputStream();
                os.write(jsonPayload.toString().getBytes());
                os.close();

                int responseCode = conn.getResponseCode();
                Log.d(TAG, "Update event response code: " + responseCode);

                if (responseCode == HttpURLConnection.HTTP_OK) {
                    Log.d(TAG, "Event updated successfully");
                    return true;
                } else {
                    Log.e(TAG, "Event update failed with response code: " + responseCode);
                    return false;
                }

            } catch (Exception e) {
                Log.e(TAG, "UpdateEventTask exception", e);
                errorMessage = "Błąd podczas aktualizacji wydarzenia: " + e.getMessage();
                return false;
            }
        }

        private void updateLocation(String locationId, String address, String city, String country) {
            Log.d(TAG, "updateLocation started for ID: " + locationId);
            try {
                URL url = new URL(ApiConfig.BASE_URL + "api/location/" + locationId);
                Log.d(TAG, "Updating location at URL: " + url.toString());
                
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("PUT");
                conn.setRequestProperty("Content-Type", "application/json");
                
                String accessToken = TokenManager.getAccessToken();
                if (accessToken != null) {
                    conn.setRequestProperty("Authorization", "Bearer " + accessToken);
                }
                conn.setDoOutput(true);

                JSONObject locationPayload = new JSONObject();
                locationPayload.put("name", "");
                locationPayload.put("address", address);
                locationPayload.put("city", city);
                locationPayload.put("postal_code", "");
                locationPayload.put("country", country);
                locationPayload.put("description", null);

                Log.d(TAG, "Location update payload: " + locationPayload.toString());

                OutputStream os = conn.getOutputStream();
                os.write(locationPayload.toString().getBytes());
                os.close();

                int responseCode = conn.getResponseCode();
                Log.d(TAG, "Location update response code: " + responseCode);
                
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    Log.d(TAG, "Location updated successfully");
                } else {
                    Log.w(TAG, "Location update failed with response code: " + responseCode);
                    try {
                        BufferedReader errorReader = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
                        StringBuilder errorResponse = new StringBuilder();
                        String line;
                        while ((line = errorReader.readLine()) != null) {
                            errorResponse.append(line);
                        }
                        errorReader.close();
                        Log.w(TAG, "Location update error response: " + errorResponse.toString());
                    } catch (Exception e) {
                        Log.w(TAG, "Could not read error response", e);
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "updateLocation exception", e);
            }
        }

        @Override
        protected void onPostExecute(Boolean success) {
            Log.d(TAG, "UpdateEventTask onPostExecute - success: " + success);
            if (!isAdded()) {
                Log.w(TAG, "Fragment not attached, skipping UI update");
                return;
            }

            if (success) {
                Log.d(TAG, "Event update successful, showing success message and navigating back");
                Toast.makeText(getContext(), getString(R.string.event_update_success), Toast.LENGTH_SHORT).show();
                NavHostFragment.findNavController(EditEventFragment.this).navigateUp();
            } else {
                Log.e(TAG, "Event update failed, showing error: " + errorMessage);
                Toast.makeText(getContext(), getString(R.string.event_update_failed) + ": " + errorMessage, Toast.LENGTH_LONG).show();
            }
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        Log.d(TAG, "onResume called");
    }

    @Override
    public void onPause() {
        super.onPause();
        Log.d(TAG, "onPause called");
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        Log.d(TAG, "onDestroyView called");
    }
}
