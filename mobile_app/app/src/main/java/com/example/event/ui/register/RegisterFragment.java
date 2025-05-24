package com.example.event.ui.register;

import android.app.DatePickerDialog;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;

import android.os.AsyncTask;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.example.event.MainActivity;
import com.example.event.R;
import com.example.event.data.RegisterDataSource;
import com.example.event.data.RegisterRepository;
import com.example.event.data.Result;

import java.util.Calendar;

import android.text.InputType;

import androidx.navigation.fragment.NavHostFragment;
import androidx.navigation.ui.AppBarConfiguration;
import androidx.navigation.ui.NavigationUI;

public class RegisterFragment extends Fragment {

    private static final String ARG_PARAM1 = "param1";
    private static final String ARG_PARAM2 = "param2";

    private String mParam1;
    private String mParam2;

    public RegisterFragment() {
    }

    public static RegisterFragment newInstance(String param1, String param2) {
        RegisterFragment fragment = new RegisterFragment();
        Bundle args = new Bundle();
        args.putString(ARG_PARAM1, param1);
        args.putString(ARG_PARAM2, param2);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            mParam1 = getArguments().getString(ARG_PARAM1);
            mParam2 = getArguments().getString(ARG_PARAM2);
        }
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_register, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        Log.d("RegisterFragment", "onViewCreated wywołane");

        EditText usernameEditText = view.findViewById(R.id.editTextUsername);
        EditText firstNameEditText = view.findViewById(R.id.editTextFirstName);
        EditText lastNameEditText = view.findViewById(R.id.editTextLastName);
        EditText birthDateEditText = view.findViewById(R.id.editTextBirthDate);
        EditText emailEditText = view.findViewById(R.id.editTextEmail);
        EditText countryCodeEditText = view.findViewById(R.id.editTextCountryCode);
        EditText phoneNumberEditText = view.findViewById(R.id.editTextPhoneNumber);
        EditText passwordEditText = view.findViewById(R.id.editTextPassword);
        EditText confirmPasswordEditText = view.findViewById(R.id.editTextConfirmPassword);
        Button registerButton = view.findViewById(R.id.buttonRegisterSubmit);
        TextView goToLoginText = view.findViewById(R.id.textGoToLogin);

        goToLoginText.setOnClickListener(v -> {
            NavHostFragment.findNavController(RegisterFragment.this).navigate(R.id.navigation_login);
        });

        // DatePickerDialog for birth date
        birthDateEditText.setFocusable(false);
        birthDateEditText.setFocusableInTouchMode(false);
        birthDateEditText.setClickable(true);
        birthDateEditText.setInputType(InputType.TYPE_NULL);
        birthDateEditText.setOnClickListener(v -> {
            final Calendar calendar = Calendar.getInstance();
            int year = calendar.get(Calendar.YEAR);
            int month = calendar.get(Calendar.MONTH);
            int day = calendar.get(Calendar.DAY_OF_MONTH);

            DatePickerDialog datePickerDialog = new DatePickerDialog(
                requireContext(),
                (view1, selectedYear, selectedMonth, selectedDay) -> {
                    String formatted = String.format("%04d-%02d-%02d", selectedYear, selectedMonth + 1, selectedDay);
                    birthDateEditText.setText(formatted);
                },
                year, month, day
            );
            datePickerDialog.show();
        });

        registerButton.setOnClickListener(v -> {
            String username = usernameEditText.getText().toString().trim();
            String firstName = firstNameEditText.getText().toString().trim();
            String lastName = lastNameEditText.getText().toString().trim();
            String birthDate = birthDateEditText.getText().toString().trim();
            String email = emailEditText.getText().toString().trim();
            String countryCode = countryCodeEditText.getText().toString().trim();
            String phoneNumber = phoneNumberEditText.getText().toString().trim();
            String password = passwordEditText.getText().toString();
            String confirmPassword = confirmPasswordEditText.getText().toString();

            if (username.isEmpty()) {
                usernameEditText.setError("Podaj nazwę użytkownika");
                return;
            }
            if (firstName.isEmpty()) {
                firstNameEditText.setError("Podaj imię");
                return;
            }
            if (lastName.isEmpty()) {
                lastNameEditText.setError("Podaj nazwisko");
                return;
            }
            if (birthDate.isEmpty()) {
                birthDateEditText.setError("Podaj datę urodzenia");
                return;
            }
            if (email.isEmpty() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                emailEditText.setError("Podaj poprawny email");
                return;
            }
            if (countryCode.isEmpty()) {
                countryCodeEditText.setError("Podaj kod kraju");
                return;
            }
            if (phoneNumber.isEmpty()) {
                phoneNumberEditText.setError("Podaj numer telefonu");
                return;
            }
            if (password.length() < 6) {
                passwordEditText.setError("Hasło musi mieć co najmniej 6 znaków");
                return;
            }
            if (!password.equals(confirmPassword)) {
                confirmPasswordEditText.setError("Hasła nie są zgodne");
                return;
            }

            Log.d("RegisterFragment", "Kliknięto przycisk rejestracji: username=" + username + ", email=" + email);

            new android.os.AsyncTask<Void, Void, Result<Void>>() {
                @Override
                protected Result<Void> doInBackground(Void... voids) {
                    RegisterRepository registerRepository = RegisterRepository.getInstance(new RegisterDataSource());
                    return registerRepository.register(
                        username, firstName, lastName, birthDate, email, countryCode, phoneNumber, password, confirmPassword
                    );
                }

                @Override
                protected void onPostExecute(Result<Void> result) {
                    if (result instanceof Result.Success) {
                        Log.d("RegisterFragment", "Rejestracja zakończona sukcesem dla użytkownika: " + username);
                        Toast.makeText(getContext(), "Rejestracja udana!", Toast.LENGTH_SHORT).show();
                        NavHostFragment.findNavController(RegisterFragment.this).navigate(R.id.navigation_login);
                    } else {
                        Exception error = ((Result.Error) result).getError();
                        Log.e("RegisterFragment", "Błąd rejestracji: " + error.getMessage());
                        Toast.makeText(getContext(), "Błąd rejestracji: " + error.getMessage(), Toast.LENGTH_LONG).show();
                    }
                }
            }.execute();
        });

        AppBarConfiguration appBarConfiguration = new AppBarConfiguration.Builder(
                NavHostFragment.findNavController(this).getGraph()
        ).build();

        NavigationUI.setupActionBarWithNavController(
                (AppCompatActivity) requireActivity(),
                NavHostFragment.findNavController(this),
                appBarConfiguration
        );
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();

        AppBarConfiguration appBarConfiguration = new AppBarConfiguration.Builder(
                R.id.navigation_home, R.id.navigation_user, R.id.navigation_notifications
        ).build();

        NavigationUI.setupActionBarWithNavController(
                (AppCompatActivity) requireActivity(),
                NavHostFragment.findNavController(this),
                appBarConfiguration
        );
    }
}
