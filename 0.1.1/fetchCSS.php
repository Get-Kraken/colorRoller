<?php
/*
 * jquery.colorRoller.min.js, version 0.1.1
 * https://colorroller.hivekey.net/
 *
 * Copyright 2012-, Francois du Plessis
 * Date:2017-02-21 00:00:00 +0000
 */

function isOwnRequest( $referer, $host )
{
	$requestCheck = strpos( strtolower($referer) , strtolower($host) );
	if ($requestCheck !== false) { return true;	} else { return false; }
}

function startsWith($haystack, $needle)
{
    $length = strlen($needle);
    return (substr($haystack, 0, $length) === $needle);
}

function endsWith($haystack, $needle)
{
    $length = strlen($needle);
    if ($length == 0) {
        return true;
    }

    return (substr($haystack, -$length) === $needle);
}

// check for external url to be fetched.
if ( $_GET['url'] && isOwnRequest($_SERVER['HTTP_REFERER'], $_SERVER['HTTP_HOST']) )
{
	// check if requested URL starts with "http" ends in ".css" (avoid loading local or malicious file types)
	if (startsWith($_GET['url'],'http') && endsWith($_GET['url'],'.css'))
	{
		$homepage = file_get_contents($_GET['url']);
		echo $homepage;
	}
	else
	{
		header("Status: 415 Unsupported Media Type");
	}
}
else
{
	// throw 404 error code if no URL is specified
	header("Status: 404 Not Found");
}
?>