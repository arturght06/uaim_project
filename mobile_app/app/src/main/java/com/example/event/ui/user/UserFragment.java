package com.example.event.ui.user;

import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.NavController;
import androidx.navigation.NavDestination;
import androidx.navigation.fragment.NavHostFragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.event.R;
import com.example.event.data.ApiConfig;
import com.example.event.data.LoginRepository;
import com.example.event.data.model.LoggedInUser;
import com.example.event.databinding.FragmentUserBinding;
import com.example.event.ui.home.Event;
import com.example.event.ui.home.EventAdapter;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.util.ArrayList;
import java.util.List;

public class UserFragment extends Fragment {

    private static final String TAG = "UserFragment";
    private FragmentUserBinding binding;
    private String firstNameForTitle = null;

    private RecyclerView recyclerViewOrganizedEvents;
    private EventAdapter organizedEventAdapter;
    private List<Event> organizedEventList = new ArrayList<>();
    private TextView textViewMyEventsTitle;

    private RecyclerView recyclerViewReservedEvents;
    private EventAdapter reservedEventAdapter;
    private List<Event> reservedEventList = new ArrayList<>();
    private TextView textViewMyReservationsTitle;


    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        Log.d(TAG, "onCreateView called");
        binding = FragmentUserBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setHasOptionsMenu(true);
        Log.d(TAG, "onCreate called");
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        Log.d(TAG, "onViewCreated called");

