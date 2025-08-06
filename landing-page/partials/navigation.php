<!-- Navigation Header -->
<header data-component="navigation">
    <div class="cs-container">
        <!-- Atlanta's Furniture Taxi Logo -->
        <a href="<?php echo esc_url(home_url()); ?>" class="cs-logo" aria-label="Atlanta's Furniture Taxi - back to home">
            <img src="<?php echo esc_url(get_asset_url('logos/Atlanta-Furniture-Movers.png')); ?>" alt="Atlanta's Furniture Taxi Logo" width="210" height="29" aria-hidden="true" decoding="async">
            <span class="cs-logo-tagline">Moving & Storage</span>
        </a>
        
        <!-- Navigation Menu -->
        <nav class="cs-nav" role="navigation">
            <!-- Mobile Nav Toggle -->
            <button class="cs-toggle" aria-label="mobile menu toggle">
                <div class="cs-box" aria-hidden="true">
                    <span class="cs-line cs-line1" aria-hidden="true"></span>
                    <span class="cs-line cs-line2" aria-hidden="true"></span>
                    <span class="cs-line cs-line3" aria-hidden="true"></span>
                </div>
            </button>
            
            <div class="cs-ul-wrapper">
                <ul id="cs-expanded" class="cs-ul" aria-expanded="false">
                    <li class="cs-li">
                        <a href="#hero" class="cs-li-link cs-active">Home</a>
                    </li>
                    <li class="cs-li">
                        <a href="#services" class="cs-li-link">Services</a>
                    </li>
                    <li class="cs-li">
                        <a href="#about" class="cs-li-link">About</a>
                    </li>
                    <li class="cs-li">
                        <a href="#testimonials" class="cs-li-link">Reviews</a>
                    </li>
                    <li class="cs-li">
                        <button class="cs-li-link moovinleads-trigger" onclick="openMoovinLeadsWidget()">Get Quote</button>
                    </li>
                </ul>
            </div>
        </nav>
        
        <!-- Contact Group -->
        <div class="cs-contact-group">
            <a href="tel:404-228-7404" class="cs-phone">
                <?php echo get_raw_svg('Device/phone-line.svg', 'cs-phone-icon'); ?>
                404-228-7404
            </a>
            <div class="cs-social">
                <a href="https://www.facebook.com/atlantafurnituremovers" class="cs-social-link" aria-label="Facebook" target="_blank" rel="noopener">
                    <?php echo get_raw_svg('Logos/facebook-fill.svg', 'cs-social-icon'); ?>
                </a>
                <a href="https://g.page/r/CQI8vX9ZhG5KEBA/review" class="cs-social-link" aria-label="Google Reviews" target="_blank" rel="noopener">
                    <?php echo get_raw_svg('Logos/google-fill.svg', 'cs-social-icon'); ?>
                </a>
                <a href="https://www.instagram.com/atlantafurnituremovers" class="cs-social-link" aria-label="Instagram" target="_blank" rel="noopener">
                    <?php echo get_raw_svg('Logos/instagram-fill.svg', 'cs-social-icon'); ?>
                </a>
            </div>
        </div>
    </div>
</header>