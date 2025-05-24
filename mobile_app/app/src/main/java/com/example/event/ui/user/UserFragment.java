package com.example.event.ui.user;

import android.os.AsyncTask;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.fragment.NavHostFragment;
import com.example.event.R;
import com.example.event.data.ApiConfig;
import com.example.event.data.LoginRepository;
import com.example.event.data.model.LoggedInUser;
import com.example.event.databinding.FragmentUserBinding;
import com.google.android.material.appbar.CollapsingToolbarLayout;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import org.json.JSONObject;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.InputStreamReader;
import java.io.BufferedReader;

public class UserFragment extends Fragment {

    private FragmentUserBinding binding;
    private String firstNameForTitle = null;

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        binding = FragmentUserBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        return root;
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setHasOptionsMenu(true); // Pozwala na menu w ActionBarze
    }

    @Override
    public void onCreateOptionsMenu(@NonNull Menu menu, @NonNull MenuInflater inflater) {
        menu.clear();
        inflater.inflate(R.menu.menu_user_logout, menu);

        LoggedInUser user = com.example.event.data.LoginRepository.getInstance().getLoggedInUser();
        MenuItem logoutItem = menu.findItem(R.id.action_logout);
        if (logoutItem != null) {
            logoutItem.setVisible(user != null);
        }
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        if (item.getItemId() == R.id.action_logout) {
            com.example.event.data.LoginRepository.getInstance().logout();

            View view = getView();
            if (view != null) {
                View profileContainer = view.findViewById(R.id.user_profile_container);
                View loginPrompt = view.findViewById(R.id.text_user_prompt);
                View loginButtons = view.findViewById(R.id.user_buttons_container);
                if (profileContainer != null) profileContainer.setVisibility(View.GONE);
                if (loginPrompt != null) loginPrompt.setVisibility(View.VISIBLE);
                if (loginButtons != null) loginButtons.setVisibility(View.VISIBLE);
            }

            requireActivity().setTitle(R.string.title_user);
            BottomNavigationView navView = requireActivity().findViewById(R.id.nav_view);
            if (navView != null) {
                navView.getMenu().findItem(R.id.navigation_user).setTitle(R.string.title_user);
            }
            androidx.navigation.NavController navController = NavHostFragment.findNavController(this);
            androidx.navigation.NavDestination destination = navController.getCurrentDestination();
            if (destination != null && destination.getId() == R.id.navigation_user) {
                destination.setLabel(getString(R.string.title_user));
            }

            requireActivity().invalidateOptionsMenu();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        View profileContainer = view.findViewById(R.id.user_profile_container);
        View loginPrompt = view.findViewById(R.id.text_user_prompt);
        View loginButtons = view.findViewById(R.id.user_buttons_container);

        view.findViewById(R.id.button_login).setOnClickListener(v ->
            NavHostFragment.findNavController(this).navigate(R.id.navigation_login)
        );
        view.findViewById(R.id.button_register).setOnClickListener(v ->
            NavHostFragment.findNavController(this).navigate(R.id.navigation_register)
        );

        LoggedInUser user = com.example.event.data.LoginRepository.getInstance().getLoggedInUser();

        if (user != null) {
            profileContainer.setVisibility(View.VISIBLE);
            loginPrompt.setVisibility(View.GONE);
            loginButtons.setVisibility(View.GONE);

            new AsyncTask<Void, Void, JSONObject>() {
                @Override
                protected JSONObject doInBackground(Void... voids) {
                    try {
                        String userId = user.getUserId();
                        URL url = new URL(ApiConfig.BASE_URL + "users/" + userId);
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
                            JSONObject responseJson = new JSONObject(response.toString());
                            if (responseJson.has("user")) {
                                return responseJson.getJSONObject("user");
                            } else {
                                return responseJson;
                            }
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    return null;
                }

                @Override
                protected void onPostExecute(JSONObject userJson) {
                    if (userJson != null) {
                        String username = userJson.optString("username", "-");
                        String email = userJson.optString("email", "-");
                        String firstName = userJson.optString("name", "-");
                        String lastName = userJson.optString("surname", "-");
                        String birthDate = userJson.optString("birthday", "-");

                        ((TextView) view.findViewById(R.id.text_profile_username)).setText("Nazwa użytkownika: " + username);
                        ((TextView) view.findViewById(R.id.text_profile_email)).setText("Email: " + email);
                        ((TextView) view.findViewById(R.id.text_profile_firstname)).setText("Imię: " + firstName);
                        ((TextView) view.findViewById(R.id.text_profile_lastname)).setText("Nazwisko: " + lastName);
                        ((TextView) view.findViewById(R.id.text_profile_birthdate)).setText("Data urodzenia: " + birthDate);

                        firstNameForTitle = firstName;

                        if (isResumed()) {
                            updateTitles();
                        }
                    } else {
                        ((TextView) view.findViewById(R.id.text_profile_username)).setText("Nazwa użytkownika: -");
                        ((TextView) view.findViewById(R.id.text_profile_email)).setText("Email: -");
                        ((TextView) view.findViewById(R.id.text_profile_firstname)).setText("Imię: -");
                        ((TextView) view.findViewById(R.id.text_profile_lastname)).setText("Nazwisko: -");
                        ((TextView) view.findViewById(R.id.text_profile_birthdate)).setText("Data urodzenia: -");
                        firstNameForTitle = null;
                        updateTitles();
                    }
                }
            }.execute();

            requireActivity().invalidateOptionsMenu();
        } else {
            profileContainer.setVisibility(View.GONE);
            loginPrompt.setVisibility(View.VISIBLE);
            loginButtons.setVisibility(View.VISIBLE);

            firstNameForTitle = null;
            updateTitles();

            requireActivity().invalidateOptionsMenu();
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        updateTitles();
    }

    private void updateTitles() {
        if (firstNameForTitle != null && !firstNameForTitle.equals("-")) {

            requireActivity().setTitle("Witaj, " + firstNameForTitle + "!");

            BottomNavigationView navView = requireActivity().findViewById(R.id.nav_view);
            if (navView != null) {
                navView.getMenu().findItem(R.id.navigation_user).setTitle(firstNameForTitle);
            }
            androidx.navigation.NavController navController = NavHostFragment.findNavController(this);
            androidx.navigation.NavDestination destination = navController.getCurrentDestination();
            if (destination != null && destination.getId() == R.id.navigation_user) {
                destination.setLabel("Witaj, " + firstNameForTitle + "!");
            }
        } else {
            requireActivity().setTitle(R.string.title_user);
            BottomNavigationView navView = requireActivity().findViewById(R.id.nav_view);
            if (navView != null) {
                navView.getMenu().findItem(R.id.navigation_user).setTitle(R.string.title_user);
            }
            androidx.navigation.NavController navController = NavHostFragment.findNavController(this);
            androidx.navigation.NavDestination destination = navController.getCurrentDestination();
            if (destination != null && destination.getId() == R.id.navigation_user) {
                destination.setLabel(getString(R.string.title_user));
            }
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
