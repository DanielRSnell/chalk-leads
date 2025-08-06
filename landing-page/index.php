<?php
/**
 * Atlanta's Furniture Taxi Landing Page
 * Standalone landing page without wp_head or wp_footer
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Include helper functions
require_once __DIR__ . '/helpers.php';
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Atlanta's Furniture Taxi - Professional Moving Services</title>
    <meta name="description" content="Trusted Atlanta moving company offering local and long-distance moving services with Southern hospitality. Licensed, insured, and stress-free moving solutions.">
    
    <!-- Preload critical fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Dancing+Script:wght@400;500;600&display=swap" rel="stylesheet">
    
    <!-- Landing page styles -->
    <?php 
    enqueue_landing_styles(); 
    
    // Enqueue MoovinLeads widget if plugin is active
    if (function_exists('MoovinLeads')) {
        $plugin = MoovinLeads::getInstance();
        $plugin->enqueueAssets();
    }
    ?>
    
    <!-- Landing page specific styles -->
    <style>
        /* Hide WordPress admin bar */
        html {
            margin-top: 0 !important;
        }
        #wpadminbar {
            display: none !important;
        }
        
        /* Prevent horizontal and vertical overflow */
        body {
            overflow-x: hidden !important;
        }
        
        /* Ensure full width sections don't cause horizontal scroll */
        * {
            max-width: 100%;
        }
        
        .cs-container {
            overflow-x: hidden;
        }
        
        /* Fix navigation overflow */
        [data-component="navigation"] {
            overflow: visible !important;
        }
        
        [data-component="navigation"] .cs-container {
            overflow: visible !important;
        }
    </style>
    
    <!-- Schema.org structured data -->
    <?php echo get_structured_data(); ?>
</head>

<body class="landing-page">
    <!-- Navigation -->
    <?php render_partial('partials/navigation.php'); ?>
    
    <main class="landing-main">
        <!-- Hero Section -->
        <?php render_partial('home/hero/index.php'); ?>
        
        <!-- Moving Process -->
        <?php render_partial('partials/moving-process.php'); ?>

        <!-- Services Section -->
        <?php render_partial('partials/services.php'); ?>
        
        <!-- Awards & Recognition -->
        <?php render_partial('partials/awards.php'); ?>

        <!-- Why Choose Us -->
        <?php render_partial('partials/why-choose-us.php'); ?>
        
        <!-- Testimonials -->
        <?php render_partial('partials/testimonials.php'); ?>
        
        <!-- Call to Action -->
        <?php render_partial('partials/call-to-action.php'); ?>
        
        <!-- FAQ Section -->
        <?php render_partial('partials/faq.php'); ?>
        
    </main>
    
    <!-- Footer -->
    <?php render_partial('partials/footer.php'); ?>

    <!-- Landing page specific scripts -->
    <script>
        // Function to open MoovinLeads widget
        function openMoovinLeadsWidget() {
            const widget = document.querySelector('moovinleads-widget');
            if (widget && widget.shadowRoot) {
                // Try to find and trigger the widget button in the shadow DOM
                const shadowBtn = widget.shadowRoot.querySelector('[data-testid="floating-action-button"], .floating-action-button, button');
                if (shadowBtn) {
                    shadowBtn.click();
                } else {
                    // Fallback: dispatch a custom event to open the widget
                    widget.dispatchEvent(new CustomEvent('open-widget', { bubbles: true }));
                }
            } else {
                console.warn('MoovinLeads widget not found or not yet initialized');
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            // Smooth scroll for anchor links
            const anchorLinks = document.querySelectorAll('a[href^="#"]');
            for (const link of anchorLinks) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            }

            // Mobile navigation toggle
            const CSbody = document.querySelector("body");
            const CSnavbarMenu = document.querySelector('[data-component="navigation"]');
            const CShamburgerMenu = document.querySelector('[data-component="navigation"] .cs-toggle');
            
            if (CShamburgerMenu) {
                CShamburgerMenu.addEventListener('click', function() {
                    CShamburgerMenu.classList.toggle("cs-active");
                    CSnavbarMenu.classList.toggle("cs-active");
                    CSbody.classList.toggle("cs-open");
                    ariaExpanded();
                });
            }

            // Aria expanded function
            function ariaExpanded() {
                const csUL = document.querySelector('#cs-expanded');
                if (csUL) {
                    const csExpanded = csUL.getAttribute('aria-expanded');
                    csUL.setAttribute('aria-expanded', csExpanded === 'false' ? 'true' : 'false');
                }
            }

            // Scroll effects
            document.addEventListener('scroll', function() { 
                const scroll = document.documentElement.scrollTop;
                if (scroll >= 100) {
                    document.querySelector('body').classList.add('scroll');
                } else {
                    document.querySelector('body').classList.remove('scroll');
                }
            });

            // FAQ toggle functionality
            const faqItems = Array.from(document.querySelectorAll('.cs-faq-item'));
            for (const item of faqItems) {
                const onClick = () => {
                    item.classList.toggle('active');
                };
                item.addEventListener('click', onClick);
            }
        });
    </script>
    
    <?php
    // Add MoovinLeads widget to footer if plugin is active
    if (function_exists('MoovinLeads')) {
        do_action('wp_footer');
    }
    ?>
</body>
</html>