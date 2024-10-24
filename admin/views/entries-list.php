<div class="wrap">
    <h1>Form Entries</h1>
    <table class="wp-list-table widefat fixed striped">
        <thead>
            <tr>
                <th>ID</th>
                <th>User</th>
                <th>Data</th>
                <th>Status</th>
                <th>Date Submitted</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($entries as $entry): ?>
                <tr>
                    <td><?php echo esc_html($entry->id); ?></td>
                    <td><?php echo esc_html(get_userdata($entry->user_id)->display_name); ?></td>
                
                    <td>
                        <button class="button view-data"
                            data-id="<?php echo esc_attr($entry->id); ?>"
                            data-json='<?php echo wp_json_encode(maybe_unserialize($entry->entry_data)); ?>'>
                            View data
                        </button>
                    </td>
                    <td><?php echo esc_html($entry->status); ?></td>
                    <td><?php echo esc_html($entry->date_submitted); ?></td>
                    <td>
                        <button class="button approve-entry" data-id="<?php echo esc_attr($entry->id); ?>">Approve</button>
                        <button class="button reject-entry" data-id="<?php echo esc_attr($entry->id); ?>">Reject</button>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>

<div id="dataModal" class="modal" style="display:none;">
    <div class="modal-content">
        <span class="close">&times;</span>
        <div id="map" style="height: 400px;"></div>
        <pre id="jsonData"></pre>
    </div>
</div>