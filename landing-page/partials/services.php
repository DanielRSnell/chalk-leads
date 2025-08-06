<!-- Services Section -->
<section data-component="services">
    <div class="cs-container">
        <div class="cs-content">
            <div class="cs-flex">
                <span class="cs-topper">Our Services</span>
                <h2 class="cs-title">Complete Moving Solutions for Atlanta</h2>
                <p class="cs-text">
                    Whether you're moving across town or across the country, we provide comprehensive moving services with Southern hospitality and professional expertise.
                </p>
                <button class="cs-button-solid moovinleads-trigger" onclick="openMoovinLeadsWidget()">Get Your Free Quote</button>
            </div>
            <div class="cs-image-group">
                <picture class="cs-map">
                    <!-- Mobile and Desktop Image -->
                    <source media="(max-width: 600px)" srcset="https://csimg.nyc3.cdn.digitaloceanspaces.com/Images/Graphics/map.png">
                    <source media="(min-width: 601px)" srcset="https://csimg.nyc3.cdn.digitaloceanspaces.com/Images/Graphics/map.png">
                    <img loading="lazy" decoding="async" src="https://csimg.nyc3.cdn.digitaloceanspaces.com/Images/Graphics/map.png" alt="Atlanta service area map" width="522" height="504">
                </picture>
                <img class="cs-arrow" loading="lazy" decoding="async" src="https://csimg.nyc3.cdn.digitaloceanspaces.com/Images/Graphics/squiggle-arrow2.svg" alt="graphic" width="34" height="73" aria-hidden="true">
                <div class="cs-box">
                    <span class="cs-box-text">
                        Atlanta Metro & Surrounding Areas
                    </span>
                </div>
            </div>
        </div>
        
        <!-- Service Cards -->
        <ul class="cs-card-group">
            <li class="cs-item">
                <div class="cs-icon-wrapper">
                    <?php echo get_raw_svg('Buildings/home-line.svg', 'cs-icon'); ?>
                </div>
                <h3 class="cs-h3">Local Moving</h3>
                <p class="cs-item-text">Reliable local moving services throughout Atlanta and surrounding areas.</p>
            </li>
            <li class="cs-item">
                <div class="cs-icon-wrapper">
                    <?php echo get_raw_svg('Map/truck-line.svg', 'cs-icon'); ?>
                </div>
                <h3 class="cs-h3">Long Distance</h3>
                <p class="cs-item-text">Professional interstate and cross-country moving with care and precision.</p>
            </li>
            <li class="cs-item">
                <div class="cs-icon-wrapper">
                    <?php echo get_raw_svg('Buildings/building-line.svg', 'cs-icon'); ?>
                </div>
                <h3 class="cs-h3">Commercial</h3>
                <p class="cs-item-text">Office relocations and commercial moves with minimal business disruption.</p>
            </li>
            <li class="cs-item">
                <div class="cs-icon-wrapper">
                    <?php echo get_raw_svg('Business/archive-line.svg', 'cs-icon'); ?>
                </div>
                <h3 class="cs-h3">Storage & Packing</h3>
                <p class="cs-item-text">Secure storage solutions and professional packing services available.</p>
            </li>
        </ul>
    </div>
</section>