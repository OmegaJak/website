<?php
$xml = $_POST['xml'];
$file = fopen("fractalData.xml","w");
fwrite($file, $xml);
fclose($file);
// echo("saved");
?> 