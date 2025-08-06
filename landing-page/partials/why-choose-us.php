<!-- Why Choose Us Section -->
<section data-component="why-choose-us">
    <div class="cs-container">
        <div class="cs-wrapper">
            <div class="cs-content">
                <span class="cs-topper">Why Choose Us</span>
                <h2 class="cs-title">Trusted Atlanta Moving Experts with Southern Hospitality</h2>
                <p class="cs-text">
                    We're passionate about making your move stress-free with professional services that are reliable, punctual, and personalized to your unique moving needs.
                </p>
                <a href="#quote" class="cs-button-solid">Experience the Difference</a>
            </div>
            <picture class="cs-picture">
                <source media="(max-width: 600px)" srcset="<?php echo esc_url(get_asset_url('team-photos/atlantas-furniture-taxi-moving-company-crew-300x201.webp')); ?>" />
                <source media="(min-width: 601px)" srcset="<?php echo esc_url(get_asset_url('team-photos/atlantas-furniture-taxi-moving-company-crew.webp')); ?>" />
                <img loading="lazy" decoding="async" src="<?php echo esc_url(get_asset_url('team-photos/atlantas-furniture-taxi-moving-company-crew.webp')); ?>" alt="Atlanta's Furniture Taxi moving truck" width="364" height="628" />
            </picture>
        </div>
        
        <!-- Features Grid -->
        <ul class="cs-card-group">
            <li class="cs-item">
                <?php echo get_raw_svg('User & Faces/team-line.svg', 'cs-icon'); ?>
                <div class="cs-flex">
                    <h3 class="cs-h3">Experienced Team</h3>
                    <p class="cs-item-text">
                        Our dedicated team of skilled moving professionals cares about your belongings and satisfaction.
                    </p>
                </div>
            </li>
            <li class="cs-item">
                <?php echo get_raw_svg('System/shield-check-line.svg', 'cs-icon'); ?>
                <div class="cs-flex">
                    <h3 class="cs-h3">Licensed & Insured</h3>
                    <p class="cs-item-text">
                        Enjoy complete peace of mind with our fully licensed and insured moving services.
                    </p>
                </div>
            </li>
            <li class="cs-item">
                <?php echo get_raw_svg('Others/recycle-line.svg', 'cs-icon'); ?>
                <div class="cs-flex">
                    <h3 class="cs-h3">Safe Handling</h3>
                    <p class="cs-item-text">
                        We use professional packing materials and techniques to protect your valuables during transit.
                    </p>
                </div>
            </li>
            <li class="cs-item">
                <?php echo get_raw_svg('Business/calendar-2-line.svg', 'cs-icon'); ?>
                <div class="cs-flex">
                    <h3 class="cs-h3">Flexible Scheduling</h3>
                    <p class="cs-item-text">
                        We offer flexible moving schedules tailored to fit seamlessly into your timeline.
                    </p>
                </div>
            </li>
            <li class="cs-item">
                <?php echo get_raw_svg('Finance/price-tag-2-line.svg', 'cs-icon'); ?>
                <div class="cs-flex">
                    <h3 class="cs-h3">Transparent Pricing</h3>
                    <p class="cs-item-text">
                        No hidden fees or surprise charges - just honest, upfront pricing for all our services.
                    </p>
                </div>
            </li>
            <li class="cs-item">
                <?php echo get_raw_svg('Map/map-pin-line.svg', 'cs-icon'); ?>
                <div class="cs-flex">
                    <h3 class="cs-h3">Locally Owned</h3>
                    <p class="cs-item-text">
                        We take pride in serving our wonderful Atlanta community with dedication and care.
                    </p>
                </div>
            </li>
        </ul>
    </div>
</section>