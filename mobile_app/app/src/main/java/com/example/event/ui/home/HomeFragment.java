package com.example.event.ui.home;

import android.content.res.ColorStateList;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;

import com.example.event.R;
import com.example.event.data.LoginRepository;
import com.example.event.databinding.FragmentHomeBinding;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class HomeFragment extends Fragment {

    private FragmentHomeBinding binding;

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        Log.d("HomeFragment", "onCreateView called");
        HomeViewModel homeViewModel =
                new ViewModelProvider(this).get(HomeViewModel.class);

        binding = FragmentHomeBinding.inflate(inflater, container, false);

        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        Log.d("HomeFragment", "onViewCreated called");

        ListView listView = view.findViewById(R.id.list_events);

        loadEvents(listView, view);
    }

    private void loadEvents(ListView listView, View rootView) {
        new AsyncTask<Void, Void, List<Event>>() {
            @Override
            protected List<Event> doInBackground(Void... voids) {
                Log.d("HomeFragment", "AsyncTask: doInBackground started");
                List<Event> events = new ArrayList<>();
                try {
                    String accessToken = com.example.event.data.TokenManager.getAccessToken();
                    String userId = null;
                    if (com.example.event.data.LoginRepository.getInstance().getLoggedInUser() != null) {
                        userId = com.example.event.data.LoginRepository.getInstance().getLoggedInUser().getUserId();
                    }
                    java.util.HashMap<String, String> eventIdToReservationId = new java.util.HashMap<>();
                    java.util.HashMap<String, String> eventIdToReservationStatus = new java.util.HashMap<>();
                    if (accessToken != null && userId != null) {
                        try {
                            java.net.URL resUrl = new java.net.URL(com.example.event.data.ApiConfig.BASE_URL + "api/reservations/");
                            java.net.HttpURLConnection resConn = (java.net.HttpURLConnection) resUrl.openConnection();
                            resConn.setRequestMethod("GET");
                            resConn.setRequestProperty("Authorization", "Bearer " + accessToken);
                            resConn.setRequestProperty("useruuid", userId);
                            int resCode = resConn.getResponseCode();
                            if (resCode == java.net.HttpURLConnection.HTTP_OK) {
                                java.io.BufferedReader in = new java.io.BufferedReader(new java.io.InputStreamReader(resConn.getInputStream()));
                                StringBuilder response = new StringBuilder();
                                String line;
                                while ((line = in.readLine()) != null) response.append(line);
                                in.close();
                                org.json.JSONArray reservations = new org.json.JSONArray(response.toString());
                                for (int i = 0; i < reservations.length(); i++) {
                                    org.json.JSONObject res = reservations.getJSONObject(i);
                                    String eventId = res.optString("event_id", null);
                                    String reservationId = res.optString("id", null);
                                    String status = res.optString("status", null);
                                    if (eventId != null && reservationId != null) {
                                        eventIdToReservationId.put(eventId, reservationId);
                                        eventIdToReservationStatus.put(eventId, status);
                                    }
                                }
                            }
                        } catch (Exception e) {
                            Log.e("HomeFragment", "Error fetching reservations", e);
                        }
                    }

                    java.net.URL url = new java.net.URL(com.example.event.data.ApiConfig.BASE_URL + "api/events/");
                    Log.d("HomeFragment", "URL: " + url.toString());
                    java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("GET");
                    if (accessToken != null) {
                        conn.setRequestProperty("Authorization", "Bearer " + accessToken);
                        if (userId != null && !userId.isEmpty()) {
                            conn.setRequestProperty("useruuid", userId);
                        }
                    }
                    int responseCode = conn.getResponseCode();
                    Log.d("HomeFragment", "HTTP response code: " + responseCode);
                    if (responseCode == java.net.HttpURLConnection.HTTP_OK) {
                        java.io.BufferedReader in = new java.io.BufferedReader(new java.io.InputStreamReader(conn.getInputStream()));
                        StringBuilder response = new StringBuilder();
                        String line;
                        while ((line = in.readLine()) != null) response.append(line);
                        in.close();
                        Log.d("HomeFragment", "Received events JSON: " + response);
                        org.json.JSONArray arr = new org.json.JSONArray(response.toString());
                        for (int i = 0; i < arr.length(); i++) {
                            org.json.JSONObject obj = arr.getJSONObject(i);
                            org.json.JSONObject loc = obj.optJSONObject("location_data");
                            org.json.JSONObject org = obj.optJSONObject("organizer_data");
                            String eventId = obj.optString("id");
                            String reservationId = eventIdToReservationId.get(eventId);
                            String reservationStatus = eventIdToReservationStatus.get(eventId);
                            String organizerId = obj.has("organizer_id") ? obj.optString("organizer_id", null) : null;
                            events.add(new Event(
                                eventId,
                                obj.optString("title"),
                                obj.optString("created_at"),
                                obj.optString("event_date"),
                                loc != null ? loc.optString("country", "") : "",
                                loc != null ? loc.optString("city", "") : "",
                                loc != null ? loc.optString("address", "") : "",
                                obj.optString("description"),
                                org != null ? org.optString("name", "") : "",
                                org != null ? org.optString("surname", "") : "",
                                reservationStatus,
                                obj.optInt("reservation_count", 0),
                                obj.has("max_participants") && !obj.isNull("max_participants") ? obj.optInt("max_participants", 0) : 0,
                                reservationId,
                                organizerId
                            ));
                        }
                        Log.d("HomeFragment", "Parsed " + events.size() + " events");
                    }
                } catch (Exception e) {
                    Log.e("HomeFragment", "Error fetching events", e);
                }
                return events;
            }

            @Override
            protected void onPostExecute(List<Event> events) {
                Log.d("HomeFragment", "AsyncTask: onPostExecute, events count: " + events.size());
                EventAdapter adapter = new EventAdapter(getContext(), events, new EventAdapter.OnEventActionListener() {
                    @Override
                    public void onComment(Event event) {
                        Log.d("HomeFragment", "onComment clicked for event: " + event.title);
                        Toast.makeText(getContext(), "Komentuj: " + event.title, Toast.LENGTH_SHORT).show();
                    }
                    @Override
                    public void onJoin(Event event) {
                        Log.d("HomeFragment", "onJoin clicked for event: " + event.title);
                        if ("confirmed".equals(event.reservationStatus)) {
                            new AsyncTask<Void, Void, Boolean>() {
                                @Override
                                protected Boolean doInBackground(Void... voids) {
                                    try {
                                        if (event.reservationId == null) return false;
                                        String urlStr = com.example.event.data.ApiConfig.BASE_URL + "api/reservations/" + event.reservationId;
                                        Log.d("HomeFragment", "DELETE reservation URL: " + urlStr);
                                        java.net.URL url = new java.net.URL(urlStr);
                                        java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                                        conn.setRequestMethod("DELETE");
                                        String accessToken = com.example.event.data.TokenManager.getAccessToken();
                                        if (accessToken != null) {
                                            conn.setRequestProperty("Authorization", "Bearer " + accessToken);
                                        }
                                        int responseCode = conn.getResponseCode();
                                        Log.d("HomeFragment", "DELETE reservation response code: " + responseCode);
                                        return responseCode == java.net.HttpURLConnection.HTTP_OK;
                                    } catch (Exception e) {
                                        Log.e("HomeFragment", "Error deleting reservation", e);
                                        return false;
                                    }
                                }
                                @Override
                                protected void onPostExecute(Boolean success) {
                                    if (success) {
                                        Log.d("HomeFragment", "Reservation deleted successfully for event: " + event.id);
                                        Toast.makeText(getContext(), "Wycofano udział", Toast.LENGTH_SHORT).show();
                                        loadEvents(listView, rootView);
                                    } else {
                                        Log.e("HomeFragment", "Reservation delete failed for event: " + event.id);
                                        Toast.makeText(getContext(), "Błąd podczas wycofywania udziału", Toast.LENGTH_SHORT).show();
                                    }
                                }
                            }.execute();
                        } else {
                            new AsyncTask<Void, Void, Boolean>() {
                                @Override
                                protected Boolean doInBackground(Void... voids) {
                                    try {
                                        String urlStr = com.example.event.data.ApiConfig.BASE_URL + "api/reservations/";
                                        Log.d("HomeFragment", "POST reservation URL: " + urlStr);
                                        java.net.URL url = new java.net.URL(urlStr);
                                        java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                                        conn.setRequestMethod("POST");
                                        conn.setRequestProperty("Content-Type", "application/json");
                                        String accessToken = com.example.event.data.TokenManager.getAccessToken();
                                        if (accessToken != null) {
                                            conn.setRequestProperty("Authorization", "Bearer " + accessToken);
                                        }
                                        conn.setDoOutput(true);
                                        org.json.JSONObject json = new org.json.JSONObject();

                                        String userId = com.example.event.data.LoginRepository.getInstance().getLoggedInUser().getUserId();
                                        json.put("user_id", userId);
                                        json.put("event_id", event.id);
                                        json.put("status", "confirmed");
                                        Log.d("HomeFragment", "POST reservation payload: " + json.toString());
                                        java.io.OutputStream os = conn.getOutputStream();
                                        os.write(json.toString().getBytes());
                                        os.close();
                                        int responseCode = conn.getResponseCode();
                                        Log.d("HomeFragment", "POST reservation response code: " + responseCode);
                                        return responseCode == java.net.HttpURLConnection.HTTP_CREATED;
                                    } catch (Exception e) {
                                        Log.e("HomeFragment", "Error creating reservation", e);
                                        return false;
                                    }
                                }
                                @Override
                                protected void onPostExecute(Boolean success) {
                                    if (success) {
                                        Log.d("HomeFragment", "Reservation created successfully for event: " + event.id);
                                        Toast.makeText(getContext(), "Zgłoszono udział", Toast.LENGTH_SHORT).show();
                                        loadEvents(listView, rootView);
                                    } else {
                                        Log.e("HomeFragment", "Reservation create failed for event: " + event.id);
                                        Toast.makeText(getContext(), "Błąd podczas zgłaszania udziału", Toast.LENGTH_SHORT).show();
                                    }
                                }
                            }.execute();
                        }
                    }
                    @Override
                    public void onDetails(Event event) {
                        Log.d("HomeFragment", "onDetails clicked for event: " + event.title + " (id: " + event.id + ")");
                        
                        Bundle args = new Bundle();
                        args.putString("event_id", event.id);
                        androidx.navigation.Navigation.findNavController(rootView).navigate(R.id.action_home_to_eventDetail, args);
                    }
                });
                listView.setAdapter(adapter);
            }
        }.execute();
    }

    @Override
    public void onDestroyView() {
        Log.d("HomeFragment", "onDestroyView called");
        super.onDestroyView();
        binding = null;
    }
}
