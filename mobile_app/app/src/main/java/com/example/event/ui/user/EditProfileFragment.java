package com.example.event.ui.user;

import android.app.DatePickerDialog;
import android.os.AsyncTask;
import android.os.Bundle;
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
import java.util.Calendar;
import java.util.regex.Pattern;

public class EditProfileFragment extends Fragment {

    private static final String TAG = "EditProfileFragment";

    private EditText editTextUsername, editTextFirstName, editTextLastName, editTextBirthDate, editTextEmail, editTextCountryCode, editTextPhoneNumber;
    private Button buttonSaveChanges;
    private LoggedInUser currentUser;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_edit_profile, container, false);

        editTextUsername = view.findViewById(R.id.editTextUsernameEdit);
        editTextFirstName = view.findViewById(R.id.editTextFirstNameEdit);
        editTextLastName = view.findViewById(R.id.editTextLastNameEdit);
        editTextBirthDate = view.findViewById(R.id.editTextBirthDateEdit);
        editTextEmail = view.findViewById(R.id.editTextEmailEdit);
        editTextCountryCode = view.findViewById(R.id.editTextCountryCodeEdit);
        editTextPhoneNumber = view.findViewById(R.id.editTextPhoneNumberEdit);
        buttonSaveChanges = view.findViewById(R.id.buttonSaveChanges);

        currentUser = LoginRepository.getInstance().getLoggedInUser();
        if (currentUser == null) {
            Toast.makeText(getContext(), "Błąd: Użytkownik nie jest zalogowany.", Toast.LENGTH_LONG).show();
            NavHostFragment.findNavController(this).popBackStack(); // Go back
            return view;
        }

        populateForm();
        setupBirthDatepicker();

        buttonSaveChanges.setOnClickListener(v -> attemptSaveChanges());

        return view;
    }

    private void populateForm() {
        if (currentUser != null) {
            editTextUsername.setText(currentUser.getDisplayName()); // Username is usually display name
            editTextFirstName.setText(currentUser.getFirstName());
            editTextLastName.setText(currentUser.getLastName());
            editTextBirthDate.setText(currentUser.getBirthDate());
            editTextEmail.setText(currentUser.getEmail());
            
            String currentCountryCode = currentUser.getCountryCode();
            Log.d(TAG, "Populating form with countryCode from LoggedInUser: '" + currentCountryCode + "'");
            editTextCountryCode.setText(currentCountryCode);
            
            editTextPhoneNumber.setText(currentUser.getPhoneNumber());
        }
    }

    private void setupBirthDatepicker() {
        editTextBirthDate.setOnClickListener(v -> {
            final Calendar calendar = Calendar.getInstance();
            int year = calendar.get(Calendar.YEAR);
            int month = calendar.get(Calendar.MONTH);
            int day = calendar.get(Calendar.DAY_OF_MONTH);

            // Try to parse existing date
            String existingDateStr = editTextBirthDate.getText().toString();
            if (!TextUtils.isEmpty(existingDateStr) && Pattern.matches("\\d{4}-\\d{2}-\\d{2}", existingDateStr)) {
                try {
                    String[] parts = existingDateStr.split("-");
                    year = Integer.parseInt(parts[0]);
                    month = Integer.parseInt(parts[1]) - 1; // Month is 0-indexed
                    day = Integer.parseInt(parts[2]);
                } catch (NumberFormatException e) {
                    Log.e(TAG, "Error parsing existing birth date", e);
                }
            }

            DatePickerDialog datePickerDialog = new DatePickerDialog(
                requireContext(),
                (view, selectedYear, selectedMonth, selectedDay) -> {
                    String formattedDate = String.format("%04d-%02d-%02d", selectedYear, selectedMonth + 1, selectedDay);
                    editTextBirthDate.setText(formattedDate);
                },
                year, month, day
            );
            datePickerDialog.show();
        });
    }

    private void attemptSaveChanges() {
        String username = editTextUsername.getText().toString().trim();
        String firstName = editTextFirstName.getText().toString().trim();
        String lastName = editTextLastName.getText().toString().trim();
        String birthDate = editTextBirthDate.getText().toString().trim(); // Should be YYYY-MM-DD
        String email = editTextEmail.getText().toString().trim();
        String countryCode = editTextCountryCode.getText().toString().trim();
        String phoneNumber = editTextPhoneNumber.getText().toString().trim();

        // Basic Validation (similar to RegisterFragment but no password)
        if (TextUtils.isEmpty(username)) {
            editTextUsername.setError("Nazwa użytkownika jest wymagana.");
            return;
        }
        if (TextUtils.isEmpty(firstName)) {
            editTextFirstName.setError("Imię jest wymagane.");
            return;
        }
        if (TextUtils.isEmpty(lastName)) {
            editTextLastName.setError("Nazwisko jest wymagane.");
            return;
        }
        if (TextUtils.isEmpty(email) || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            editTextEmail.setError("Podaj poprawny email.");
            return;
        }
        if (!TextUtils.isEmpty(birthDate) && !Pattern.matches("\\d{4}-\\d{2}-\\d{2}", birthDate)) {
            editTextBirthDate.setError("Format daty: RRRR-MM-DD");
            return;
        }
        // Phone number validation can be more complex, basic check here
        if (TextUtils.isEmpty(countryCode) && !TextUtils.isEmpty(phoneNumber)) {
             editTextCountryCode.setError("Kod kraju jest wymagany z numerem telefonu.");
             return;
        }
         if (!TextUtils.isEmpty(countryCode) && TextUtils.isEmpty(phoneNumber)) {
             editTextPhoneNumber.setError("Numer telefonu jest wymagany z kodem kraju.");
             return;
        }


        new UpdateUserTask().execute(username, firstName, lastName, birthDate, email, countryCode, phoneNumber);
    }

    private class UpdateUserTask extends AsyncTask<String, Void, Boolean> {
        private String errorMsg = null;
        private String updatedCountryCodeForLog; // For logging

        @Override
        protected Boolean doInBackground(String... params) {
            String username = params[0];
            String firstName = params[1];
            String lastName = params[2];
            String birthDate = params[3]; // Backend expects "birthday"
            String email = params[4];
            String countryCode = params[5]; // Backend expects "country_code"
            updatedCountryCodeForLog = countryCode; // Store for onPostExecute logging
            String phoneNumber = params[6]; // Backend expects "phone_number"

            try {
                URL url = new URL(ApiConfig.BASE_URL + "users/" + currentUser.getUserId());
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("PUT");
                conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                String accessToken = TokenManager.getAccessToken();
                if (accessToken == null) {
                    errorMsg = "Brak tokenu dostępu. Zaloguj się ponownie.";
                    return false;
                }
                conn.setRequestProperty("Authorization", "Bearer " + accessToken);
                conn.setDoOutput(true);

                JSONObject jsonPayload = new JSONObject();
                jsonPayload.put("username", username);
                jsonPayload.put("name", firstName);
                jsonPayload.put("surname", lastName);
                if (!TextUtils.isEmpty(birthDate)) jsonPayload.put("birthday", birthDate);
                jsonPayload.put("email", email);
                if (!TextUtils.isEmpty(countryCode)) jsonPayload.put("phone_country_code", countryCode);
                if (!TextUtils.isEmpty(phoneNumber)) jsonPayload.put("phone_number", phoneNumber);

                Log.d(TAG, "UpdateUserTask JSON Payload: " + jsonPayload.toString());

                OutputStream os = conn.getOutputStream();
                os.write(jsonPayload.toString().getBytes("UTF-8"));
                os.close();

                int responseCode = conn.getResponseCode();
                Log.d(TAG, "UpdateUserTask Response Code: " + responseCode);

                if (responseCode == HttpURLConnection.HTTP_OK) {
                    LoginRepository.getInstance().updateLoggedInUserDetails(firstName, lastName, email, birthDate, countryCode, phoneNumber, username);
                    return true;
                } else {
                    // Try to read error message from response
                    BufferedReader br = new BufferedReader(new InputStreamReader( (responseCode >= 200 && responseCode <=299) ? conn.getInputStream() : conn.getErrorStream() ));
                    StringBuilder sb = new StringBuilder();
                    String output;
                    while ((output = br.readLine()) != null) {
                        sb.append(output);
                    }
                    Log.e(TAG, "UpdateUserTask Error Response: " + sb.toString());
                    try {
                        JSONObject errorJson = new JSONObject(sb.toString());
                        if (errorJson.has("error")) {
                            errorMsg = errorJson.getString("error");
                        } else if (errorJson.has("message")) {
                            errorMsg = errorJson.getString("message");
                        } else if (errorJson.has("errors")) {
                            // Handle complex error structures if necessary
                            errorMsg = errorJson.getJSONObject("errors").toString();
                        }
                         else {
                            errorMsg = "Błąd serwera: " + responseCode;
                        }
                    } catch (Exception e) {
                         errorMsg = "Błąd serwera: " + responseCode + ". Nie udało się sparsować odpowiedzi.";
                    }
                    return false;
                }

            } catch (Exception e) {
                Log.e(TAG, "Error during user update", e);
                errorMsg = "Wystąpił błąd: " + e.getMessage();
                return false;
            }
        }

        @Override
        protected void onPostExecute(Boolean success) {
            if (success) {
                Toast.makeText(getContext(), R.string.profile_update_success, Toast.LENGTH_SHORT).show();
                // The LoginRepository.updateLoggedInUserDetails call is already in the original code,
                // which will use the 'updatedCountryCodeForLog' (effectively) that was sent to the server.
                Log.d(TAG, "Profile update success. Country code sent to server was: '" + updatedCountryCodeForLog + "'");
                NavHostFragment.findNavController(EditProfileFragment.this).popBackStack();
            } else {
                String finalErrorMsg = TextUtils.isEmpty(errorMsg) ? getString(R.string.profile_update_failed) : errorMsg;
                Toast.makeText(getContext(), finalErrorMsg, Toast.LENGTH_LONG).show();
            }
        }
    }
}
