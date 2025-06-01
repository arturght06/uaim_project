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

public class AddEventFragment extends Fragment {

    private static final String TAG = "AddEventFragment";
    
    private EditText editTextEventTitle;
    private EditText editTextEventDescription;
    private EditText editTextEventDate;
    private EditText editTextAddress;
    private EditText editTextCity;
    private EditText editTextCountry;
    private EditText editTextMaxParticipants;
    private Button buttonSaveEvent;

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        Log.d(TAG, "onCreateView called");
        return inflater.inflate(R.layout.fragment_add_event, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        Log.d(TAG, "onViewCreated started");

        // Check if user is logged in
        LoggedInUser user = LoginRepository.getInstance().getLoggedInUser();
        if (user == null) {
            Log.w(TAG, "User not logged in, navigating back");
            Toast.makeText(getContext(), "Musisz być zalogowany, aby dodać wydarzenie", Toast.LENGTH_SHORT).show();
            NavHostFragment.findNavController(this).navigateUp();
            return;
        }

        Log.d(TAG, "User logged in: " + user.getUserId());
        initViews(view);
        setupClickListeners();
        Log.d(TAG, "onViewCreated completed");
    }

    private void initViews(View view) {
        Log.d(TAG, "initViews started");
        editTextEventTitle = view.findViewById(R.id.editTextEventTitle);
        editTextEventDescription = view.findViewById(R.id.editTextEventDescription);
        editTextEventDate = view.findViewById(R.id.editTextEventDate);
        editTextAddress = view.findViewById(R.id.editTextAddress);
        editTextCity = view.findViewById(R.id.editTextCity);
        editTextCountry = view.findViewById(R.id.editTextCountry);
        editTextMaxParticipants = view.findViewById(R.id.editTextMaxParticipants);
        buttonSaveEvent = view.findViewById(R.id.buttonSaveEvent);

        Log.d(TAG, "All views initialized successfully");
        setupEventDatePicker();
    }

    private void setupEventDatePicker() {
        Log.d(TAG, "setupEventDatePicker called");
        editTextEventDate.setFocusable(false);
        editTextEventDate.setFocusableInTouchMode(false);
        editTextEventDate.setClickable(true);
        editTextEventDate.setInputType(InputType.TYPE_NULL);
        editTextEventDate.setOnClickListener(v -> {
            Log.d(TAG, "Event date field clicked, showing date picker");
            showDateTimePicker();
        });
    }

