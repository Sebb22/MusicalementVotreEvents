<h1>Connexion Admin</h1>
<?php if (!empty($error)) : ?>
    <p style="color:red"><?= htmlspecialchars($error) ?></p>
<?php endif; ?>
<form action="/login" method="POST">
    <label for="username">Nom d'utilisateur :</label>
    <input type="text" name="username" id="username" required>

    <label for="password">Mot de passe :</label>
    <input type="password" name="password" id="password" required>

    <button type="submit">Se connecter</button>
</form>