<?php
/**
 * Semplice Child Theme - functions.php
 *
 * Enqueues all custom and third-party scripts for the front-end only.
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

function brandon_enqueue_custom_scripts() {
    if (is_admin()) {
        return;
    }

    // --- STYLES ---
    wp_enqueue_style(
        'brandon-custom-styles',
        get_stylesheet_uri(),
        array(),
        '1.0.0'
    );

    // --- THIRD-PARTY LIBRARIES ---

    // P5.js
    wp_enqueue_script(
        'brandon-p5',
        'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js',
        array(),
        '1.9.4',
        true
    );

    // GSAP Plugins - DEPENDENT ON SEMPLICE'S FRONTEND SCRIPT
    wp_enqueue_script(
        'brandon-gsap-ce',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/CustomEase.min.js',
        array('semplice-frontend-js'), // Depends on the parent theme's script
        '3.13.0',
        true
    );

    wp_enqueue_script(
        'brandon-gsap-st',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/SplitText.min.js',
        array('semplice-frontend-js'), // Depends on the parent theme's script
        '3.13.0',
        true
    );

    wp_enqueue_script(
        'brandon-gsap-stg',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js',
        array('semplice-frontend-js'), // Depends on the parent theme's script
        '3.13.0',
        true
    );


    // --- CUSTOM JS ---
    wp_enqueue_script(
        'brandon-custom-scripts',
        get_stylesheet_directory_uri() . '/brandon-custom-scripts.js',
        array('brandon-p5', 'brandon-gsap-ce', 'brandon-gsap-st', 'brandon-gsap-stg'),
        '3.1.4', // Incremented version
        true
    );
}
add_action( 'wp_enqueue_scripts', 'brandon_enqueue_custom_scripts', 20 );