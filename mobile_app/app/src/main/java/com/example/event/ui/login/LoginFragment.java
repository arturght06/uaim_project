package com.example.event.ui.login;

import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProvider;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.StringRes;
import androidx.fragment.app.Fragment;
import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.example.event.databinding.FragmentLoginBinding;

import com.example.event.R;
import androidx.navigation.fragment.NavHostFragment;
import androidx.navigation.ui.AppBarConfiguration;
import androidx.navigation.ui.NavigationUI;

public class LoginFragment extends Fragment {

    private LoginViewModel loginViewModel;
    private FragmentLoginBinding binding;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {

        Log.d("LoginFragment", "onCreateView wywołane");
        binding = FragmentLoginBinding.inflate(inflater, container, false);
        return binding.getRoot();

    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        Log.d("LoginFragment", "onViewCreated wywołane");

        AppBarConfiguration appBarConfiguration = new AppBarConfiguration.Builder(
                NavHostFragment.findNavController(this).getGraph()
        ).build();

        NavigationUI.setupActionBarWithNavController(
                (AppCompatActivity) requireActivity(),
                NavHostFragment.findNavController(this),
                appBarConfiguration
        );

        loginViewModel = new ViewModelProvider(this, new LoginViewModelFactory())
                .get(LoginViewModel.class);

        final EditText usernameEditText = binding.username;
        final EditText passwordEditText = binding.password;
        final Button loginButton = binding.login;
        final ProgressBar loadingProgressBar = binding.loading;

        loginViewModel.getLoginFormState().observe(getViewLifecycleOwner(), new Observer<LoginFormState>() {
            @Override
            public void onChanged(@Nullable LoginFormState loginFormState) {
                Log.d("LoginFragment", "LoginFormState zmieniony: " + loginFormState);
                if (loginFormState == null) {
                    return;
                }
                loginButton.setEnabled(loginFormState.isDataValid());
                if (loginFormState.getUsernameError() != null) {
                    usernameEditText.setError(getString(loginFormState.getUsernameError()));
                }
                if (loginFormState.getPasswordError() != null) {
                    passwordEditText.setError(getString(loginFormState.getPasswordError()));
                }
            }
        });

        loginViewModel.getLoginResult().observe(getViewLifecycleOwner(), new Observer<LoginResult>() {
            @Override
            public void onChanged(@Nullable LoginResult loginResult) {
                Log.d("LoginFragment", "LoginResult zmieniony: " + loginResult);
                if (loginResult == null) {
                    return;
                }
                loadingProgressBar.setVisibility(View.GONE);
                if (loginResult.getError() != null) {
                    showLoginFailed(loginResult.getError());
                }
                if (loginResult.getSuccess() != null) {
                    updateUiWithUser(loginResult.getSuccess());
                }
            }
        });

        TextWatcher afterTextChangedListener = new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
                // ignore
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                // ignore
            }

            @Override
            public void afterTextChanged(Editable s) {
                loginViewModel.loginDataChanged(usernameEditText.getText().toString(),
                        passwordEditText.getText().toString());
            }
        };
        usernameEditText.addTextChangedListener(afterTextChangedListener);
        passwordEditText.addTextChangedListener(afterTextChangedListener);
        passwordEditText.setOnEditorActionListener(new TextView.OnEditorActionListener() {

            @Override
            public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
                if (actionId == EditorInfo.IME_ACTION_DONE) {
                    loginViewModel.login(usernameEditText.getText().toString(),
                            passwordEditText.getText().toString());
                }
                return false;
            }
        });

        loginButton.setOnClickListener(v -> {
            Log.d("LoginFragment", "Kliknięto przycisk logowania");
            loadingProgressBar.setVisibility(View.VISIBLE);
            loginViewModel.login(usernameEditText.getText().toString(),
                    passwordEditText.getText().toString());
            loginViewModel.getLoginResult().observe(getViewLifecycleOwner(), loginResult -> {
                Log.d("LoginFragment", "LoginResult (po kliknięciu): " + loginResult);
                loadingProgressBar.setVisibility(View.GONE);
                if (loginResult.getError() != null) {
                    Log.e("LoginFragment", "Błąd logowania: " + loginResult.getError());
                    Toast.makeText(getContext(), getString(loginResult.getError()), Toast.LENGTH_LONG).show();
                }
                if (loginResult.getSuccess() != null) {
                    Log.d("LoginFragment", "Logowanie zakończone sukcesem: " + loginResult.getSuccess().getDisplayName());
                    updateUiWithUser(loginResult.getSuccess());
                }
            });
        });
    }

    private void updateUiWithUser(LoggedInUserView model) {
        Log.d("LoginFragment", "updateUiWithUser: " + model.getDisplayName());
        String welcome = getString(R.string.welcome) + model.getDisplayName();
        // TODO : initiate successful logged in experience
        if (getContext() != null && getContext().getApplicationContext() != null) {
            Toast.makeText(getContext().getApplicationContext(), welcome, Toast.LENGTH_LONG).show();
        }
        // Przejdź do ekranu użytkownika po zalogowaniu
        NavHostFragment.findNavController(this).navigate(R.id.navigation_user);
    }

    private void showLoginFailed(@StringRes Integer errorString) {
        Log.e("LoginFragment", "showLoginFailed: " + errorString);
        if (getContext() != null && getContext().getApplicationContext() != null) {
            Toast.makeText(
                    getContext().getApplicationContext(),
                    errorString,
                    Toast.LENGTH_LONG).show();
        }
    }

    @Override
    public void onDestroyView() {
        Log.d("LoginFragment", "onDestroyView wywołane");
        super.onDestroyView();
        binding = null;

        // Reset the AppBarConfiguration to the default top-level destinations
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
