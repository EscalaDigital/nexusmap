<div class="wrap">
    <h1>Form Entries</h1>

    <!-- Sección de entradas pendientes -->
    <div class="nm-entries-section">
        <h2>Entradas Pendientes (<?php echo count($pending_entries); ?>)</h2>
        <?php if (!empty($pending_entries)): ?>
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
                    <?php foreach ($pending_entries as $entry): ?>
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
        <?php else: ?>
            <p>No hay entradas pendientes.</p>
        <?php endif; ?>
    </div>

    <!-- Separador visual -->
    <hr style="margin: 30px 0; border: 2px solid #0073aa;">

    <!-- Sección de entradas aprobadas -->
    <div class="nm-entries-section">
        <h2>Entradas Aprobadas (<?php echo count($approved_entries); ?>)</h2>
        <?php if (!empty($approved_entries)): ?>
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
                    <?php foreach ($approved_entries as $entry): ?>
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
                                <button class="button edit-entry" data-id="<?php echo esc_attr($entry->id); ?>">Edit</button>
                                <button class="button button-secondary delete-entry" data-id="<?php echo esc_attr($entry->id); ?>">Delete</button>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php else: ?>
            <p>No hay entradas aprobadas.</p>
        <?php endif; ?>
    </div>
</div>

<div id="dataModal" class="modal" style="display:none;">
    <div class="modal-content">
        <div class="modal-header">
            <h2>Información de la Entrada</h2>
            <button class="close" type="button">&times;</button>
        </div>
        <div class="modal-body">
            <div class="map-section">
                <div id="map" style="height: 100%; width: 100%;"></div>
            </div>
            <div class="data-section">
                <h3 class="data-section-title">Datos del Formulario</h3>
                <div class="property-grid">
                    <div id="jsonData"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modal de edición de entradas -->
<div id="editEntryModal" class="modal" style="display:none;">
    <div class="modal-content" style="width: 90%; max-width: 800px;">
        <span class="close edit-modal-close">&times;</span>
        <h2>Editar Entrada</h2>
        <div id="editEntryForm">
            <div id="editFormFields"></div>
            <div style="margin-top: 20px;">
                <button id="saveEntryChanges" class="button button-primary">Guardar Cambios</button>
                <button id="cancelEntryEdit" class="button">Cancelar</button>
            </div>
        </div>
    </div>
</div>