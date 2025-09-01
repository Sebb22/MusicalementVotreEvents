<main class="login">
    <h1 class="login__title">Connexion Admin</h1>

    <?php if (!empty($error)) : ?>
        <p class="login__error"><?= htmlspecialchars($error) ?></p>
    <?php endif; ?>

    <form action="/login" method="POST" class="login__form">
        <div class="login__field">
            <label for="username" class="login__label">Nom d'utilisateur</label>
            <input type="text" name="username" id="username" class="login__input" required>
        </div>

        <div class="login__field">
            <label for="password" class="login__label">Mot de passe</label>
            <input type="password" name="password" id="password" class="login__input" required>
        </div>

        <button type="submit" class="login__button">Se connecter</button>
    </form>
</main>
