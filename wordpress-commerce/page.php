<?php get_header(); ?>
<?php while (have_posts()) : the_post(); ?>
<h1 class="commerce-page-title shell"><?php the_title(); ?></h1>
<?php the_content(); endwhile; ?>
<?php get_footer(); ?>
