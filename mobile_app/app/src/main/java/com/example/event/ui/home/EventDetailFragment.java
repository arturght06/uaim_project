package com.example.event.ui.home;

import android.os.AsyncTask;
import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import com.example.event.R;
import org.json.JSONObject;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.InputStreamReader;
import java.io.BufferedReader;

public class EventDetailFragment extends Fragment {
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_event_detail, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        String eventId = getArguments() != null ? getArguments().getString("event_id") : null;
        if (eventId == null) return;

        new AsyncTask<Void, Void, JSONObject>() {
            @Override
            protected JSONObject doInBackground(Void... voids) {
                try {
                    URL url = new URL(com.example.event.data.ApiConfig.BASE_URL + "api/events/" + eventId);
                    android.util.Log.d("EventDetailFragment", "URL: " + url.toString());
                    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("GET");
                    int responseCode = conn.getResponseCode();
                    if (responseCode == HttpURLConnection.HTTP_OK) {
                        BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                        StringBuilder response = new StringBuilder();
                        String line;
                        while ((line = in.readLine()) != null) response.append(line);
                        in.close();
                        return new JSONObject(response.toString());
                    }
                } catch (Exception e) { e.printStackTrace(); }
                return null;
            }

            @Override
            protected void onPostExecute(JSONObject obj) {
                if (obj != null) {
                    ((TextView) view.findViewById(R.id.text_event_detail_title)).setText(obj.optString("title", "-"));
                    ((TextView) view.findViewById(R.id.text_event_detail_date)).setText(obj.optString("date", "-"));
                    ((TextView) view.findViewById(R.id.text_event_detail_location)).setText(obj.optString("location", "-"));
                    ((TextView) view.findViewById(R.id.text_event_detail_description)).setText(obj.optString("description", "-"));
                }
            }
        }.execute();
    }
}
