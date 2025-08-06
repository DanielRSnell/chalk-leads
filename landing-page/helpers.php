<?php
/**
 * Landing Page Helper Functions
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Render a partial template file
 * 
 * @param string $partial_path Path to the partial file relative to landing-page directory
 * @param array $data Optional data to pass to the partial
 * @return void
 */
function render_partial($partial_path, $data = []) {
    // Extract data array to variables for use in partial
    if (!empty($data)) {
        extract($data, EXTR_SKIP);
    }
    
    // Build the full path to the partial
    $full_path = __DIR__ . '/' . ltrim($partial_path, '/');
    
    // Check if file exists before including
    if (file_exists($full_path)) {
        include $full_path;
    } else {
        // Development error - show helpful message
        if (defined('WP_DEBUG') && WP_DEBUG) {
            echo "<!-- Partial not found: {$full_path} -->";
        }
    }
}

/**
 * Get the plugin directory URL for assets
 * 
 * @return string Plugin directory URL
 */
function get_landing_asset_url() {
    return plugin_dir_url(__FILE__);
}

/**
 * Get the full URL to an asset file
 * 
 * @param string $asset_path Path to asset relative to assets folder (e.g., 'logos/Atlanta-Furniture-Movers.png')
 * @return string Full URL to asset
 */
function get_asset_url($asset_path) {
    return get_landing_asset_url() . 'assets/' . ltrim($asset_path, '/');
}

/**
 * Get raw SVG content from an icon file
 * 
 * @param string $icon_path Path to icon relative to assets/icons folder (e.g., 'Device/phone-line.svg')
 * @param string $css_class Optional CSS class to add to the SVG
 * @return string Raw SVG content or empty string if file not found
 */
function get_raw_svg($icon_path, $css_class = '') {
    // Build the full path to the icon
    $full_path = __DIR__ . '/assets/icons/' . ltrim($icon_path, '/');
    
    // Check if file exists
    if (!file_exists($full_path)) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            return "<!-- Icon not found: {$full_path} -->";
        }
        return '';
    }
    
    // Read the SVG content
    $svg_content = file_get_contents($full_path);
    
    // Add CSS class if provided
    if (!empty($css_class) && $svg_content) {
        // Look for existing class attribute or add one
        if (strpos($svg_content, 'class=') !== false) {
            // Add to existing class attribute
            $svg_content = preg_replace('/class="([^"]*)"/', 'class="$1 ' . esc_attr($css_class) . '"', $svg_content);
        } else {
            // Add new class attribute to svg tag
            $svg_content = preg_replace('/<svg([^>]*)>/', '<svg$1 class="' . esc_attr($css_class) . '">', $svg_content);
        }
    }
    
    return $svg_content;
}

/**
 * Enqueue landing page styles
 * 
 * @return void
 */
function enqueue_landing_styles() {
    $plugin_url = get_landing_asset_url();
    $css_file = $plugin_url . 'dist/main.css';
    $css_path = __DIR__ . '/dist/main.css';
    
    // Get file modification time for cache busting
    $version = file_exists($css_path) ? filemtime($css_path) : '1.0.0';
    
    // Debug CSS path in development
    if (defined('WP_DEBUG') && WP_DEBUG) {
        echo "<!-- CSS File: {$css_file} -->\n";
        echo "<!-- CSS Path Exists: " . (file_exists($css_path) ? 'YES' : 'NO') . " -->\n";
    }
    
    echo '<link rel="stylesheet" href="' . esc_url($css_file) . '?v=' . esc_attr($version) . '">' . "\n";
}

/**
 * Get MoovinLeads widget HTML
 * 
 * @return string Widget HTML or empty string
 */
function get_moovinleads_widget() {
    // Get the MoovinLeads plugin instance
    if (class_exists('MoovinLeads')) {
        $moovinleads = MoovinLeads::getInstance();
        if (method_exists($moovinleads, 'renderWidget')) {
            ob_start();
            echo $moovinleads->renderWidget();
            return ob_get_clean();
        }
    }
    
    // Fallback if plugin not available
    return '<p>MoovinLeads widget not available. Please ensure the plugin is activated.</p>';
}

/**
 * Get structured data for Atlanta's Furniture Taxi
 * 
 * @return string JSON-LD structured data
 */
function get_structured_data() {
    $data = [
        "@context" => "https://schema.org",
        "@type" => "MovingCompany",
        "name" => "Atlanta's Furniture Taxi",
        "description" => "Professional moving services in Atlanta with Southern hospitality",
        "url" => home_url(),
        "telephone" => "404-228-7404",
        "address" => [
            "@type" => "PostalAddress",
            "streetAddress" => "2340 Chamblee Tucker Rd",
            "addressLocality" => "Atlanta",
            "addressRegion" => "GA",
            "addressCountry" => "US"
        ],
        "areaServed" => [
            "Atlanta", "Chamblee", "Roswell", "Alpharetta", 
            "Dunwoody", "Marietta", "Buckhead"
        ],
        "serviceType" => [
            "Local Moving", "Long Distance Moving", "Commercial Moving", 
            "Storage Services", "Packing Services"
        ]
    ];
    
    return '<script type="application/ld+json">' . wp_json_encode($data, JSON_PRETTY_PRINT) . '</script>';
}