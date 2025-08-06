<!-- High-Fidelity Footer Section -->
<footer data-component="footer">
    <div class="cs-container">
        <!-- Top Section with Contact Info -->
        <div class="cs-top-section">
            <!-- Company Info & Description -->
            <div class="cs-company-info">
                <a class="cs-logo" aria-label="Atlanta's Furniture Taxi home" href="<?php echo esc_url(home_url()); ?>">
                    <img class="cs-logo-img" src="<?php echo esc_url(get_asset_url('logos/Atlanta-Furniture-Movers.png')); ?>" alt="Atlanta's Furniture Taxi" width="200" height="40" loading="lazy">
                </a>
                <p class="cs-description">
                    Your trusted Atlanta moving company providing professional residential and commercial moving services with Southern hospitality. Licensed, insured, and committed to making your move stress-free.
                </p>
            </div>

            <!-- Contact Information -->
            <div class="cs-contact-info">
                <h3 class="cs-section-title">Contact</h3>
                <div class="cs-contact-item">
                    <span class="cs-contact-label">Phone:</span>
                    <a class="cs-contact-link" href="tel:404-228-7404">404-228-7404</a>
                </div>
                <div class="cs-contact-item">
                    <span class="cs-contact-label">Email:</span>
                    <a class="cs-contact-link" href="mailto:info@atlantafurnituremovers.com">info@atlantafurnituremovers.com</a>
                </div>
                <div class="cs-contact-item">
                    <span class="cs-contact-label">Address:</span>
                    <a class="cs-contact-link" href="https://maps.google.com/?q=2340+Chamblee+Tucker+Rd+Atlanta+GA" target="_blank">2340 Chamblee Tucker Rd<br>Atlanta, GA 30341</a>
                </div>
            </div>

            <!-- Service Areas -->
            <div class="cs-service-areas">
                <h3 class="cs-section-title">Service Areas</h3>
                <p class="cs-area-text">Atlanta Metro, Chamblee, Roswell, Alpharetta, Dunwoody, Marietta, Buckhead</p>
            </div>

            <!-- Licensed & Insured -->
            <div class="cs-credentials">
                <h3 class="cs-section-title">Licensed & Insured</h3>
                <p class="cs-credentials-text">Professional moving services with full insurance coverage</p>
            </div>
        </div>

        <!-- Bottom Section -->
        <div class="cs-bottom-section">
            <!-- Quick Links -->
            <div class="cs-links-group">
                <h4 class="cs-links-title">Quick Links</h4>
                <div class="cs-links-columns">
                    <div class="cs-links-column">
                        <a class="cs-footer-link" href="#services">Local Moving</a>
                        <a class="cs-footer-link" href="#services">Long Distance</a>
                        <a class="cs-footer-link" href="#services">Commercial Moving</a>
                        <a class="cs-footer-link" href="#services">Storage Services</a>
                    </div>
                    <div class="cs-links-column">
                        <a class="cs-footer-link" href="#services">Packing Services</a>
                        <a class="cs-footer-link" href="#faq">FAQ</a>
                        <a class="cs-footer-link" href="#testimonials">Reviews</a>
                        <button class="cs-footer-link moovinleads-trigger" onclick="openMoovinLeadsWidget()">Get Quote</button>
                    </div>
                </div>
            </div>

            <!-- Moving Tips Newsletter -->
            <div class="cs-newsletter">
                <h4 class="cs-newsletter-title">Moving Tips</h4>
                <p class="cs-newsletter-text">Get helpful moving tips, seasonal advice, and exclusive offers delivered to your inbox.</p>
                <form class="cs-newsletter-form" name="Footer Newsletter" method="post">
                    <div class="cs-form-group">
                        <input class="cs-newsletter-input" type="email" name="email" placeholder="Your email address" required>
                        <button class="cs-newsletter-button" type="submit">Subscribe</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Copyright Bar -->
        <div class="cs-copyright-section">
            <div class="cs-copyright-content">
                <span class="cs-copyright-text">© <?php echo date('Y'); ?> - Atlanta's Furniture Taxi</span>
                <div class="cs-legal-links">
                    <a href="#" class="cs-legal-link">Terms & Conditions</a>
                    <span class="cs-divider">|</span>
                    <a href="#" class="cs-legal-link">Privacy Policy</a>
                    <span class="cs-divider">|</span>
                    <a href="#" class="cs-legal-link">License Info</a>
                </div>
            </div>
        </div>
    </div>
</footer>