package com.example.event.ui.home;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.TextView;
import android.widget.ImageView;
import com.example.event.R;
import java.util.List;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class EventAdapter extends BaseAdapter {
    private Context context;
    private List<Event> events;
    private OnEventActionListener listener;

    public interface OnEventActionListener {
        void onComment(Event event);
        void onJoin(Event event);
        void onDetails(Event event);
    }

    public EventAdapter(Context context, List<Event> events, OnEventActionListener listener) {
        this.context = context;
        this.events = events;
        this.listener = listener;
    }

    @Override
    public int getCount() { return events.size(); }

    @Override
    public Object getItem(int position) { return events.get(position); }

    @Override
    public long getItemId(int position) { return position; }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        Event event = events.get(position);
        if (convertView == null) {
            convertView = LayoutInflater.from(context).inflate(R.layout.item_event, parent, false);
        }

        boolean isLoggedIn = com.example.event.data.LoginRepository.getInstance().getLoggedInUser() != null;
        String loggedUserId = isLoggedIn ? com.example.event.data.LoginRepository.getInstance().getLoggedInUser().getUserId() : null;
        boolean isMyEvent = (loggedUserId != null && event.organizerId != null && loggedUserId.equals(event.organizerId));

        // Autor i data utworzenia
        TextView authorView = convertView.findViewById(R.id.text_event_author);
        if (isMyEvent) {
            authorView.setText("Twoje wydarzenie");
        } else {
            authorView.setText(event.authorName + " " + event.authorSurname);
        }
        ((TextView) convertView.findViewById(R.id.text_event_created)).setText(
            formatDate(event.createdAt, "d MMMM yyyy HH:mm")
        );

        // Tytuł
        ((TextView) convertView.findViewById(R.id.text_event_title)).setText(event.title);

        // Lokalizacja
        String loc = event.locationCountry;
        if (event.locationCity != null && !event.locationCity.isEmpty())
            loc += ", " + event.locationCity;
        if (event.locationAddress != null && !event.locationAddress.isEmpty())
            loc += ", " + event.locationAddress;
        ((TextView) convertView.findViewById(R.id.text_event_location)).setText(loc);

        // Data eventu
        ((TextView) convertView.findViewById(R.id.text_event_date)).setText(
            formatDate(event.eventDate, "d MMMM yyyy HH:mm")
        );

        // Opis
        ((TextView) convertView.findViewById(R.id.text_event_description)).setText(event.description);

        // Liczba rezerwacji
        TextView reservationCountView = convertView.findViewById(R.id.text_reservation_count);
        String reservationText;
        if (event.maxParticipants > 0) {
            reservationText = event.reservationCount + "/" + event.maxParticipants;
        } else {
            reservationText = String.valueOf(event.reservationCount);
        }
        reservationCountView.setText(reservationText);

        // Ikona dołączania
        ImageView joinBtn = convertView.findViewById(R.id.button_join);
        if (!isLoggedIn || isMyEvent) {
            joinBtn.setVisibility(View.GONE);
        } else {
            joinBtn.setVisibility(View.VISIBLE);
            if ("confirmed".equals(event.reservationStatus)) {
                joinBtn.setImageResource(R.drawable.person_dash_fill);
                joinBtn.setColorFilter(context.getResources().getColor(R.color.tawny));
                joinBtn.setContentDescription("Wycofaj udział");
            } else {
                joinBtn.setImageResource(R.drawable.person_check_fill);
                joinBtn.setColorFilter(context.getResources().getColor(R.color.primary_color));
                joinBtn.setContentDescription("Weź udział");
            }
            joinBtn.setOnClickListener(v -> listener.onJoin(event));
        }

        // Obsługa kliknięć
        convertView.setOnClickListener(v -> listener.onDetails(event));
        convertView.findViewById(R.id.button_comment).setOnClickListener(v -> listener.onComment(event));

        return convertView;
    }

    private String formatDate(String apiDate, String outFormat) {
        try {
            SimpleDateFormat apiFmt = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z", Locale.ENGLISH);
            Date date = apiFmt.parse(apiDate);
            SimpleDateFormat outFmt = new SimpleDateFormat(outFormat, new Locale("pl", "PL"));
            return outFmt.format(date);
        } catch (Exception e) {
            return apiDate;
        }
    }
}
