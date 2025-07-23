<?php
/**
 * Plugin Name: MoovinLeads
 * Description: AI-powered Lead Capture Widget for Moving Companies. Capture, qualify, and convert leads with intelligent forms and automated follow-up.
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL v2 or later
 * Text Domain: moovinleads
 * Domain Path: /languages
 *
 * @package MoovinLeads
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('MOOVINLEADS_VERSION', '1.0.0');
define('MOOVINLEADS_FILE', __FILE__);
define('MOOVINLEADS_DIR', plugin_dir_path(__FILE__));
define('MOOVINLEADS_URL', plugin_dir_url(__FILE__));
define('MOOVINLEADS_BASENAME', plugin_basename(__FILE__));

/**
 * Main Plugin Class
 */
class MoovinLeads {
    
    /**
     * Single instance of the class
     */
    private static $instance = null;
    
    /**
     * Get single instance
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->init();
    }
    
    /**
     * Initialize the plugin
     */
    private function init() {
        // Hook into WordPress
        add_action('init', [$this, 'onInit']);
        add_action('wp_enqueue_scripts', [$this, 'enqueueAssets']);
        add_action('admin_enqueue_scripts', [$this, 'enqueueAssets']);
        add_action('enqueue_block_editor_assets', [$this, 'enqueueBlockEditorAssets']);
        add_action('rest_api_init', [$this, 'initRestApi']);
        
        // Admin hooks
        add_action('admin_menu', [$this, 'addAdminMenu']);
        
        // Plugin lifecycle hooks
        register_activation_hook(__FILE__, [$this, 'onActivation']);
        register_deactivation_hook(__FILE__, [$this, 'onDeactivation']);
        
        // Load required files
        $this->loadDependencies();
    }
    
    /**
     * Initialize plugin
     */
    public function onInit() {
        // Load text domain
        load_plugin_textdomain('moovinleads', false, dirname(MOOVINLEADS_BASENAME) . '/languages');
        
        // Initialize database tables if needed
        $this->initDatabase();
    }
    
    /**
     * Enqueue frontend and admin assets
     */
    public function enqueueAssets() {
        // Enqueue the React build
        $js_file = MOOVINLEADS_DIR . 'dist/js/shadow-plugin.js';
        if (file_exists($js_file)) {
            wp_enqueue_script(
                'moovinleads-js',
                MOOVINLEADS_URL . 'dist/js/shadow-plugin.js',
                [],
                filemtime($js_file),
                true
            );
        }
        
        // Localize script with WordPress data
        wp_localize_script('moovinleads-js', 'moovinleadsData', [
            'nonce' => wp_create_nonce('wp_rest'),
            'apiUrl' => rest_url('moovinleads/v1/'),
            'adminUrl' => admin_url(),
            'pluginUrl' => MOOVINLEADS_URL,
            'isAdmin' => is_admin(),
            'currentUser' => wp_get_current_user()->ID,
            'version' => MOOVINLEADS_VERSION,
            'tailwindApiUrl' => rest_url('moovinleads/v1/tailwind-styles'),
            'hasTailwindCSS' => $this->hasTailwindCSS()
        ]);
        
        // Add server data to page for web component props
        $this->addServerDataToPage();
    }
    
    /**
     * Enqueue block editor specific assets
     */
    public function enqueueBlockEditorAssets() {
        // Add Gutenberg-specific integration here
        $this->enqueueAssets();
    }
    
