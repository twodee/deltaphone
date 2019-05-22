<?php

$html = file_get_contents('index.html');

if (array_key_exists('src', $_REQUEST)) {
  $src = str_replace(array("\r\n", "\n", "\r"), "\\n", $_REQUEST['src']);
  $src = str_replace("'", "\\'", $src);
  $script = "source0 = '$src';";
  $html = str_replace('// SRC:PHP', $script, $html);
}

echo $html;
?>
