package com.example.event.data;

import android.util.Log;

import org.json.JSONObject;

import java.io.OutputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class RegisterDataSource {

    public Result<Void> register(String username, String firstName, String lastName, String birthDate, String email, String countryCode, String phoneNumber, String password, String confirmPassword) {
        Log.d("RegisterDataSource", "Rozpoczynam rejestrację: username=" + username + ", email=" + email);

        try {
            URL url = new URL("http://192.168.1.184:8800/auth/register");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            JSONObject json = new JSONObject();
            json.put("username", username);
            json.put("name", firstName);
            json.put("surname", lastName);
            json.put("birthday", birthDate);
            json.put("email", email);
            json.put("phone_country_code", countryCode);
            json.put("phone_number", phoneNumber);
            json.put("salt", "salt");
            json.put("password", password);

            Log.d("RegisterDataSource", "Wysyłam dane: " + json.toString());

            OutputStream os = conn.getOutputStream();
            os.write(json.toString().getBytes());
            os.close();

            int responseCode = conn.getResponseCode();
            Log.d("RegisterDataSource", "Kod odpowiedzi HTTP: " + responseCode);

            BufferedReader in = new BufferedReader(new InputStreamReader(
                    responseCode == HttpURLConnection.HTTP_OK ? conn.getInputStream() : conn.getErrorStream()));
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = in.readLine()) != null) {
                response.append(line);
            }
            in.close();

            Log.d("RegisterDataSource", "Odpowiedź serwera: " + response);

            if (responseCode == HttpURLConnection.HTTP_OK) {
                JSONObject responseJson = new JSONObject(response.toString());
                if (responseJson.optBoolean("success", true)) {
                    Log.d("RegisterDataSource", "Rejestracja udana.");
                    return new Result.Success<>(null);
                } else {
                    Log.e("RegisterDataSource", "Rejestracja nieudana: success=false");
                    return new Result.Error(new Exception("Rejestracja nieudana."));
                }
            } else {
                Log.e("RegisterDataSource", "Błąd serwera: " + response.toString());
                return new Result.Error(new Exception("Błąd serwera: " + response.toString()));
            }
        } catch (Exception e) {
            Log.e("RegisterDataSource", "Wyjątek podczas rejestracji", e);
            return new Result.Error(new Exception("Błąd podczas rejestracji", e));
        }
    }
}
