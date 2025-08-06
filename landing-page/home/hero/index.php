<!-- ============================================ -->
<!--                    Hero                      -->
<!-- ============================================ -->

<section data-component="hero">
    <div class="cs-container">
        <h1 class="cs-title">Trusted Atlanta Moving & Storage with Southern Hospitality</h1>
        <p class="cs-text">
            Professional local and long-distance moving services with stress-free reliability. Atlanta's Furniture Taxi delivers personalized moving solutions for residential and commercial clients.
        </p>
        <button class="cs-button-solid moovinleads-trigger" onclick="openMoovinLeadsWidget()">Get Your Free Quote</button>
    </div>

    <!-- Background Image -->
    <picture class="cs-background">
        <source media="(max-width: 600px)" srcset="<?php echo esc_url(get_asset_url('backgrounds/Atlanta-Furniture-Movers-Header-Background.webp')); ?>">
        <source media="(min-width: 601px)" srcset="<?php echo esc_url(get_asset_url('backgrounds/Atlanta-Furniture-Movers-Header-Background.webp')); ?>">
        <img fetchpriority="high" decoding="async" src="<?php echo esc_url(get_asset_url('backgrounds/Atlanta-Furniture-Movers-Header-Background.webp')); ?>" alt="Atlanta's Furniture Taxi moving trucks" width="2250" height="1500" aria-hidden="true">
    </picture>
</section>

<!-- ============================================ -->
<!--                   Services                   -->
<!-- ============================================ -->

<section data-component="hero-services">
    <ul class="cs-card-group">
        <li class="cs-item">
            <div class="cs-icon">
                <?php echo get_raw_svg('Buildings/home-fill.svg', 'cs-icon-svg'); ?>
            </div>
            <h2 class="cs-title">Local Moving</h2>
            <p class="cs-text">
                Professional residential and commercial moving services throughout the Atlanta metro area with careful handling of your belongings.
            </p>
        </li>
        <li class="cs-item">
            <div class="cs-icon">
                <?php echo get_raw_svg('Map/truck-fill.svg', 'cs-icon-svg'); ?>
            </div>
            <h2 class="cs-title">Long Distance</h2>
            <p class="cs-text">
                Reliable long-distance moving services with comprehensive planning and secure transport to get you settled in your new home.
            </p>
        </li>
        <li class="cs-item">
            <div class="cs-icon">
                <?php echo get_raw_svg('Business/archive-fill.svg', 'cs-icon-svg'); ?>
            </div>
            <h2 class="cs-title">Storage & Packing</h2>
            <p class="cs-text">
                Secure storage solutions and professional packing services to protect your items during transition periods.
            </p>
        </li>
    </ul>
</section>
                                