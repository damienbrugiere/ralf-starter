# language: fr
Fonctionnalité: Créer une partie

  Scénario: Créer une partie avec un nom valide
    Soit je suis sur la page de création de partie
    Quand je saisis le nom de partie "La Mine perdue"
    Et je valide la création
    Alors je vois la confirmation de création pour "La Mine perdue"

  Scénario: Le nom est obligatoire
    Soit je suis sur la page de création de partie
    Quand je valide la création
    Alors je vois l'erreur de nom "Le nom est obligatoire"

  Scénario: L'API refuse un nom vide
    Quand je crée une partie via l'API avec le nom ""
    Alors l'API répond avec le statut 400
