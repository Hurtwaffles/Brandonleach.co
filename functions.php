<?php
/**
 * Semplice Child Theme - functions.php
 *
 * Enqueues all custom and third-party scripts for the front-end only.
 * Configures theme support for Semplice SPA features.
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

function brandon_enqueue_custom_scripts() {
    if (is_admin()) {
        return; // Only enqueue for the front-end
    }

    // --- STYLES ---
    wp_enqueue_style(
        'semplice-child-theme-styles',
        get_stylesheet_uri(),
        array('semplice-frontend-stylesheet-css'),
        '1.1.7' // Custom Overlay Menu System
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

    // GSAP Plugins
    wp_enqueue_script(
        'brandon-gsap-ce',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/CustomEase.min.js',
        array('semplice-frontend-js'),
        '3.13.0',
        true
    );

    wp_enqueue_script(
        'brandon-gsap-st',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/SplitText.min.js',
        array('semplice-frontend-js'),
        '3.13.0',
        true
    );

    wp_enqueue_script(
        'brandon-gsap-stg',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js',
        array('semplice-frontend-js'),
        '3.13.0',
        true
    );
    
    wp_enqueue_script(
        'brandon-gsap-scramble',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrambleTextPlugin.min.js',
        array('semplice-frontend-js'),
        '3.13.0',
        true
    );

    // --- CUSTOM JS ---
    wp_enqueue_script(
        'brandon-custom-scripts',
        get_stylesheet_directory_uri() . '/brandon-custom-scripts.js',
        array('brandon-p5', 'brandon-gsap-ce', 'brandon-gsap-st', 'brandon-gsap-stg', 'brandon-gsap-scramble'),
        '3.8.1', // VERSION BUMP - Overlay Menu System
        true
    );
}
add_action( 'wp_enqueue_scripts', 'brandon_enqueue_custom_scripts', 20 );

// --- SEMPLICE SPECIFIC THEME SUPPORT ---
function brandon_add_semplice_theme_support() {
    add_theme_support( 'semplice-spa' );
}
add_action( 'after_setup_theme', 'brandon_add_semplice_theme_support' );
