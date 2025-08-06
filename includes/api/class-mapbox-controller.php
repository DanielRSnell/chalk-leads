<?php
/**
 * Mapbox API Controller
 * 
 * Handles server-side Mapbox API calls to keep secret keys secure
 */

if (!defined('ABSPATH')) {
    exit;
}

class Mapbox_Controller {

    private $secret_key;
    
    public function __construct() {
        // Store the secret key securely - in production this should be in wp-config.php
        $this->secret_key = 'sk.eyJ1IjoidW1icmFsLWFpIiwiYSI6ImNtZGdla3BzajBtZmkybG84aDA3eTM3cnQifQ.fsDXv6XG6i5s7Jz0B1TdfQ';
        
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    /**
     * Register REST API routes for Mapbox functionality
     */
    public function register_routes() {
        register_rest_route('moovinleads/v1', '/mapbox/suggest', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_address_suggestions'),
            'permission_callback' => '__return_true', // Public endpoint
            'args' => array(
                'q' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                    'validate_callback' => array($this, 'validate_query')
                ),
                'types' => array(
                    'required' => false,
                    'type' => 'string',
                    'default' => 'address',
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'country' => array(
                    'required' => false,
                    'type' => 'string',
                    'default' => 'us',
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'limit' => array(
                    'required' => false,
                    'type' => 'integer',
                    'default' => 5,
                    'sanitize_callback' => 'absint'
                )
            )
        ));

        register_rest_route('moovinleads/v1', '/mapbox/retrieve', array(
            'methods' => 'GET',
            'callback' => array($this, 'retrieve_address_details'),
            'permission_callback' => '__return_true', // Public endpoint
            'args' => array(
                'mapbox_id' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                )
            )
        ));

        register_rest_route('moovinleads/v1', '/mapbox/directions', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_route_directions'),
            'permission_callback' => '__return_true', // Public endpoint
            'args' => array(
                'pickup' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                    'validate_callback' => array($this, 'validate_address')
                ),
                'destination' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                    'validate_callback' => array($this, 'validate_address')
                )
            )
        ));
    }

    /**
     * Validate search query
     */
    public function validate_query($param) {
        return !empty($param) && strlen($param) >= 2;
    }

    /**
     * Validate address string
     */
    public function validate_address($param) {
        return !empty($param) && strlen($param) >= 5;
    }

    /**
     * Get address suggestions from Mapbox Search API
     */
    public function get_address_suggestions($request) {
        $query = $request->get_param('q');
        $types = $request->get_param('types');
        $country = $request->get_param('country');
        $limit = $request->get_param('limit');

        if (empty($query)) {
            return new WP_Error('missing_query', 'Search query is required', array('status' => 400));
        }

        // Generate session token for billing purposes
        $session_token = wp_generate_uuid4();

        // Build Mapbox Search API URL for suggestions
        $params = array(
            'q' => $query,
            'access_token' => $this->secret_key,
            'session_token' => $session_token,
            'limit' => min($limit, 10) // Max 10 results allowed
        );

        // Add country filter if specified (comma-separated ISO country codes)
        if (!empty($country)) {
            $params['country'] = strtoupper($country); // US, CA, etc.
        }

        // Add types filter if specified (address, poi, street, etc.)
        if (!empty($types) && $types !== 'address') {
            $params['types'] = $types;
        }

        $api_url = add_query_arg($params, 'https://api.mapbox.com/search/searchbox/v1/suggest');

        // Log the API call for debugging
        error_log('Mapbox API Request: ' . $api_url);

        // Make the API request
        $response = wp_remote_get($api_url, array(
            'timeout' => 10,
            'headers' => array(
                'User-Agent' => 'MoovinLeads WordPress Plugin'
            )
        ));

        if (is_wp_error($response)) {
            error_log('Mapbox API Error: ' . $response->get_error_message());
            return new WP_Error('api_error', 'Failed to fetch suggestions', array('status' => 500));
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);

        error_log('Mapbox API Response Code: ' . $response_code);
        error_log('Mapbox API Response Body: ' . substr($response_body, 0, 500) . '...');

        if ($response_code !== 200) {
            return new WP_Error('api_error', 'Mapbox API returned error: ' . $response_code, array('status' => $response_code));
        }

        $data = json_decode($response_body, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return new WP_Error('json_error', 'Invalid JSON response from Mapbox', array('status' => 500));
        }

        return rest_ensure_response($data);
    }

    /**
     * Retrieve detailed address information
     */
    public function retrieve_address_details($request) {
        $mapbox_id = $request->get_param('mapbox_id');

        if (empty($mapbox_id)) {
            return new WP_Error('missing_id', 'Mapbox ID is required', array('status' => 400));
        }

        // Generate session token for billing purposes
        $session_token = wp_generate_uuid4();

        // Build Mapbox Search API URL for retrieval
        $api_url = add_query_arg(array(
            'access_token' => $this->secret_key,
            'session_token' => $session_token
        ), 'https://api.mapbox.com/search/searchbox/v1/retrieve/' . urlencode($mapbox_id));

        // Log the API call for debugging
        error_log('Mapbox Retrieve API Request: ' . $api_url);

        // Make the API request
        $response = wp_remote_get($api_url, array(
            'timeout' => 10,
            'headers' => array(
                'User-Agent' => 'MoovinLeads WordPress Plugin'
            )
        ));

        if (is_wp_error($response)) {
            error_log('Mapbox Retrieve API Error: ' . $response->get_error_message());
            return new WP_Error('api_error', 'Failed to retrieve address details', array('status' => 500));
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);

        error_log('Mapbox Retrieve API Response Code: ' . $response_code);
        error_log('Mapbox Retrieve API Response Body: ' . substr($response_body, 0, 500) . '...');

        if ($response_code !== 200) {
            return new WP_Error('api_error', 'Mapbox API returned error: ' . $response_code, array('status' => $response_code));
        }

        $data = json_decode($response_body, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return new WP_Error('json_error', 'Invalid JSON response from Mapbox', array('status' => 500));
        }

        return rest_ensure_response($data);
    }

    /**
     * Get route directions and distance between two addresses
     */
    public function get_route_directions($request) {
        $pickup_address = $request->get_param('pickup');
        $destination_address = $request->get_param('destination');

        if (empty($pickup_address) || empty($destination_address)) {
            return new WP_Error('missing_addresses', 'Both pickup and destination addresses are required', array('status' => 400));
        }

        try {
            // First, geocode both addresses to get coordinates
            $pickup_coords = $this->geocode_address($pickup_address);
            $destination_coords = $this->geocode_address($destination_address);

            if (!$pickup_coords || !$destination_coords) {
                return new WP_Error('geocoding_error', 'Could not geocode one or both addresses', array('status' => 400));
            }

            // Build Mapbox Directions API URL
            $coordinates = $pickup_coords['longitude'] . ',' . $pickup_coords['latitude'] . ';' . 
                          $destination_coords['longitude'] . ',' . $destination_coords['latitude'];
            
            $api_url = add_query_arg(array(
                'access_token' => $this->secret_key,
                'geometries' => 'geojson',
                'overview' => 'simplified',
                'steps' => 'false'
            ), 'https://api.mapbox.com/directions/v5/mapbox/driving/' . $coordinates);

            error_log('Mapbox Directions API Request: ' . $api_url);

            // Make the API request
            $response = wp_remote_get($api_url, array(
                'timeout' => 15,
                'headers' => array(
                    'User-Agent' => 'MoovinLeads WordPress Plugin'
                )
            ));

            if (is_wp_error($response)) {
                error_log('Mapbox Directions API Error: ' . $response->get_error_message());
                return new WP_Error('api_error', 'Failed to get route directions', array('status' => 500));
            }

            $response_code = wp_remote_retrieve_response_code($response);
            $response_body = wp_remote_retrieve_body($response);

            error_log('Mapbox Directions API Response Code: ' . $response_code);

            if ($response_code !== 200) {
                return new WP_Error('api_error', 'Mapbox Directions API returned error: ' . $response_code, array('status' => $response_code));
            }

            $data = json_decode($response_body, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                return new WP_Error('json_error', 'Invalid JSON response from Mapbox Directions', array('status' => 500));
            }

            // Extract useful information
            if (isset($data['routes']) && count($data['routes']) > 0) {
                $route = $data['routes'][0];
                $distance_meters = $route['distance'];
                $duration_seconds = $route['duration'];
                
                // Convert to miles and minutes
                $distance_miles = round($distance_meters * 0.000621371, 1); // Convert meters to miles
                $duration_minutes = round($duration_seconds / 60);
                
                $route_info = array(
                    'distance' => array(
                        'miles' => $distance_miles,
                        'meters' => $distance_meters,
                        'text' => $distance_miles . ' miles'
                    ),
                    'duration' => array(
                        'minutes' => $duration_minutes,
                        'seconds' => $duration_seconds,
                        'text' => $this->format_duration($duration_minutes)
                    ),
                    'pickup_coordinates' => $pickup_coords,
                    'destination_coordinates' => $destination_coords,
                    'geometry' => $route['geometry'] ?? null
                );

                return rest_ensure_response($route_info);
            } else {
                return new WP_Error('no_route', 'No route found between the addresses', array('status' => 404));
            }

        } catch (Exception $e) {
            error_log('Mapbox Directions Error: ' . $e->getMessage());
            return new WP_Error('processing_error', 'Error processing route request', array('status' => 500));
        }
    }

    /**
     * Geocode an address to get coordinates
     */
    private function geocode_address($address) {
        $api_url = add_query_arg(array(
            'access_token' => $this->secret_key,
            'limit' => 1
        ), 'https://api.mapbox.com/geocoding/v5/mapbox.places/' . urlencode($address) . '.json');

        $response = wp_remote_get($api_url, array('timeout' => 10));

        if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
            return false;
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);
        
        if (isset($data['features']) && count($data['features']) > 0) {
            $coordinates = $data['features'][0]['center'];
            return array(
                'longitude' => $coordinates[0],
                'latitude' => $coordinates[1]
            );
        }

        return false;
    }

    /**
     * Format duration in minutes to human readable text
     */
    private function format_duration($minutes) {
        if ($minutes < 60) {
            return $minutes . ' min';
        } else {
            $hours = floor($minutes / 60);
            $remaining_minutes = $minutes % 60;
            if ($remaining_minutes > 0) {
                return $hours . 'h ' . $remaining_minutes . 'm';
            } else {
                return $hours . 'h';
            }
        }
    }
}

// Initialize the controller
new Mapbox_Controller();