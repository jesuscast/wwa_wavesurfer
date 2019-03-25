<?php

/*

WARNING! DO NOT EDIT THEME FILES IF YOU PLAN ON UPDATING!

Theme files will be overwritten and your changes will be lost 
when updating. Instead, add custom code in the admin under 
Appearance > Theme Settings > Code or create a child theme.

*/

// Defines
define( 'FL_THEME_VERSION', '1.5.1' );
define( 'FL_THEME_DIR', get_template_directory() );
define( 'FL_THEME_URL', get_template_directory_uri() );

// Classes
require_once 'classes/class-fl-color.php';
require_once 'classes/class-fl-customizer.php';
require_once 'classes/class-fl-fonts.php';
require_once 'classes/class-fl-theme.php';
require_once 'classes/class-fl-theme-update.php';

// Theme Actions
add_action( 'after_setup_theme',     'FLTheme::setup' );
add_action( 'init',                  'FLTheme::init_woocommerce' );
add_action( 'wp_enqueue_scripts',    'FLTheme::enqueue_scripts', 999 );
add_action( 'widgets_init',          'FLTheme::widgets_init' );
add_action( 'wp_footer',             'FLTheme::go_to_top' );

// Theme Filters
add_filter( 'body_class',            'FLTheme::body_class' );
add_filter( 'excerpt_more',          'FLTheme::excerpt_more' );

// Theme Updates
add_action( 'init',                  'FLThemeUpdate::init' );

// Admin Actions
add_action( 'admin_head',            'FLTheme::favicon' );

// Customizer
add_action( 'customize_preview_init',                    'FLCustomizer::preview_init' );
add_action( 'customize_controls_enqueue_scripts',        'FLCustomizer::controls_enqueue_scripts' );
add_action( 'customize_controls_print_footer_scripts',   'FLCustomizer::controls_print_footer_scripts' );
add_action( 'customize_register',                        'FLCustomizer::register' );
add_action( 'customize_save_after',                      'FLCustomizer::save' );




function ww_enqueue_admin_head() {
    $user = wp_get_current_user();
    if( ! empty( $user ) && count( array_intersect( [ "subscriber" ], $user->roles ) ) ) {
        echo '<style>


html {

    margin-top: 0px!important;
}
 
#adminmenuback, 
#adminmenuwrap, 
#wpadminbar
{
display:none !important;
}

.kite-card-edit h1{
display:none !important;
}
.kite-card-edit h2{
display:none !important;
}
.kite-card-edit  p{
display:none !important;
}
.kite-card-edit  h3{
display:none !important;
}

.price-table{
display:none!important;}


.notice,
.kite-nav-bar-item{
display:none !important;
}

.updated{
display:none !important;
}
#kite-navigation-bar{
height:43px !important;
}
#user_images_for_products{
border:3px solid white;}
.delete-attachment,
.actions{
display:block !important;
}
#product-range-scroller{
display:none;}
.td-scroll-left, 
.td-scroll-right,

.td-product-range
{
display:none !important;
}
.download-template{
display:none !important;
}
.logo-photoshop{
display:none !important;
}
.btn-customise:before{
content:"EDIT"!important;
min-width: 145px!important;
font-size:14px;
text-align:center;
color:grey;
height:400px!important;

}
.kite-card-product .btn-customise{
color:white!important;
font-size:1px !important;
}
.kite-card-product .btn-customise:hover{
color:#313131;
}

.page-title-action{
display:none !important;
}
#contextual-help-link{
display:none !important;
}



              </style>';
    }
}

add_action('admin_head', 'ww_enqueue_admin_head');

add_action('wp_ajax_export_canvas', 'export_canvas');
add_action('wp_ajax_nopriv_export_canvas', 'export_canvas');


function export_canvas(){
  	
	$product_id = $_POST['post_id'];
	$qnty = $_POST['quantity'];
	$price = $_POST['price'];

  	if( $product_id != "" && $qnty != "" && $price !="" ) {
  		
  		$upload_dir = wp_upload_dir();
	    $upload_path = $upload_dir['basedir'];
	  	$fileext = '.jpeg';
	    $hashed_filename = md5($fileext . microtime() . rand(100, 1000)) . $fileext;

	    $post = array(
	      'post_author' => '',
	      'post_status' => 'publish',
	      'post_title' => 'custom',
	      //'post_parent' => @$formdata['product_id'],
	      'post_type' => "product"
	    );

	    //Create post
	    $post_id = wp_insert_post( $post );
	    //$term = get_term_by('name', 'Custom', 'product_cat');
		//wp_set_object_terms($post_id, $term->term_id, 'product_cat');
	    $img1 = urldecode($_POST['img1']);
	    $img1 = str_replace('data:image/png;base64,', '', $img1);
	    $img1 = str_replace(' ', '+', $img1);
	    $img1 = base64_decode($img1);
	    $upload_dir = wp_upload_dir();
	    $upload_path = $upload_dir['basedir'];

	    $name = 'myimage'.strtotime("now");
	    $image = $upload_path.$name.'.jpeg';
	    $fopen = fopen($image,'wb');
	    fwrite($fopen, $img1);
	    fclose($fopen);
	    $attachment = array(
	        'guid' => $image,
	        'post_mime_type' => 'image/jpeg',
	        'post_title' => preg_replace('/\.[^.]+$/', '', $name),
	        'post_content' => '',
	        'post_status' => 'inherit'
	    );
	    $attach_id = wp_insert_attachment($attachment, $image);
	    $att['img1'] = $attach_id;
	    set_post_thumbnail( $post_id, $att['img1'] );
	    if($post_id){
	      update_post_meta( $post_id, 'quantity', $qnty );
	      //update_post_meta( $post_id, 'canvas', $att['img1']);
	      update_post_meta( $post_id, '_sale_price', $price );
	      update_post_meta( $post_id, '_regular_price', $price );
	      update_post_meta( $post_id, '_price', $price );
	      //update_post_meta( $post_id, 'featured_img2', $att['img2'] );_sale_price
	      update_post_meta($post_id, '_sku', "");
	      update_post_meta( $post_id, '_product_attributes', array());
	      //update_post_meta( $post_id, '_regular_price', $formdata['price'] );
	    }
  	}
    //echo json_encode($product_id);
    exit();
  }