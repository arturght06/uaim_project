package com.example.event.ui.filter;

import android.content.res.ColorStateList;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.Toast;
import android.widget.CompoundButton;


import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.OptIn;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.navigation.fragment.NavHostFragment;
// Removed RecyclerView imports

import com.example.event.R;
import com.example.event.data.ApiConfig;
import com.example.event.data.TokenManager;
import com.example.event.data.model.Category;
import com.google.android.material.badge.BadgeDrawable;
import com.google.android.material.badge.BadgeUtils;
import com.google.android.material.badge.ExperimentalBadgeUtils;
import com.google.android.material.chip.Chip;
import com.google.android.material.chip.ChipGroup;


import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public class FilterFragment extends Fragment {

    private static final String TAG = "FilterFragment";
    public static final String REQUEST_KEY = "filterRequestKey";
    public static final String SELECTED_CATEGORIES_KEY = "selectedCategories";
    public static final String SORT_BY_KEY = "sortBy";
    public static final String SORT_ORDER_KEY = "sortOrder";
    public static final String ARG_CURRENT_FILTERS = "currentFilters";
    public static final String ARG_CURRENT_SORT_BY = "currentSortBy";
    public static final String ARG_CURRENT_SORT_ORDER = "currentSortOrder";

    // private RecyclerView recyclerViewCategories; // Removed
    // private CategoryAdapter categoryAdapter; // Removed
    private ChipGroup chipGroupCategories;
    private ChipGroup chipGroupSorting;
    private List<Category> categoryList = new ArrayList<>();
    private Button buttonConfirmFilters;
    private Button buttonResetFilters;
    private FrameLayout frameLayoutResetButton; // Added for badge attachment
    private ArrayList<String> currentSelectedIds;
    private String currentSortBy = "date";
    private String currentSortOrder = "asc";
    private BadgeDrawable badgeDrawable;

    @OptIn(markerClass = ExperimentalBadgeUtils.class)
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_filter, container, false);

        if (getArguments() != null) {
            currentSelectedIds = getArguments().getStringArrayList(ARG_CURRENT_FILTERS);
            currentSortBy = getArguments().getString(ARG_CURRENT_SORT_BY, "date");
            currentSortOrder = getArguments().getString(ARG_CURRENT_SORT_ORDER, "asc");
            Log.d(TAG, "Received current filters: " + (currentSelectedIds != null ? currentSelectedIds.toString() : "null") + 
                      ", sortBy: " + currentSortBy + ", sortOrder: " + currentSortOrder);
        }
        if (currentSelectedIds == null) {
            currentSelectedIds = new ArrayList<>();
        }

        chipGroupCategories = view.findViewById(R.id.chip_group_categories);
        chipGroupSorting = view.findViewById(R.id.chip_group_sorting);
        buttonConfirmFilters = view.findViewById(R.id.button_confirm_filters);
        buttonResetFilters = view.findViewById(R.id.button_reset_filters);
        frameLayoutResetButton = view.findViewById(R.id.frame_layout_reset_button); // Initialize FrameLayout

        // Initialize Badge
        badgeDrawable = BadgeDrawable.createFromResource(requireContext(), R.xml.filter_badge);
        badgeDrawable.setVisible(false); // Start hidden
        BadgeUtils.attachBadgeDrawable(badgeDrawable, buttonResetFilters, frameLayoutResetButton);
        Log.d(TAG, "Badge attached to button_reset_filters within frame_layout_reset_button");

        // Setup sorting chips
        setupSortingChips();

        buttonConfirmFilters.setOnClickListener(v -> {
            ArrayList<String> selectedIds = new ArrayList<>();
            for (int i = 0; i < chipGroupCategories.getChildCount(); i++) {
                Chip chip = (Chip) chipGroupCategories.getChildAt(i);
                if (chip.isChecked()) {
                    Category category = (Category) chip.getTag();
                    if (category != null) {
                        selectedIds.add(category.getId());
                    }
                }
            }
            
            // Get current sort settings from sorting chips
            String selectedSortBy = currentSortBy;
            String selectedSortOrder = currentSortOrder;
            
            Bundle result = new Bundle();
            result.putStringArrayList(SELECTED_CATEGORIES_KEY, selectedIds);
            result.putString(SORT_BY_KEY, selectedSortBy);
            result.putString(SORT_ORDER_KEY, selectedSortOrder);
            Log.d(TAG, "Confirming filters. Selected IDs: " + selectedIds.toString() + 
                      ", sortBy: " + selectedSortBy + ", sortOrder: " + selectedSortOrder);
            getParentFragmentManager().setFragmentResult(REQUEST_KEY, result);
            NavHostFragment.findNavController(this).popBackStack();
        });

        buttonResetFilters.setOnClickListener(v -> {
            // Reset category chips
            for (int i = 0; i < chipGroupCategories.getChildCount(); i++) {
                Chip chip = (Chip) chipGroupCategories.getChildAt(i);
                if (chip.isChecked()) {
                    chip.setChecked(false);
                }
            }
            currentSelectedIds.clear();
            
            // Reset sorting chips to default
            currentSortBy = "date";
            currentSortOrder = "asc";
            updateSortingChipsState();
            
            updateBadgeCount(); // Update badge after resetting everything
            Log.d(TAG, "Reset filters clicked. All filters reset to default.");
        });

        Log.d(TAG, "Fetching categories...");
        new FetchCategoriesTask().execute();

        return view;
    }

    private void setupSortingChips() {
        ColorStateList chipBackgroundColorStateList = ContextCompat.getColorStateList(requireContext(), R.color.chip_background_state);
        ColorStateList chipTextColorStateList = ContextCompat.getColorStateList(requireContext(), R.color.chip_text_color_state);

        // Date sorting chip
        Chip dateChip = new Chip(getContext());
        dateChip.setText("Data");
        dateChip.setTag("date");
        dateChip.setCheckable(true);
        dateChip.setCheckedIconVisible(false);
        if (chipBackgroundColorStateList != null) {
            dateChip.setChipBackgroundColor(chipBackgroundColorStateList);
        }
        if (chipTextColorStateList != null) {
            dateChip.setTextColor(chipTextColorStateList);
        }
        // Force refresh of colors
        dateChip.refreshDrawableState();
        dateChip.setOnClickListener(v -> handleSortChipClick("date", dateChip));
        chipGroupSorting.addView(dateChip);

        // Comments sorting chip
        Chip commentsChip = new Chip(getContext());
        commentsChip.setText("Komentarze");
        commentsChip.setTag("comments");
        commentsChip.setCheckable(true);
        commentsChip.setCheckedIconVisible(false);
        if (chipBackgroundColorStateList != null) {
            commentsChip.setChipBackgroundColor(chipBackgroundColorStateList);
        }
        if (chipTextColorStateList != null) {
            commentsChip.setTextColor(chipTextColorStateList);
        }
        commentsChip.refreshDrawableState();
        commentsChip.setOnClickListener(v -> handleSortChipClick("comments", commentsChip));
        chipGroupSorting.addView(commentsChip);

        // Participants sorting chip
        Chip participantsChip = new Chip(getContext());
        participantsChip.setText("Uczestnicy");
        participantsChip.setTag("participants");
        participantsChip.setCheckable(true);
        participantsChip.setCheckedIconVisible(false);
        if (chipBackgroundColorStateList != null) {
            participantsChip.setChipBackgroundColor(chipBackgroundColorStateList);
        }
        if (chipTextColorStateList != null) {
            participantsChip.setTextColor(chipTextColorStateList);
        }
        participantsChip.refreshDrawableState();
        participantsChip.setOnClickListener(v -> handleSortChipClick("participants", participantsChip));
        chipGroupSorting.addView(participantsChip);

        updateSortingChipsState();
    }

    private void handleSortChipClick(String sortBy, Chip clickedChip) {
        if (currentSortBy.equals(sortBy)) {
            // Same sort type, toggle order
            currentSortOrder = currentSortOrder.equals("asc") ? "desc" : "asc";
        } else {
            // Different sort type, set new type with ascending order
            currentSortBy = sortBy;
            currentSortOrder = "asc";
        }
        
        updateSortingChipsState();
        updateBadgeCount();
        Log.d(TAG, "Sort changed to: " + currentSortBy + " " + currentSortOrder);
    }

    private void updateSortingChipsState() {
        for (int i = 0; i < chipGroupSorting.getChildCount(); i++) {
            Chip chip = (Chip) chipGroupSorting.getChildAt(i);
            String sortType = (String) chip.getTag();
            
            if (sortType.equals(currentSortBy)) {
                chip.setChecked(true);
                int iconRes = currentSortOrder.equals("asc") ? R.drawable.sort : R.drawable.sort_down;
                chip.setChipIcon(ContextCompat.getDrawable(requireContext(), iconRes));
                chip.setChipIconVisible(true);
            } else {
                chip.setChecked(false);
                chip.setChipIconVisible(false);
            }
        }
    }

    private void updateBadgeCount() {
        int selectedCount = 0;
        if (chipGroupCategories != null) {
            for (int i = 0; i < chipGroupCategories.getChildCount(); i++) {
                View childView = chipGroupCategories.getChildAt(i);
                if (childView instanceof Chip) {
                    Chip chip = (Chip) childView;
                    if (chip.isChecked()) {
                        selectedCount++;
                    }
                }
            }
        }
        
        // Add 1 to badge if sorting is not default
        if (!currentSortBy.equals("date") || !currentSortOrder.equals("asc")) {
            selectedCount++;
        }
        
        Log.d(TAG, "updateBadgeCount - Calculated selectedCount: " + selectedCount);

        if (badgeDrawable != null) {
            if (selectedCount > 0) {
                badgeDrawable.setNumber(selectedCount);
                badgeDrawable.setVisible(true);
                Log.d(TAG, "updateBadgeCount - Badge number set to " + selectedCount);
            } else {
                badgeDrawable.setVisible(false);
                Log.d(TAG, "updateBadgeCount - Badge hidden");
            }
        }
    }


    private class FetchCategoriesTask extends AsyncTask<Void, Void, List<Category>> {
        @Override
        protected List<Category> doInBackground(Void... voids) {
            Log.d(TAG, "FetchCategoriesTask: doInBackground started");
            List<Category> fetchedCategories = new ArrayList<>();
            HttpURLConnection conn = null;
            try {
                URL url = new URL(ApiConfig.BASE_URL + "api/category/");
                Log.d(TAG, "FetchCategoriesTask: Fetching from URL: " + url.toString());
                conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                String accessToken = TokenManager.getAccessToken();
                if (accessToken != null) {
                    conn.setRequestProperty("Authorization", "Bearer " + accessToken);
                    Log.d(TAG, "FetchCategoriesTask: Added Authorization header.");
                } else {
                    Log.w(TAG, "FetchCategoriesTask: Access token is null.");
                }

                int responseCode = conn.getResponseCode();
                Log.d(TAG, "FetchCategoriesTask: HTTP Response Code: " + responseCode);

                if (responseCode == HttpURLConnection.HTTP_OK) {
                    BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = in.readLine()) != null) {
                        response.append(line);
                    }
                    in.close();
                    String responseBody = response.toString();
                    Log.d(TAG, "FetchCategoriesTask: Response Body: " + responseBody);

                    JSONArray jsonArray = new JSONArray(responseBody);
                    Log.d(TAG, "FetchCategoriesTask: Parsed JSONArray length: " + jsonArray.length());
                    for (int i = 0; i < jsonArray.length(); i++) {
                        JSONObject categoryJson = jsonArray.getJSONObject(i);
                        String id = categoryJson.getString("id");
                        String name = categoryJson.getString("name");
                        fetchedCategories.add(new Category(id, name));
                        Log.d(TAG, "FetchCategoriesTask: Added category - ID: " + id + ", Name: " + name);
                    }
                } else {
                    Log.e(TAG, "FetchCategoriesTask: Failed to fetch categories. HTTP Error: " + responseCode);
                    // Optionally, read error stream
                    try (BufferedReader errorReader = new BufferedReader(new InputStreamReader(conn.getErrorStream()))) {
                        StringBuilder errorResponse = new StringBuilder();
                        String errorLine;
                        while ((errorLine = errorReader.readLine()) != null) {
                            errorResponse.append(errorLine);
                        }
                        Log.e(TAG, "FetchCategoriesTask: Error response body: " + errorResponse.toString());
                    } catch (Exception e) {
                        Log.e(TAG, "FetchCategoriesTask: Failed to read error stream", e);
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "FetchCategoriesTask: Error fetching categories", e);
            } finally {
                if (conn != null) {
                    conn.disconnect();
                }
            }
            Log.d(TAG, "FetchCategoriesTask: doInBackground finished. Fetched " + fetchedCategories.size() + " categories.");
            return fetchedCategories;
        }

        @Override
        protected void onPostExecute(List<Category> fetchedCategories) {
            Log.d(TAG, "FetchCategoriesTask: onPostExecute. Received " + fetchedCategories.size() + " categories.");
            if (getContext() == null || chipGroupCategories == null) { // Added null check for chipGroupCategories
                Log.w(TAG, "FetchCategoriesTask: Context or ChipGroup is null, fragment likely detached or view not fully initialized.");
                return;
            }

            chipGroupCategories.removeAllViews(); // Clear previous chips
            categoryList.clear();

            if (fetchedCategories.isEmpty()) {
                Log.w(TAG, "FetchCategoriesTask: Fetched category list is empty.");
                Toast.makeText(getContext(), "Nie znaleziono żadnych kategorii.", Toast.LENGTH_SHORT).show();
            } else {
                Log.d(TAG, "FetchCategoriesTask: Populating ChipGroup with " + fetchedCategories.size() + " categories.");
                categoryList.addAll(fetchedCategories);

                ColorStateList chipBackgroundColorStateList = ContextCompat.getColorStateList(requireContext(), R.color.chip_background_state);
                ColorStateList chipTextColorStateList = ContextCompat.getColorStateList(requireContext(), R.color.chip_text_color_state);


                for (Category category : categoryList) {
                    Chip chip = new Chip(getContext());
                    chip.setText(category.getName());
                    chip.setTag(category); // Store the whole category object
                    chip.setCheckable(true);

                    if (chipBackgroundColorStateList != null) {
                        chip.setChipBackgroundColor(chipBackgroundColorStateList);
                    }
                    if (chipTextColorStateList != null) {
                        chip.setTextColor(chipTextColorStateList);
                    }
                    // chip.setEnsureMinTouchTargetSize(false); // Optional: if chips are too large

                    // Ensure currentSelectedIds is not null before checking contains
                    boolean isInitiallyChecked = currentSelectedIds != null && currentSelectedIds.contains(category.getId());
                    chip.setChecked(isInitiallyChecked);
                    Log.d(TAG, "Chip created: " + category.getName() + ", InitiallyChecked: " + isInitiallyChecked);

                    chip.setOnCheckedChangeListener((buttonView, isChecked) -> {
                        // Update currentSelectedIds based on chip state
                        Category cat = (Category) buttonView.getTag();
                        if (cat != null) {
                            if (isChecked) {
                                if (currentSelectedIds != null && !currentSelectedIds.contains(cat.getId())) {
                                    currentSelectedIds.add(cat.getId());
                                }
                            } else {
                                if (currentSelectedIds != null) {
                                    currentSelectedIds.remove(cat.getId());
                                }
                            }
                        }
                        Log.d(TAG, "Chip " + cat.getName() + " isChecked: " + isChecked + ". currentSelectedIds: " + (currentSelectedIds != null ? currentSelectedIds.toString() : "null"));
                        updateBadgeCount();
                    });
                    chipGroupCategories.addView(chip);
                }
            }
            updateBadgeCount(); // Update badge after populating chips
        }
    }
}
