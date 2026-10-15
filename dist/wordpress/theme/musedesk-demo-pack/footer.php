<?php
$post_id = get_queried_object_id();
echo get_post_meta($post_id, '_demo_footer_html', true);
wp_footer();
?>
</body>
</html>
