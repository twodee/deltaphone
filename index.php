<?php

$html = file_get_contents('index.html');
$script = '';

if (array_key_exists('src', $_REQUEST)) {
  $src = str_replace(array("\r\n", "\n", "\r"), "\\n", $_REQUEST['src']);
  $src = str_replace("'", "\\'", $src);
  $script .= "source0 = '$src';\n";
}

if (array_key_exists('compact', $_REQUEST)) {
  $isCompact = strcmp($_REQUEST['compact'], 'true') == 0 ? 'true' : 'false';
  $script .= "isCompact = $isCompact;\n";
}

$html = str_replace('// SRC:PHP', $script, $html);
echo $html;
?>
