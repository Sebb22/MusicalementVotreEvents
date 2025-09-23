<?php
phpinfo();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo '<pre>';
    print_r($_FILES);
    echo '</pre>';
}
?>
<form method="post" enctype="multipart/form-data">
    <input type="file" name="fichier">
    <button type="submit">Uploader</button>
</form>

