<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $title ?? SITE_NAME ?></title>
    <link rel="stylesheet" href="/css/main">
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
                <a class="header__link" href="#prestations">Prestations</a>
                <a class="header__link" href="/location">Locations</a>
                <a class="header__link" href="#contact">Contact</a>
                <a class="cta add-to-cart" href="#devis"><span class="shine"></span>Demander un devis</a>
            </nav>
        </div>
    </header>
    <main>