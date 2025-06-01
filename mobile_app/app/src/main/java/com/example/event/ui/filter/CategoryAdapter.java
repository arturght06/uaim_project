package com.example.event.ui.filter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.event.R;
import com.example.event.data.model.Category;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class CategoryAdapter extends RecyclerView.Adapter<CategoryAdapter.CategoryViewHolder> {

    private List<Category> categories;
    private List<String> initiallySelectedCategoryIds;

    public CategoryAdapter(List<Category> categories, List<String> initiallySelectedCategoryIds) {
        this.categories = new ArrayList<>(categories); // Work with a copy
        this.initiallySelectedCategoryIds = initiallySelectedCategoryIds != null ? new ArrayList<>(initiallySelectedCategoryIds) : new ArrayList<>();
        for (Category category : this.categories) {
            if (this.initiallySelectedCategoryIds.contains(category.getId())) {
                category.setSelected(true);
            }
        }
        sortCategories();
    }

    @NonNull
    @Override
    public CategoryViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_category, parent, false);
        return new CategoryViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull CategoryViewHolder holder, int position) {
        Category category = categories.get(position);
        holder.categoryName.setText(category.getName());
        holder.categorySelected.setChecked(category.isSelected());

        holder.itemView.setOnClickListener(v -> {
            category.setSelected(!category.isSelected());
            holder.categorySelected.setChecked(category.isSelected());
            sortCategories();
            notifyDataSetChanged(); // More efficient updates can be used like notifyItemMoved etc.
        });
        holder.categorySelected.setOnCheckedChangeListener((buttonView, isChecked) -> {
            if (category.isSelected() != isChecked) { // Avoid recursion if click listener already handled
                category.setSelected(isChecked);
                sortCategories();
                notifyDataSetChanged();
            }
        });
    }

    private void sortCategories() {
        Collections.sort(categories, (o1, o2) -> {
            if (o1.isSelected() && !o2.isSelected()) {
                return -1;
            }
            if (!o1.isSelected() && o2.isSelected()) {
                return 1;
            }
            return o1.getName().compareToIgnoreCase(o2.getName());
        });
    }

    @Override
    public int getItemCount() {
        return categories.size();
    }

    public List<String> getSelectedCategoryIds() {
        List<String> selectedIds = new ArrayList<>();
        for (Category category : categories) {
            if (category.isSelected()) {
                selectedIds.add(category.getId());
            }
        }
        return selectedIds;
    }

    static class CategoryViewHolder extends RecyclerView.ViewHolder {
        CheckBox categorySelected;
        TextView categoryName;

        public CategoryViewHolder(@NonNull View itemView) {
            super(itemView);
            categorySelected = itemView.findViewById(R.id.checkbox_category_selected);
            categoryName = itemView.findViewById(R.id.text_category_name);
        }
    }
}
