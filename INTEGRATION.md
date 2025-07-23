# Quick Integration Guide

## Adding the Panel to Your WordPress Pages

### 1. Simple Button Trigger

Add this anywhere in your WordPress interface:

```html
<button onclick="openShadowPlugin()">Open Panel</button>
<shadow-plugin-panel></shadow-plugin-panel>

<script>
function openShadowPlugin() {
    // The web component auto-initializes when added to DOM
    console.log('Shadow Plugin Panel opened!');
}
</script>
```

### 2. Gutenberg Block Integration

```jsx
// In your block's edit function
import { useBlockProps } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';

export default function Edit() {
    const blockProps = useBlockProps();
    
    const openPanel = () => {
        let panel = document.querySelector('shadow-plugin-panel');
        if (!panel) {
            panel = document.createElement('shadow-plugin-panel');
            document.body.appendChild(panel);
        }
    };
    
    return (
        <div {...blockProps}>
            <Button isPrimary onClick={openPanel}>
                Open Shadow Plugin
            </Button>
        </div>
    );
}
```

### 3. Admin Page Integration

```php
// In your admin page function
public function renderAdminPage() {
    ?>
    <div class="wrap">
        <h1>My Plugin Settings</h1>
        <p>Click below to open the advanced interface:</p>
        <button id="open-panel" class="button button-primary">
            Open Advanced Panel
        </button>
        <shadow-plugin-panel></shadow-plugin-panel>
        
        <script>
        document.getElementById('open-panel').addEventListener('click', function() {
            console.log('Panel should now be visible!');
        });
        </script>
    </div>
    <?php
}
```

### 4. WordPress Customizer

```php
// Add to your customizer controls
add_action('customize_register', function($wp_customize) {
    $wp_customize->add_section('my_plugin_section', [
        'title' => 'My Plugin Advanced',
        'priority' => 30
    ]);
    
    // This will be your trigger
    $wp_customize->add_setting('my_plugin_trigger');
    $wp_customize->add_control('my_plugin_trigger', [
        'label' => 'Open Advanced Panel',
        'section' => 'my_plugin_section',
        'type' => 'button'
    ]);
});
```

## That's It!

The boilerplate handles:
- ✅ Shadow DOM creation
- ✅ Style isolation  
- ✅ React initialization
- ✅ Responsive design
- ✅ Keyboard shortcuts

Just add the `<shadow-plugin-panel>` element to your page and start building your plugin interface!