package com.example.event.ui.home;

import android.content.res.ColorStateList;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentResultListener;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.NavOptions;
import androidx.navigation.fragment.NavHostFragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.event.R;
import com.example.event.data.ApiConfig;
import com.example.event.data.LoginRepository;
import com.example.event.data.TokenManager;
import com.example.event.databinding.FragmentHomeBinding;
import com.example.event.ui.filter.FilterFragment;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class HomeFragment extends Fragment {

    private FragmentHomeBinding binding;
    private RecyclerView recyclerViewEvents;
    private EventAdapter eventAdapter;
    private List<Event> eventList = new ArrayList<>();
    private FloatingActionButton fabFilterEvents;
    private ArrayList<String> selectedCategoryIds = new ArrayList<>();
    private String sortBy = "date"; // Default sort
    private String sortOrder = "asc"; // Default order

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

        recyclerViewEvents = binding.recyclerViewEvents; // Use binding
        fabFilterEvents = binding.fabFilterEvents; // Use binding
        // fabAddEvent can also be accessed via binding.fabAddEvent if needed

        recyclerViewEvents.setLayoutManager(new LinearLayoutManager(getContext()));

        eventAdapter = new EventAdapter(getContext(), eventList, new EventAdapter.OnEventActionListener() {
            @Override
            public void onComment(Event event) {
                Log.d("HomeFragment", "onComment clicked for event: " + event.title);
                // Comment expansion is handled in the adapter
            }

            @Override
            public void onJoin(Event event) {
                Log.d("HomeFragment", "onJoin clicked for event: " + event.title);
                handleJoinEvent(event, view);
            }

            @Override
            public void onDetails(Event event) {
                Log.d("HomeFragment", "onDetails clicked for event: " + event.title + " (id: " + event.id + ")");
                Bundle args = new Bundle();
                args.putString("event_id", event.id);
                // Use NavHostFragment.findNavController(HomeFragment.this) for navigation
                NavHostFragment.findNavController(HomeFragment.this).navigate(R.id.action_home_to_eventDetail, args);
            }

            @Override
            public void onSendComment(Event event, String commentText) {
                Log.d("HomeFragment", "onSendComment for event: " + event.title + ", comment: " + commentText);
                sendCommentToEvent(event, commentText);
            }

            @Override
            public void onLoginRequired() {
                Log.d("HomeFragment", "onLoginRequired - navigating to login");
                NavHostFragment.findNavController(HomeFragment.this).navigate(R.id.navigation_login);
            }
        });
        recyclerViewEvents.setAdapter(eventAdapter);

        fabFilterEvents.setOnClickListener(v -> {
            Bundle args = new Bundle();
            args.putStringArrayList(FilterFragment.ARG_CURRENT_FILTERS, selectedCategoryIds);
            args.putString(FilterFragment.ARG_CURRENT_SORT_BY, sortBy);
            args.putString(FilterFragment.ARG_CURRENT_SORT_ORDER, sortOrder);
            Log.d("HomeFragment", "Navigating to FilterFragment with current filters: " + (selectedCategoryIds != null ? selectedCategoryIds.toString() : "null") + 
                  ", sortBy: " + sortBy + ", sortOrder: " + sortOrder);
            NavHostFragment.findNavController(HomeFragment.this)
                    .navigate(R.id.action_home_to_filterFragment, args);
        });
        
        // Listen for results from FilterFragment
        getParentFragmentManager().setFragmentResultListener(FilterFragment.REQUEST_KEY, this, new FragmentResultListener() {
            @Override
            public void onFragmentResult(@NonNull String requestKey, @NonNull Bundle bundle) {
                selectedCategoryIds = bundle.getStringArrayList(FilterFragment.SELECTED_CATEGORIES_KEY);
                if (selectedCategoryIds == null) {
                    selectedCategoryIds = new ArrayList<>();
                }
                sortBy = bundle.getString(FilterFragment.SORT_BY_KEY, "date");
                sortOrder = bundle.getString(FilterFragment.SORT_ORDER_KEY, "asc");
                Log.d("HomeFragment", "Received filter categories: " + selectedCategoryIds.toString() + ", sortBy: " + sortBy + ", sortOrder: " + sortOrder);
                updateFilterFabAppearance();
                loadEvents(getView()); // Reload events with new filters
            }
        });

        updateFilterFabAppearance();
        loadEvents(view); 
    }

    private void updateFilterFabAppearance() {
        if (getContext() == null) { // Add null check for context
            Log.w("HomeFragment", "updateFilterFabAppearance: Context is null, cannot update FAB.");
            return;
        }
        boolean hasFilters = (selectedCategoryIds != null && !selectedCategoryIds.isEmpty()) || 
                           (!sortBy.equals("date") || !sortOrder.equals("asc"));
        if (hasFilters) {
            fabFilterEvents.setBackgroundTintList(ColorStateList.valueOf(ContextCompat.getColor(requireContext(), R.color.secondary_color_variant)));
        } else {
            fabFilterEvents.setBackgroundTintList(ColorStateList.valueOf(ContextCompat.getColor(requireContext(), R.color.secondary_color_muted)));
        }
    }


    private void loadEvents(View rootView) {
        new LoadEventsTask().execute();
    }

    private class LoadEventsTask extends AsyncTask<Void, Void, List<Event>> {
        @Override
        protected List<Event> doInBackground(Void... voids) {
            Log.d("HomeFragment", "LoadEventsTask: doInBackground started. Categories: " + (selectedCategoryIds != null ? selectedCategoryIds.toString() : "null") + ", sortBy: " + sortBy + ", sortOrder: " + sortOrder);
            List<Event> fetchedEvents = new ArrayList<>();
            String accessToken = TokenManager.getAccessToken();
            String userId = null;
            if (LoginRepository.getInstance().getLoggedInUser() != null) {
                userId = LoginRepository.getInstance().getLoggedInUser().getUserId();
            }

            // Build URL with query parameters
            StringBuilder urlBuilder = new StringBuilder(ApiConfig.BASE_URL + "api/events/");
            boolean hasParams = false;
            
            // Add category parameters
            if (selectedCategoryIds != null && !selectedCategoryIds.isEmpty()) {
                for (String categoryId : selectedCategoryIds) {
                    if (!hasParams) {
                        urlBuilder.append("?");
                        hasParams = true;
                    } else {
                        urlBuilder.append("&");
                    }
                    urlBuilder.append("category=").append(categoryId);
                }
            }
            
            // Add sorting parameters
            if (!hasParams) {
                urlBuilder.append("?");
                hasParams = true;
            } else {
                urlBuilder.append("&");
            }
            urlBuilder.append("sort_by=").append(sortBy);
            urlBuilder.append("&sort_order=").append(sortOrder);

            String urlString = urlBuilder.toString();
            Log.d("HomeFragment", "LoadEventsTask: Final URL: " + urlString);

            // Fetch reservation statuses first (if needed for all events)
            java.util.HashMap<String, String> eventIdToReservationId = new java.util.HashMap<>();
            java.util.HashMap<String, String> eventIdToReservationStatus = new java.util.HashMap<>();
            if (accessToken != null && userId != null) {
                try {
                    URL resUrl = new URL(ApiConfig.BASE_URL + "api/reservations/");
                    Log.d("HomeFragment", "LoadEventsTask: Fetching reservations from URL: " + resUrl.toString());
                    HttpURLConnection resConn = (HttpURLConnection) resUrl.openConnection();
                    resConn.setRequestMethod("GET");
                    resConn.setRequestProperty("Authorization", "Bearer " + accessToken);
                    resConn.setRequestProperty("useruuid", userId);
                    int resCode = resConn.getResponseCode();
                    if (resCode == HttpURLConnection.HTTP_OK) {
                        BufferedReader in = new BufferedReader(new InputStreamReader(resConn.getInputStream()));
                        StringBuilder response = new StringBuilder();
                        String line;
                        while ((line = in.readLine()) != null) response.append(line);
                        in.close();
                        JSONArray reservations = new JSONArray(response.toString());
                        for (int i = 0; i < reservations.length(); i++) {
                            JSONObject res = reservations.getJSONObject(i);
                            String eventId = res.optString("event_id", null);
                            String reservationId = res.optString("id", null);
                            String status = res.optString("status", null);
                            if (eventId != null && reservationId != null) {
                                eventIdToReservationId.put(eventId, reservationId);
                                eventIdToReservationStatus.put(eventId, status);
                            }
                        }
                    } else {
                        Log.e("HomeFragment", "LoadEventsTask: Failed to fetch reservations, HTTP " + resCode);
                    }
                } catch (Exception e) {
                    Log.e("HomeFragment", "Error fetching reservations", e);
                }
            }

            // Fetch events with single request
            fetchEventsFromUrl(urlString, accessToken, userId, eventIdToReservationStatus, eventIdToReservationId, fetchedEvents);
            
            Log.d("HomeFragment", "AsyncTask: doInBackground finished. Total fetched events: " + fetchedEvents.size());
            return fetchedEvents;
        }
        
        private void fetchEventsFromUrl(String urlString, String accessToken, String userId,
                                        java.util.HashMap<String, String> eventIdToReservationStatus,
                                        java.util.HashMap<String, String> eventIdToReservationId,
                                        List<Event> fetchedEvents) {
            HttpURLConnection conn = null;
            try {
                Log.d("HomeFragment", "fetchEventsFromUrl: Attempting to fetch events from URL: " + urlString);
                URL url = new URL(urlString);
                conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                if (accessToken != null) {
                    conn.setRequestProperty("Authorization", "Bearer " + accessToken);
                    if (userId != null && !userId.isEmpty()) {
                        conn.setRequestProperty("useruuid", userId);
                    }
                }
                int responseCode = conn.getResponseCode();
                Log.d("HomeFragment", "fetchEventsFromUrl: HTTP response code: " + responseCode);
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = in.readLine()) != null) response.append(line);
                    in.close();
                    String responseBody = response.toString();
                    Log.d("HomeFragment", "fetchEventsFromUrl: Received events JSON: " + responseBody.substring(0, Math.min(responseBody.length(), 500)));
                    JSONArray arr = new JSONArray(response.toString());
                    for (int i = 0; i < arr.length(); i++) {
                        JSONObject obj = arr.getJSONObject(i);
                        JSONObject loc = obj.optJSONObject("location_data");
                        JSONObject org = obj.optJSONObject("organizer_data");
                        String eventId = obj.optString("id");
                        
                        String reservationStatus = eventIdToReservationStatus.get(eventId);
                        if (reservationStatus == null && obj.has("reservation_status")) {
                            reservationStatus = obj.optString("reservation_status", null);
                        }
                        String reservationId = eventIdToReservationId.get(eventId);
                         if (reservationId == null && obj.has("reservation_id")) {
                            reservationId = obj.optString("reservation_id", null);
                        }

                        String organizerId = obj.has("organizer_id") ? obj.optString("organizer_id", null) : null;

                        Event currentEvent = new Event(
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
                            organizerId,
                            obj.optInt("comment_count", 0)
                        );
                        fetchedEvents.add(currentEvent);
                    }
                } else {
                    Log.e("HomeFragment", "fetchEventsFromUrl: Failed to fetch events, HTTP " + responseCode);
                    try (BufferedReader errorReader = new BufferedReader(new InputStreamReader(conn.getErrorStream()))) {
                        StringBuilder errorResponse = new StringBuilder();
                        String errorLine;
                        while ((errorLine = errorReader.readLine()) != null) {
                            errorResponse.append(errorLine);
                        }
                        Log.e("HomeFragment", "fetchEventsFromUrl: Error response body: " + errorResponse.toString());
                    } catch (Exception e) {
                        Log.e("HomeFragment", "fetchEventsFromUrl: Failed to read error stream", e);
                    }
                }
            } catch (Exception e) {
                Log.e("HomeFragment", "fetchEventsFromUrl: Error fetching events", e);
            } finally {
                if (conn != null) {
                    conn.disconnect();
                }
            }
        }


        @Override
        protected void onPostExecute(List<Event> fetchedEvents) {
            Log.d("HomeFragment", "AsyncTask: onPostExecute started. Received " + fetchedEvents.size() + " events.");
            if (getContext() == null) { // Check if fragment is still attached
                Log.w("HomeFragment", "onPostExecute: Context is null, fragment likely detached. Aborting UI update.");
                return;
            }
            
            Log.d("HomeFragment", "Current eventList size before clear: " + eventList.size());
            eventList.clear();
            Log.d("HomeFragment", "eventList cleared. Size now: " + eventList.size());
            eventList.addAll(fetchedEvents);
            Log.d("HomeFragment", "Added fetched events to eventList. Size now: " + eventList.size());
            if (eventList.isEmpty()) {
                Log.d("HomeFragment", "Event list is empty after fetch. No events to display or error occurred.");
                if (selectedCategoryIds != null && !selectedCategoryIds.isEmpty()) {
                    Toast.makeText(getContext(), "Brak wydarzeń dla wybranych kategorii.", Toast.LENGTH_SHORT).show();
                } else {
                    // Toast.makeText(getContext(), "Brak wydarzeń.", Toast.LENGTH_SHORT).show();
                }
            } else {
                for(Event e : eventList) {
                    Log.d("HomeFragment", "Event in list: " + e.title + ", ID: " + e.id + ", ResStatus: " + e.reservationStatus + ", ResID: " + e.reservationId);
                }
            }
            eventAdapter.notifyDataSetChanged();
            Log.d("HomeFragment", "eventAdapter.notifyDataSetChanged() called.");
        }
    }

    private void handleJoinEvent(Event event, View rootView) {
        if (LoginRepository.getInstance().getLoggedInUser() == null) {
            Toast.makeText(getContext(), "Musisz być zalogowany, aby dołączyć.", Toast.LENGTH_SHORT).show();
            Log.w("HomeFragment", "handleJoinEvent: User not logged in.");
            return;
        }

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
                        Log.d("HomeFragment", "Reservation deleted successfully for event: " + event.id + ". Reloading events.");
                        Toast.makeText(getContext(), "Wycofano udział", Toast.LENGTH_SHORT).show();
                        loadEvents(rootView); // Use the member field rootView or pass getView()
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

                        String userId = LoginRepository.getInstance().getLoggedInUser().getUserId();
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
                        Log.d("HomeFragment", "Reservation created successfully for event: " + event.id + ". Reloading events.");
                        Toast.makeText(getContext(), "Zgłoszono udział", Toast.LENGTH_SHORT).show();
                        loadEvents(rootView); // Use the member field rootView or pass getView()
                    } else {
                        Log.e("HomeFragment", "Reservation create failed for event: " + event.id);
                        Toast.makeText(getContext(), "Błąd podczas zgłaszania udziału", Toast.LENGTH_SHORT).show();
                    }
                }
            }.execute();
        }
    }

    private void sendCommentToEvent(Event event, String commentText) {
        if (LoginRepository.getInstance().getLoggedInUser() == null) {
            Toast.makeText(getContext(), "Musisz być zalogowany, aby komentować.", Toast.LENGTH_SHORT).show();
            return;
        }

        new AsyncTask<Void, Void, Boolean>() {
            @Override
            protected Boolean doInBackground(Void... voids) {
                try {
                    URL url = new URL(ApiConfig.BASE_URL + "api/comments/");
                    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("POST");
                    conn.setRequestProperty("Content-Type", "application/json");
                    String accessToken = TokenManager.getAccessToken();
                    if (accessToken != null) {
                        conn.setRequestProperty("Authorization", "Bearer " + accessToken);
                    }
                    conn.setDoOutput(true);

                    JSONObject json = new JSONObject();
                    json.put("event_id", event.id);
                    json.put("content", commentText);

                    OutputStream os = conn.getOutputStream();
                    os.write(json.toString().getBytes());
                    os.close();

                    int responseCode = conn.getResponseCode();
                    return responseCode == HttpURLConnection.HTTP_CREATED;
                } catch (Exception e) {
                    Log.e("HomeFragment", "Error sending comment", e);
                    return false;
                }
            }

            @Override
            protected void onPostExecute(Boolean success) {
                if (success) {
                    Toast.makeText(getContext(), "Komentarz dodany", Toast.LENGTH_SHORT).show();
                    loadEvents(getView()); // Reload to update comment count
                } else {
                    Toast.makeText(getContext(), "Błąd podczas dodawania komentarza", Toast.LENGTH_SHORT).show();
                }
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
