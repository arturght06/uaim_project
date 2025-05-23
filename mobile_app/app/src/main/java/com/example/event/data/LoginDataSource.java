package com.example.event.data;

import com.example.event.data.model.LoggedInUser;

import java.io.IOException;
import org.json.JSONObject;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.OutputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import android.util.Log; // Dodano import logowania

/**
 * Class that handles authentication w/ login credentials and retrieves user information.
 */
public class LoginDataSource {

    public Result<LoggedInUser> login(String username, String password) {
        Log.d("LoginDataSource", "Rozpoczynam logowanie: username=" + username);
        try {
            URL url = new URL(ApiConfig.BASE_URL + "auth/login");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            JSONObject json = new JSONObject();
            json.put("login", username);
            json.put("password", password);

            Log.d("LoginDataSource", "Wysyłam dane: " + json.toString());

            OutputStream os = conn.getOutputStream();
            os.write(json.toString().getBytes());
            os.close();

            int responseCode = conn.getResponseCode();
            Log.d("LoginDataSource", "Kod odpowiedzi HTTP: " + responseCode);

            BufferedReader in = new BufferedReader(new InputStreamReader(
                    responseCode == HttpURLConnection.HTTP_OK ? conn.getInputStream() : conn.getErrorStream()));
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = in.readLine()) != null) {
                response.append(line);
            }
            in.close();

            Log.d("LoginDataSource", "Odpowiedź serwera: " + response);

            if (responseCode == HttpURLConnection.HTTP_OK) {
                JSONObject responseJson = new JSONObject(response.toString());
                if (responseJson.getBoolean("success")) {
                    JSONObject user = responseJson.getJSONObject("user");
                    String userId = user.getString("id");
                    String displayName = user.getString("username");

                    // Save tokens locally (e.g., SharedPreferences)
                    String accessToken = responseJson.getJSONObject("tokens").getString("access_token");
                    String refreshToken = responseJson.getJSONObject("tokens").getString("refresh_token");
                    TokenManager.saveTokens(accessToken, refreshToken);

                    Log.d("LoginDataSource", "Logowanie udane. userId=" + userId + ", displayName=" + displayName);
                    return new Result.Success<>(new LoggedInUser(userId, displayName));
                } else {
                    Log.e("LoginDataSource", "Logowanie nieudane: success=false");
                    return new Result.Error(new Exception("Niepoprawne dane logowania."));
                }
            } else if (responseCode == HttpURLConnection.HTTP_UNAUTHORIZED) {
                Log.e("LoginDataSource", "Błąd: Nieautoryzowany dostęp.");
                return new Result.Error(new Exception("Nieautoryzowany dostęp."));
            } else {
                Log.e("LoginDataSource", "Błąd serwera: " + response.toString());
                return new Result.Error(new Exception("Błąd serwera: " + response.toString()));
            }
        } catch (Exception e) {
            Log.e("LoginDataSource", "Wyjątek podczas logowania", e);
            return new Result.Error(new IOException("Error logging in", e));
        }
    }

    public void logout() {
        // Clear tokens locally
        TokenManager.clearTokens();
    }
}
