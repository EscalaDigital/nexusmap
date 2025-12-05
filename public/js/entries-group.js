/**
 * NexusMap - Entries Group JavaScript
 * Maneja la interacción de la galería agrupada
 */

(function($) {
    'use strict';

    // Variables globales
    let currentCategory = null;
    let currentPage = 1;
    let isLoading = false;

    /**
     * Inicializar la galería agrupada
     */
    function initEntriesGroup() {
        const $container = $('.nm-entries-group-container');
        
        if ($container.length === 0) {
            return;
        }

        // Evento click en categorías
        $(document).on('click', '.nm-group-category', function(e) {
            e.preventDefault();
            
            if (isLoading) {
                return;
            }

            const $category = $(this);
            const category = $category.data('category');

            // Si ya está activa, no hacer nada
            if ($category.hasClass('active')) {
                return;
            }

            // Actualizar estado de categorías
            $('.nm-group-category').removeClass('active').addClass('inactive');
            $category.removeClass('inactive').addClass('active');

            // Cargar entradas de esta categoría
            currentCategory = category;
            currentPage = 1;
            loadFilteredEntries(category, 1);
        });

        // Evento click en paginación
        $(document).on('click', '.nm-entries-pagination .nm-page-link', function(e) {
            e.preventDefault();
            
            if ($(this).hasClass('nm-current') || isLoading) {
                return;
            }

            const page = parseInt($(this).data('page'));
            
            if (page && currentCategory) {
                currentPage = page;
                loadFilteredEntries(currentCategory, page);
                
                // Scroll suave hacia arriba
                $('html, body').animate({
                    scrollTop: $('.nm-group-entries-container').offset().top - 100
                }, 300);
            }
        });
    }

    /**
     * Cargar entradas filtradas por categoría
     */
    function loadFilteredEntries(category, page) {
        if (isLoading) {
            return;
        }

        const $container = $('.nm-entries-group-container');
        const $entriesContainer = $('.nm-group-entries-container');
        const $entriesGrid = $('#nm-filtered-entries');
        const $pagination = $('#nm-group-pagination');
        const groupField = $container.data('group-field');
        const perPage = $container.data('per-page');

        // Mostrar estado de carga
        isLoading = true;
        $entriesGrid.addClass('nm-loading');

        // Realizar petición AJAX
        $.ajax({
            url: nm_group_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'nm_get_filtered_entries',
                nonce: nm_group_ajax.nonce,
                category: category,
                group_field: groupField,
                page: page,
                per_page: perPage
            },
            success: function(response) {
                if (response.success) {
                    // Actualizar título
                    $('.nm-group-current-category').text(category);

                    // Actualizar entradas con animación
                    $entriesGrid.fadeOut(200, function() {
                        $entriesGrid.html(response.data.cards_html);
                        $entriesGrid.removeClass('nm-loading').fadeIn(300);
                    });

                    // Actualizar paginación
                    if (response.data.pagination_html) {
                        $pagination.html(response.data.pagination_html).show();
                    } else {
                        $pagination.hide();
                    }

                    // Mostrar contenedor de entradas si estaba oculto
                    if (!$entriesContainer.is(':visible')) {
                        $entriesContainer.fadeIn(400, function() {
                            // Hacer scroll hasta el contenedor después de mostrarlo
                            $('html, body').animate({
                                scrollTop: $entriesContainer.offset().top - 100
                            }, 300);
                        });
                    } else {
                        // Si ya está visible, hacer scroll inmediatamente
                        $('html, body').animate({
                            scrollTop: $entriesContainer.offset().top - 100
                        }, 300);
                    }

                    // Reiniciar modal handlers si existen
                    if (typeof initEntryModals === 'function') {
                        initEntryModals();
                    }
                } else {
                    console.error('Error al cargar entradas:', response.data);
                    showError('No se pudieron cargar las entradas. Por favor, intenta de nuevo.');
                }
            },
            error: function(xhr, status, error) {
                console.error('Error AJAX:', error);
                showError('Error de conexión. Por favor, intenta de nuevo.');
            },
            complete: function() {
                isLoading = false;
                $entriesGrid.removeClass('nm-loading');
            }
        });
    }

    /**
     * Mostrar mensaje de error
     */
    function showError(message) {
        const $entriesGrid = $('#nm-filtered-entries');
        $entriesGrid.html(
            '<div class="nm-no-entries">' +
            '<p style="color: #dc2626;">' + message + '</p>' +
            '</div>'
        );
    }

    /**
     * Inicializar cuando el documento esté listo
     */
    $(document).ready(function() {
        initEntriesGroup();
    });

})(jQuery);
