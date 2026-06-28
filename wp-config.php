<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'revisaac' );

/** Database username */
define( 'DB_USER', 'admin' );

/** Database password */
define( 'DB_PASSWORD', '5c15264e6f4a127cb79e11056129a1502ea3dcfa' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         '-LELo!K(t(5R+vVKI9%-jUlD5r8>e,l^GyaKR|8r)|zz$pw&9-pBZGC>=_~nI`8^');
define('SECURE_AUTH_KEY',  '9tC[`4J-:4C&}@Bxu{S.yMMsEf#/tCbTOE>q70E2|!l3(H<maHxL17`rvW[468ZA');
define('LOGGED_IN_KEY',    'bB+-Egb~(Ds5CE/9eXIY#P#Wc^z+anGjQ[Va<D2?,C3EV=px[ulo_U HvOR|O  N');
define('NONCE_KEY',        'klFe3<9[-Xc1-+e |!Tz3b%PwHk8kh,cc=4-2T!<~gI=@yfYbPLA4{m&tjE%|`|?');
define('AUTH_SALT',        'L-BUj^.v{C|AbSfv7<C-H%`KIZ~p$=C:-J:Lbbq>RD[[2I);L2v[gBi-Y@;lr>Dr');
define('SECURE_AUTH_SALT', '~.kr+6jJPV6 |si97o;hH@@HbTHyOQFv|,.2]wCMWaY>u-|A`Or{cF,f,j`>:&dv');
define('LOGGED_IN_SALT',   'm6sKe+xzWx;^mhGG/Pb,+q+y^6RC (} {qk Z6)m*_<A}xz3lUXVG!Fd|u:Zy|M+');
define('NONCE_SALT',       '|E~4Fy_gQE>]V#^5FS+XAj+vE>Tc}|wd-?Xv!S::PgF>j)gCI~+/B6}rH^>ZnsF$');

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 *
 * At the installation time, database tables are created with the specified prefix.
 * Changing this value after WordPress is installed will make your site think
 * it has not been installed.
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/#table-prefix
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
