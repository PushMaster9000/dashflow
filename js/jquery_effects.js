// js/jquery_effects.js
// ----------------------------------------------------
// Exp 6: Implement jQuery Effects and Animations
// Exp 10: Create Visual Effects with jQuery Animations using AJAX
// ----------------------------------------------------

$(document).ready(function() {

    // 1. Sidebar Toggle Animation
    $('#toggle-sidebar').click(function() {
        $('#sidebar').toggleClass('collapsed');
        
        if ($('#sidebar').hasClass('collapsed')) {
            $('.logo-text, .sidebar-nav span, .sidebar-footer span').fadeOut(200);
        } else {
            setTimeout(() => {
                $('.logo-text, .sidebar-nav span, .sidebar-footer span').fadeIn(200);
            }, 100);
        }
    });

    // 2. Tab Navigation Logic (Single Page App feel)
    $('.sidebar-nav .nav-item').click(function(e) {
        e.preventDefault();
        
        // Remove active class from all nav items
        $('.sidebar-nav .nav-item').removeClass('active');
        // Add active class to clicked item
        $(this).addClass('active');

        // Get target tab id
        const targetId = $(this).data('target');

        // Hide all tab panes
        $('.tab-pane').hide().removeClass('active-tab');
        
        // Fade in target tab pane
        $('#' + targetId).fadeIn(400).addClass('active-tab');
    });

    // 3. Add Task Form Toggle
    $('#add-task-btn').click(function() {
        $('#task-form').slideToggle(300);
        $(this).find('i').toggleClass('fa-plus fa-minus');
    });

    // 4. Notification Dropdown Toggle
    $('#notif-btn').click(function(e) {
        e.stopPropagation();
        $('#notif-dropdown').fadeToggle(200);
        $('#notif-dropdown').toggleClass('hidden');
        if (!$('#profile-dropdown').hasClass('hidden')) {
            $('#profile-dropdown').fadeOut(200).addClass('hidden');
        }
    });

    // 4.5 Profile Dropdown Toggle
    $('#profile-btn').click(function(e) {
        e.stopPropagation();
        $('#profile-dropdown').fadeToggle(200);
        $('#profile-dropdown').toggleClass('hidden');
        if (!$('#notif-dropdown').hasClass('hidden')) {
            $('#notif-dropdown').fadeOut(200).addClass('hidden');
        }
    });

    $(document).click(function() {
        if (!$('#notif-dropdown').hasClass('hidden')) {
            $('#notif-dropdown').fadeOut(200, function() {
                $(this).addClass('hidden');
            });
        }
        if (!$('#profile-dropdown').hasClass('hidden')) {
            $('#profile-dropdown').fadeOut(200, function() {
                $(this).addClass('hidden');
            });
        }
    });

    $('#notif-dropdown, #profile-dropdown').click(function(e) {
        e.stopPropagation();
    });

    // 5. Visual Effects with jQuery Animations using AJAX
    $(document).on('ajaxSuccessEvent', function(event, message) {
        const $msgBox = $('#ajax-msg');
        
        $msgBox.text(message);
        $msgBox.slideDown(300).delay(3000).slideUp(300);
        
        setTimeout(() => {
            $('#task-list .task-item').first()
                .css('background-color', 'rgba(16, 185, 129, 0.2)') // Matches new var(--color-green)
                .animate({ backgroundColor: 'var(--bg-color)' }, 1000, function() {
                    $(this).css('background-color', ''); 
                });
        }, 100);
    });

});
