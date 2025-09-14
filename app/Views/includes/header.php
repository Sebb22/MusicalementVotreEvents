<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $title ?? SITE_NAME ?></title>
    <link rel="stylesheet" href="/css/main">
    <!-- Favicon PNG -->
    <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png">

    <!-- Favicon ICO -->
    <link rel="shortcut icon" href="/images/favicon.ico" type="image/x-icon">

    <!-- Apple Touch Icon -->
    <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png">




</head>

<body>

    <header class="header">
        <div class="header__container container">
            <div class="header__brand">
                <span class="header__brand-mark"></span>
                <a href="/" class="header__link"> <img class="header__logo" src="/images/logo.png" alt="Logo <?= SITE_NAME ?>"></a>

            </div>

            <button class="header__toggle" aria-label="Menu" aria-expanded="false">
                <span></span><span></span><span></span>
            </button>

            <nav class="header__nav" aria-label="Navigation principale">
                <button class="header__close" aria-label="Fermer le menu">&times;</button>
                <a class="header__link" href="#prestations">Prestations</a>
                <a class="header__link" href="/location">Locations</a>
                <a class="header__link" href="#contact">Contact</a>
                <a class="cta add-to-cart" href="#devis" title="Demandez un devis"><span class="shine"></span>Demander un devis</a>
            </nav>

    </header>
    <main>