    private void showDateTimePicker() {
        Log.d(TAG, "showDateTimePicker started");
        final Calendar calendar = Calendar.getInstance();
        int year = calendar.get(Calendar.YEAR);
        int month = calendar.get(Calendar.MONTH);
        int day = calendar.get(Calendar.DAY_OF_MONTH);
        int hour = calendar.get(Calendar.HOUR_OF_DAY);
        int minute = calendar.get(Calendar.MINUTE);

        Log.d(TAG, "Current date/time: " + year + "-" + (month+1) + "-" + day + " " + hour + ":" + minute);

        DatePickerDialog datePickerDialog = new DatePickerDialog(
            requireContext(),
            (view, selectedYear, selectedMonth, selectedDay) -> {
                Log.d(TAG, "Date selected: " + selectedYear + "-" + (selectedMonth+1) + "-" + selectedDay);
                // After date selection, show time picker
                TimePickerDialog timePickerDialog = new TimePickerDialog(
                    requireContext(),
                    (timeView, selectedHour, selectedMinute) -> {
                        String formatted = String.format(Locale.getDefault(), "%04d-%02d-%02d %02d:%02d", 
                                selectedYear, selectedMonth + 1, selectedDay, selectedHour, selectedMinute);
                        Log.d(TAG, "Time selected, formatted date/time: " + formatted);
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
        Log.d(TAG, "setupClickListeners called");
        buttonSaveEvent.setOnClickListener(v -> {
            Log.d(TAG, "Save event button clicked");
            if (validateInputs()) {
                createEvent();
            }
        });
    }

    private boolean validateInputs() {
        Log.d(TAG, "validateInputs started");
        String title = editTextEventTitle.getText().toString().trim();
        String description = editTextEventDescription.getText().toString().trim();
        String eventDate = editTextEventDate.getText().toString().trim();
        String address = editTextAddress.getText().toString().trim();
        String city = editTextCity.getText().toString().trim();
        String country = editTextCountry.getText().toString().trim();

        Log.d(TAG, "Validating inputs - title: '" + title + "', description length: " + description.length() + 
              ", eventDate: '" + eventDate + "', address: '" + address + "', city: '" + city + "', country: '" + country + "'");

        if (TextUtils.isEmpty(title)) {
            Log.w(TAG, "Title validation failed");
            editTextEventTitle.setError(getString(R.string.validation_title_required));
            return false;
        }

        if (TextUtils.isEmpty(description)) {
            Log.w(TAG, "Description validation failed");
            editTextEventDescription.setError(getString(R.string.validation_description_required));
            return false;
        }

        if (TextUtils.isEmpty(eventDate)) {
            Log.w(TAG, "Event date validation failed");
            editTextEventDate.setError(getString(R.string.validation_date_required));
            return false;
        }

        if (TextUtils.isEmpty(address)) {
            Log.w(TAG, "Address validation failed");
            editTextAddress.setError(getString(R.string.validation_address_required));
            return false;
        }

        if (TextUtils.isEmpty(city)) {
            Log.w(TAG, "City validation failed");
            editTextCity.setError(getString(R.string.validation_city_required));
            return false;
        }

        if (TextUtils.isEmpty(country)) {
            Log.w(TAG, "Country validation failed");
            editTextCountry.setError(getString(R.string.validation_country_required));
            return false;
        }

        // Validate date format
        if (!isValidDateFormat(eventDate)) {
            Log.w(TAG, "Date format validation failed for: " + eventDate);
            editTextEventDate.setError(getString(R.string.validation_date_format));
            return false;
        }

        Log.d(TAG, "All inputs validated successfully");
        return true;
    }

    private boolean isValidDateFormat(String date) {
        Log.d(TAG, "isValidDateFormat checking: " + date);
        try {
            SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault());
            format.setLenient(false);
            Date parsedDate = format.parse(date);
            boolean isValid = parsedDate != null;
            Log.d(TAG, "Date format validation result: " + isValid);
            return isValid;
        } catch (Exception e) {
            Log.w(TAG, "Date format validation exception", e);
            return false;
        }
    }

    private void createEvent() {
        Log.d(TAG, "createEvent started");
        String title = editTextEventTitle.getText().toString().trim();
        String description = editTextEventDescription.getText().toString().trim();
        String eventDate = editTextEventDate.getText().toString().trim();
        String address = editTextAddress.getText().toString().trim();
        String city = editTextCity.getText().toString().trim();
        String country = editTextCountry.getText().toString().trim();
        String maxParticipantsStr = editTextMaxParticipants.getText().toString().trim();

        Log.d(TAG, "Creating event with data - title: " + title + ", description length: " + description.length() + 
              ", eventDate: " + eventDate + ", address: " + address + ", city: " + city + ", country: " + country + 
              ", maxParticipants: " + maxParticipantsStr);

        new CreateEventTask().execute(title, description, eventDate, address, city, country, maxParticipantsStr);
    }

    private class CreateEventTask extends AsyncTask<String, Void, Boolean> {
        private String errorMessage = "";

        @Override
        protected Boolean doInBackground(String... params) {
            Log.d(TAG, "CreateEventTask doInBackground started");
            try {
                LoggedInUser user = LoginRepository.getInstance().getLoggedInUser();
                if (user == null) {
                    Log.e(TAG, "User not logged in during task execution");
                    errorMessage = "Użytkownik nie jest zalogowany";
                    return false;
                }

                String title = params[0];
                String description = params[1];
                String eventDate = params[2];
                String address = params[3];
                String city = params[4];
                String country = params[5];
                String maxParticipantsStr = params[6];

                Log.d(TAG, "Task parameters - userId: " + user.getUserId() + ", title: " + title);

                // First create location
                Log.d(TAG, "Creating location first");
                String locationId = createLocation(address, city, country);
                if (locationId == null) {
                    Log.e(TAG, "Failed to create location");
                    return false;
                }

                Log.d(TAG, "Location created successfully with ID: " + locationId);

                // Convert date format for API
                SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault());
                SimpleDateFormat outputFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault());
                Date date = inputFormat.parse(eventDate);
                String formattedDate = outputFormat.format(date);

                Log.d(TAG, "Date converted from '" + eventDate + "' to '" + formattedDate + "'");

                // Create event
                URL url = new URL(ApiConfig.BASE_URL + "api/events/");
                Log.d(TAG, "Creating event at URL: " + url.toString());
                
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                
                String accessToken = TokenManager.getAccessToken();
                if (accessToken != null) {
                    conn.setRequestProperty("Authorization", "Bearer " + accessToken);
                    Log.d(TAG, "Access token added to request");
                } else {
                    Log.w(TAG, "No access token available");
                }
                conn.setDoOutput(true);

                JSONObject jsonPayload = new JSONObject();
                jsonPayload.put("organizer_id", user.getUserId());
                jsonPayload.put("location_id", locationId);
                jsonPayload.put("event_date", formattedDate);
                jsonPayload.put("title", title);
                jsonPayload.put("description", description);
                
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

                Log.d(TAG, "Event JSON Payload: " + jsonPayload.toString());

                OutputStream os = conn.getOutputStream();
                os.write(jsonPayload.toString().getBytes());
                os.close();

                int responseCode = conn.getResponseCode();
                Log.d(TAG, "Event creation response code: " + responseCode);

                if (responseCode == HttpURLConnection.HTTP_CREATED) {
                    Log.d(TAG, "Event created successfully");
                    return true;
                } else {
                    BufferedReader errorReader = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
                    StringBuilder errorResponse = new StringBuilder();
                    String line;
                    while ((line = errorReader.readLine()) != null) {
                        errorResponse.append(line);
                    }
                    errorReader.close();
                    errorMessage = "Błąd serwera: " + errorResponse.toString();
                    Log.e(TAG, "Event creation failed - Response code: " + responseCode + ", Error: " + errorResponse.toString());
                    return false;
                }

            } catch (Exception e) {
                Log.e(TAG, "CreateEventTask exception", e);
                errorMessage = "Błąd podczas tworzenia wydarzenia: " + e.getMessage();
                return false;
            }
        }

        private String createLocation(String address, String city, String country) {
            Log.d(TAG, "createLocation started with address: " + address + ", city: " + city + ", country: " + country);
            try {
                URL url = new URL(ApiConfig.BASE_URL + "api/location/");
                Log.d(TAG, "Creating location at URL: " + url.toString());
                
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
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

                Log.d(TAG, "Location JSON payload: " + locationPayload.toString());

                OutputStream os = conn.getOutputStream();
                os.write(locationPayload.toString().getBytes());
                os.close();

                int responseCode = conn.getResponseCode();
                Log.d(TAG, "Location creation response code: " + responseCode);
                
                if (responseCode == HttpURLConnection.HTTP_CREATED || responseCode == HttpURLConnection.HTTP_OK) {
                    try {
                        BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                        StringBuilder response = new StringBuilder();
                        String line;
                        while ((line = in.readLine()) != null) {
                            response.append(line);
                        }
                        in.close();

                        Log.d(TAG, "Location creation response: " + response.toString());
                        
                        if (response.length() > 0) {
                            JSONObject responseJson = new JSONObject(response.toString());
                            String locationId = responseJson.getString("id");
                            Log.d(TAG, "Location created successfully with ID: " + locationId);
                            return locationId;
                        } else {
                            Log.w(TAG, "Empty response body, but request was successful");
                            errorMessage = "Otrzymano pustą odpowiedź od serwera podczas tworzenia lokalizacji";
                            return null;
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Error reading location response", e);
                        errorMessage = "Błąd podczas odczytu odpowiedzi serwera: " + e.getMessage();
                        return null;
                    }
                } else {
                    BufferedReader errorReader = null;
                    try {
                        errorReader = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
                        StringBuilder errorResponse = new StringBuilder();
                        String line;
                        while ((line = errorReader.readLine()) != null) {
                            errorResponse.append(line);
                        }
                        errorMessage = "Błąd podczas tworzenia lokalizacji: " + errorResponse.toString();
                        Log.e(TAG, "Location creation error - Response code: " + responseCode + ", Error: " + errorResponse.toString());
                    } catch (Exception e) {
                        errorMessage = "Błąd serwera podczas tworzenia lokalizacji (kod: " + responseCode + ")";
                        Log.e(TAG, "Error reading error response", e);
                    } finally {
                        if (errorReader != null) {
                            try {
                                errorReader.close();
                            } catch (Exception e) {
                                Log.w(TAG, "Error closing error reader", e);
                            }
                        }
                    }
                    return null;
                }
            } catch (Exception e) {
                Log.e(TAG, "createLocation exception", e);
                errorMessage = "Błąd podczas tworzenia lokalizacji: " + e.getMessage();
                return null;
            }
        }

        @Override
        protected void onPostExecute(Boolean success) {
            Log.d(TAG, "CreateEventTask onPostExecute - success: " + success);
            if (!isAdded()) {
                Log.w(TAG, "Fragment not attached, skipping UI update");
                return;
            }

            if (success) {
                Log.d(TAG, "Event creation successful, showing success message and navigating back");
                Toast.makeText(getContext(), getString(R.string.event_create_success), Toast.LENGTH_SHORT).show();
                NavHostFragment.findNavController(AddEventFragment.this).navigateUp();
            } else {
                Log.e(TAG, "Event creation failed, showing error: " + errorMessage);
                Toast.makeText(getContext(), getString(R.string.event_create_failed) + ": " + errorMessage, Toast.LENGTH_LONG).show();
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
