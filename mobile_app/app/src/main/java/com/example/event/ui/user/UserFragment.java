package com.example.event.ui.user;

import android.os.AsyncTask;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.fragment.NavHostFragment;
import com.example.event.R;
import com.example.event.data.LoginRepository;
import com.example.event.data.model.LoggedInUser;
import com.example.event.databinding.FragmentUserBinding;
import org.json.JSONObject;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.InputStreamReader;
import java.io.BufferedReader;

public class UserFragment extends Fragment {

    private FragmentUserBinding binding;

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        binding = FragmentUserBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        return root;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        View profileContainer = view.findViewById(R.id.user_profile_container);
        View loginPrompt = view.findViewById(R.id.text_user_prompt);
        View loginButtons = view.findViewById(R.id.user_buttons_container);
        Button logoutButton = view.findViewById(R.id.button_logout);

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
                        URL url = new URL("http://192.168.1.184:8800/users/" + userId);
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
                    } else {
                        ((TextView) view.findViewById(R.id.text_profile_username)).setText("Nazwa użytkownika: -");
                        ((TextView) view.findViewById(R.id.text_profile_email)).setText("Email: -");
                        ((TextView) view.findViewById(R.id.text_profile_firstname)).setText("Imię: -");
                        ((TextView) view.findViewById(R.id.text_profile_lastname)).setText("Nazwisko: -");
                        ((TextView) view.findViewById(R.id.text_profile_birthdate)).setText("Data urodzenia: -");
                    }
                }
            }.execute();

            logoutButton.setOnClickListener(v -> {
                com.example.event.data.LoginRepository.getInstance().logout();
                profileContainer.setVisibility(View.GONE);
                loginPrompt.setVisibility(View.VISIBLE);
                loginButtons.setVisibility(View.VISIBLE);
            });
        } else {
            profileContainer.setVisibility(View.GONE);
            loginPrompt.setVisibility(View.VISIBLE);
            loginButtons.setVisibility(View.VISIBLE);
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
