<!-- High-Fidelity Call to Action Section -->
<section data-component="call-to-action">
    <div class="cs-container">
        <div class="cs-content">
            <div class="cs-text-content">
                <span class="cs-topper">Ready to Move?</span>
                <h2 class="cs-title">Get Your Free Moving Quote Today</h2>
                <p class="cs-description">
                    Join thousands of satisfied customers who chose Atlanta's Furniture Taxi for their stress-free moving experience. Licensed, insured, and committed to your satisfaction.
                </p>
                
                <div class="cs-cta-buttons">
                    <a href="tel:404-228-7404" class="cs-button-primary">
                        <?php echo get_raw_svg('Device/phone-line.svg', 'cs-phone-icon'); ?>
                        Call Today
                    </a>
                    
                    <button class="cs-button-secondary moovinleads-trigger" onclick="openMoovinLeadsWidget()">
                        <?php echo get_raw_svg('Document/file-text-line.svg', 'cs-quote-icon'); ?>
                        Get Free Estimate
                    </button>
                </div>
                
                <div class="cs-trust-indicators">
                    <div class="cs-trust-item">
                        <?php echo get_raw_svg('System/shield-check-line.svg', 'cs-trust-icon'); ?>
                        <span>Licensed & Insured</span>
                    </div>
                    <div class="cs-trust-item">
                        <?php echo get_raw_svg('System/star-fill.svg', 'cs-trust-icon'); ?>
                        <span>5-Star Rated</span>
                    </div>
                    <div class="cs-trust-item">
                        <?php echo get_raw_svg('Finance/price-tag-3-line.svg', 'cs-trust-icon'); ?>
                        <span>Free Estimates</span>
                    </div>
                </div>
            </div>
            
            <div class="cs-image-content">
                <picture class="cs-picture">
                    <source media="(max-width: 600px)" srcset="<?php echo esc_url(get_asset_url('team-photos/atlantas-furniture-taxi-moving-company-crew-300x201.webp')); ?>">
                    <source media="(min-width: 601px)" srcset="<?php echo esc_url(get_asset_url('team-photos/atlantas-furniture-taxi-moving-company-crew.webp')); ?>">
                    <img loading="lazy" decoding="async" src="<?php echo esc_url(get_asset_url('team-photos/atlantas-furniture-taxi-moving-company-crew.webp')); ?>" alt="Atlanta's Furniture Taxi team and moving trucks" width="600" height="400">
                </picture>
                
                <div class="cs-stats-overlay">
                    <div class="cs-stat">
                        <div class="cs-stat-number">500+</div>
                        <div class="cs-stat-label">Happy Customers</div>
                    </div>
                    <div class="cs-stat">
                        <div class="cs-stat-number">10+</div>
                        <div class="cs-stat-label">Years Experience</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>