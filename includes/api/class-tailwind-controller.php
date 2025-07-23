<?php
/**
 * Tailwind CSS API Controller
 * 
 * Handles fetching and serving compiled Tailwind CSS for the Shadow DOM web component
 * 
 * @package MoovinLeads
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class MoovinLeads_Tailwind_Controller {
    
    /**
     * Register REST API routes
     */
    public function register_routes() {
        register_rest_route('moovinleads/v1', '/tailwind-styles', [
            'methods' => 'GET',
            'callback' => [$this, 'get_tailwind_styles'],
            'permission_callback' => '__return_true', // Public endpoint for styles
            'args' => [
                'cache_bust' => [
                    'description' => 'Cache busting parameter',
                    'type' => 'string',
                    'required' => false,
                ]
            ]
        ]);
    }
    
    /**
     * Get compiled Tailwind CSS styles
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function get_tailwind_styles($request) {
        try {
            // Look for compiled CSS in common Tailwind output locations
            $possible_paths = [
                MOOVINLEADS_DIR . 'dist/css/main.css',
                MOOVINLEADS_DIR . 'dist/main.css',
                MOOVINLEADS_DIR . 'dist/styles.css',
                MOOVINLEADS_DIR . 'dist/tailwind.css',
                MOOVINLEADS_DIR . 'src/styles/main.css',
                MOOVINLEADS_DIR . 'build/css/main.css'
            ];
            
            $css_content = '';
            $css_file_path = '';
            
            // Find the first existing CSS file
            foreach ($possible_paths as $path) {
                if (file_exists($path)) {
                    $css_file_path = $path;
                    $css_content = file_get_contents($path);
                    break;
                }
            }
            
            // If no CSS file found, return error
            if (empty($css_content)) {
                return new WP_Error(
                    'css_not_found',
                    'Compiled Tailwind CSS not found. Please run the build process.',
                    ['status' => 404, 'searched_paths' => $possible_paths]
                );
            }
            
            // Process CSS for Shadow DOM compatibility
            $processed_css = $this->process_css_for_shadow_dom($css_content);
            
            // Get file modification time for caching
            $last_modified = filemtime($css_file_path);
            
            // Prepare response
            $response = rest_ensure_response([
                'success' => true,
                'css' => $processed_css,
                'file_path' => basename($css_file_path),
                'last_modified' => $last_modified,
                'size' => strlen($processed_css),
                'timestamp' => current_time('timestamp')
            ]);
            
            // Set cache headers
            $response->header('Cache-Control', 'public, max-age=3600'); // 1 hour cache
            $response->header('Last-Modified', gmdate('D, d M Y H:i:s', $last_modified) . ' GMT');
            $response->header('ETag', md5($processed_css));
            
            return $response;
            
        } catch (Exception $e) {
            return new WP_Error(
                'css_error',
                'Error reading Tailwind CSS: ' . $e->getMessage(),
                ['status' => 500]
            );
        }
    }
    
    /**
     * Process CSS for Shadow DOM compatibility
     * 
     * @param string $css
     * @return string
     */
    private function process_css_for_shadow_dom($css) {
        // Remove any @import statements (not supported in Shadow DOM)
        $css = preg_replace('/@import[^;]*;/', '', $css);
        
        // Wrap all styles to be scoped to :host
        // This ensures Tailwind utilities work within the Shadow DOM
        $css = ':host { ' . PHP_EOL . $css . PHP_EOL . '}';
        
        // Fix any remaining issues with CSS variables
        // Ensure CSS custom properties are properly defined
        $css = str_replace(':root', ':host', $css);
        
        // Clean up extra whitespace
        $css = preg_replace('/\s+/', ' ', $css);
        $css = trim($css);
        
        return $css;
    }
    
    /**
     * Get CSS file modification time for cache busting
     * 
     * @return int|false
     */
    public function get_css_modification_time() {
        $possible_paths = [
            MOOVINLEADS_DIR . 'dist/css/main.css',
            MOOVINLEADS_DIR . 'dist/main.css',
            MOOVINLEADS_DIR . 'dist/styles.css',
            MOOVINLEADS_DIR . 'dist/tailwind.css',
            MOOVINLEADS_DIR . 'src/styles/main.css'
        ];
        
        foreach ($possible_paths as $path) {
            if (file_exists($path)) {
                return filemtime($path);
            }
        }
        
        return false;
    }
    
    /**
     * Check if CSS file exists
     * 
     * @return bool
     */
    public function css_file_exists() {
        $possible_paths = [
            MOOVINLEADS_DIR . 'dist/css/main.css',
            MOOVINLEADS_DIR . 'dist/main.css',
            MOOVINLEADS_DIR . 'dist/styles.css',
            MOOVINLEADS_DIR . 'dist/tailwind.css',
            MOOVINLEADS_DIR . 'src/styles/main.css'
        ];
        
        foreach ($possible_paths as $path) {
            if (file_exists($path)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Get the URL for the Tailwind styles API endpoint
     * 
     * @return string
     */
    public static function get_api_url() {
        return rest_url('moovinleads/v1/tailwind-styles');
    }
}