        // Organized Events UI
        textViewMyEventsTitle = view.findViewById(R.id.text_my_events_title);
        recyclerViewOrganizedEvents = view.findViewById(R.id.recycler_view_user_events);
        recyclerViewOrganizedEvents.setHasFixedSize(false); // Add this line
        recyclerViewOrganizedEvents.setLayoutManager(new LinearLayoutManager(getContext()));
        organizedEventAdapter = new EventAdapter(getContext(), organizedEventList, new EventAdapter.OnEventActionListener() {
            @Override
            public void onComment(Event event) {
                Log.d(TAG, "onComment clicked for organized event: " + event.title);
                // Comment expansion is handled in the adapter
            }

            @Override
            public void onJoin(Event event) {
                // No action - user cannot join/leave their own organized events from here.
                // The adapter should hide the join button for these events.
                Log.d(TAG, "onJoin clicked for organized event (no action): " + event.title);
                // Optionally show a message that they can't join their own event
                Toast.makeText(getContext(), "Nie możesz dołączyć do własnego wydarzenia", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onDetails(Event event) {
                Log.d(TAG, "onDetails clicked for organized event: " + event.title + " (id: " + event.id + ")");
                Bundle args = new Bundle();
                args.putString("event_id", event.id);
                NavHostFragment.findNavController(UserFragment.this).navigate(R.id.action_user_to_eventDetail, args);
            }

            @Override
            public void onSendComment(Event event, String commentText) {
                Log.d(TAG, "onSendComment for organized event: " + event.title + ", comment: " + commentText);
                sendCommentToEvent(event, commentText);
            }

            @Override
            public void onLoginRequired() {
                Log.d(TAG, "onLoginRequired - navigating to login");
                NavHostFragment.findNavController(UserFragment.this).navigate(R.id.navigation_login);
            }
        });
        recyclerViewOrganizedEvents.setAdapter(organizedEventAdapter);

        // Reserved Events UI
        textViewMyReservationsTitle = view.findViewById(R.id.text_my_reservations_title);
        recyclerViewReservedEvents = view.findViewById(R.id.recycler_view_reserved_events);
        recyclerViewReservedEvents.setHasFixedSize(false); // Add this line
        recyclerViewReservedEvents.setLayoutManager(new LinearLayoutManager(getContext()));
        reservedEventAdapter = new EventAdapter(getContext(), reservedEventList, new EventAdapter.OnEventActionListener() {
            @Override
            public void onComment(Event event) {
                Log.d(TAG, "onComment clicked for reserved event: " + event.title);
                // Comment expansion is handled in the adapter
            }

            @Override
            public void onJoin(Event event) {
                Log.d(TAG, "onJoin clicked for reserved event: " + event.title);
                handleUserJoinEvent(event, view); // Handles join/leave for reserved events
            }

            @Override
            public void onDetails(Event event) {
                Log.d(TAG, "onDetails clicked for reserved event: " + event.title + " (id: " + event.id + ")");
                Bundle args = new Bundle();
                args.putString("event_id", event.id);
                NavHostFragment.findNavController(UserFragment.this).navigate(R.id.action_user_to_eventDetail, args);
            }

            @Override
            public void onSendComment(Event event, String commentText) {
                Log.d(TAG, "onSendComment for reserved event: " + event.title + ", comment: " + commentText);
                sendCommentToEvent(event, commentText);
            }

            @Override
            public void onLoginRequired() {
                Log.d(TAG, "onLoginRequired - navigating to login");
                NavHostFragment.findNavController(UserFragment.this).navigate(R.id.navigation_login);
            }
        });
        recyclerViewReservedEvents.setAdapter(reservedEventAdapter);

        ImageView editProfileButton = view.findViewById(R.id.button_edit_profile);
        editProfileButton.setOnClickListener(v -> {
            Log.d(TAG, "Edit profile button clicked.");
            // Navigate to EditProfileFragment
            NavHostFragment.findNavController(UserFragment.this).navigate(R.id.action_user_to_edit_profile);
        });


        setupButtonListeners();
        updateUIBasedOnLoginState();
    }

    @Override
    public void onResume() {
        super.onResume();
        Log.d(TAG, "onResume called");
        // updateUIBasedOnLoginState will handle checking login status,
        // attempting to load local data, and triggering API calls.
        updateUIBasedOnLoginState();
    }

    @Override
    public void onCreateOptionsMenu(@NonNull Menu menu, @NonNull MenuInflater inflater) {
        Log.d(TAG, "onCreateOptionsMenu called");
        menu.clear();
        inflater.inflate(R.menu.menu_user_logout, menu);
        LoggedInUser user = LoginRepository.getInstance().getLoggedInUser();
        MenuItem logoutItem = menu.findItem(R.id.action_logout);
        if (logoutItem != null) {
            logoutItem.setVisible(user != null);
        }
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        Log.d(TAG, "onOptionsItemSelected: " + item.getTitle());
        if (item.getItemId() == R.id.action_logout) {
            handleLogout();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    private void setupButtonListeners() {
        Log.d(TAG, "setupButtonListeners called");
        if (binding == null) return;
        binding.buttonLogin.setOnClickListener(v ->
            NavHostFragment.findNavController(this).navigate(R.id.navigation_login)
        );
        binding.buttonRegister.setOnClickListener(v ->
            NavHostFragment.findNavController(this).navigate(R.id.navigation_register)
        );
    }

    private void updateUIBasedOnLoginState() {
        Log.d(TAG, "updateUIBasedOnLoginState called");
        LoggedInUser user = LoginRepository.getInstance().getLoggedInUser();
        if (user != null) {
            Log.d(TAG, "User is logged in: " + user.getDisplayName() + " (ID: " + user.getUserId() + ")");
            showUserProfileView();

            // Attempt to populate with local data first
            String localFirstName = user.getFirstName();
            String localLastName = user.getLastName();
            // Assuming getDisplayName() from LoggedInUser might be the username,
            // or it could be derived from email if username field isn't explicitly stored/fetched initially.
            // For now, using what's available. The API fetch will provide the definitive username.
            String localUsername = user.getDisplayName();

            // Check if we have at least a first name locally to make an initial display
            if (localFirstName != null && !localFirstName.isEmpty() && !localFirstName.equals("-")) {
                Log.d(TAG, "Populating profile with local data: " + localFirstName);
                firstNameForTitle = localFirstName; // Set for title update

                // Directly populate views using local data
                String fullName = (!localFirstName.equals("-") ? localFirstName : "");
                if (localLastName != null && !localLastName.isEmpty() && !localLastName.equals("-")) {
                    if (!fullName.isEmpty()) {
                        fullName += " ";
                    }
                    fullName += localLastName;
                }
                if (fullName.trim().isEmpty()) {
                    fullName = "Brak danych"; // Fallback if both are "-" or empty
                }

                if (binding.textProfileFullname != null) {
                    binding.textProfileFullname.setText(fullName);
                }
                // Use localUsername if available, otherwise placeholder. API will update.
                binding.textProfileUsername.setText(localUsername != null && !localUsername.isEmpty() ? localUsername : "-");

                updateTitlesForLoggedInUser(firstNameForTitle);
            } else {
                Log.d(TAG, "Local data insufficient for initial profile display. Waiting for API.");
                // If local data is insufficient, show placeholders and update titles to default
                firstNameForTitle = null; // Reset
                if (binding != null) {
                    if (binding.textProfileFullname != null) binding.textProfileFullname.setText("Ładowanie...");
                    binding.textProfileUsername.setText("-"); // Username might not be known yet
                }
                updateTitlesForLoggedOutUser(); // Set titles to default/loading state
            }

            // Always fetch fresh data from API to update/confirm local data and load events
            fetchAndDisplayUserData(user.getUserId());

        } else {
            Log.d(TAG, "User is not logged in.");
            showLoginPromptView();
            clearUserProfileData(); // This clears profile texts and event lists
            firstNameForTitle = null; // Ensure this is reset
            updateTitlesForLoggedOutUser();
        }

        if (getActivity() != null) {
            requireActivity().invalidateOptionsMenu(); // Update logout button visibility
        }
    }

    private void showUserProfileView() {
        Log.d(TAG, "showUserProfileView called");
        if (binding == null) return;
        binding.userProfileContainer.setVisibility(View.VISIBLE);
        binding.textUserPrompt.setVisibility(View.GONE);
        binding.userButtonsContainer.setVisibility(View.GONE);

        // The visibility of event-related sections (titles and RecyclerViews)
        // will be managed by loadAndCategorizeUserEvents().onPostExecute based on list content,
        // or by showLoginPromptView() which hides them.
        // They are initially GONE as per XML.
        // Old lines that were removed/commented:
        // if (textViewMyEventsTitle != null) textViewMyEventsTitle.setVisibility(View.VISIBLE);
        // if (recyclerViewOrganizedEvents != null) recyclerViewOrganizedEvents.setVisibility(View.VISIBLE);
        // if (textViewMyReservationsTitle != null) textViewMyReservationsTitle.setVisibility(View.VISIBLE);
        // if (recyclerViewReservedEvents != null) recyclerViewReservedEvents.setVisibility(View.VISIBLE);
    }

    private void showLoginPromptView() {
        Log.d(TAG, "showLoginPromptView called");
        if (binding == null) return;
        binding.userProfileContainer.setVisibility(View.GONE);
        binding.textUserPrompt.setVisibility(View.VISIBLE);
        binding.userButtonsContainer.setVisibility(View.VISIBLE);

        if (textViewMyEventsTitle != null) textViewMyEventsTitle.setVisibility(View.GONE);
        if (recyclerViewOrganizedEvents != null) recyclerViewOrganizedEvents.setVisibility(View.GONE);
        if (textViewMyReservationsTitle != null) textViewMyReservationsTitle.setVisibility(View.GONE);
        if (recyclerViewReservedEvents != null) recyclerViewReservedEvents.setVisibility(View.GONE);

        organizedEventList.clear();
        if (organizedEventAdapter != null) organizedEventAdapter.notifyDataSetChanged();
        reservedEventList.clear();
        if (reservedEventAdapter != null) reservedEventAdapter.notifyDataSetChanged();
    }

    private void fetchAndDisplayUserData(String userId) {
        Log.d(TAG, "fetchAndDisplayUserData called for userId: " + userId);
        new FetchUserDataTask().execute(userId);
    }

    private class FetchUserDataTask extends AsyncTask<String, Void, JSONObject> {
        @Override
        protected JSONObject doInBackground(String... params) {
            String userId = params[0];
            Log.d(TAG, "FetchUserDataTask doInBackground for userId: " + userId);
            try {
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
                    Log.d(TAG, "FetchUserDataTask received user JSON: " + responseJson.toString());
                    // The response might be {"user": {...}} or just {...}
                    return responseJson.has("user") ? responseJson.getJSONObject("user") : responseJson;
                } else {
                    Log.e(TAG, "FetchUserDataTask HTTP error: " + responseCode + " for URL: " + url.toString());
                }
            } catch (Exception e) {
                Log.e(TAG, "FetchUserDataTask error fetching user data", e);
            }
            return null;
        }

        @Override
        protected void onPostExecute(JSONObject userJson) {
            Log.d(TAG, "FetchUserDataTask onPostExecute");
            if (binding == null || !isAdded()) {
                Log.w(TAG, "FetchUserDataTask onPostExecute: Fragment not attached or binding is null.");
                return;
            }

            if (userJson != null) {
                Log.d(TAG, "User data fetched successfully. JSON: " + userJson.toString()); // Log the whole JSON
                populateUserProfile(userJson);

                String username = userJson.optString("username");
                String firstName = userJson.optString("name");
                String lastName = userJson.optString("surname");
                String email = userJson.optString("email");
                String birthDate = userJson.optString("birthday");
                String countryCode = userJson.optString("phone_country_code");
                String phoneNumber = userJson.optString("phone_number");

                LoginRepository.getInstance().updateLoggedInUserDetails(firstName, lastName, email, birthDate, countryCode, phoneNumber, username);


                if (!firstName.equals("-") && !firstName.isEmpty()) {
                    firstNameForTitle = firstName;
                    updateTitlesForLoggedInUser(firstNameForTitle);
                } else {
                    firstNameForTitle = null;
                    updateTitlesForLoggedOutUser();
                }
                LoggedInUser currentUser = LoginRepository.getInstance().getLoggedInUser();
                if (currentUser != null) {
                    loadAndCategorizeUserEvents(currentUser.getUserId());
                } else {
                     Log.w(TAG, "FetchUserDataTask onPostExecute: CurrentUser is null after fetching profile.");
                }
            } else {
                Log.e(TAG, "FetchUserDataTask onPostExecute: userJson is null. Clearing profile.");
                clearUserProfileData(); // Clears profile and event lists
                firstNameForTitle = null;
                updateTitlesForLoggedOutUser();
            }
        }
    }

    private void populateUserProfile(JSONObject userJson) {
        Log.d(TAG, "populateUserProfile called with JSON: " + userJson.toString());
        if (binding == null || !isAdded()) { // Added isAdded() check
            Log.w(TAG, "populateUserProfile: Binding is null or fragment not added.");
            return;
        }
        String username = userJson.optString("username", "-");
        String firstName = userJson.optString("name", "-");
        String lastName = userJson.optString("surname", "-");

        String fullName = (!firstName.equals("-") ? firstName : "");
        if (!lastName.equals("-") && !lastName.isEmpty()) {
            if (!fullName.isEmpty()) {
                fullName += " ";
            }
            fullName += lastName;
        }
        if (fullName.trim().isEmpty()) {
            fullName = "Brak danych";
        }

        if (binding.textProfileFullname != null) {
            binding.textProfileFullname.setText(fullName);
        }
        binding.textProfileUsername.setText(username);
    }

    private void clearUserProfileData() {
        Log.d(TAG, "clearUserProfileData called");
        if (binding == null) return;
        
        if (binding.textProfileFullname != null) {
            binding.textProfileFullname.setText("Imię Nazwisko");
        }
        binding.textProfileUsername.setText("-");

        organizedEventList.clear();
        if (organizedEventAdapter != null) {
            organizedEventAdapter.notifyDataSetChanged();
        }
        reservedEventList.clear();
        if (reservedEventAdapter != null) {
            reservedEventAdapter.notifyDataSetChanged();
        }
    }

    private void updateTitlesForLoggedInUser(String userName) {
        Log.d(TAG, "updateTitlesForLoggedInUser with userName: " + userName);
        if (getActivity() == null || !isAdded()) return;
        String greeting = getString(R.string.user_greeting, userName);
        requireActivity().setTitle(greeting);

        BottomNavigationView navView = requireActivity().findViewById(R.id.nav_view);
        if (navView != null) {
            navView.getMenu().findItem(R.id.navigation_user).setTitle(userName);
        }
        NavController navController = NavHostFragment.findNavController(this);
        NavDestination destination = navController.getCurrentDestination();
        if (destination != null && destination.getId() == R.id.navigation_user) {
            destination.setLabel(greeting);
        }
    }

    private void updateTitlesForLoggedOutUser() {
        Log.d(TAG, "updateTitlesForLoggedOutUser called");
        if (getActivity() == null || !isAdded()) return;
        String defaultTitle = getString(R.string.title_user);
        requireActivity().setTitle(defaultTitle);

        BottomNavigationView navView = requireActivity().findViewById(R.id.nav_view);
        if (navView != null) {
            navView.getMenu().findItem(R.id.navigation_user).setTitle(defaultTitle);
        }
        NavController navController = NavHostFragment.findNavController(this);
        NavDestination destination = navController.getCurrentDestination();
        if (destination != null && destination.getId() == R.id.navigation_user) {
            destination.setLabel(defaultTitle);
        }
    }

    private void handleLogout() {
        Log.d(TAG, "handleLogout called");
        LoginRepository.getInstance().logout();
        firstNameForTitle = null;
        showLoginPromptView(); 
        clearUserProfileData(); 
        updateTitlesForLoggedOutUser();
        if(getActivity() != null) {
            requireActivity().invalidateOptionsMenu();
        }
    }

    private void loadAndCategorizeUserEvents(String userId) {
        Log.d(TAG, "loadAndCategorizeUserEvents called for userId: " + userId);
        new AsyncTask<String, Void, List<Event>>() {
            @Override
            protected List<Event> doInBackground(String... params) {
                String currentUserId = params[0];
                Log.d(TAG, "LoadEventsTask doInBackground for userId: " + currentUserId);
                List<Event> fetchedEvents = new ArrayList<>();
                try {
                    String accessToken = com.example.event.data.TokenManager.getAccessToken();
                    
                    java.util.HashMap<String, String> eventIdToReservationId = new java.util.HashMap<>();
                    java.util.HashMap<String, String> eventIdToReservationStatus = new java.util.HashMap<>();

                    if (accessToken != null && currentUserId != null) {
                        Log.d(TAG, "LoadEventsTask: Fetching reservations for user: " + currentUserId);
                        try {
                            URL resUrl = new URL(ApiConfig.BASE_URL + "api/reservations/");
                            HttpURLConnection resConn = (HttpURLConnection) resUrl.openConnection();
                            resConn.setRequestMethod("GET");
                            resConn.setRequestProperty("Authorization", "Bearer " + accessToken);
                            resConn.setRequestProperty("useruuid", currentUserId);
                            int resCode = resConn.getResponseCode();
                            if (resCode == HttpURLConnection.HTTP_OK) {
                                BufferedReader in = new BufferedReader(new InputStreamReader(resConn.getInputStream()));
                                StringBuilder response = new StringBuilder();
                                String line;
                                while ((line = in.readLine()) != null) response.append(line);
                                in.close();
                                JSONArray reservations = new JSONArray(response.toString());
                                Log.d(TAG, "LoadEventsTask: Fetched " + reservations.length() + " reservations.");
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
                                Log.e(TAG, "LoadEventsTask: HTTP error fetching reservations: " + resCode);
                            }
                        } catch (Exception e) {
                            Log.e(TAG, "LoadEventsTask: Error fetching reservations", e);
                        }
                    }

                    URL url = new URL(ApiConfig.BASE_URL + "api/events/user/" + currentUserId);
                    Log.d(TAG, "LoadEventsTask: Fetching user-related events from URL: " + url.toString());
                    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("GET");
                    if (accessToken != null) {
                        conn.setRequestProperty("Authorization", "Bearer " + accessToken);
                        conn.setRequestProperty("useruuid", currentUserId); // Ensure backend knows context
                    }

                    int responseCode = conn.getResponseCode();
                    Log.d(TAG, "LoadEventsTask: User events HTTP response code: " + responseCode);
                    if (responseCode == HttpURLConnection.HTTP_OK) {
                        BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                        StringBuilder response = new StringBuilder();
                        String line;
                        while ((line = in.readLine()) != null) response.append(line);
                        in.close();
                        Log.d(TAG, "LoadEventsTask: Received user-related events JSON: " + response.toString());
                        JSONArray arr = new JSONArray(response.toString());
                        for (int i = 0; i < arr.length(); i++) {
                            JSONObject obj = arr.getJSONObject(i);
                            JSONObject loc = obj.optJSONObject("location_data");
                            JSONObject org = obj.optJSONObject("organizer_data");
                            String eventId = obj.optString("id");

                            String reservationStatus = eventIdToReservationStatus.get(eventId);
                            // API might also return "reservation" field directly in event object
                            if (reservationStatus == null && obj.has("reservation")) {
                                reservationStatus = obj.optString("reservation", null);
                            }
                            String reservationId = eventIdToReservationId.get(eventId);
                            String organizerId = obj.optString("organizer_id", null);

                            fetchedEvents.add(new Event(
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
                            ));
                        }
                        Log.d(TAG, "LoadEventsTask: Parsed " + fetchedEvents.size() + " total user-related events");
                    } else {
                         Log.e(TAG, "LoadEventsTask: HTTP error fetching user-related events: " + responseCode);
                    }
                } catch (Exception e) {
                    Log.e(TAG, "LoadEventsTask: Error fetching user-related events", e);
                }
                return fetchedEvents;
            }

            @Override
            protected void onPostExecute(List<Event> fetchedEvents) {
                Log.d(TAG, "LoadEventsTask onPostExecute with " + fetchedEvents.size() + " events.");
                if (!isAdded() || binding == null) {
                    Log.w(TAG, "LoadEventsTask onPostExecute: Fragment not attached or binding is null.");
                    return;
                }
                
                Log.d(TAG, "Current organizedEventList size before clear: " + organizedEventList.size());
                organizedEventList.clear();
                Log.d(TAG, "organizedEventList cleared. Size now: " + organizedEventList.size());
                Log.d(TAG, "Current reservedEventList size before clear: " + reservedEventList.size());
                reservedEventList.clear();
                Log.d(TAG, "reservedEventList cleared. Size now: " + reservedEventList.size());

                LoggedInUser loggedInUser = LoginRepository.getInstance().getLoggedInUser();
                if (loggedInUser == null) {
                    Log.w(TAG, "LoadEventsTask onPostExecute: LoggedInUser is null. Cannot categorize events.");
                    // Ensure adapters are notified of cleared lists
                    if (organizedEventAdapter != null) organizedEventAdapter.notifyDataSetChanged();
                    if (reservedEventAdapter != null) reservedEventAdapter.notifyDataSetChanged();
                    
                    // Ensure views are hidden if user is no longer logged in
                    if (textViewMyEventsTitle != null) textViewMyEventsTitle.setVisibility(View.GONE);
                    if (recyclerViewOrganizedEvents != null) recyclerViewOrganizedEvents.setVisibility(View.GONE);
                    if (textViewMyReservationsTitle != null) textViewMyReservationsTitle.setVisibility(View.GONE);
                    if (recyclerViewReservedEvents != null) recyclerViewReservedEvents.setVisibility(View.GONE);
                    return;
                }
                String currentUserId = loggedInUser.getUserId();

                for (Event event : fetchedEvents) {
                    if (event.organizerId != null && event.organizerId.equals(currentUserId)) {
                        organizedEventList.add(event);
                    } else if ("confirmed".equalsIgnoreCase(event.reservationStatus)) { 
                        // Add to reserved if user is not organizer AND has a confirmed reservation
                        reservedEventList.add(event);
                    }
                }
                Log.d(TAG, "Added " + organizedEventList.size() + " events to organizedEventList.");
                Log.d(TAG, "Added " + reservedEventList.size() + " events to reservedEventList.");

                Log.d(TAG, "Categorized events: " + organizedEventList.size() + " organized, " + reservedEventList.size() + " reserved.");

                if (organizedEventList.isEmpty()) {
                    Log.d(TAG, "Organized event list is empty after categorization.");
                } else {
                    for(Event e : organizedEventList) {
                        Log.d(TAG, "Organized Event in list: " + e.title + ", ID: " + e.id + ", OrganizerID: " + e.organizerId);
                    }
                }
                if (reservedEventList.isEmpty()) {
                    Log.d(TAG, "Reserved event list is empty after categorization.");
                } else {
                    for(Event e : reservedEventList) {
                        Log.d(TAG, "Reserved Event in list: " + e.title + ", ID: " + e.id + ", ResStatus: " + e.reservationStatus + ", ResID: " + e.reservationId);
                    }
                }

                if (organizedEventAdapter != null) {
                    organizedEventAdapter.notifyDataSetChanged();
                    Log.d(TAG, "organizedEventAdapter.notifyDataSetChanged() called.");
                }
                if (reservedEventAdapter != null) {
                    reservedEventAdapter.notifyDataSetChanged();
                    Log.d(TAG, "reservedEventAdapter.notifyDataSetChanged() called.");
                }


                // Update visibility of titles AND RecyclerViews based on list content
                boolean organizedEventsExist = !organizedEventList.isEmpty();
                if (textViewMyEventsTitle != null) {
                    textViewMyEventsTitle.setVisibility(organizedEventsExist ? View.VISIBLE : View.GONE);
                }
                if (recyclerViewOrganizedEvents != null) {
                    recyclerViewOrganizedEvents.setVisibility(organizedEventsExist ? View.VISIBLE : View.GONE);
                    if (organizedEventsExist) {
                        recyclerViewOrganizedEvents.requestLayout(); // Force re-measure
                    }
                }

                boolean reservedEventsExist = !reservedEventList.isEmpty();
                if (textViewMyReservationsTitle != null) {
                    textViewMyReservationsTitle.setVisibility(reservedEventsExist ? View.VISIBLE : View.GONE);
                }
                if (recyclerViewReservedEvents != null) {
                    recyclerViewReservedEvents.setVisibility(reservedEventsExist ? View.VISIBLE : View.GONE);
                    if (reservedEventsExist) {
                        recyclerViewReservedEvents.requestLayout(); // Force re-measure
                    }
                }
            }
        }.execute(userId);
    }

    private void handleUserJoinEvent(Event event, View rootView) {
        Log.d(TAG, "handleUserJoinEvent called for event: " + event.title + ", current status: " + event.reservationStatus);
        LoggedInUser loggedInUser = LoginRepository.getInstance().getLoggedInUser();
        if (loggedInUser == null) {
            Toast.makeText(getContext(), "Musisz być zalogowany.", Toast.LENGTH_SHORT).show();
            Log.w(TAG, "handleUserJoinEvent: User not logged in.");
            return;
        }
        String currentUserId = loggedInUser.getUserId();

        if ("confirmed".equals(event.reservationStatus)) { // Try to delete reservation
            Log.d(TAG, "Attempting to delete reservation for event ID: " + event.id + ", reservation ID: " + event.reservationId);
            new AsyncTask<Void, Void, Boolean>() {
                @Override
                protected Boolean doInBackground(Void... voids) {
                    try {
                        if (event.reservationId == null) {
                            Log.e(TAG, "Delete reservation: reservationId is null for event " + event.id);
                            return false;
                        }
                        URL url = new URL(ApiConfig.BASE_URL + "api/reservations/" + event.reservationId);
                        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                        conn.setRequestMethod("DELETE");
                        String accessToken = com.example.event.data.TokenManager.getAccessToken();
                        if (accessToken != null) {
                            conn.setRequestProperty("Authorization", "Bearer " + accessToken);
                        }
                        int responseCode = conn.getResponseCode();
                        Log.d(TAG, "Delete reservation response code: " + responseCode);
                        return responseCode == HttpURLConnection.HTTP_OK;
                    } catch (Exception e) {
                        Log.e(TAG, "Error deleting reservation", e);
                        return false;
                    }
                }
                @Override
                protected void onPostExecute(Boolean success) {
                    if (!isAdded()) return;
                    if (success) {
                        Log.d(TAG, "Reservation deleted successfully for event: " + event.id + ". Reloading events.");
                        Toast.makeText(getContext(), "Wycofano udział", Toast.LENGTH_SHORT).show();
                        loadAndCategorizeUserEvents(currentUserId); 
                    } else {
                        Log.e(TAG, "Failed to delete reservation for event: " + event.id);
                        Toast.makeText(getContext(), "Błąd podczas wycofywania udziału", Toast.LENGTH_SHORT).show();
                    }
                }
            }.execute();
        } else { 
            Log.w(TAG, "handleUserJoinEvent: Attempted to join event '" + event.title + "' from UserFragment, but this action is not supported here. Event status: " + event.reservationStatus);
            Toast.makeText(getContext(), "Ta akcja nie jest tutaj obsługiwana.", Toast.LENGTH_SHORT).show();
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
                    String accessToken = com.example.event.data.TokenManager.getAccessToken();
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
                    Log.e(TAG, "Error sending comment", e);
                    return false;
                }
            }

            @Override
            protected void onPostExecute(Boolean success) {
                if (!isAdded()) return;
                if (success) {
                    Toast.makeText(getContext(), "Komentarz dodany", Toast.LENGTH_SHORT).show();
                    LoggedInUser currentUser = LoginRepository.getInstance().getLoggedInUser();
                    if (currentUser != null) {
                        loadAndCategorizeUserEvents(currentUser.getUserId());
                    }
                } else {
                    Toast.makeText(getContext(), "Błąd podczas dodawania komentarza", Toast.LENGTH_SHORT).show();
                }
            }
        }.execute();
    }


    @Override
    public void onDestroyView() {
        super.onDestroyView();
        Log.d(TAG, "onDestroyView called");
        binding = null;
        // Adapters and lists will be garbage collected if not referenced elsewhere.
    }

    @Override
    public void onPause() {
        super.onPause();
        Log.d(TAG, "onPause called");
    }

    @Override
    public void onStop() {
        super.onStop();
        Log.d(TAG, "onStop called");
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "onDestroy called");
    }
}
