package com.example.event.ui.home;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.event.R;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class EventAdapter extends RecyclerView.Adapter<EventAdapter.ViewHolder> {
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

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_event, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Event event = events.get(position);

        boolean isLoggedIn = com.example.event.data.LoginRepository.getInstance().getLoggedInUser() != null;
        String loggedUserId = isLoggedIn ? com.example.event.data.LoginRepository.getInstance().getLoggedInUser().getUserId() : null;
        boolean isMyEvent = (loggedUserId != null && event.organizerId != null && loggedUserId.equals(event.organizerId));

        // Autor i data utworzenia
        if (isMyEvent) {
            holder.authorView.setText("Twoje wydarzenie");
        } else {
            holder.authorView.setText(event.authorName + " " + event.authorSurname);
        }
        holder.createdView.setText(formatDate(event.createdAt, "d MMMM yyyy HH:mm"));

        // Tytuł
        holder.titleView.setText(event.title);

        // Lokalizacja
        String loc = event.locationCountry;
        if (event.locationCity != null && !event.locationCity.isEmpty())
            loc += ", " + event.locationCity;
        if (event.locationAddress != null && !event.locationAddress.isEmpty())
            loc += ", " + event.locationAddress;
        holder.locationView.setText(loc);

        // Data eventu
        holder.eventDateView.setText(formatDate(event.eventDate, "d MMMM yyyy HH:mm"));

        // Opis
        holder.descriptionView.setText(event.description);

        // Liczba rezerwacji
        String reservationText;
        if (event.maxParticipants > 0) {
            reservationText = event.reservationCount + "/" + event.maxParticipants;
        } else {
            reservationText = String.valueOf(event.reservationCount);
        }
        holder.reservationCountView.setText(reservationText);

        // Ikona dołączania
        if (!isLoggedIn || isMyEvent) {
            holder.joinBtn.setVisibility(View.GONE);
        } else {
            holder.joinBtn.setVisibility(View.VISIBLE);
            if ("confirmed".equals(event.reservationStatus)) {
                holder.joinBtn.setImageResource(R.drawable.person_dash_fill);
                holder.joinBtn.setColorFilter(context.getResources().getColor(R.color.primary_color)); // Tawny - for deleting reservation
                holder.joinBtn.setContentDescription("Wycofaj udział");
            } else {
                holder.joinBtn.setImageResource(R.drawable.person_check_fill);
                holder.joinBtn.setColorFilter(context.getResources().getColor(R.color.secondary_color)); // Hunter Green - for adding reservation
                holder.joinBtn.setContentDescription("Weź udział");
            }
            holder.joinBtn.setOnClickListener(v -> listener.onJoin(event));
        }

        // Obsługa kliknięć
        holder.itemView.setOnClickListener(v -> listener.onDetails(event));
        holder.commentBtn.setOnClickListener(v -> listener.onComment(event));
    }

    @Override
    public int getItemCount() { return events.size(); }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView authorView, createdView, titleView, locationView, eventDateView, descriptionView, reservationCountView;
        ImageView joinBtn, commentBtn;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            authorView = itemView.findViewById(R.id.text_event_author);
            createdView = itemView.findViewById(R.id.text_event_created);
            titleView = itemView.findViewById(R.id.text_event_title);
            locationView = itemView.findViewById(R.id.text_event_location);
            eventDateView = itemView.findViewById(R.id.text_event_date);
            descriptionView = itemView.findViewById(R.id.text_event_description);
            reservationCountView = itemView.findViewById(R.id.text_reservation_count);
            joinBtn = itemView.findViewById(R.id.button_join);
            commentBtn = itemView.findViewById(R.id.button_comment);
        }
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