    /**
     * Initialize REST API endpoints
     */
    public function initRestApi() {
        // Register API routes
        register_rest_route('moovinleads/v1', '/data', [
            'methods' => 'GET',
            'callback' => [$this, 'apiGetData'],
            'permission_callback' => [$this, 'apiPermissionCheck']
        ]);
        
        register_rest_route('moovinleads/v1', '/data', [
            'methods' => 'POST',
            'callback' => [$this, 'apiSaveData'],
            'permission_callback' => [$this, 'apiPermissionCheck']
        ]);
        
        // Register leads endpoint
        register_rest_route('moovinleads/v1', '/leads', [
            'methods' => 'POST',
            'callback' => [$this, 'apiSubmitLead'],
            'permission_callback' => [$this, 'apiPermissionCheck'],
            'args' => [
                'serviceType' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_string($param);
                    }
                ]
            ]
        ]);
        
        // Register Tailwind CSS API routes
        if (class_exists('MoovinLeads_Tailwind_Controller')) {
            $tailwind_controller = new MoovinLeads_Tailwind_Controller();
            $tailwind_controller->register_routes();
        }
    }
    
    /**
     * API permission check
     */
    public function apiPermissionCheck() {
        return current_user_can('edit_posts');
    }
    
    /**
     * API: Get data
     */
    public function apiGetData($request) {
        // Verify nonce
        if (!wp_verify_nonce($request->get_header('X-WP-Nonce'), 'wp_rest')) {
            return new WP_Error('invalid_nonce', 'Invalid nonce', ['status' => 403]);
        }
        
        // Return sample data
        return rest_ensure_response([
            'success' => true,
            'data' => [
                'message' => 'Hello from MoovinLeads API!'
            ]
        ]);
    }
    
    /**
     * API: Save data
     */
    public function apiSaveData($request) {
        // Verify nonce
        if (!wp_verify_nonce($request->get_header('X-WP-Nonce'), 'wp_rest')) {
            return new WP_Error('invalid_nonce', 'Invalid nonce', ['status' => 403]);
        }
        
        $data = $request->get_json_params();
        
        // Process and save data here
        // Example: update_option('shadow_plugin_data', $data);
        
        return rest_ensure_response([
            'success' => true,
            'message' => 'Data saved successfully'
        ]);
    }
    
    /**
     * Submit lead from widget
     */
    public function apiSubmitLead($request) {
        // Verify nonce
        if (!wp_verify_nonce($request->get_header('X-WP-Nonce'), 'wp_rest')) {
            return new WP_Error('invalid_nonce', 'Invalid nonce', ['status' => 403]);
        }
        
        $lead_data = $request->get_json_params();
        
        // Validate required fields
        if (empty($lead_data['serviceType'])) {
            return new WP_Error('missing_service_type', 'Service type is required', ['status' => 400]);
        }
        
        if (empty($lead_data['contact']['email'])) {
            return new WP_Error('missing_email', 'Email is required', ['status' => 400]);
        }
        
        try {
            // Save lead to database
            global $wpdb;
            
            $table_name = $wpdb->prefix . 'moovinleads_leads';
            
            $result = $wpdb->insert(
                $table_name,
                [
                    'lead_data' => json_encode($lead_data),
                    'email' => sanitize_email($lead_data['contact']['email']),
                    'phone' => sanitize_text_field($lead_data['contact']['phone'] ?? ''),
                    'service_type' => sanitize_text_field($lead_data['serviceType']),
                    'status' => 'new',
                    'created_at' => current_time('mysql'),
                    'updated_at' => current_time('mysql')
                ],
                [
                    '%s', // lead_data
                    '%s', // email
                    '%s', // phone
                    '%s', // service_type
                    '%s', // status
                    '%s', // created_at
                    '%s'  // updated_at
                ]
            );
            
            if ($result === false) {
                return new WP_Error('database_error', 'Failed to save lead', ['status' => 500]);
            }
            
            $lead_id = $wpdb->insert_id;
            
            // Send notification email to admin (optional)
            $this->sendLeadNotification($lead_data, $lead_id);
            
            return rest_ensure_response([
                'success' => true,
                'message' => 'Lead submitted successfully',
                'lead_id' => $lead_id
            ]);
            
        } catch (Exception $e) {
            return new WP_Error('submission_error', $e->getMessage(), ['status' => 500]);
        }
    }
    
    /**
     * Send lead notification email
     */
    private function sendLeadNotification($lead_data, $lead_id) {
        $admin_email = get_option('admin_email');
        $subject = 'New Moving Lead #' . $lead_id;
        
        $message = "A new moving lead has been submitted:\n\n";
        $message .= "Lead ID: " . $lead_id . "\n";
        $message .= "Name: " . $lead_data['contact']['firstName'] . " " . $lead_data['contact']['lastName'] . "\n";
        $message .= "Email: " . $lead_data['contact']['email'] . "\n";
        $message .= "Phone: " . $lead_data['contact']['phone'] . "\n";
        $message .= "Service Type: " . $lead_data['serviceType'] . "\n";
        
        if (!empty($lead_data['moveDate'])) {
            $message .= "Move Date: " . $lead_data['moveDate'] . "\n";
        }
        
        $message .= "\nView in admin: " . admin_url('options-general.php?page=moovinleads-settings');
        
        wp_mail($admin_email, $subject, $message);
    }
    
    /**
     * Add admin menu
     */
    public function addAdminMenu() {
        add_options_page(
            __('MoovinLeads Settings', 'moovinleads'),
            __('MoovinLeads', 'moovinleads'),
            'manage_options',
            'moovinleads-settings',
            [$this, 'renderAdminPage']
        );
    }
    
    /**
     * Render admin page
     */
    public function renderAdminPage() {
        // Get current user info
        $current_user = wp_get_current_user();
        $user_roles = $current_user->roles;
        $user_role = !empty($user_roles) ? $user_roles[0] : 'subscriber';
        
        // Get Tailwind CSS for admin page
        $tailwind_css = $this->getTailwindCSS();
        
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            <div id="moovinleads-admin-root">
                <!-- Example of passing server data to React component via attributes -->
                <moovinleads-widget 
                    user-role="<?php echo esc_attr($user_role); ?>"
                    site-url="<?php echo esc_attr(home_url()); ?>"
                    user-id="<?php echo esc_attr($current_user->ID); ?>"
                    settings='<?php echo esc_attr(json_encode(get_option('moovinleads_settings', []))); ?>'
                    api-nonce="<?php echo esc_attr(wp_create_nonce('moovinleads_nonce')); ?>"
                    plugin-version="<?php echo esc_attr(MOOVINLEADS_VERSION); ?>"
                    is-admin="<?php echo esc_attr(current_user_can('manage_options') ? 'true' : 'false'); ?>"
                    theme="dark"
                    <?php if (!empty($tailwind_css)) : ?>
                    tailwind-css="<?php echo base64_encode($tailwind_css); ?>"
                    <?php endif; ?>
                ></moovinleads-widget>
            </div>
        </div>
        <?php
    }
    
    /**
     * Get Tailwind CSS content server-side
     */
    private function getTailwindCSS() {
        $css_file = MOOVINLEADS_DIR . 'dist/css/main.css';
        
        if (!file_exists($css_file)) {
            return '';
        }
        
        $css_content = file_get_contents($css_file);
        
        if (!$css_content) {
            return '';
        }
        
        // Process CSS for Shadow DOM compatibility
        $css_content = $this->processCSSForShadowDOM($css_content);
        
        return $css_content;
    }
    
    /**
     * Process CSS for Shadow DOM compatibility
     */
    private function processCSSForShadowDOM($css) {
        // Remove any @import statements (not supported in Shadow DOM)
        $css = preg_replace('/@import[^;]*;/', '', $css);
        
        // CSS is already properly formatted for shadow DOM with :host selector
        // No need to wrap again as Tailwind 4 already includes :host rules
        
        // Fix any remaining issues with CSS variables
        $css = str_replace(':root', ':host', $css);
        
        // Clean up extra whitespace but preserve structure
        $css = trim($css);
        
        return $css;
    }

    /**
     * Add server data to page for web component initialization
     */
    public function addServerDataToPage() {
        // Get current user info
        $current_user = wp_get_current_user();
        $user_roles = $current_user->roles;
        $user_role = !empty($user_roles) ? $user_roles[0] : 'subscriber';
        
        // Get Tailwind CSS content
        $tailwind_css = $this->getTailwindCSS();
        
        // Add a web component with server data to footer only if script is enqueued
        add_action('wp_footer', function() use ($current_user, $user_role, $tailwind_css) {
            // Only inject if the script was actually enqueued
            if (!wp_script_is('moovinleads-js', 'enqueued')) {
                return;
            }
            ?>
            <script>
                // Auto-create shadow plugin panel with server data
                document.addEventListener('DOMContentLoaded', function() {
                    // Only add if not already present
                    if (!document.querySelector('moovinleads-widget')) {
                        const panel = document.createElement('moovinleads-widget');
                        
                        // Set attributes with server data
                        panel.setAttribute('user-role', '<?php echo esc_js($user_role); ?>');
                        panel.setAttribute('site-url', '<?php echo esc_js(home_url()); ?>');
                        panel.setAttribute('user-id', '<?php echo esc_js($current_user->ID); ?>');
                        panel.setAttribute('settings', '<?php echo esc_js(json_encode(get_option('moovinleads_settings', []))); ?>');
                        panel.setAttribute('api-nonce', '<?php echo esc_js(wp_create_nonce('moovinleads_nonce')); ?>');
                        panel.setAttribute('plugin-version', '<?php echo esc_js(MOOVINLEADS_VERSION); ?>');
                        panel.setAttribute('is-admin', '<?php echo esc_js(current_user_can('manage_options') ? 'true' : 'false'); ?>');
                        panel.setAttribute('theme', 'dark');
                        <?php if (!empty($tailwind_css)) : ?>
                        panel.setAttribute('tailwind-css', <?php echo json_encode(base64_encode($tailwind_css)); ?>);
                        <?php endif; ?>
                        
                        // Add to body (hidden by default until triggered)
                        document.body.appendChild(panel);
                    }
                });
            </script>
            <?php
        });
        
        // For admin pages, also add to admin_footer
        add_action('admin_footer', function() use ($current_user, $user_role, $tailwind_css) {
            // Only inject if the script was actually enqueued
            if (!wp_script_is('moovinleads-js', 'enqueued')) {
                return;
            }
            ?>
            <script>
                // Auto-create shadow plugin panel with server data
                document.addEventListener('DOMContentLoaded', function() {
                    // Only add if not already present
                    if (!document.querySelector('moovinleads-widget')) {
                        const panel = document.createElement('moovinleads-widget');
                        
                        // Set attributes with server data
                        panel.setAttribute('user-role', '<?php echo esc_js($user_role); ?>');
                        panel.setAttribute('site-url', '<?php echo esc_js(home_url()); ?>');
                        panel.setAttribute('user-id', '<?php echo esc_js($current_user->ID); ?>');
                        panel.setAttribute('settings', '<?php echo esc_js(json_encode(get_option('moovinleads_settings', []))); ?>');
                        panel.setAttribute('api-nonce', '<?php echo esc_js(wp_create_nonce('moovinleads_nonce')); ?>');
                        panel.setAttribute('plugin-version', '<?php echo esc_js(MOOVINLEADS_VERSION); ?>');
                        panel.setAttribute('is-admin', '<?php echo esc_js(current_user_can('manage_options') ? 'true' : 'false'); ?>');
                        panel.setAttribute('theme', 'dark');
                        <?php if (!empty($tailwind_css)) : ?>
                        panel.setAttribute('tailwind-css', <?php echo json_encode(base64_encode($tailwind_css)); ?>);
                        <?php endif; ?>
                        
                        // Add to body (hidden by default until triggered)
                        document.body.appendChild(panel);
                    }
                });
            </script>
            <?php
        });
    }
    
    /**
     * Plugin activation
     */
    public function onActivation() {
        // Create database tables
        $this->createTables();
        
        // Set default options
        add_option('moovinleads_version', MOOVINLEADS_VERSION);
        add_option('moovinleads_settings', [
            'enabled' => true,
            'api_key' => ''
        ]);
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    /**
     * Plugin deactivation
     */
    public function onDeactivation() {
        // Clean up if needed
        flush_rewrite_rules();
    }
    
    /**
     * Initialize database
     */
    private function initDatabase() {
        $installed_version = get_option('moovinleads_version');
        
        if ($installed_version !== MOOVINLEADS_VERSION) {
            $this->createTables();
            update_option('moovinleads_version', MOOVINLEADS_VERSION);
        }
    }
    
    /**
     * Create database tables
     */
    private function createTables() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'moovinleads_data';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            data_key varchar(255) NOT NULL,
            data_value longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY data_key (data_key)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * Check if Tailwind CSS file exists
     */
    private function hasTailwindCSS() {
        if (class_exists('MoovinLeads_Tailwind_Controller')) {
            $controller = new MoovinLeads_Tailwind_Controller();
            return $controller->css_file_exists();
        }
        return false;
    }
    
    /**
     * Load required dependencies
     */
    private function loadDependencies() {
        // Load additional PHP classes here
        require_once MOOVINLEADS_DIR . 'includes/api/class-tailwind-controller.php';
        // require_once MOOVINLEADS_DIR . 'includes/class-admin.php';
    }
}

// Initialize the plugin
function moovinLeads() {
    return MoovinLeads::getInstance();
}

// Start the plugin
moovinLeads();