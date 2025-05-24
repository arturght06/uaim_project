package com.example.event.ui.home;

import android.content.res.ColorStateList;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
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

public class HomeFragment extends Fragment {

    private FragmentHomeBinding binding;

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        HomeViewModel homeViewModel =
                new ViewModelProvider(this).get(HomeViewModel.class);

        binding = FragmentHomeBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        final TextView textView = binding.textHome;
        homeViewModel.getText().observe(getViewLifecycleOwner(), textView::setText);

        return root;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        FloatingActionButton fab = view.findViewById(R.id.fab_add_event);

        boolean isLoggedIn = false;
        try {
            isLoggedIn = LoginRepository.getInstance().isLoggedIn();
        } catch (Exception e) {
            isLoggedIn = false;
        }

        if (isLoggedIn) {
            fab.setBackgroundTintList(ColorStateList.valueOf(
                ContextCompat.getColor(requireContext(), R.color.secondary_color)
            ));
            fab.setOnClickListener(v -> {
                // Logika dodawania wydarzenia
                Toast.makeText(getContext(), "Dodaj wydarzenie", Toast.LENGTH_SHORT).show();
            });
        } else {
            fab.setBackgroundTintList(ColorStateList.valueOf(
                ContextCompat.getColor(requireContext(), R.color.secondary_color_disabled)
            ));
            fab.setOnClickListener(v -> {
                Toast.makeText(getContext(), "Aby dodać wydarzenie, musisz się zalogować.", Toast.LENGTH_LONG).show();
            });
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
